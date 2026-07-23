@echo off
setlocal
cd /d "%~dp0"
call "%~dp0run-node.cmd" node_modules\vite\bin\vite.js --host 127.0.0.1
pause
