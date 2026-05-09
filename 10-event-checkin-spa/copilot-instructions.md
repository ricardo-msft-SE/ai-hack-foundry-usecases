# Copilot Instructions: Hackathon Registration - State of Ohio

This document standardizes how future updates are made to this module so changes are repeatable, safe, and production-ready.

## Scope

These instructions apply to all files under this folder:

- `10-event-checkin-spa/frontend/`
- `10-event-checkin-spa/api/`
- `10-event-checkin-spa/infra/`
- `10-event-checkin-spa/sample-data/`

## Product Baseline

- App name: `Hackathon Registration - State of Ohio`
- UX model: touch-first kiosk SPA
- Auth model: anonymous/public kiosk flows (no sign-in required)
- Runtime architecture:
  - Frontend: static HTML/CSS/JS in `frontend/`
  - API: Azure Functions (Node.js v4 programming model) in `api/`
  - Data: Azure Table Storage in production, JSON local fallback for development

## File Ownership Map

- `frontend/index.html`: page structure and semantic sections
- `frontend/assets/styles.css`: visual system and responsive styles
- `frontend/assets/app.js`: frontend state, rendering, and API calls
- `frontend/assets/env.js`: runtime API base URL override
- `api/src/functions.js`: HTTP endpoint definitions and request validation
- `api/src/services/registrationStore.js`: business logic and persistence (local + table)
- `api/src/config.js`: environment configuration for storage and event id
- `sample-data/initial-registrations.json`: initial seed rows

## Data Model Conventions

Canonical attendee fields:

- `registrationId`
- `status`
- `name`
- `title`
- `agency`
- `trackSelected`
- `lastName` (derived from `name`)
- `lastInitial` (derived from `lastName`)
- `checkedInAtUtc`
- `createdAtUtc`

Rules:

- Always preserve `registrationId` on updates.
- Let API normalization derive `lastName` and `lastInitial` from `name`.
- Supported tracks are `No Code`, `Low Code`, `Pro Code`, plus `Unknown` fallback.
- `check-in` sets `status=Checked-In` and timestamp.
- `check-out` sets `status=Pending` and clears timestamp.

## API Contract (Current)

Preferred stable endpoints for frontend calls:

- `GET /api/health`
- `GET /api/initials`
- `GET /api/attendees?initial={A-Z}`
- `GET /api/attendee?id={registrationId}`
- `POST /api/checkin?id={registrationId}`
- `POST /api/checkout?id={registrationId}`
- `POST /api/register` (JSON body, requires `name`)
- `GET /api/dashboard`
- `GET /api/track-agencies?track={trackName}`
- `POST /api/import` (JSON body: `{ attendees: [...] }`)

Legacy path-based routes also exist; keep query endpoints functioning for production stability.

## Frontend Standards

- Keep UI kiosk-friendly:
  - large hit targets
  - clear status pills
  - minimal steps for check-in/check-out
- Keep branding intact unless explicitly changed:
  - scarlet/grey palette
  - Ohio seal and Microsoft logo in header
  - attribution footer on check-in page
- Matching registrant list should remain compact (name, status, select).
- Detail panel is the source for richer attendee information.
- Keep manual day-of registration section at bottom of check-in page.

## Implementation Workflow (Required)

1. Identify impacted layer(s): `frontend`, `api`, `store`, `infra`, or data.
2. For behavior changes, update both:
   - endpoint contract in `api/src/functions.js`
   - underlying operation in `api/src/services/registrationStore.js`
3. For UI changes, update:
   - structure in `frontend/index.html`
   - styles in `frontend/assets/styles.css`
   - behavior in `frontend/assets/app.js`
4. Validate local code health and runtime behavior.
5. Deploy only affected components.
6. Run production smoke checks.

## Local Development Commands

From `10-event-checkin-spa/api`:

```powershell
npm install
copy local.settings.example.json local.settings.json
npm start
```

From `10-event-checkin-spa/frontend`:

```powershell
python -m http.server 5173
```

