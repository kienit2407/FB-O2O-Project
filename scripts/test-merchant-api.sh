#!/bin/bash

# Script test Merchant API
# Cần thay YOUR_JWT_TOKEN với token thực tế của bạn

BASE_URL="http://localhost:4000"
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

echo "========================================="
echo "Merchant API Test Script"
echo "========================================="
echo ""

# Step 1: Tạo merchant cho user hiện tại
echo "1. Creating merchant for current user..."
curl -X POST "${BASE_URL}/merchant/menu/categories/debug/create-merchant" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -v
echo ""
echo ""

# Step 2: Get all categories
echo "2. Getting all categories..."
curl -X GET "${BASE_URL}/merchant/menu/categories?includeInactive=1" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -v
echo ""
echo ""

# Step 3: Get all products
echo "3. Getting all products..."
curl -X GET "${BASE_URL}/merchant/menu/products" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -v
echo ""
echo ""

# Step 4: Get all toppings
echo "4. Getting all toppings..."
curl -X GET "${BASE_URL}/merchant/menu/toppings" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -v
echo ""
echo ""

echo "========================================="
echo "Test completed!"
echo "========================================="
