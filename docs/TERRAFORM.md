# Deploying saltypoolwater with Terraform

This replaces steps 1–4 of `PROVISIONING.md` (resource group, Cosmos, Static
Web App, app settings). Custom domain, budget alert, and monitoring stay
manual for now — good candidates to Terraform later as practice.

Prereqs: Azure CLI (`az login` done), Terraform >= 1.7.

---

## 0. Bootstrap remote state (one-time, done with the CLI on purpose)

Terraform state has a chicken-and-egg problem: the storage account that holds
state can't manage itself. Standard practice is to create it once outside
Terraform:

```bash
az group create -n rg-tfstate -l eastus2
az storage account create -n sttfstatespw$RANDOM -g rg-tfstate -l eastus2 --sku Standard_LRS
az storage container create -n tfstate --account-name <the-name-from-above>
```

Then uncomment the `backend "azurerm"` block in `infra/providers.tf`, fill in
the storage account name, and you're set. (You can also run entirely on local
state for your first apply and migrate later with `terraform init -migrate-state` —
migrating state is itself an exam topic, so doing it once on purpose is useful.)

## 1. Identity: how Terraform authenticates

Three options, in increasing order of production-realism:

1. **Your own login (easiest, fine for tonight):** the azurerm provider picks
   up your `az login` session automatically. Zero setup.
2. **Service principal with a client secret:**
   ```bash
   az ad sp create-for-rbac --name sp-terraform-spw \
     --role Contributor \
     --scopes /subscriptions/<sub-id>/resourceGroups/rg-saltypoolwater
   ```
   Export `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_TENANT_ID`,
   `ARM_SUBSCRIPTION_ID`. Note the scope: Contributor on the resource group,
   not the subscription — least privilege. (Chicken-and-egg detail: the RG
   must exist before you can scope to it, so either create it first or scope
   to the subscription initially and tighten after the first apply.)
3. **OIDC federated credentials (best, for CI):** the app registration trusts
   your GitHub repo directly — no secret to store or rotate. Set this up when
   you move `terraform apply` into GitHub Actions.

## 2. Deploy

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # adjust if you want
terraform init
terraform plan        # read every line — this is the skill the exam tests
terraform apply
```

Expected resources: 1 resource group, 1 Cosmos account (+1 database,
2 containers via for_each), 1 Static Web App, 1 random_integer. ~10 min,
mostly Cosmos.

## 3. Wire up GitHub deployments

Terraform created the Static Web App but code deploys still go through
GitHub Actions using the SWA deployment token:

```bash
terraform output -raw static_web_app_deployment_token
```

Add that value in your GitHub repo → Settings → Secrets and variables →
Actions → New secret → name it `AZURE_STATIC_WEB_APPS_API_TOKEN`.
Push to `main` and the site deploys to the URL from:

```bash
terraform output static_web_app_url
```

## 4. Prove to yourself it's really IaC

The exercises that teach the most:

- `terraform plan` again → should say "No changes." (idempotency)
- Change a tag in `variables.tf` → plan → see the in-place update
- Delete a container in the portal → `terraform plan` detects drift → apply heals it
- `terraform state list`, `terraform state show azurerm_static_web_app.main`
- Rename a resource block → see plan want to destroy/create → fix with `terraform state mv` (or a `moved` block)

## Exam mapping (Terraform Associate 003)

| In this repo                              | Exam objective                          |
|-------------------------------------------|-----------------------------------------|
| `required_providers`, version constraints | Providers and versioning                 |
| backend block + state bootstrap           | State management, remote backends        |
| `variables.tf` with validation blocks     | Input variables, validation              |
| `locals` + `for_each` on containers       | Meta-arguments, expressions              |
| `sensitive = true` on the token output    | Sensitive data handling                  |
| implicit deps (endpoint → app_settings)   | Resource dependencies                    |
| drift/state exercises above               | State CLI, moved resources               |
