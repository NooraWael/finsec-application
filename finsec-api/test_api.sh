#!/bin/bash

API_BASE_URL="http://localhost:5000/api"

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}FinSec API Testing Script${NC}"
echo "============================="

# 1. Test health check
echo -e "\n${BLUE}Testing Health Check${NC}"
curl -s -X GET "http://localhost:5000/"
echo

# 2. Test login with regular user
echo -e "\n${BLUE}Testing Login (Regular User)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }')

echo $LOGIN_RESPONSE | python -m json.tool

# Extract access token for next requests
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")
USER_ID=$(echo $LOGIN_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin).get('user', {}).get('id', ''))")

if [ ! -z "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}Login successful! Received access token.${NC}"
  
  # 3. Test logout
  echo -e "\n${BLUE}Testing Logout${NC}"
  SESSION_ID=$(echo $LOGIN_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin).get('session_id', 'test_session'))")
  
  LOGOUT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/logout" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -d "{
      \"userId\": ${USER_ID},
      \"sessionId\": \"${SESSION_ID}\"
    }")
  
  echo $LOGOUT_RESPONSE | python -m json.tool
else
  echo -e "${RED}Login failed or no access token received.${NC}"
fi

# 4. Test login with MFA user
echo -e "\n${BLUE}Testing Login (MFA User)${NC}"
MFA_LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "password123"
  }')

echo $MFA_LOGIN_RESPONSE | python -m json.tool

# Extract userId for MFA verification
MFA_USER_ID=$(echo $MFA_LOGIN_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin).get('userId', ''))")

if [ ! -z "$MFA_USER_ID" ]; then
  echo -e "${GREEN}MFA login step 1 successful!${NC}"
  echo -e "${BLUE}To complete MFA verification, run:${NC}"
  echo "curl -X POST \"${API_BASE_URL}/auth/verify-mfa\" \\"
  echo "  -H \"Content-Type: application/json\" \\"
  echo "  -d '{\"userId\": ${MFA_USER_ID}, \"otpCode\": \"YOUR_OTP_CODE\"}'"
else
  echo -e "${RED}MFA login failed.${NC}"
fi

echo -e "\n${BLUE}Testing Complete!${NC}" 