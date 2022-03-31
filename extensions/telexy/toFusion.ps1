$ErrorActionPreference = "Stop"
$fusion = $env:tlxFusion
if ([string]::IsNullOrWhiteSpace($fusion)) {
    Write-Error "Environment is not set! tlxFusion"
}
$dest = [IO.Path]::Combine($fusion,"Components","Bot","Telexy.Bot.Forwarder", "Mbfc", "Composer", "extensions", "telexy")
$src = Split-Path $script:MyInvocation.MyCommand.Path -Parent
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