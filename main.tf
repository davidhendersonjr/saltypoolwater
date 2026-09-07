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

  lifecycle {
    ignore_changes = [repository_url, repository_branch]
  }
}
resource "azurerm_dns_zone" "spw" {
  name                = "saltypoolwater.com"
  resource_group_name = azurerm_resource_group.spw-rg.name
}
resource "azurerm_dns_txt_record" "ms_verify" {
  name                = "@"
  zone_name           = azurerm_dns_zone.spw.name
  resource_group_name = azurerm_resource_group.spw-rg.name
  ttl                 = 3600

  record {
    value = "MS=ms28032115"
  }

  # Only present while the custom domain is being validated; Azure blanks it afterward.
  dynamic "record" {
    for_each = azurerm_static_web_app_custom_domain.apex.validation_token != "" ? [1] : []
    content {
      value = azurerm_static_web_app_custom_domain.apex.validation_token
    }
  }
}
# www.saltypoolwater.com
resource "azurerm_dns_cname_record" "www" {
  name                = "www"
  zone_name           = azurerm_dns_zone.spw.name
  resource_group_name = azurerm_resource_group.spw-rg.name
  ttl                 = 300
  record              = azurerm_static_web_app.spw-swa.default_host_name
}

resource "azurerm_static_web_app_custom_domain" "www" {
  static_web_app_id = azurerm_static_web_app.spw-swa.id
  domain_name       = "www.saltypoolwater.com"
  validation_type   = "cname-delegation"
  depends_on        = [azurerm_dns_cname_record.www]
}

# saltypoolwater.com (apex)
resource "azurerm_static_web_app_custom_domain" "apex" {
  static_web_app_id = azurerm_static_web_app.spw-swa.id
  domain_name       = "saltypoolwater.com"
  validation_type   = "dns-txt-token"
}

resource "azurerm_dns_a_record" "apex" {
  name                = "@"
  zone_name           = azurerm_dns_zone.spw.name
  resource_group_name = azurerm_resource_group.spw-rg.name
  ttl                 = 300
  target_resource_id  = azurerm_static_web_app.spw-swa.id
}
resource "azurerm_cosmosdb_sql_container" "profiles" {
  name                = "profiles"
  resource_group_name = azurerm_resource_group.spw-rg.name
  account_name        = azurerm_cosmosdb_account.spw-cosmosdb.name
  database_name       = azurerm_cosmosdb_sql_database.spw-db.name
  partition_key_paths = ["/id"]
}
