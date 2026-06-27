@echo off
REM Batch script to run all diagnostics and capture output

setlocal enabledelayedexpansion

REM Change to api-server directory
cd /d "C:\Users\rmsam\Desktop\fundedwealth (1) data\fundedwealth\artifacts\api-server"

REM Run simple diagnostic
echo === RUNNING SIMPLE DIAGNOSTIC ===
node simple_diagnostic.js > diagnostic_run_output.txt 2>&1

REM Show if file was created
if exist diagnostic_run_output.txt (
  echo Diagnostic report saved to diagnostic_run_output.txt
) else (
  echo Failed to create diagnostic_run_output.txt
)

REM Show current directory
cd > current_dir.txt

REM List key files
dir dist\index.mjs 2>nul > dist_check.txt || echo dist/index.mjs not found >> dist_check.txt
dir src\index.ts 2>nul > src_check.txt || echo src/index.ts not found >> src_check.txt

echo All checks complete
