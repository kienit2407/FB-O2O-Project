#!/bin/bash

# Script test Merchant Menu API sau khi seeding
# Sử dụng: ./test-seeded-menu.sh <JWT_TOKEN>

set -e

BASE_URL="http://localhost:4000"

if [ -z "$1" ]; then
  echo "Usage: ./test-seeded-menu.sh <JWT_TOKEN>"
  echo ""
  echo "Example:"
  echo '  ./test-seeded-menu.sh "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."'
  exit 1
fi

JWT_TOKEN="$1"

echo "========================================"
echo "Testing Seeded Merchant Menu API"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make API call and pretty print JSON
test_endpoint() {
  local name="$1"
  local url="$2"

  echo -e "${BLUE}Testing: $name${NC}"
  echo "URL: $url"

  response=$(curl -s -X GET "$url" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json")

  # Pretty print JSON
  echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
  echo ""
}

# Test 1: Get all categories
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Categories (5 items)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Get all categories" "${BASE_URL}/merchant/menu/categories?includeInactive=1"

# Test 2: Get all products
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Products (10 items)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Get all products" "${BASE_URL}/merchant/menu/products"

# Test 3: Get products by category (Đồ uống nóng)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Products by Category"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Note: Copy a category_id from the output above and run:"
echo "curl -X GET '${BASE_URL}/merchant/menu/products?categoryId=CATEGORY_ID' \\"
echo "  -H 'Authorization: Bearer $JWT_TOKEN'"
echo ""

# Test 4: Get all toppings
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Toppings (5 items)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Get all toppings" "${BASE_URL}/merchant/menu/toppings"

# Test 5: Get product options
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Product Options"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Note: Copy a product_id from the output above and run:"
echo "curl -X GET '${BASE_URL}/merchant/menu/products/PRODUCT_ID/options' \\"
echo "  -H 'Authorization: Bearer $JWT_TOKEN'"
echo ""

# Test 6: Search products
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Search Products"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Search 'cà phê'" "${BASE_URL}/merchant/menu/products?q=cà phê"
test_endpoint "Search 'sinh tố'" "${BASE_URL}/merchant/menu/products?q=sinh tố"
test_endpoint "Search 'combo'" "${BASE_URL}/merchant/menu/products?q=combo"

echo "========================================"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo "========================================"
echo ""
echo "Manual testing:"
echo "  1. Copy category_id from categories output"
echo "  2. Test: GET /merchant/menu/products?categoryId=CATEGORY_ID"
echo "  3. Copy product_id from products output"
echo "  4. Test: GET /merchant/menu/products/PRODUCT_ID/options"
echo ""
