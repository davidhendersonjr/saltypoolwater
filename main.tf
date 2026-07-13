resource "azurerm_resource_group" "spw-rg" {
  name     = "spw-rg"
  location = "Central US"
}

resource "azurerm_cosmosdb_account" "spw-cosmosdb" {
  name                = "cosmos-saltypoolwater"
  location            = azurerm_resource_group.spw-rg.location
  resource_group_name = azurerm_resource_group.spw-rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  free_tier_enabled   = true


  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.spw-rg.location
    failover_priority = 0
  }
}
  resource "azurerm_cosmosdb_sql_database" "spw-db" {
    name                = "saltypoolwater"
    resource_group_name = azurerm_resource_group.spw-rg.name
    account_name        = azurerm_cosmosdb_account.spw-cosmosdb.name
    throughput          = 1000
  }

  resource "azurerm_cosmosdb_sql_container" "complaints" {
    name                = "complaints"
    resource_group_name = azurerm_resource_group.spw-rg.name
    account_name        = azurerm_cosmosdb_account.spw-cosmosdb.name
    database_name       = azurerm_cosmosdb_sql_database.spw-db.name
    partition_key_paths = ["/day"]
  }

  resource "azurerm_cosmosdb_sql_container" "votes" {
    name                = "votes"
    resource_group_name = azurerm_resource_group.spw-rg.name
    account_name        = azurerm_cosmosdb_account.spw-cosmosdb.name
    database_name       = azurerm_cosmosdb_sql_database.spw-db.name
    partition_key_paths = ["/complaintId"]
  }

resource "azurerm_static_web_app" "spw-swa" {
  name                = "swa-saltypoolwater"
  resource_group_name = azurerm_resource_group.spw-rg.name
  location            = "centralus"
  sku_tier            = "Free"
  sku_size            = "Free"

  app_settings = {
    COSMOS_ENDPOINT = azurerm_cosmosdb_account.spw-cosmosdb.endpoint
    COSMOS_KEY      = azurerm_cosmosdb_account.spw-cosmosdb.primary_key
  }
}