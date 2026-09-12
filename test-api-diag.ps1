param([string]$apiBase = "https://fundedwealth-api-production.up.railway.app")

$diagKey = "fw-diag-2026"

# 1. Get overall ownership summary
Write-Host "=== STEP 1: OWNERSHIP SUMMARY (active challenges) ==="
$wc = New-Object System.Net.WebClient
$json = $wc.DownloadString("$apiBase/api/diag/accounts?key=$diagKey&email=test%40test.com")
$d = ConvertFrom-Json $json
$s = $d.activeChallengeSummary

$linked   = @($s | Where-Object { $_.linkStatus -eq "linked" }).Count
$unlinked = @($s | Where-Object { $_.linkStatus -eq "UNLINKED" }).Count
Write-Host "Total active accounts (sample): $($s.Count)"
Write-Host "  Linked (visible to users):   $linked"
Write-Host "  UNLINKED (invisible!):        $unlinked"

$multi = @($s | Group-Object traderEmail | Where-Object { $_.Count -gt 1 })
Write-Host "Multi-account users in sample: $($multi.Count)"
foreach ($m in $multi) {
    Write-Host "  $($m.Name): $($m.Count) active accounts"
}

# 2. Check specific users from the active list
Write-Host ""
Write-Host "=== STEP 2: PER-USER PROBE (5 known active users) ==="
$emailsRaw = @($s | Select-Object -ExpandProperty traderEmail -Unique)
$testEmails = $emailsRaw | Select-Object -First 5
foreach ($email in $testEmails) {
    $enc  = [System.Uri]::EscapeDataString($email)
    $url  = "$apiBase/api/diag/accounts?key=$diagKey&email=$enc"
    $j2   = $wc.DownloadString($url)
    $d2   = ConvertFrom-Json $j2
    foreach ($u in $d2.users) {
        $ph = ($u.clerkId -like "provisioned_*" -or $u.clerkId -like "supabase_pending_*")
        $tById  = @($u.traderByUsersId).Count
        $tEmail = @($u.traderByEmail).Count
        $accts  = @($u.tradingAccounts).Count
        Write-Host "[$email]  clerkPlaceholder=$ph  traderById=$tById  traderByEmail=$tEmail  accounts=$accts  mismatch=$($u.mismatch)"
    }
}

# 3. Check a user with multiple accounts (cryptofundedwealth appeared twice)
Write-Host ""
Write-Host "=== STEP 3: MULTI-ACCOUNT USER TEST ==="
$cryptoEmail = "cryptofundedwealth%40gmail.com"
$j3  = $wc.DownloadString("$apiBase/api/diag/accounts?key=$diagKey&email=$cryptoEmail")
$d3  = ConvertFrom-Json $j3
foreach ($u in $d3.users) {
    $accts = @($u.tradingAccounts)
    Write-Host "cryptofundedwealth: userId=$($u.userId) accounts=$($accts.Count)"
    foreach ($a in $accts) {
        Write-Host "  $($a.account_code) | ta_status=$($a.ta_status) | challenge=$($a.challenge_status) | plan=$($a.plan)"
    }
}

Write-Host ""
Write-Host "=== STEP 4: ACCOUNTS API RESPONSE (unauthenticated - expect 401) ==="
try {
    $wc.DownloadString("$apiBase/api/accounts/my")
} catch {
    Write-Host "Expected 401: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== DONE ==="
