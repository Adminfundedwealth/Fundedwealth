$token = "Iowv2CDJxETfH81PfaIse3pcUbqJwmvbLp2Jih9p-Il"
$deployId = "7a52f8f0-62a6-4711-b731-a728ba67d0af"
$envId = "16f08975-7d0d-4624-afeb-3ac5f2743402"
$serviceId = "f2f00ffd-e354-4909-aa27-cd20d7ab5733"

# Get environment variables set on this service
$q = '{ serviceInstance(environmentId: "' + $envId + '", serviceId: "' + $serviceId + '") { id } }'
$body = @{ query = $q } | ConvertTo-Json -Compress
$r = Invoke-WebRequest -Uri "https://backboard.railway.com/graphql/v2" `
  -Method POST -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body $body -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "ServiceInstance: $($r.Content)"

# Try to get plugin/vars via the v2 REST API instead
$r2 = Invoke-WebRequest -Uri "https://backboard.railway.com/graphql/v2" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body '{"query":"{ me { id name email } }"}' -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "Me: $($r2.Content)"
