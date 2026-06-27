#!/bin/bash
set -e

# Build the frontend
pnpm --filter @workspace/fundedwealth build

# Create Vercel Build Output API structure
rm -rf .vercel/output
mkdir -p .vercel/output/static

# Copy build output to static directory
cp -r artifacts/fundedwealth/dist/* .vercel/output/static/

# Create config with SPA routing, redirects, and security headers
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "/register",
      "headers": { "Location": "/sign-up" },
      "status": 302
    },
    {
      "src": "/assets/(.*)",
      "headers": { "Cache-Control": "public, max-age=31536000, immutable" },
      "continue": true
    },
    {
      "src": "/(.*)",
      "headers": {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self)",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
      },
      "continue": true
    },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

echo "Build Output API structure created at .vercel/output/"
