$ErrorActionPreference='Stop'
$csvPath='C:\Users\riwilki\Downloads\bc8a12b3-ca36-4142-a28e-35cdb607c86d_PII_05262026(PII)(in).csv'
$base='https://hackreg-ohio-func-2041.azurewebsites.net/api'

$csv=Import-Csv -Path $csvPath
if(-not $csv -or $csv.Count -eq 0){ throw 'CSV is empty.' }

$initials=(Invoke-RestMethod -Uri "$base/initials" -Method Get).initials
$prod=@()
foreach($i in $initials){ $prod += (Invoke-RestMethod -Uri "$base/attendees?initial=$($i.initial)" -Method Get).attendees }

function Norm([string]$v){ ([string]$v).Trim() }
function Lower([string]$v){ (Norm $v).ToLowerInvariant() }
function KeyFor($email,$name){ $e=Lower $email; if(-not [string]::IsNullOrWhiteSpace($e)){ "email:$e" } else { "name:" + (Lower $name) } }
function MapTrack([string]$t){
  $x=Norm $t
  if($x -eq 'Azure AI & Foundry'){ return 'Pro Code' }
  if($x -eq 'Copilot Studio'){ return 'Low Code' }
  if($x -eq 'M365 Copilot & Copilot Studio'){ return 'No Code' }
  if($x -eq 'No Code' -or $x -eq 'Low Code' -or $x -eq 'Pro Code' -or $x -eq 'Unknown'){ return $x }
  return 'Unknown'
}

$prodMap=@{}
foreach($r in $prod){
  $k=KeyFor $r.email $r.name
  if(-not $prodMap.ContainsKey($k)){ $prodMap[$k]=$r }
}

$added=[System.Collections.Generic.List[object]]::new()
$changed=[System.Collections.Generic.List[object]]::new()
$csvKeys=[System.Collections.Generic.HashSet[string]]::new()

$trackHeader='Which technology track are you interested in participating in? (NOTE: Please only choose a track if you will be participating in the full hackathon)'

foreach($r in $csv){
  $key=KeyFor $r.Email $r.Contact
  $null=$csvKeys.Add($key)

  if(-not $prodMap.ContainsKey($key)){
    $added.Add([pscustomobject]@{ key=$key; name=Norm $r.Contact; email=Norm $r.Email; status=Norm $r.Status; agency=Norm $r.'Company Name'; track=Norm $r.$trackHeader })
    continue
  }

  $p=$prodMap[$key]
  $csvStatus=Norm $r.Status
  $prodStatus=Norm $p.status
  $csvAgency=Norm $r.'Company Name'
  $prodAgency=Norm $p.agency
  $csvTitle=Norm $r.'Job Role'
  $prodTitle=Norm $p.title
  $csvName=Norm $r.Contact
  $prodName=Norm $p.name
  $csvTrack=MapTrack $r.$trackHeader
  $prodTrack=Norm $p.trackSelected

  $diffs=@()
  if((Lower $csvName) -ne (Lower $prodName)){ $diffs += "name: '$prodName' -> '$csvName'" }
  if((Lower $csvTitle) -ne (Lower $prodTitle)){ $diffs += "title: '$prodTitle' -> '$csvTitle'" }
  if((Lower $csvAgency) -ne (Lower $prodAgency)){ $diffs += "agency: '$prodAgency' -> '$csvAgency'" }
  if((Lower $csvStatus) -ne (Lower $prodStatus)){ $diffs += "status: '$prodStatus' -> '$csvStatus'" }
  if((Lower $csvTrack) -ne (Lower $prodTrack)){ $diffs += "track: '$prodTrack' -> '$csvTrack'" }

  if($diffs.Count -gt 0){
    $changed.Add([pscustomobject]@{ key=$key; name=$csvName; email=Norm $r.Email; differences=($diffs -join '; ') })
  }
}

$missing=[System.Collections.Generic.List[object]]::new()
foreach($k in $prodMap.Keys){
  if(-not $csvKeys.Contains($k)){
    $p=$prodMap[$k]
    $missing.Add([pscustomobject]@{ key=$k; name=Norm $p.name; email=Norm $p.email; status=Norm $p.status; agency=Norm $p.agency; track=Norm $p.trackSelected })
  }
}

Write-Output ("CSV_COUNT=" + $csv.Count)
Write-Output ("PROD_COUNT=" + $prod.Count)
Write-Output ("ADDED_COUNT=" + $added.Count)
Write-Output ("CHANGED_COUNT=" + $changed.Count)
Write-Output ("MISSING_COUNT=" + $missing.Count)
Write-Output ''
Write-Output 'ADDED_SAMPLE'
$added | Select-Object -First 20 | ForEach-Object { Write-Output ("{0}`t{1}`t{2}`t{3}`t{4}" -f $_.name,$_.email,$_.status,$_.agency,$_.track) }
Write-Output ''
Write-Output 'CHANGED_SAMPLE'
$changed | Select-Object -First 30 | ForEach-Object { Write-Output ("{0}`t{1}`t{2}" -f $_.name,$_.email,$_.differences) }
Write-Output ''
Write-Output 'MISSING_SAMPLE'
$missing | Select-Object -First 30 | ForEach-Object { Write-Output ("{0}`t{1}`t{2}`t{3}`t{4}" -f $_.name,$_.email,$_.status,$_.agency,$_.track) }
