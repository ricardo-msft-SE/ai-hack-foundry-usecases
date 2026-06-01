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

@description('Storage public network access mode: Enabled for legacy/public path, Disabled for private endpoint path')
@allowed([
  'Enabled'
  'Disabled'
])
param storagePublicNetworkAccess string = 'Enabled'

@description('Storage firewall default action')
@allowed([
  'Allow'
  'Deny'
])
param storageDefaultAction string = 'Allow'

@description('Existing subnet resource ID for Function App VNet integration (optional)')
param functionVnetSubnetResourceId string = ''

@description('Existing subnet resource ID for Storage private endpoint (optional)')
param privateEndpointSubnetResourceId string = ''

@description('Existing private DNS zone resource ID for table.core.windows.net (optional)')
param privateDnsZoneResourceId string = ''

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
    publicNetworkAccess: storagePublicNetworkAccess
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: storageDefaultAction
      ipRules: []
      virtualNetworkRules: []
    }
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
var hasFunctionSubnet = !empty(functionVnetSubnetResourceId)
var hasPrivateEndpointSubnet = !empty(privateEndpointSubnetResourceId)
var hasPrivateDnsZone = !empty(privateDnsZoneResourceId)

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: hostingPlan.id
    httpsOnly: true
    ...(hasFunctionSubnet ? {
      virtualNetworkSubnetId: functionVnetSubnetResourceId
    } : {})
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
          name: 'AZURE_TABLE_ACCOUNT_NAME'
          value: storage.name
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

resource tablePrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-11-01' = if (hasPrivateEndpointSubnet) {
  name: '${storage.name}-table-pe'
  location: location
  properties: {
    subnet: {
      id: privateEndpointSubnetResourceId
    }
    privateLinkServiceConnections: [
      {
        name: '${storage.name}-table-connection'
        properties: {
          privateLinkServiceId: storage.id
          groupIds: [
            'table'
          ]
        }
      }
    ]
  }
}

resource tablePrivateDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2023-11-01' = if (hasPrivateEndpointSubnet && hasPrivateDnsZone) {
  parent: tablePrivateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'table-core-windows-net'
        properties: {
          privateDnsZoneId: privateDnsZoneResourceId
        }
      }
    ]
  }
}

resource tableDataContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storage
  name: guid(storage.id, functionApp.id, 'StorageTableDataContributor')
  properties: {
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3')
  }
}

resource queueDataContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storage
  name: guid(storage.id, functionApp.id, 'StorageQueueDataContributor')
  properties: {
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '974c5e8b-45b9-4653-ba55-5f855dd0fb88')
  }
}

resource blobDataOwnerRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storage
  name: guid(storage.id, functionApp.id, 'StorageBlobDataOwner')
  properties: {
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b')
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
output functionAppPrincipalId string = functionApp.identity.principalId
output storageAccountId string = storage.id
output tablePrivateEndpointId string = hasPrivateEndpointSubnet ? tablePrivateEndpoint.id : ''
