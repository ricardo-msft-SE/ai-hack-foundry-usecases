param(
  [string]$SubscriptionId = "ee0073ce-de38-45ed-a940-4dbfd9435dc1",
  [string]$ResourceGroup = "rg-hackreg-ohio",
  [string]$FunctionApp = "hackreg-ohio-func-2041",
  [string]$StorageAccount = "hackregohio2041",
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

function Invoke-ApiProbe([string]$url, [int]$timeoutSec = 20) {
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
if ($storage.publicNetworkAccess -ne "Enabled") {
  Write-Warning "Storage public network access is not Enabled. This can break Table Storage access from the Function App."

  if ($Fix) {
    Write-Host "Applying fix: setting storage public network access to Enabled..."
    az storage account update --name $StorageAccount --resource-group $ResourceGroup --public-network-access Enabled --output none
    $changed = $true
  }
}

Write-Section "Function identity role assignments"
$principalId = az functionapp identity show --name $FunctionApp --resource-group $ResourceGroup --query principalId -o tsv
if (-not $principalId) {
  throw "Function App managed identity principalId not found."
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