## Deployment Runbook (Repeatable)

Set context once:

```powershell
az account set --subscription ee0073ce-de38-45ed-a940-4dbfd9435dc1
```

Validate production reliability settings before any deploy:

```powershell
az functionapp config show --name hackreg-ohio-func-2041 --resource-group rg-hackreg-ohio --query "{alwaysOn:alwaysOn,linuxFxVersion:linuxFxVersion}" -o json
az functionapp config appsettings list --name hackreg-ohio-func-2041 --resource-group rg-hackreg-ohio --query "[?name=='AzureWebJobsStorage' || name=='AzureWebJobsStorage__accountName' || name=='AzureWebJobsStorage__credential' || name=='USE_TABLE_STORAGE' || name=='AZURE_TABLE_ACCOUNT_NAME' || name=='AZURE_TABLE_NAME']" -o table
```

Required values:

- `alwaysOn=true`
- `AzureWebJobsStorage` is empty string
- `AzureWebJobsStorage__accountName=hackregohio2041`
- `AzureWebJobsStorage__credential=managedidentity`
- `USE_TABLE_STORAGE=true`
- `AZURE_TABLE_ACCOUNT_NAME=hackregohio2041`
- `AZURE_TABLE_NAME=Registrations`

If identity storage settings drifted, re-apply and restart:

```powershell
$rg = "rg-hackreg-ohio"
$func = "hackreg-ohio-func-2041"
$storage = "hackregohio2041"
$storageId = az storage account show --name $storage --resource-group $rg --query id -o tsv

az functionapp identity assign --name $func --resource-group $rg | Out-Null
$principalId = az functionapp identity show --name $func --resource-group $rg --query principalId -o tsv

az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --role "Storage Blob Data Owner" --scope $storageId | Out-Null
az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --role "Storage Queue Data Contributor" --scope $storageId | Out-Null
az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --role "Storage Table Data Contributor" --scope $storageId | Out-Null

az functionapp config appsettings set --name $func --resource-group $rg --settings AzureWebJobsStorage= AzureWebJobsStorage__accountName=$storage AzureWebJobsStorage__credential=managedidentity USE_TABLE_STORAGE=true AZURE_TABLE_ACCOUNT_NAME=$storage AZURE_TABLE_NAME=Registrations | Out-Null
az functionapp config set --name $func --resource-group $rg --always-on true | Out-Null
az functionapp restart --name $func --resource-group $rg | Out-Null
```

Deploy API updates:

```powershell
Set-Location "10-event-checkin-spa/api"
func azure functionapp publish hackreg-ohio-func-2041 --javascript
```

Create a production data snapshot before every deploy:

```powershell
$base = "https://hackreg-ohio-func-2041.azurewebsites.net/api"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$snapshotDir = "10-event-checkin-spa/snapshots"
$snapshotPath = Join-Path $snapshotDir "attendees-$stamp.json"

New-Item -ItemType Directory -Path $snapshotDir -Force | Out-Null
$initials = (Invoke-RestMethod -Uri "$base/initials" -Method Get).initials
$all = @()
foreach ($i in $initials) {
  $all += (Invoke-RestMethod -Uri "$base/attendees?initial=$($i.initial)" -Method Get).attendees
}

$all | ConvertTo-Json -Depth 8 | Set-Content -Path $snapshotPath -Encoding utf8
Write-Host "Snapshot saved: $snapshotPath"
Write-Host ("Rows: " + $all.Count)
```

If post-deploy data is missing/corrupt, restore immediately from latest snapshot:

```powershell
$base = "https://hackreg-ohio-func-2041.azurewebsites.net/api"
$snapshotPath = Get-ChildItem "10-event-checkin-spa/snapshots/attendees-*.json" | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1 -ExpandProperty FullName
$rows = Get-Content $snapshotPath -Raw | ConvertFrom-Json

Invoke-RestMethod -Uri "$base/import" -Method Post -ContentType "application/json" -Body (@{ attendees = @($rows) } | ConvertTo-Json -Depth 10)
Write-Host "Restored from: $snapshotPath"
```

