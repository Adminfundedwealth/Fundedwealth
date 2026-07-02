# Cloudflare Turnstile CAPTCHA Configuration

## Current Status: DISABLED ❌

CAPTCHA is currently **disabled** to allow production testing without interruption.

## How to Re-Enable CAPTCHA

### Step 1: Enable the Feature Flag

Edit `artifacts/fundedwealth/src/config/features.ts`:

```typescript
export const FEATURES = {
  ENABLE_TURNSTILE: true,  // Change from false to true
} as const;
```

### Step 2: Verify Environment Variables

Ensure these are set in your deployment environment (Vercel):

```bash
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAD1MKR834O5Sg6TwA
```

**Important**: The sitekey must have `Sg6` not `Sq6` (previously had typo)

### Step 3: Verify Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Turnstile
2. Confirm `fundedwealth.com` is in the authorized domains list
3. Verify the sitekey matches the environment variable

### Step 4: Deploy

```bash
git add artifacts/fundedwealth/src/config/features.ts
git commit -m "feat: re-enable Cloudflare Turnstile CAPTCHA"
git push origin main
```

Vercel will automatically deploy with CAPTCHA enabled.

## What This Feature Flag Controls

### When `ENABLE_TURNSTILE = false` (Current):
- ✅ No CAPTCHA widget shown on login page
- ✅ No CAPTCHA widget shown on signup page
- ✅ No CAPTCHA validation performed
- ✅ Users can login/signup immediately
- ✅ All CAPTCHA code remains in the repository

### When `ENABLE_TURNSTILE = true`:
- 🔒 CAPTCHA widget appears on login page
- 🔒 CAPTCHA widget appears on signup page
- 🔒 CAPTCHA must be verified before submission
- 🔒 Login/signup buttons disabled until CAPTCHA verified
- 🔒 Backend validation enforced (if implemented)

## Files Modified

1. **artifacts/fundedwealth/src/config/features.ts** - Feature flag configuration
2. **artifacts/fundedwealth/src/pages/sign-in.tsx** - Login page with conditional CAPTCHA
3. **artifacts/fundedwealth/src/pages/sign-up.tsx** - Signup page with conditional CAPTCHA

## No Code Deleted

All CAPTCHA implementation files are **preserved**:
- `/src/components/TurnstileWidget.tsx` ✓
- `/src/hooks/useCaptcha.ts` ✓
- Backend verification code ✓

## Testing After Re-enabling

1. Visit `/sign-in` - CAPTCHA widget should appear
2. Visit `/sign-up` - CAPTCHA widget should appear
3. Try logging in without completing CAPTCHA - should be blocked
4. Complete CAPTCHA - login should work
5. Check browser console for any Turnstile errors

## Troubleshooting

If CAPTCHA doesn't work after re-enabling:

1. **Error 400020**: Sitekey or domain mismatch
   - Verify sitekey in Vercel env vars
   - Check authorized domains in Cloudflare dashboard
   
2. **Widget not rendering**: 
   - Check browser console for errors
   - Verify Turnstile script loads: `https://challenges.cloudflare.com/turnstile/v0/api.js`

3. **Widget appears but doesn't verify**:
   - Check network tab for API calls to Cloudflare
   - Verify sitekey is correct in environment

## Rollback

To disable CAPTCHA again:

```typescript
// artifacts/fundedwealth/src/config/features.ts
export const FEATURES = {
  ENABLE_TURNSTILE: false,
} as const;
```

Commit and push. CAPTCHA will be disabled within 2-3 minutes.
