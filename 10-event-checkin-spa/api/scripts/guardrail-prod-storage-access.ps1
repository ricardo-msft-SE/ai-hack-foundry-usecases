param(
  [string]$SubscriptionId = "ee0073ce-de38-45ed-a940-4dbfd9435dc1",
  [string]$ResourceGroup = "rg-hackreg-ohio",
  [string]$FunctionApp = "hackreg-ohio-func-2041",
  [string]$StorageAccount = "hackregohio2041",
  [string]$VNetName = "vnet-hackreg-ohio",
  [string]$IntegrationSubnet = "snet-func-integration",
  [ValidateSet("Public", "Private")]
  [string]$ExpectedMode = "Public",
  [switch]$Fix,
  [switch]$SkipApiChecks
)

$ErrorActionPreference = "Stop"

function Write-Section([string]$text) {
  Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

function Assert-AzCli {
  if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    throw "Azure CLI (az) is not installed or not on PATH."
  }
}

function Invoke-ApiProbe([string]$url, [int]$timeoutSec = 60) {
  try {
    $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec $timeoutSec -UseBasicParsing
    return [pscustomobject]@{
      Url = $url
      StatusCode = $response.StatusCode
      Ok = $true
      Error = ""
    }
  }
  catch {
    $statusCode = 0
    if ($_.Exception.Response) {
      $statusCode = [int]$_.Exception.Response.StatusCode
    }

    return [pscustomobject]@{
      Url = $url
      StatusCode = $statusCode
      Ok = $false
      Error = $_.Exception.Message
    }
  }
}

Assert-AzCli

Write-Section "Azure context"
az account set --subscription $SubscriptionId | Out-Null
$account = az account show --query "{name:name,id:id,tenantId:tenantId}" -o json | ConvertFrom-Json
Write-Host ("Subscription: {0} ({1})" -f $account.name, $account.id)
Write-Host ("Tenant: {0}" -f $account.tenantId)

Write-Section "Storage network access"
$storage = az storage account show --name $StorageAccount --resource-group $ResourceGroup --query "{publicNetworkAccess:publicNetworkAccess,defaultAction:networkRuleSet.defaultAction,bypass:networkRuleSet.bypass}" -o json | ConvertFrom-Json
Write-Host ("publicNetworkAccess: {0}" -f $storage.publicNetworkAccess)
Write-Host ("defaultAction: {0}" -f $storage.defaultAction)
Write-Host ("bypass: {0}" -f $storage.bypass)

$changed = $false
$targetPublicNetworkAccess = if ($ExpectedMode -eq "Private") { "Disabled" } else { "Enabled" }
$targetDefaultAction = if ($ExpectedMode -eq "Private") { "Deny" } else { "Allow" }

if ($storage.publicNetworkAccess -ne $targetPublicNetworkAccess) {
  Write-Warning ("Storage public network access is {0} but expected {1} for {2} mode." -f $storage.publicNetworkAccess, $targetPublicNetworkAccess, $ExpectedMode)

  if ($Fix) {
    Write-Host ("Applying fix: setting storage public network access to {0}..." -f $targetPublicNetworkAccess)
    az storage account update --name $StorageAccount --resource-group $ResourceGroup --public-network-access $targetPublicNetworkAccess --output none
    $changed = $true
  }
}

if ($storage.defaultAction -ne $targetDefaultAction) {
  Write-Warning ("Storage defaultAction is {0} but expected {1} for {2} mode." -f $storage.defaultAction, $targetDefaultAction, $ExpectedMode)

  if ($Fix) {
    Write-Host ("Applying fix: setting storage defaultAction to {0}..." -f $targetDefaultAction)
    az storage account update --name $StorageAccount --resource-group $ResourceGroup --default-action $targetDefaultAction --output none
    $changed = $true
  }
}

