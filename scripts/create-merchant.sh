#!/bin/bash

# Script để tạo merchant cho user hiện tại
# Cần: JWT token của user

set -e

BASE_URL="http://localhost:4000"

if [ -z "$1" ]; then
  echo "Usage: ./create-merchant.sh <JWT_TOKEN>"
  echo ""
  echo "Example:"
  echo '  ./create-merchant.sh "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."'
  exit 1
fi

JWT_TOKEN="$1"

echo "========================================="
echo "Creating merchant for current user"
echo "========================================="
echo ""

echo "Sending request to: ${BASE_URL}/merchant/menu/categories/debug/create-merchant"
echo ""

RESPONSE=$(curl -s -X POST "${BASE_URL}/merchant/menu/categories/debug/create-merchant" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool || echo "$RESPONSE"
echo ""

# Check if merchant was created successfully
if echo "$RESPONSE" | grep -q "Merchant created"; then
  echo "✅ Merchant created successfully!"
  echo ""
  echo "Now you can test merchant endpoints:"
  echo "  GET  ${BASE_URL}/merchant/menu/categories"
  echo "  GET  ${BASE_URL}/merchant/menu/products"
  echo "  GET  ${BASE_URL}/merchant/menu/toppings"
elif echo "$RESPONSE" | grep -q "Merchant already exists"; then
  echo "✅ Merchant already exists!"
  echo ""
  echo "You can now test merchant endpoints."
else
  echo "❌ Failed to create merchant"
  echo "Check server logs for details"
  exit 1
fi

echo ""
echo "========================================="
