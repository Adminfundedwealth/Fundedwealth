$env:NODE_ENV = "development"
try {
    node --use-system-ca --enable-source-maps ./dist/index.mjs 2>&1
} catch {
    Write-Host "CRASH: $_"
}
