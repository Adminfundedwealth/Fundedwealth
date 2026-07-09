# Set database URL
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/fundedwealth_dev'

# Start API server
Write-Host "Starting API server..."
cd c:\Users\jitro\Fundedwealth-2\artifacts\api-server
pnpm run start
