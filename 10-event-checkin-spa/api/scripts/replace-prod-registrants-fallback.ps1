$ErrorActionPreference = 'Stop'

$base = 'https://hackreg-ohio-func-2041.azurewebsites.net/api'
$csvPath = 'C:\Users\riwilki\OneDrive - Microsoft\04_SE SLED\OH\26.06\registrations1.csv'

# Load existing prod ids
$initials = (Invoke-RestMethod -Uri "$base/initials" -Method Get).initials
$existing = @()
foreach ($i in $initials) {
  $existing += (Invoke-RestMethod -Uri "$base/attendees?initial=$($i.initial)" -Method Get).attendees
}
$existingIds = $existing | Select-Object -ExpandProperty registrationId

# Load csv
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

if ($existingIds.Count -ne $rows.Count) {
  Write-Output ("COUNT_MISMATCH existing=" + $existingIds.Count + " csv=" + $rows.Count)
  exit 2
}

$sortedIds = $existingIds | Sort-Object
$attendees = @()
for ($i = 0; $i -lt $rows.Count; $i++) {
  $r = $rows[$i]
  $attendees += [PSCustomObject]@{
    registrationId = [string]$sortedIds[$i]
    status = 'Pending'
    name = [string]$r.Contact
    title = [string]$r.'Job Role'
    agency = [string]$r.'Company Name'
    trackSelected = (Map-Track ([string]$r.$trackHeader))
  }
}

$payload = @{ attendees = $attendees } | ConvertTo-Json -Depth 10
$result = Invoke-RestMethod -Uri "$base/import" -Method Post -ContentType 'application/json' -Body $payload
$dash = Invoke-RestMethod -Uri "$base/dashboard" -Method Get

$initialsAfter = (Invoke-RestMethod -Uri "$base/initials" -Method Get).initials
$after = @()
foreach ($i in $initialsAfter) {
  $after += (Invoke-RestMethod -Uri "$base/attendees?initial=$($i.initial)" -Method Get).attendees
}
$byAgency = $after | Group-Object agency | Sort-Object -Property @{Expression='Count';Descending=$true}, @{Expression='Name';Descending=$false}

Write-Output ("IMPORT_IMPORTED=" + $result.imported)
Write-Output ("IMPORT_TOTAL=" + $result.total)
Write-Output ("AFTER_TOTAL=" + $after.Count)
Write-Output ("UNIQUE_AGENCIES_AFTER=" + ($byAgency | Measure-Object).Count)
Write-Output ("TRACK_NoCode=" + $dash.trackCounts.'No Code')
Write-Output ("TRACK_LowCode=" + $dash.trackCounts.'Low Code')
Write-Output ("TRACK_ProCode=" + $dash.trackCounts.'Pro Code')
Write-Output ("TRACK_Unknown=" + $dash.trackCounts.Unknown)
Write-Output ''
Write-Output 'TOP_AGENCIES_AFTER'
$byAgency | Select-Object -First 20 | ForEach-Object { Write-Output ("{0}`t{1}" -f $_.Name, $_.Count) }
