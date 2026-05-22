$ErrorActionPreference = 'Stop'

$base = 'https://hackreg-ohio-func-2041.azurewebsites.net/api'
$csvPath = 'C:\Users\riwilki\OneDrive - Microsoft\04_SE SLED\OH\26.06\registrations1.csv'

# 1) Snapshot current attendees
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$snapshotDir = 'C:\Code-Ricardo\ai-hack-foundry-usecases\10-event-checkin-spa\snapshots'
New-Item -ItemType Directory -Path $snapshotDir -Force | Out-Null
$snapshotPath = Join-Path $snapshotDir ("attendees-before-replace-" + $stamp + ".json")
$initials = (Invoke-RestMethod -Uri "$base/initials" -Method Get).initials
$beforeAll = @()
foreach ($i in $initials) {
  $beforeAll += (Invoke-RestMethod -Uri "$base/attendees?initial=$($i.initial)" -Method Get).attendees
}
$beforeAll | ConvertTo-Json -Depth 10 | Set-Content -Path $snapshotPath -Encoding utf8

# 2) Build replacement attendees from CSV
$rows = Import-Csv -Path $csvPath
$headers = $rows[0].PSObject.Properties.Name
$trackHeader = $headers | Where-Object { $_ -like 'Which technology track are you interested in participating in*' } | Select-Object -First 1

function Map-Track([string]$track) {
  $t = [string]$track
  if ($t -eq 'Azure AI & Foundry') { return 'Pro Code' }
  if ($t -eq 'Copilot Studio') { return 'Low Code' }
  if ($t -eq 'M365 Copilot & Copilot Studio') { return 'No Code' }
  return 'Unknown'
}

$attendees = @()
for ($i = 0; $i -lt $rows.Count; $i++) {
  $r = $rows[$i]
  $attendees += [PSCustomObject]@{
    registrationId = ('prod-2026-' + ($i + 1).ToString('00000'))
    status = 'Pending'
    name = [string]$r.Contact
    title = [string]$r.'Job Role'
    agency = [string]$r.'Company Name'
    trackSelected = (Map-Track ([string]$r.$trackHeader))
  }
}

$payload = @{ attendees = $attendees } | ConvertTo-Json -Depth 10
$replace = Invoke-RestMethod -Uri "$base/replace" -Method Post -ContentType 'application/json' -Body $payload

# 3) Verify after replace
$initialsAfter = (Invoke-RestMethod -Uri "$base/initials" -Method Get).initials
$afterAll = @()
foreach ($i in $initialsAfter) {
  $afterAll += (Invoke-RestMethod -Uri "$base/attendees?initial=$($i.initial)" -Method Get).attendees
}
$byAgency = $afterAll | Group-Object agency | Sort-Object -Property @{Expression='Count';Descending=$true}, @{Expression='Name';Descending=$false}
$dash = Invoke-RestMethod -Uri "$base/dashboard" -Method Get

Write-Output ("SNAPSHOT_PATH=" + $snapshotPath)
Write-Output ("BEFORE_TOTAL=" + $beforeAll.Count)
Write-Output ("REPLACE_IMPORTED=" + $replace.imported)
Write-Output ("REPLACE_TOTAL=" + $replace.total)
Write-Output ("AFTER_TOTAL=" + $afterAll.Count)
Write-Output ("UNIQUE_AGENCIES_AFTER=" + ($byAgency | Measure-Object).Count)
Write-Output ("TRACK_COUNTS_NoCode=" + $dash.trackCounts.'No Code')
Write-Output ("TRACK_COUNTS_LowCode=" + $dash.trackCounts.'Low Code')
Write-Output ("TRACK_COUNTS_ProCode=" + $dash.trackCounts.'Pro Code')
Write-Output ("TRACK_COUNTS_Unknown=" + $dash.trackCounts.Unknown)
Write-Output ''
Write-Output 'TOP_AGENCIES_AFTER'
$byAgency | Select-Object -First 20 | ForEach-Object { Write-Output ("{0}`t{1}" -f $_.Name, $_.Count) }
