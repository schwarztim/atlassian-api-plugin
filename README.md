# Atlassian API Plugin for Claude Code

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.25.2-blue)](https://modelcontextprotocol.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey)](https://github.com/schwarztim/atlassian-api-plugin)

**Professional Atlassian integration for Claude Code using API key authentication**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Overview

A comprehensive Claude Code plugin that provides **full Jira and Confluence access** through API key authentication. No OAuth flows, no browser prompts—just fast, reliable access to your Atlassian workspace.

### Why This Plugin?

- ✅ **24 MCP Tools** - Complete Jira (15) + Confluence (9) API coverage
- ✅ **3 Workflow Skills** - High-level automation for common tasks
- ✅ **API Key Auth** - Works offline, no browser authentication needed
- ✅ **Cross-Platform** - macOS, Linux, and Windows support
- ✅ **Fast & Reliable** - Direct API access without OAuth overhead
- ✅ **Well Documented** - Comprehensive guides and examples
- ✅ **Production Ready** - Battle-tested with real workflows

## Features

### 🎯 MCP Tools (24 total)

<details>
<summary><b>Jira Tools (15)</b></summary>

**Search & Query:**
- `search_jira_issues` - Advanced JQL search
- `get_issue` - Full issue details with comments
- `get_my_issues` - Your assigned issues
- `get_in_progress_issues` - Active work
- `get_recent_issues` - Recently updated

**Issue Management:**
- `create_issue` - Create new issues
- `update_issue` - Update any field
- `assign_issue` - Assign to users
- `add_jira_comment` - Add comments

**Workflows:**
- `get_transitions` - Available status changes
- `transition_issue` - Move through workflow

**Projects & Users:**
- `get_projects` - List all projects
- `get_project` - Project details
- `get_current_user` - User info
- `search_users` - Find users by name/email

</details>

<details>
<summary><b>Confluence Tools (9)</b></summary>

**Search:**
- `search_confluence` - Advanced CQL search
- `search_confluence_by_text` - Simple text search

**Pages:**
- `get_confluence_page` - Get page by ID
- `get_confluence_page_by_title` - Get page by title
- `create_confluence_page` - Create new pages
- `update_confluence_page` - Update existing pages
- `add_confluence_comment` - Comment on pages

**Spaces:**
- `get_confluence_spaces` - List all spaces
- `get_confluence_space` - Space details

</details>

### 🚀 Skills (3 total)

- **`/triage-issue`** - Intelligent bug triage with duplicate detection
- **`/search-jira`** - Advanced Jira search with JQL examples
- **`/search-confluence`** - Search and access documentation

## Installation

### Prerequisites

- **Node.js** v18 or higher
- **Claude Code** CLI installed
- **Atlassian Cloud** account
- **API Token** from Atlassian

### Quick Install

**macOS / Linux:**
```bash
# Clone the repository
git clone https://github.com/schwarztim/atlassian-api-plugin.git
cd atlassian-api-plugin

# Run the installation script
./install.sh
```

**Windows (PowerShell):**
```powershell
# Clone the repository
git clone https://github.com/schwarztim/atlassian-api-plugin.git
cd atlassian-api-plugin

# Run the installation script
.\install.ps1
```

The installation script will:
1. ✅ Check Node.js version
2. ✅ Install dependencies
3. ✅ Guide you through API token setup
4. ✅ Create your configuration
5. ✅ Verify the installation

### Manual Installation

<details>
<summary>Click to expand manual installation steps</summary>

#### 1. Get Your API Token

1. Visit https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **"Create API token"**
3. Give it a name (e.g., "Claude Code")
4. Copy the generated token

#### 2. Configure the Plugin

```bash
# Copy example configuration
cp .mcp.json.example .mcp.json

# Edit with your credentials
nano .mcp.json
```

Replace these values:
- `your-domain.atlassian.net` → Your Atlassian domain
- `your-email@company.com` → Your Atlassian email
- `your-api-token-here` → Your API token from step 1

#### 3. Install Dependencies

```bash
cd mcp-server
npm install
```

#### 4. Verify Installation

**macOS / Linux:**
```bash
cd ..
./test-plugin.sh
```

**Windows (PowerShell):**
```powershell
cd ..
.\test-plugin.ps1
```

</details>

## Usage

### Getting Started

```bash
# Navigate to the plugin directory
cd atlassian-api-plugin

# Start Claude Code
claude
```

The plugin loads automatically when Claude Code starts in this directory.

### Example Commands

**Jira:**
```
"Show me my open Jira issues"
"Search for high-priority bugs in project CSA"
"Create a bug ticket for login timeout error"
"Add a comment to issue CSA-123"
```

**Confluence:**
```
"Search Confluence for API documentation"
"Find pages about deployment in the DEV space"
"Show me the authentication guide"
"List all Confluence spaces"
```

**Skills:**
```
/triage-issue Connection timeout in authentication
/search-jira my high priority bugs
/search-confluence deployment guide
```

### Query Languages

<details>
<summary><b>JQL (Jira Query Language) Examples</b></summary>

```jql
# Your open issues
assignee=currentUser() AND status!=Done

# High-priority bugs
project=CSA AND priority=High AND type=Bug

# Recent updates
updated >= -7d ORDER BY updated DESC

# Complex query
project IN (CSA, TEXP) AND status="In Progress" AND assignee=currentUser()
```

</details>

<details>
<summary><b>CQL (Confluence Query Language) Examples</b></summary>

```cql
# Search by title
title ~ "API Guide" AND type=page

# In specific space
space=DEV AND text ~ "authentication"

# Recent pages
lastModified >= now("-7d") AND type=page

# Multiple criteria
space IN (DEV, DOCS) AND title ~ "deployment"
```

</details>

## Documentation

### 📚 Available Guides

- [**Setup Guide**](SETUP_COMPLETE.md) - Detailed setup instructions
- [**Confluence Upgrade**](CONFLUENCE_UPGRADE.md) - Confluence features overview
- [**Plugin Precedence**](PLUGIN_PRECEDENCE.md) - OAuth vs API key plugins
- [**Skills Documentation**](skills/) - Individual skill guides

### 🔧 Configuration

The plugin uses `.mcp.json` for configuration:

```json
{
  "atlassian-api-key": {
    "command": "node",
    "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-server/index.js"],
    "env": {
      "JIRA_URL": "https://your-domain.atlassian.net",
      "JIRA_EMAIL": "your-email@company.com",
      "JIRA_API_TOKEN": "your-api-token-here"
    }
  }
}
```

### 🏗️ Architecture

```
atlassian-api-plugin/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata
├── mcp-server/
│   ├── index.js                 # MCP server (Jira + Confluence)
│   ├── package.json             # Dependencies
│   └── node_modules/            # Installed packages
├── skills/
│   ├── triage-issue/            # Bug triage workflow
│   ├── search-jira/             # Jira search patterns
│   └── search-confluence/       # Confluence search patterns
├── install.sh                   # Installation script (macOS/Linux)
├── install.ps1                  # Installation script (Windows)
├── test-plugin.sh               # Verification script (macOS/Linux)
├── test-plugin.ps1              # Verification script (Windows)
└── README.md                    # This file
```

## Comparison

| Feature | This Plugin | OAuth Plugin |
|---------|-------------|--------------|
| **Authentication** | API Token | OAuth 2.1 |
| **Setup** | Config file | Browser flow |
| **Jira Access** | ✅ 15 tools | ✅ Yes |
| **Confluence Access** | ✅ 9 tools | ✅ Yes |
| **Compass Access** | ❌ No | ✅ Yes |
| **Offline Use** | ✅ Always works | ⚠️ Needs reauth |
| **Enterprise SSO** | ⚠️ API token | ✅ Supported |
| **Total Tools** | **24** | ~20+ |

## Troubleshooting

### Common Issues

<details>
<summary><b>"JIRA_EMAIL and JIRA_API_TOKEN must be set"</b></summary>

**Solution:**
1. Check `.mcp.json` exists and has correct values
2. Verify no typos in email or token
3. Confirm API token is still valid
4. Try generating a new token

</details>

<details>
<summary><b>"Jira API error (401)"</b></summary>

**Cause:** Invalid or expired API token

**Solution:**
1. Generate new API token at https://id.atlassian.com/manage-profile/security/api-tokens
2. Update `.mcp.json` with new token
3. Restart Claude Code

</details>

<details>
<summary><b>"Confluence API error (404)"</b></summary>

**Cause:** Confluence not available or incorrect space key

**Solution:**
1. Verify your Atlassian instance has Confluence enabled
2. Check space keys are correct (case-sensitive)
3. Ensure you have permission to access the space

</details>

<details>
<summary><b>Plugin not loading</b></summary>

**Solution:**
1. Ensure you're in the plugin directory: `cd atlassian-api-plugin`
2. Verify `.claude-plugin/plugin.json` exists
3. Check `.mcp.json` has correct configuration
4. Restart Claude Code

</details>

## Security

### Best Practices

- ✅ Never commit `.mcp.json` to version control
- ✅ Rotate API tokens regularly
- ✅ Use least privilege (minimal Jira/Confluence permissions)
- ✅ Store tokens securely (use keychain if available)
- ⚠️ API tokens don't expire automatically - monitor usage

### Token Security

Your API token is stored locally in `.mcp.json`:
- Protected by `.gitignore`
- Only readable by your user account
- Used only for Atlassian API authentication
- Never sent to third parties

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of Conduct
- Development setup
- Pull request process
- Coding standards

### Development

```bash
# Clone and setup
git clone https://github.com/schwarztim/atlassian-api-plugin.git
cd atlassian-api-plugin
npm install

# Make changes to mcp-server/index.js or skills/

# Test your changes
./test-plugin.sh         # macOS/Linux
.\test-plugin.ps1        # Windows

# Submit PR
git checkout -b feature/your-feature
git commit -am "Add your feature"
git push origin feature/your-feature
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for [Claude Code](https://claude.com/claude-code)
- Uses [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- Atlassian API documentation: https://developer.atlassian.com/

## Support

- 📖 **Documentation**: Check the [docs](./docs/) folder
- 🐛 **Bug Reports**: [Open an issue](https://github.com/schwarztim/atlassian-api-plugin/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/schwarztim/atlassian-api-plugin/discussions)
- 📧 **Contact**: timothy.schwarz@qvc.com

---

<div align="center">

**Made with ❤️ for the Claude Code community**

[⬆ Back to Top](#atlassian-api-plugin-for-claude-code)

</div>
