Set-StrictMode -Version 3.0
$ErrorActionPreference = "Stop"
$fusion = $env:wsp2
if ([string]::IsNullOrWhiteSpace($fusion)) {
    Write-Error "Environment is not set! wsp2"
}
$dest = [IO.Path]::GetFullPath("$fusion/Fusion.One/Components/Bot/Telexy.Bot.Forwarder/Mbfc/Composer/extensions/telexy")
$di = New-Object -TypeName "System.IO.DirectoryInfo" -ArgumentList $dest
if (-not $di.Exists) { Write-Error "Directory does not exists! $dest"}
$src = $PSScriptRoot
$choice = ""

while ($choice -notmatch "[y|n]") {
    $choice = Read-Host "(Y/N) Would you like to transfer changes from $src to $dest "
}

if ($choice -eq "y") {
    Write-Host "Yes! Starting " -ForegroundColor Green
    robocopy $src $dest /mir /v /xo /xd .git node_modules out obj bin lib .vs /xf *.cmd *.vsix yarn-error.log /x
} else {
    Write-Host "No is selected!" -ForegroundColor DarkCyan
}