param(
  [Parameter(Mandatory = $false)]
  [string]$SubscriptionId = "ee0073ce-de38-45ed-a940-4dbfd9435dc1",

  [Parameter(Mandatory = $false)]
  [string]$ResourceGroup = "rg-hackreg-ohio",

  [Parameter(Mandatory = $false)]
  [string]$Location = "eastus2"
)

$ErrorActionPreference = "Stop"

Write-Host "Using subscription: $SubscriptionId"
az account set --subscription $SubscriptionId | Out-Null

Write-Host "Ensuring resource group exists: $ResourceGroup"
az group create --name $ResourceGroup --location $Location | Out-Null

$suffix = Get-Random -Minimum 1000 -Maximum 9999
$functionAppName = "hackreg-ohio-func-$suffix"
$hostingPlanName = "hackreg-ohio-plan-$suffix"
$appInsightsName = "hackreg-ohio-ai-$suffix"
$storageAccountName = "hackregohio$suffix"
$staticWebAppName = "hackreg-ohio-swa-$suffix"

Write-Host "Using generated names:" 
Write-Host "- Function App: $functionAppName"
Write-Host "- Hosting Plan: $hostingPlanName"
Write-Host "- App Insights: $appInsightsName"
Write-Host "- Storage Account: $storageAccountName"
Write-Host "- Static Web App: $staticWebAppName"

Write-Host "Deploying infrastructure from Bicep..."
$deploymentJson = az deployment group create `
  --resource-group $ResourceGroup `
  --template-file "./main.bicep" `
  --parameters "./main.parameters.json" `
  --parameters location=$Location staticWebAppLocation=$Location `
  --parameters functionAppName=$functionAppName hostingPlanName=$hostingPlanName appInsightsName=$appInsightsName storageAccountName=$storageAccountName staticWebAppName=$staticWebAppName `
  --query properties.outputs -o json

if (-not $?) {
  throw "Infrastructure deployment failed."
}

$deploymentResult = $deploymentJson | ConvertFrom-Json

Write-Host ""
Write-Host "Deployment outputs:"
$deploymentResult | ConvertTo-Json -Depth 5

$functionApiBase = $deploymentResult.functionApiBaseUrl.value
$swaHost = $deploymentResult.staticWebAppDefaultHostName.value
$functionAppName = $deploymentResult.functionAppName.value

Write-Host ""
Write-Host "Next steps:"
Write-Host "1) Deploy Function API code:"
Write-Host "   cd ../api"
Write-Host "   func azure functionapp publish $functionAppName --javascript"
Write-Host ""
Write-Host "2) Deploy frontend static files (example using SWA CLI optional):"
Write-Host "   npm install -g @azure/static-web-apps-cli"
Write-Host "   cd ../frontend"
Write-Host "   swa deploy . --env production"
Write-Host ""
Write-Host "3) Configure frontend API base to: $functionApiBase"
Write-Host "4) Static Web App hostname: https://$swaHost"
