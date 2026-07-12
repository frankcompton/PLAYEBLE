@echo off
setlocal
cd /d "%~dp0"

set "SOURCE_KEY="
if exist ".secrets\playable_handoff" set "SOURCE_KEY=%~dp0.secrets\playable_handoff"
if exist ".secrets\vps_key" set "SOURCE_KEY=%~dp0.secrets\vps_key"

if defined SOURCE_KEY (
  if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh" >nul 2>nul
  copy /Y "%SOURCE_KEY%" "%USERPROFILE%\.ssh\playeble_deploy_key" >nul 2>nul
  if exist "%USERPROFILE%\.ssh\playeble_deploy_key" (
    icacls "%USERPROFILE%\.ssh\playeble_deploy_key" /inheritance:r >nul 2>nul
    icacls "%USERPROFILE%\.ssh\playeble_deploy_key" /grant:r "%USERDOMAIN%\%USERNAME%:F" >nul 2>nul
    set "VPS_SSH_KEY_PATH=%USERPROFILE%\.ssh\playeble_deploy_key"
  )
)

node deploy-project.mjs %*
exit /b %ERRORLEVEL%
