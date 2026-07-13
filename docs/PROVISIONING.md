# Azure provisioning guide — saltypoolwater

Do these in order. Everything here is portal-clicking (no CLI required),
and each step maps to AZ-104 exam territory, noted in *(italics)*.

Prereqs: an Azure subscription, this repo pushed to your GitHub account.

---

## 1. Resource group

Portal → **Resource groups** → **Create**
- Name: `rg-saltypoolwater`
- Region: pick the one closest to you (e.g. `East US 2`)

*(AZ-104: resource groups, regions, governance scope)*

## 2. Cosmos DB account (Free tier)

Portal → **Create a resource** → **Azure Cosmos DB** → **Azure Cosmos DB for NoSQL**
- Resource group: `rg-saltypoolwater`
- Account name: `cosmos-saltypoolwater` (must be globally unique — add digits if taken)
- **Apply Free Tier Discount: Yes** ← the important one (1000 RU/s + 25 GB free, one per subscription)
- Capacity mode: Provisioned throughput
- Disable geo-redundancy and multi-region writes (cost)

After it deploys:
1. **Data Explorer** → **New Database**: id `saltypoolwater`, check "Share throughput
   across containers", 1000 RU/s (stays inside free tier)
2. **New Container** ×2, both in that database:
   - id `complaints`, partition key `/day`
   - id `votes`, partition key `/complaintId`
3. **Keys** blade → copy the **URI** and **PRIMARY KEY**. You'll paste these in step 4.

*(AZ-104: storage/data services, keys and access management)*

## 3. Static Web App

Portal → **Create a resource** → **Static Web App**
- Resource group: `rg-saltypoolwater`
- Name: `swa-saltypoolwater`
- Plan: **Free**
- Deployment source: **GitHub** → sign in → pick your repo and `main` branch
- Build presets: **Custom**
  - App location: `frontend`
  - Api location: `api`
  - Output location: `dist`

Creating this does two things automatically: adds a deployment token to your
repo secrets, and commits a GitHub Actions workflow. This repo already ships
a workflow at `.github/workflows/azure-swa.yml`; if Azure adds its own copy,
keep whichever one you like and delete the other (they'll be near-identical —
just make sure the secret name in the file matches the one in your repo's
**Settings → Secrets and variables → Actions**).

First deploy takes ~3 minutes. The site is live at the auto-generated
`*.azurestaticapps.net` URL.

*(AZ-104: app services, deployment, CI/CD integration)*

## 4. Connect the API to Cosmos

Static Web App → **Settings → Environment variables** → add:

| Name              | Value                          |
|-------------------|--------------------------------|
| `COSMOS_ENDPOINT` | the URI from step 2            |
| `COSMOS_KEY`      | the PRIMARY KEY from step 2    |

Save. The Functions restart and switch from the in-memory fallback to Cosmos.

*(AZ-104: application settings, secrets handling)*

## 5. Custom domain

Static Web App → **Custom domains** → **Add** → `saltypoolwater.com`
- Azure gives you a TXT record (validation) and tells you what to point the
  domain at (CNAME for `www`, ALIAS/ANAME or apex support for the root).
- Add those records at your domain registrar's DNS panel.
- SSL certificate is issued automatically and is free.

*(AZ-104: DNS records, custom domains, certificates)*

## 6. Authentication

Nothing to provision — SWA includes GitHub and Microsoft (Entra ID) login at
`/.auth/login/github` and `/.auth/login/aad` out of the box. The API reads the
`x-ms-client-principal` header to know who's posting, which is how the
one-complaint-per-day rule is enforced server-side. Roles and invitations can
be managed under **Role management** in the SWA blade if you later want
moderators.

*(AZ-104: Entra ID, app authentication)*

## 7. Budget alert (do not skip)

Portal → **Cost Management + Billing** → **Budgets** → **Add**
- Scope: `rg-saltypoolwater`
- Amount: `$10/month`, alert at 50% and 90% to your email

Everything above is free-tier, so any alert firing means something is
misconfigured — this is your smoke detector.

*(AZ-104: cost management — an actual exam objective)*

## 8. Monitoring (optional, later)

Static Web App → **Application Insights** → Enable. Free tier covers hobby
traffic and shows you real visitors, API failures, and response times.

---

## Order of operations for launch night

1. Push this repo to GitHub (`git init`, commit, push)
2. Steps 1–3 above → site is live on the azurestaticapps.net URL
3. Step 4 → data persists
4. Step 5 → live on saltypoolwater.com
5. Step 7 → budget alert
