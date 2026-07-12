@echo off
setlocal
cd /d "%~dp0"
if exist ".secrets\vps_key" (
  if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh" >nul 2>nul
  copy /Y ".secrets\vps_key" "%USERPROFILE%\.ssh\playeble_deploy_key" >nul 2>nul
  if exist "%USERPROFILE%\.ssh\playeble_deploy_key" (
    icacls "%USERPROFILE%\.ssh\playeble_deploy_key" /inheritance:r >nul 2>nul
    icacls "%USERPROFILE%\.ssh\playeble_deploy_key" /grant:r "%USERDOMAIN%\%USERNAME%:F" >nul 2>nul
    set "VPS_SSH_KEY_PATH=%USERPROFILE%\.ssh\playeble_deploy_key"
  )
)
call "%~dp0run-node.cmd" deploy-project.mjs %*
pause
