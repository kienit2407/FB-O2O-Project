#!/bin/bash

# Script để seed dữ liệu thực đơn cho merchant
# Sử dụng: ./seed-merchant-menu.sh <user_id> <email>

set -e

USER_ID="$1"
USER_EMAIL="$2"

if [ -z "$USER_ID" ] || [ -z "$USER_EMAIL" ]; then
  echo "Usage: ./seed-merchant-menu.sh <user_id> <email>"
  echo ""
  echo "Example:"
  echo '  ./seed-merchant-menu.sh "698d3ca5001a035ba0dce744" "votrungkien240705@gmail.com"'
  exit 1
fi

echo "========================================"
echo "Seeding Merchant Menu Data"
echo "========================================"
echo ""
echo "User ID: $USER_ID"
echo "User Email: $USER_EMAIL"
echo ""
echo "Running TypeScript script..."
echo ""

# Chạy script seeding
cd /Users/kinit/Documents/FaB-O2O

npx ts-node scripts/seed-merchant-menu.ts "$USER_ID" "$USER_EMAIL"

echo ""
echo "✅ Seeding completed!"
echo ""
echo "You can now test the API:"
echo "  GET  http://localhost:4000/merchant/menu/categories"
echo "  GET  http://localhost:4000/merchant/menu/products"
echo "  GET  http://localhost:4000/merchant/menu/toppings"
echo ""
