#!/bin/bash
# ============================================================
# FundedWealth EC2 Backend Setup Script
# Run this on a fresh Ubuntu 22.04/24.04 EC2 instance
# ============================================================

set -e

echo "=========================================="
echo "FundedWealth API Server - EC2 Setup"
echo "=========================================="

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install pnpm
sudo npm install -g pnpm@9

# 4. Install PM2 (process manager)
sudo npm install -g pm2

# 5. Install Nginx
sudo apt install -y nginx

# 6. Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# 7. Create app directory
sudo mkdir -p /opt/fundedwealth
sudo chown $USER:$USER /opt/fundedwealth

# 8. Clone and setup (replace with actual repo URL)
echo ""
echo "Clone your repo into /opt/fundedwealth:"
echo "  cd /opt/fundedwealth"
echo "  git clone <your-repo-url> ."
echo "  pnpm install --no-frozen-lockfile"
echo "  pnpm --filter @workspace/db run build"
echo "  pnpm --filter @workspace/api-zod run build"
echo "  pnpm --filter @workspace/api-server run build"
echo ""

# 9. Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo ""
echo "=========================================="
echo "Setup complete! Next steps:"
echo "1. Clone repo to /opt/fundedwealth"
echo "2. Create /opt/fundedwealth/.env with production vars"
echo "3. Run: pm2 start ecosystem.config.cjs"
echo "4. Configure Nginx (see nginx.conf)"
echo "5. Get SSL cert: sudo certbot --nginx -d api.fundedwealth.com"
echo "6. Run: pm2 save && pm2 startup"
echo "=========================================="