if ($ExpectedMode -eq "Private") {
  Write-Section "Private-mode networking pre-flight"

  # 1. VNet integration on Function app
  $vnetSubnetId = az functionapp show --name $FunctionApp --resource-group $ResourceGroup --query virtualNetworkSubnetId -o tsv 2>$null
  if ($vnetSubnetId -and $vnetSubnetId -match $IntegrationSubnet) {
    Write-Host ("VNet integration active: {0}" -f $vnetSubnetId)
  } else {
    Write-Warning ("Function app is NOT VNet-integrated with subnet '{0}'. Current value: '{1}'" -f $IntegrationSubnet, $vnetSubnetId)
    if ($Fix) {
      $subnetId = az network vnet subnet show --resource-group $ResourceGroup --vnet-name $VNetName --name $IntegrationSubnet --query id -o tsv
      Write-Host "Attaching VNet integration..."
      az functionapp vnet-integration add --name $FunctionApp --resource-group $ResourceGroup --vnet $VNetName --subnet $IntegrationSubnet | Out-Null
      $changed = $true
    }
  }

  # 2. Correct privatelink DNS zones linked to VNet (no shadow zones)
  $correctZones = @("privatelink.blob.core.windows.net","privatelink.queue.core.windows.net","privatelink.table.core.windows.net")
  $shadowZones  = @("blob.core.windows.net","queue.core.windows.net","table.core.windows.net")

  foreach ($zone in $correctZones) {
    $allLinks = az network private-dns link vnet list --resource-group $ResourceGroup --zone-name $zone -o json 2>$null | ConvertFrom-Json
    $linked = $allLinks | Where-Object { $_.virtualNetwork.id -match $VNetName }
    if ($linked) {
      Write-Host ("DNS zone linked OK: {0}" -f $zone)
    } else {
      Write-Warning ("DNS zone '$zone' is NOT linked to VNet '$VNetName'. Private DNS resolution will fail.")
    }
  }

  foreach ($zone in $shadowZones) {
    $allLinks = az network private-dns link vnet list --resource-group $ResourceGroup --zone-name $zone -o json 2>$null | ConvertFrom-Json
    $linked = $allLinks | Where-Object { $_.virtualNetwork.id -match $VNetName }
    if ($linked) {
      Write-Warning ("Shadow DNS zone '$zone' is linked to VNet '$VNetName'. This will intercept '$zone' queries and return NXDOMAIN, breaking the privatelink CNAME chain.")
      if ($Fix) {
        $linkName = $linked[0].name
        Write-Host ("Removing shadow DNS zone link: $linkName from $zone")
        az network private-dns link vnet delete --resource-group $ResourceGroup --zone-name $zone --name $linkName --yes | Out-Null
        $changed = $true
      }
    }
  }

  # 3. Privatelink DNS A records exist and point to non-public IPs
  $zoneSubdomainMap = @{
    "privatelink.blob.core.windows.net"  = $StorageAccount
    "privatelink.queue.core.windows.net" = $StorageAccount
    "privatelink.table.core.windows.net" = $StorageAccount
  }
  foreach ($zone in $zoneSubdomainMap.Keys) {
    $name = $zoneSubdomainMap[$zone]
    $ip = az network private-dns record-set a show --resource-group $ResourceGroup --zone-name $zone --name $name --query "aRecords[0].ipv4Address" -o tsv 2>$null
    if ($ip -and $ip -notmatch "^0\.") {
      Write-Host ("A record OK: {0}.{1} -> {2}" -f $name, $zone, $ip)
    } else {
      Write-Warning ("A record missing or invalid in zone '$zone' for '$name'. Private DNS will not resolve.")
    }
  }

  # 4. Private endpoints provisioned
  $peNames = @("pe-hackreg-storage-blob","pe-hackreg-storage-queue","pe-hackreg-storage-table")
  foreach ($pe in $peNames) {
    $peState = az network private-endpoint show --name $pe --resource-group $ResourceGroup --query "provisioningState" -o tsv 2>$null
    if ($peState -eq "Succeeded") {
      Write-Host ("Private endpoint OK: {0}" -f $pe)
    } else {
      Write-Warning ("Private endpoint '$pe' not found or not provisioned (state: $peState).")
    }
  }

  # 5. AzureWebJobsStorage uses managed identity (no connection string)
  $jobsConnStr = az functionapp config appsettings list --name $FunctionApp --resource-group $ResourceGroup --query "[?name=='AzureWebJobsStorage'].value | [0]" -o tsv 2>$null
  $jobsAcctName = az functionapp config appsettings list --name $FunctionApp --resource-group $ResourceGroup --query "[?name=='AzureWebJobsStorage__accountName'].value | [0]" -o tsv 2>$null
  if ($jobsConnStr -and $jobsConnStr -match "AccountKey=") {
    Write-Warning "AzureWebJobsStorage is set as a connection string with a key. In private mode the Functions runtime will fail DNS resolution if VNet integration is active. Use managed identity: AzureWebJobsStorage__accountName + AzureWebJobsStorage__credential=managedidentity."
  } elseif ($jobsAcctName) {
    Write-Host ("AzureWebJobsStorage uses managed identity for account: {0}" -f $jobsAcctName)
  } else {
    Write-Warning "Neither AzureWebJobsStorage nor AzureWebJobsStorage__accountName is set."
  }
}

