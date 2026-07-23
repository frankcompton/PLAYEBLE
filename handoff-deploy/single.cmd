@echo off
setlocal
cd /d "%~dp0"
call "%~dp0run-node.cmd" single.mjs
pause
