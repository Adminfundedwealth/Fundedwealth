param([string]$apiBase = "https://fundedwealth-api-production.up.railway.app")
$key = "fw-diag-2026"

$wc = New-Object System.Net.WebClient

# 1. Global counts
$j1 = $wc.DownloadString("$apiBase/api/diag/accounts?key=$key&email=test%40test.com")
$d1 = ConvertFrom-Json $j1
Write-Host "=== GLOBAL ACTIVE CHALLENGE COUNT ==="
Write-Host "Total active challenge_accounts: $($d1.globalActiveChallengeCount)"

# 2. Clerk/external_id health check
$j2 = $wc.DownloadString("$apiBase/api/diag/clerk?key=$key&sample=5")
$d2 = ConvertFrom-Json $j2
Write-Host ""
Write-Host "=== CLERK_ID HEALTH ==="
Write-Host "Total users:        $($d2.summary.total.c)"
Write-Host "Placeholder IDs:    $($d2.summary.placeholders.c)"
Write-Host "Real UUID IDs:      $($d2.summary.uuids.c)"
Write-Host ""
Write-Host "Sample rows (latest 20 users):"
foreach ($row in $d2.sample) {
    $ph = if ($row.is_placeholder) { "PLACEHOLDER" } elseif (-not $row.looks_like_uuid) { "NON-UUID" } else { "uuid-ok" }
    $match = if ($row.external_id_matches_user_id -eq $null) { "no-trader" } elseif ($row.external_id_matches_user_id) { "ext-MATCH" } else { "ext-MISMATCH" }
    Write-Host "  [$ph / $match] $($row.email)"
}

Write-Host ""
Write-Host "=== USERS WHERE external_id MISMATCHES users.id ==="
$mismatches = $d2.sample | Where-Object { $_.has_trader -and -not $_.external_id_matches_user_id }
Write-Host "Mismatches in sample: $($mismatches.Count)"
foreach ($m in $mismatches) {
    Write-Host "  email=$($m.email)"
    Write-Host "  users.id not shown | external_id=$($m.external_id)"
}

Write-Host ""
Write-Host "=== DONE ==="
