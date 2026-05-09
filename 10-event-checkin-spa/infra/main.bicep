@description('Azure region for Function App, Storage, and App Insights')
param location string = resourceGroup().location

@description('Azure region for Static Web App')
param staticWebAppLocation string = location

@description('Function app name')
param functionAppName string

@description('Function hosting plan name')
param hostingPlanName string

@description('Application Insights name')
param appInsightsName string

@description('Storage account name (3-24 lowercase letters and numbers)')
param storageAccountName string

@description('Storage table name for registration records')
param tableName string = 'Registrations'

@description('Static Web App name')
param staticWebAppName string

@description('Event identifier used as partition key')
param eventId string = 'hackathon-registration-state-ohio'

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource registrationTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tableService
  name: tableName
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: hostingPlanName
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|24'
      appSettings: [
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'AzureWebJobsStorage'
          value: storageConnectionString
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'EVENT_ID'
          value: eventId
        }
        {
          name: 'USE_TABLE_STORAGE'
          value: 'true'
        }
        {
          name: 'AZURE_TABLE_CONNECTION_STRING'
          value: storageConnectionString
        }
        {
          name: 'AZURE_TABLE_NAME'
          value: tableName
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
}

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: staticWebAppLocation
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output functionAppName string = functionApp.name
output functionApiBaseUrl string = 'https://${functionApp.properties.defaultHostName}/api'
output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostName string = staticWebApp.properties.defaultHostname
output storageAccountName string = storage.name
output tableNameOut string = registrationTable.name
