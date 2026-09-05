output "site_url" {
  value = "https://${azurerm_static_web_app.spw-swa.default_host_name}"
}

output "deployment_token" {
  value     = azurerm_static_web_app.spw-swa.api_key
  sensitive = true
}

output "nameservers" {
  value = azurerm_dns_zone.spw.name_servers
}