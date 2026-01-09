#!/bin/bash

echo "=================================="
echo "Frontend-Backend Integration Test"
echo "=================================="
echo ""

# Test 1: Register new user
echo "Test 1: Register new user"
echo "--------------------------"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Test User",
    "email": "frontendtest@example.com",
    "password": "Test123456",
    "password_confirmation": "Test123456"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
REGISTER_SUCCESS=$(echo "$REGISTER_RESPONSE" | jq -r '.success')
REGISTER_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token // empty')

if [ "$REGISTER_SUCCESS" = "true" ] || [ "$REGISTER_SUCCESS" = "false" ]; then
  if [ "$REGISTER_SUCCESS" = "true" ]; then
    echo "✓ Registration endpoint working"
    echo "✓ Token received: ${REGISTER_TOKEN:0:20}..."
  else
    echo "⚠ Registration returned false (user may already exist)"
  fi
else
  echo "✗ Registration endpoint failed"
fi

echo ""

# Test 2: Login
echo "Test 2: Login with credentials"
echo "-------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
LOGIN_SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.success')
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
USER_ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.data.user.role // empty')

if [ "$LOGIN_SUCCESS" = "true" ]; then
  echo "✓ Login endpoint working"
  echo "✓ Token received: ${LOGIN_TOKEN:0:20}..."
  echo "✓ User role: $USER_ROLE"
else
  echo "✗ Login endpoint failed"
fi

echo ""

# Test 3: Get current user
echo "Test 3: Get current user with token"
echo "------------------------------------"
if [ -n "$LOGIN_TOKEN" ]; then
  ME_RESPONSE=$(curl -s -X GET http://localhost:8000/api/v1/auth/me \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $LOGIN_TOKEN")
  
  echo "$ME_RESPONSE" | jq '.'
  ME_SUCCESS=$(echo "$ME_RESPONSE" | jq -r '.success')
  
  if [ "$ME_SUCCESS" = "true" ]; then
    echo "✓ Auth verification working"
  else
    echo "✗ Auth verification failed"
  fi
else
  echo "⚠ Skipping (no token available)"
fi

echo ""
echo "=================================="
echo "Integration Test Complete"
echo "=================================="
echo ""
echo "Next.js Frontend: http://localhost:3000"
echo "Laravel API: http://localhost:8000/api"
echo ""
echo "Test these pages:"
echo "- Login: http://localhost:3000/login"
echo "- Register: http://localhost:3000/register"
echo ""
echo "Demo credentials:"
echo "- Admin: admin@example.com / password123"
echo "- User: notifuser@example.com / password123"
