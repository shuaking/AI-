#!/bin/bash

# Integration test script for JSON Storage API
# Tests all CRUD operations and error handling

set -e

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "JSON Storage API Integration Tests"
echo "=========================================="
echo ""

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Testing: $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $status)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Wait for server to be ready
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${RED}Error: Server is not running at $BASE_URL${NC}"
    echo "Please start the server with: npm start"
    exit 1
fi
echo -e "${GREEN}Server is running${NC}"
echo ""

# Health check
echo "=== Health Check ==="
test_endpoint "Health endpoint" "GET" "/api/health" "" "200"
echo ""

# Workflows tests
echo "=== Workflows API ==="
test_endpoint "List workflows" "GET" "/api/workflows" "" "200"
test_endpoint "Get specific workflow" "GET" "/api/workflows/brainstorm" "" "200"
test_endpoint "Get non-existent workflow" "GET" "/api/workflows/nonexistent" "" "404"

WORKFLOW_DATA='{
  "id": "test_workflow",
  "name": "Test Workflow",
  "description": "Integration test workflow",
  "stages": [
    {"id": "stage1", "name": "Stage 1", "duration": 1000}
  ]
}'
test_endpoint "Create workflow" "POST" "/api/workflows" "$WORKFLOW_DATA" "201"
test_endpoint "Create duplicate workflow" "POST" "/api/workflows" "$WORKFLOW_DATA" "409"

WORKFLOW_UPDATE='{
  "name": "Updated Test Workflow",
  "description": "Updated description",
  "stages": [
    {"id": "stage1", "name": "Updated Stage", "duration": 2000}
  ]
}'
test_endpoint "Update workflow" "PUT" "/api/workflows/test_workflow" "$WORKFLOW_UPDATE" "200"
test_endpoint "Delete workflow" "DELETE" "/api/workflows/test_workflow" "" "200"
test_endpoint "Delete non-existent workflow" "DELETE" "/api/workflows/test_workflow" "" "404"

INVALID_WORKFLOW='{"id": "test", "stages": []}'
test_endpoint "Create invalid workflow" "POST" "/api/workflows" "$INVALID_WORKFLOW" "400"
echo ""

# Roles tests
echo "=== Roles API ==="
test_endpoint "List roles" "GET" "/api/roles" "" "200"
test_endpoint "Get specific role" "GET" "/api/roles/pm" "" "200"
test_endpoint "Get non-existent role" "GET" "/api/roles/nonexistent" "" "404"

ROLE_DATA='{
  "id": "test_role",
  "name": "Test Role",
  "emoji": "🧪",
  "color": "#FF5733",
  "title": "Test Role Title",
  "personality": "Test personality"
}'
test_endpoint "Create role" "POST" "/api/roles" "$ROLE_DATA" "201"

ROLE_UPDATE='{
  "id": "test_role",
  "name": "Updated Test Role",
  "emoji": "🔬",
  "color": "#33FF57",
  "title": "Updated Title",
  "personality": "Updated personality"
}'
test_endpoint "Update role" "PUT" "/api/roles/test_role" "$ROLE_UPDATE" "200"
test_endpoint "Delete role" "DELETE" "/api/roles/test_role" "" "200"
test_endpoint "Delete required role" "DELETE" "/api/roles/facilitator" "" "400"

INVALID_ROLE='{"id": "test", "name": "Test", "emoji": "😀", "color": "invalid"}'
test_endpoint "Create role with invalid color" "POST" "/api/roles" "$INVALID_ROLE" "400"
echo ""

# Prompts tests
echo "=== Prompts API ==="
test_endpoint "List prompts" "GET" "/api/prompts" "" "200"
test_endpoint "Get specific prompt" "GET" "/api/prompts/brainstorm" "" "200"

PROMPT_DATA='{
  "id": "test_prompt",
  "name": "Test Prompt",
  "description": "Test prompt description",
  "type": "stage",
  "content": "Test content with {variable}",
  "variables": ["variable"]
}'
test_endpoint "Create prompt" "POST" "/api/prompts" "$PROMPT_DATA" "201"

PROMPT_UPDATE='{
  "id": "test_prompt",
  "name": "Updated Prompt",
  "description": "Updated description",
  "type": "role",
  "content": "Updated content",
  "variables": []
}'
test_endpoint "Update prompt" "PUT" "/api/prompts/test_prompt" "$PROMPT_UPDATE" "200"
test_endpoint "Delete prompt" "DELETE" "/api/prompts/test_prompt" "" "200"

INVALID_PROMPT='{"id": "test", "name": "Test", "type": "invalid_type"}'
test_endpoint "Create prompt with invalid type" "POST" "/api/prompts" "$INVALID_PROMPT" "400"
echo ""

# Settings tests
echo "=== Settings API ==="
test_endpoint "Get all settings" "GET" "/api/settings" "" "200"
test_endpoint "Get all variables" "GET" "/api/settings/variables" "" "200"

test_endpoint "Set variable" "PUT" "/api/settings/variables/testVar" '{"value": "test value"}' "200"
test_endpoint "Get specific variable" "GET" "/api/settings/variables/testVar" "" "200"
test_endpoint "Delete variable" "DELETE" "/api/settings/variables/testVar" "" "200"
test_endpoint "Get deleted variable" "GET" "/api/settings/variables/testVar" "" "404"

API_CONFIG='{
  "name": "Test API",
  "endpoint": "https://api.example.com/v1/chat",
  "apiKey": "test-key",
  "modelName": "test-model",
  "temperature": 0.7,
  "maxTokens": 2000
}'
test_endpoint "Set API config" "PUT" "/api/settings/api-configs/testAPI" "$API_CONFIG" "200"
test_endpoint "Get specific API config" "GET" "/api/settings/api-configs/testAPI" "" "200"
test_endpoint "Delete API config" "DELETE" "/api/settings/api-configs/testAPI" "" "200"

INVALID_API_CONFIG='{"name": "Test", "endpoint": "not-a-url", "apiKey": "key", "modelName": "model"}'
test_endpoint "Create invalid API config" "PUT" "/api/settings/api-configs/badAPI" "$INVALID_API_CONFIG" "400"
echo ""

# Summary
echo "=========================================="
echo "Test Results"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
