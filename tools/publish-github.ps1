param([ValidateSet('publish','status','deploy')][string]$Mode='status')
$ErrorActionPreference='Stop'
$repoRoot=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot
$env:GIT_TERMINAL_PROMPT='0'
$env:GCM_INTERACTIVE='Never'
$credentialLines="protocol=https`nhost=github.com`n`n" | git credential fill 2>$null
if($LASTEXITCODE -ne 0){throw 'GitHub sign-in is unavailable in Git Credential Manager.'}
$credential=@{}
foreach($line in $credentialLines){$parts=$line -split '=',2;if($parts.Count -eq 2){$credential[$parts[0]]=$parts[1]}}
if(-not $credential['password']){throw 'GitHub credentials are unavailable.'}
$headers=@{Authorization=('Bearer '+$credential['password']);Accept='application/vnd.github+json';'X-GitHub-Api-Version'='2022-11-28'}
function GitHub([string]$method,[string]$route,$body=$null){
  $args=@{Method=$method;Uri=('https://api.github.com'+$route);Headers=$headers}
  if($null -ne $body){$args.ContentType='application/json';$args.Body=($body|ConvertTo-Json -Depth 10 -Compress)}
  Invoke-RestMethod @args
}
$identity=GitHub 'GET' '/user'
if($identity.login -ne 'guildcoder'){throw 'The active GitHub account is not the verified repository owner guildcoder.'}
$repo='guildcoder/bumpery'
if($Mode -eq 'status'){
  $repository=GitHub 'GET' "/repos/$repo"
  $pages=GitHub 'GET' "/repos/$repo/pages"
  $runs=GitHub 'GET' "/repos/$repo/actions/runs?per_page=3"
  [pscustomobject]@{repository=$repository.html_url;site=$pages.html_url;status=$pages.status;runs=@($runs.workflow_runs|Select-Object id,status,conclusion,html_url)}|ConvertTo-Json -Depth 5
  exit
}
if($Mode -eq 'deploy'){
  $remote=git remote get-url origin
  if($remote -ne 'https://github.com/guildcoder/bumpery.git'){throw 'Unexpected Git remote.'}
  $branch=git branch --show-current
  if($branch -ne 'main'){git branch -m main;if($LASTEXITCODE -ne 0){throw 'Could not align the release branch.'}}
  git push -u origin main
  if($LASTEXITCODE -ne 0){throw 'Could not push the release branch.'}
  GitHub 'PATCH' "/repos/$repo" @{default_branch='main'}|Out-Null
  GitHub 'POST' "/repos/$repo/actions/workflows/pages.yml/dispatches" @{ref='main'}|Out-Null
  Write-Output 'Deployment dispatched from main, matching the existing Pages protection rule.'
  exit
}
# Creation is intentionally separate from replacing any pre-existing repository.
try{$existing=GitHub 'GET' "/repos/$repo"}catch{if([int]$_.Exception.Response.StatusCode -ne 404){throw};$existing=$null}
if($existing){throw 'A repository named bumpery already exists. Inspect it before publishing.'}
$created=GitHub 'POST' '/user/repos' @{name='bumpery';description='Bumpery: original pinball tables for iPhone, web, and Chrome. Play Starbound Parlor, with more tables to come.';private=$false;auto_init=$false;has_wiki=$false;has_projects=$false}
Write-Output ('Created '+$created.html_url)
$existingRemote=$null
if(@(git remote) -contains 'origin'){$existingRemote=git remote get-url origin}
if($existingRemote -and $existingRemote -ne $created.clone_url){throw 'An unrelated origin remote is configured.'}
if(-not $existingRemote){git remote add origin $created.clone_url;if($LASTEXITCODE -ne 0){throw 'Could not add GitHub remote.'}}
git add -- .gitignore .github README.md DESIGN.md TABLES.md VERIFICATION.md backend extension tests tools
if($LASTEXITCODE -ne 0){throw 'Could not stage project files.'}
$authorEmail=([string]$identity.id)+'+'+$identity.login+'@users.noreply.github.com'
git -c "user.name=$($identity.login)" -c "user.email=$authorEmail" commit -m 'Launch Bumpery with Starbound Parlor, Home Screen installation, and global scores'
if($LASTEXITCODE -ne 0){throw 'Could not commit project files.'}
$branch=git branch --show-current
git push -u origin $branch
if($LASTEXITCODE -ne 0){throw 'Could not push the project to GitHub.'}
$pages=GitHub 'POST' "/repos/$repo/pages" @{build_type='workflow'}
GitHub 'POST' "/repos/$repo/actions/workflows/pages.yml/dispatches" @{ref=$branch}|Out-Null
Write-Output ('Pages enabled: '+$pages.html_url)
