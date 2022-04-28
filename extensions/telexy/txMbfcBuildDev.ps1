$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"
$scriptPath = Split-Path $script:MyInvocation.MyCommand.Path -Parent
$scriptName = Split-Path $script:MyInvocation.MyCommand.Path -Leaf
Write-Output "$scriptName starting in $scriptPath"
$navPath = [IO.Path]::Combine($scriptPath,"..","..","..","..","..","..","..")
#$navPath = [IO.Path]::Combine($scriptPath,"..","..","..","..")
$fusion =[IO.Path]::GetFullPath($navPath)
if (!$fusion.EndsWith("Fusion.One")) {
  Write-Error("Wrong FusonOne root! $fusion")
}
Write-Output "$scriptName FusionOne root is $fusion"
$wsp = [IO.Path]::Combine($fusion, "BuildWorkspace")
if ([IO.directory]::Exists($wsp)) {
  Write-Information "Cleaning workspace. $wsp"
  Remove-Item $wsp -Recurse -Force
}
New-Item $wsp -ItemType "directory"

$mbfc = "Mbfc"
$repo = "https://github.com/microsoft/BotFramework-Composer.git"
$branch = "release/2.1.1"
$mbfc = [IO.Path]::Combine($wsp, $mbfc)
Write-Output "$scriptName Cloning Microsoft Bot Framework Composer into in $mbfc"
git clone --branch $branch --depth 1 --single-branch --no-tags $repo $mbfc

# remove unused extensions
$extToRemove = @(
  'authTest'
  'azurePublish',
  'azurePublishNew',
  'githubAuth',
  'mockRemotePublish',
  'localPublish',
  'mongoStorage',
  'pvaPublish',
  'runtimes',
  'sample-ui-plugin',
  'samples',
  'webRoute'
);
Foreach($ext in $extToRemove)
{
    $extDir = [IO.Path]::Combine($mbfc, "extensions", $ext);
    Write-Information "Removing unused MBFC extension: $extDir"
    Remove-Item $extDir -Recurse -Force
}

$forwarder = [IO.Path]::Combine($fusion,"Components", "Bot", "Telexy.Bot.Forwarder")
$forwarderProj = [IO.Path]::Combine($forwarder,"Telexy.Bot.Forwarder.csproj")
$mbfcForwarder = [IO.Path]::Combine($mbfc, "forwarder")
Write-Output "$scriptName Building $forwarderProj into $mbfcForwarder"
#docker build --tag telexy_botforwarder:latest .
dotnet publish -c Release --self-contained true -r linux-x64 -o "$mbfcForwarder" "$forwarderProj"

$srcDockerFile = [IO.Path]::Combine($forwarder,"Mbfc", "Composer", "extensions", "telexy", "Dockerfile.template")
$dstDockerFile = [IO.Path]::Combine($mbfc, "Dockerfile")
$srcDockerIgnore = [IO.Path]::Combine($forwarder, "Mbfc", "Composer", "extensions", "telexy", ".dockerignore.template")
$dstDockerIgnore = [IO.Path]::Combine($mbfc, ".dockerignore")
$srcExt = [IO.Path]::Combine($forwarder, "Mbfc", "Composer", "extensions", "telexy")
$destExt = [IO.Path]::Combine($mbfc,"extensions","telexy")
Write-Output "$scriptName Overwriting $dstDockerFile with $srcDockerFile"
Copy-Item $srcDockerFile $dstDockerFile -Force
Write-Output "$scriptName Overwriting $dstDockerIgnore with $srcDockerIgnore"
Copy-Item $srcDockerIgnore $dstDockerIgnore -Force
Write-Output "$scriptName Copying $srcExt into $destExt"
Copy-Item $srcExt $destExt -Recurse
docker build --tag telexy_bfc:latest $mbfc