Write-Section "Function identity role assignments"
$principalId = az functionapp identity show --name $FunctionApp --resource-group $ResourceGroup --query principalId -o tsv
if (-not $principalId) {
  throw "Function App managed identity principalId not found."
}

Write-Host ("Function managed identity principalId: {0}" -f $principalId)

Write-Section "Function app settings"
$tableAccountName = az functionapp config appsettings list --name $FunctionApp --resource-group $ResourceGroup --query "[?name=='AZURE_TABLE_ACCOUNT_NAME'].value | [0]" -o tsv
if ($tableAccountName) {
  Write-Host ("AZURE_TABLE_ACCOUNT_NAME: {0}" -f $tableAccountName)
} else {
  Write-Warning "AZURE_TABLE_ACCOUNT_NAME is not set. API may fall back to connection string path instead of managed identity."
}

$tableConnectionString = az functionapp config appsettings list --name $FunctionApp --resource-group $ResourceGroup --query "[?name=='AZURE_TABLE_CONNECTION_STRING'].value | [0]" -o tsv
if ($ExpectedMode -eq "Private" -and $tableConnectionString) {
  Write-Warning "AZURE_TABLE_CONNECTION_STRING is still set. Managed identity path is preferred for private mode."
}

$storageId = az storage account show --name $StorageAccount --resource-group $ResourceGroup --query id -o tsv
$roles = az role assignment list --assignee $principalId --scope $storageId --query "[].roleDefinitionName" -o tsv
$roleSet = @{}
foreach ($role in ($roles -split "`r?`n" | Where-Object { $_ })) {
  $roleSet[$role] = $true
}

$requiredRoles = @(
  "Storage Blob Data Owner",
  "Storage Queue Data Contributor",
  "Storage Table Data Contributor"
)

$missingRoles = @()
foreach ($required in $requiredRoles) {
  if (-not $roleSet.ContainsKey($required)) {
    $missingRoles += $required
  }
}

if ($missingRoles.Count -eq 0) {
  Write-Host "All required storage roles are assigned."
}
else {
  Write-Warning ("Missing storage roles: {0}" -f ($missingRoles -join ", "))
  if ($Fix) {
    foreach ($role in $missingRoles) {
      Write-Host ("Assigning role: {0}" -f $role)
      az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --role $role --scope $storageId --output none
    }
    $changed = $true
  }
}

if ($changed) {
  Write-Section "Restarting Function App"
  az functionapp restart --name $FunctionApp --resource-group $ResourceGroup | Out-Null
  Start-Sleep -Seconds 8
}

if (-not $SkipApiChecks) {
  Write-Section "API probes"
  $base = "https://$FunctionApp.azurewebsites.net/api"
  $probes = @(
    "$base/health",
    "$base/initials",
    "$base/dashboard"
  )

  $results = foreach ($probe in $probes) {
    Invoke-ApiProbe -url $probe
  }

  $results | Format-Table Url, StatusCode, Ok -AutoSize

  $failed = $results | Where-Object { -not $_.Ok }
  if ($failed) {
    Write-Warning "One or more API probes failed."
    foreach ($f in $failed) {
      Write-Host ("- {0}: {1}" -f $f.Url, $f.Error)
    }
    exit 2
  }
}

Write-Section "Guardrail complete"
Write-Host "No blocking issues detected."
