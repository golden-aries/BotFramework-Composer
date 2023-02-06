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
    robocopy $src $dest /mir /v /xo /xd .git node_modules out dist obj bin lib .vs /xf *.cmd *.vsix yarn-error.log /x
} else {
    Write-Host "No is selected!" -ForegroundColor DarkCyan
}

# https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/robocopy
# /e	Copies subdirectories. This option automatically includes empty directories.
# /purge	Deletes destination files and directories that no longer exist in the source. Using this option with the /e option and a destination directory, allows the destination directory security settings to not be overwritten.
# /mir	Mirrors a directory tree (equivalent to /e plus /purge). Using this option with the /e option and a destination directory, overwrites the destination directory security settings.
# /v	Produces verbose output, and shows all skipped files.
# /xo	Source directory files older than the destination are excluded from the copy.
# /xf <filename>[ ...]	Excludes files that match the specified names or paths. Wildcard characters (* and ?) are supported.
# /xd <directory>[ ...]	Excludes directories that match the specified names and paths.
# /x	Reports all extra files, not just the ones that are selected.