#!/bin/bash
set -e

DOMAIN="izzamuzzic.com"
EMAIL="${1:?Usage: ./deploy.sh your@email.com}"

echo "=== Step 1: Build app ==="
docker compose build

echo "=== Step 2: Start with HTTP-only (for certbot) ==="
# Temporarily use init config without SSL
cp nginx/default.conf nginx/default.conf.bak
cp nginx/init.conf nginx/default.conf
docker compose up -d app nginx

echo "=== Step 3: Obtain SSL certificate ==="
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

echo "=== Step 4: Switch to SSL config and restart nginx ==="
cp nginx/default.conf.bak nginx/default.conf
rm nginx/default.conf.bak
docker compose restart nginx

echo ""
echo "=== Done! Site live at https://$DOMAIN ==="
echo ""
echo "Add SSL auto-renewal to crontab:"
echo "  0 3 1 * * cd $(pwd) && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload"
