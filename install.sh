#!/bin/bash

# Atlassian API Plugin Installer
# Professional installation script for Claude Code plugin

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Atlassian API Plugin for Claude Code     ║${NC}"
    echo -e "${BLUE}║  Installation Script                       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main installation
main() {
    print_header

    # Step 1: Check Node.js
    print_step "Checking Node.js installation..."
    if ! command_exists node; then
        print_error "Node.js is not installed"
        echo "Please install Node.js v18 or higher from https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher (found: $(node --version))"
        exit 1
    fi
    print_success "Node.js $(node --version) detected"

    # Step 2: Install dependencies
    print_step "Installing dependencies..."
    cd mcp-server
    if npm install --silent; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    cd ..

    # Step 3: Check for existing configuration
    if [ -f ".mcp.json" ]; then
        print_warning "Configuration file .mcp.json already exists"
        read -p "Do you want to reconfigure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_step "Skipping configuration"
        else
            rm .mcp.json
        fi
    fi

    # Step 4: Create configuration
    if [ ! -f ".mcp.json" ]; then
        print_step "Creating configuration..."
        echo ""
        echo -e "${YELLOW}You'll need:${NC}"
        echo "  1. Your Atlassian domain (e.g., company.atlassian.net)"
        echo "  2. Your Atlassian email"
        echo "  3. An API token from: https://id.atlassian.com/manage-profile/security/api-tokens"
        echo ""

        # Get Atlassian URL
        read -p "Enter your Atlassian domain (without https://): " JIRA_DOMAIN
        JIRA_URL="https://${JIRA_DOMAIN}"

        # Get email
        read -p "Enter your Atlassian email: " JIRA_EMAIL

        # Get API token
        echo ""
        echo -e "${YELLOW}Please create an API token:${NC}"
        echo "  1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens"
        echo "  2. Click 'Create API token'"
        echo "  3. Give it a name (e.g., 'Claude Code')"
        echo "  4. Copy the generated token"
        echo ""
        read -sp "Paste your API token: " JIRA_API_TOKEN
        echo ""

        # Create configuration file
        cat > .mcp.json << EOF
{
  "atlassian-api-key": {
    "command": "node",
    "args": ["\${CLAUDE_PLUGIN_ROOT}/mcp-server/index.js"],
    "env": {
      "JIRA_URL": "${JIRA_URL}",
      "JIRA_EMAIL": "${JIRA_EMAIL}",
      "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
    }
  }
}
EOF
        print_success "Configuration created"
    fi

    # Step 5: Test connection
    print_step "Testing Atlassian API connection..."
    if ./test-plugin.sh > /dev/null 2>&1; then
        print_success "Connection test passed"
    else
        print_warning "Connection test failed - please check your credentials"
        echo "You can test manually with: ./test-plugin.sh"
    fi

    # Step 6: Success message
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Installation Complete! 🎉                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start Claude Code in this directory:"
    echo -e "     ${BLUE}claude${NC}"
    echo ""
    echo "  2. Try some commands:"
    echo -e "     ${BLUE}\"Show me my Jira issues\"${NC}"
    echo -e "     ${BLUE}\"Search Confluence for documentation\"${NC}"
    echo -e "     ${BLUE}/search-jira my high priority bugs${NC}"
    echo ""
    echo "Documentation: README.md"
    echo "Test plugin: ./test-plugin.sh"
    echo ""
}

# Run main installation
main