Deploy frontend updates:

```powershell
$token = az staticwebapp secrets list --name hackreg-ohio-swa-2041 --resource-group rg-hackreg-ohio --query properties.apiKey -o tsv
Set-Location ".."
swa deploy 10-event-checkin-spa/frontend --deployment-token $token --env production
```

Notes:

- Run the frontend deploy from repository root (`ai-hack-foundry-usecases`) to avoid SWA CLI path-resolution failures.
- If `swa deploy` fails, reinstall CLI and retry:

```powershell
npm install -g @azure/static-web-apps-cli@latest
```

## Production Smoke Test Checklist

Run after every deploy:

```powershell
$base = "https://hackreg-ohio-func-2041.azurewebsites.net/api"
Invoke-RestMethod -Uri "$base/health" -Method Get
Invoke-RestMethod -Uri "$base/initials" -Method Get
Invoke-RestMethod -Uri "$base/dashboard" -Method Get
```

Stability probes (catch intermittent failures):

```powershell
1..20 | ForEach-Object {
  $h = curl.exe -s -o NUL -w "%{http_code}" "https://hackreg-ohio-func-2041.azurewebsites.net/api/health"
  $i = curl.exe -s -o NUL -w "%{http_code}" "https://hackreg-ohio-func-2041.azurewebsites.net/api/initials"
  $d = curl.exe -s -o NUL -w "%{http_code}" "https://hackreg-ohio-func-2041.azurewebsites.net/api/dashboard"
  Write-Host ("check[{0}] health={1} initials={2} dashboard={3}" -f $_, $h, $i, $d)
}
```

All probe results must be `200` before declaring deployment healthy.

Data integrity checks (must pass):

```powershell
$base = "https://hackreg-ohio-func-2041.azurewebsites.net/api"
$initials = (Invoke-RestMethod -Uri "$base/initials").initials
$all = @()
foreach ($i in $initials) {
  $all += (Invoke-RestMethod -Uri "$base/attendees?initial=$($i.initial)").attendees
}

Write-Host ("Total attendees: " + $all.Count)
$all | Group-Object agency | Sort-Object Name | Select-Object Name,Count | Format-Table -AutoSize
```

Behavior checks:

- Initials render and selecting an initial loads attendees.
- Selecting attendee shows detail panel.
- Check-in toggles to checked state.
- Check-out returns attendee to pending state.
- Manual registration creates a new attendee.
- Dashboard totals and checked-in-by-track summary refresh correctly.
- Current Registration track accordion loads agencies.

## Safe Data Update Pattern

For bulk attendee edits in production:

1. Read current attendees through API endpoints.
2. Transform records in memory.
3. Re-import using `POST /api/import` with same `registrationId` values.
4. Re-query and verify targeted rows.

Do not edit derived fields (`lastName`, `lastInitial`) directly if `name` can be used to derive them.

## Change Guardrails

- Do not remove existing endpoints without migrating all frontend callers.
- Do not introduce mandatory auth flows unless explicitly requested.
- Keep API and frontend path assumptions aligned with `frontend/assets/env.js`.
- Keep JSON responses backward compatible when feasible.
- Prefer small, surgical edits over broad refactors.

## Documentation Update Rule

Any change to behavior, routes, data handling, or deployment process must update:

- `10-event-checkin-spa/README.md`
- this file (`10-event-checkin-spa/copilot-instructions.md`) if the standardized workflow changed

## Live Environment Reference

- Frontend URL: `https://lively-cliff-0c767c51e.7.azurestaticapps.net`
- API Base URL: `https://hackreg-ohio-func-2041.azurewebsites.net/api`
- Resource Group: `rg-hackreg-ohio`
- Function App: `hackreg-ohio-func-2041`
- Static Web App: `hackreg-ohio-swa-2041`
- Storage Account: `hackregohio2041`
