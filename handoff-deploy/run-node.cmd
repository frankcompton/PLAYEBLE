@echo off
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  node %*
  exit /b %ERRORLEVEL%
)
set "NODE_BIN=%~dp0tools\node-win-x64\node.exe"
if not exist "%NODE_BIN%" (
  echo Node.js was not found. Install Node.js or keep tools\node-win-x64\node.exe in this folder.
  exit /b 1
)
"%NODE_BIN%" %*
exit /b %ERRORLEVEL%
