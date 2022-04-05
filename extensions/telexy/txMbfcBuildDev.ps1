$ErrorActionPreference = "Stop"
$scriptPath = Split-Path $script:MyInvocation.MyCommand.Path -Parent
$scriptName = Split-Path $script:MyInvocation.MyCommand.Path -Leaf
Write-Output "$scriptName starting in $scriptPath"
# Build Telexy Forwarder image
$navPath = [IO.Path]::Combine($scriptPath,"..","..","..","..","..","..","..")
$fusion =[IO.Path]::GetFullPath($navPath)
Write-Output "$scriptName FusionOne root is $fusion"

# Build Telexy Forwarder image

$forwarder = [IO.Path]::Combine($fusion,"Components", "Bot", "Telexy.Bot.Forwarder")
Write-Output "$scriptName Building docker image of Telexy.Bot.Forwarder in $forwarder"
Set-Location $forwarder
# docker build --tag telexy_botforwarder .

# Build Mbfc image
$wsp = [IO.Path]::Combine($fusion, "BuildWorkspace" )
New-Item $wsp -ItemType "directory"
Set-Location $wsp
$mbfc = "Mbfc"
$repo = "https://github.com/microsoft/BotFramework-Composer.git"
$branch = "release/2.1.1"
$mbfc = [IO.Path]::Combine($wsp, $mbfc)
Write-Output "$scriptName Cloning Microsoft Bot Framework Composer into in $mbfc"
git clone --branch $branch --depth 1 --single-branch --no-tags $repo $mbfc
Set-Location $mbfc
#docker build --tag microsoft_mbfc:2.1.1

# Build Tbfc image

$srcDockerFile = [IO.Path]::Combine($scriptPath, "Dockerfile")
$dstDockerFile = [IO.Path]::Combine($mbfc, "Dockerfile")
$srcDockerIgnore = [IO.Path]::Combine($scriptPath, ".dockerignore")
$dstDockerIgnore = [IO.Path]::Combine($mbfc, ".dockerignore")
$srcExt = [IO.Path]::Combine($forwarder, "Mbfc", "Composer", "extensions", "telexy")
$destExt = [IO.Path]::Combine($mbfc,"extensions","telexy")
Write-Output "$scriptName Overwriting $dstDockerFile with $srcDockerFile"
Copy-Item $srcDockerFile $dstDockerFile -Force
Write-Output "$scriptName Overwriting $dstDockerIgnore with $srcDockerIgnore"
Copy-Item $srcDockerIgnore $dstDockerIgnore -Force
Write-Output "$scriptName Copying $srcExt into $destExt"
Copy-Item $srcExt $destExt -Recurse
#docker build --tag telexy_mbfc .
Set-Location $scriptPath
