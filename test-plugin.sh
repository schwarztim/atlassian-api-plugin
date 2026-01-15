#!/bin/bash

# Atlassian API Plugin Test Script
# Verify the plugin is properly configured and working

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Atlassian API Plugin Test Suite          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
}

print_test() {
    echo -n -e "${BLUE}▶${NC} $1 ... "
}

print_success() {
    echo -e "${GREEN}✓ PASS${NC}"
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC}"
    echo -e "${RED}  $1${NC}"
}

# Get script directory (works on macOS and Linux)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL_CONFIG="$HOME/.claude/mcp.json"
LOCAL_CONFIG="$SCRIPT_DIR/.mcp.json"

# Determine which config file to use
get_config_file() {
    if [ -f "$GLOBAL_CONFIG" ] && grep -q "atlassian-api-key" "$GLOBAL_CONFIG" 2>/dev/null; then
        echo "$GLOBAL_CONFIG"
    elif [ -f "$LOCAL_CONFIG" ]; then
        echo "$LOCAL_CONFIG"
    else
        echo ""
    fi
}

# Test 1: Check files exist
test_files() {
    print_test "Checking plugin files"

    if [ ! -f "$SCRIPT_DIR/.claude-plugin/plugin.json" ]; then
        print_fail "Missing .claude-plugin/plugin.json"
        return 1
    fi

    CONFIG_FILE=$(get_config_file)
    if [ -z "$CONFIG_FILE" ]; then
        print_fail "Missing configuration - run ./install.sh first"
        return 1
    fi

    if [ ! -f "$SCRIPT_DIR/mcp-server/index.js" ]; then
        print_fail "Missing mcp-server/index.js"
        return 1
    fi

    if [ ! -d "$SCRIPT_DIR/mcp-server/node_modules" ]; then
        print_fail "Dependencies not installed - run: cd mcp-server && npm install"
        return 1
    fi

    print_success
    return 0
}

# Test 2: Check configuration
test_config() {
    print_test "Validating configuration"

    CONFIG_FILE=$(get_config_file)
    if [ -z "$CONFIG_FILE" ]; then
        print_fail "No configuration file found"
        return 1
    fi

    if ! grep -q "atlassian-api-key" "$CONFIG_FILE"; then
        print_fail "Invalid configuration format - missing atlassian-api-key"
        return 1
    fi

    if grep -q "your-domain.atlassian.net" "$CONFIG_FILE"; then
        print_fail "Configuration not completed - run ./install.sh"
        return 1
    fi

    if grep -q "your-api-token-here" "$CONFIG_FILE"; then
        print_fail "API token not configured"
        return 1
    fi

    print_success
    return 0
}

# Test 3: Load environment from config
load_env() {
    CONFIG_FILE=$(get_config_file)
    if [ -z "$CONFIG_FILE" ]; then
        return 1
    fi

    export JIRA_URL=$(grep JIRA_URL "$CONFIG_FILE" | cut -d'"' -f4)
    export JIRA_EMAIL=$(grep JIRA_EMAIL "$CONFIG_FILE" | cut -d'"' -f4)
    export JIRA_API_TOKEN=$(grep JIRA_API_TOKEN "$CONFIG_FILE" | cut -d'"' -f4)

    if [ -z "$JIRA_URL" ] || [ -z "$JIRA_EMAIL" ] || [ -z "$JIRA_API_TOKEN" ]; then
        return 1
    fi

    return 0
}

# Test 4: Test MCP server
test_mcp_server() {
    print_test "Testing MCP server"

    if ! load_env; then
        print_fail "Failed to load configuration"
        return 1
    fi

    # Test tools list (use absolute path for cross-platform compatibility)
    OUTPUT=$(echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | \
             JIRA_URL="$JIRA_URL" JIRA_EMAIL="$JIRA_EMAIL" JIRA_API_TOKEN="$JIRA_API_TOKEN" \
             node "$SCRIPT_DIR/mcp-server/index.js" 2>/dev/null | tail -1)

    if ! echo "$OUTPUT" | grep -q "search_jira_issues"; then
        print_fail "MCP server not responding correctly"
        return 1
    fi

    if ! echo "$OUTPUT" | grep -q "search_confluence"; then
        print_fail "Confluence tools not loaded"
        return 1
    fi

    print_success
    return 0
}

# Test 5: Test API connection
test_api_connection() {
    print_test "Testing Atlassian API connection"

    if ! load_env; then
        print_fail "Failed to load configuration"
        return 1
    fi

    # Simple API test - get current user
    HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null \
                -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
                -H "Accept: application/json" \
                "$JIRA_URL/rest/api/3/myself" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        print_success
        return 0
    elif [ "$HTTP_CODE" = "401" ]; then
        print_fail "Authentication failed - check your API token"
        return 1
    elif [ "$HTTP_CODE" = "404" ]; then
        print_fail "Invalid Atlassian URL"
        return 1
    else
        print_fail "Connection failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 6: Count available tools
test_tool_count() {
    print_test "Counting available tools"

    if ! load_env; then
        print_fail "Failed to load configuration"
        return 1
    fi

    TOOL_COUNT=$(echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | \
                 JIRA_URL="$JIRA_URL" JIRA_EMAIL="$JIRA_EMAIL" JIRA_API_TOKEN="$JIRA_API_TOKEN" \
                 node "$SCRIPT_DIR/mcp-server/index.js" 2>/dev/null | grep -o '"name":"[^"]*"' | wc -l | tr -d ' ')

    if [ "$TOOL_COUNT" -ne 24 ]; then
        print_fail "Expected 24 tools, found $TOOL_COUNT"
        return 1
    fi

    echo -n -e "${GREEN}✓ PASS${NC} (24 tools: 15 Jira + 9 Confluence)\n"
    return 0
}

# Main test suite
main() {
    print_header

    FAILED=0

    test_files || FAILED=$((FAILED + 1))
    test_config || FAILED=$((FAILED + 1))
    test_mcp_server || FAILED=$((FAILED + 1))
    test_api_connection || FAILED=$((FAILED + 1))
    test_tool_count || FAILED=$((FAILED + 1))

    echo ""
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  All Tests Passed! ✓                       ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Your plugin is ready to use!"
        echo "Start Claude Code with: claude"
        exit 0
    else
        echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  $FAILED Test(s) Failed                          ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Please fix the issues above and run ./test-plugin.sh again"
        exit 1
    fi
}

main
