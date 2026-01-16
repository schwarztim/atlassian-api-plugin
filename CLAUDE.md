# Atlassian API Plugin for Claude Code

## CRITICAL RULE: USE MCP TOOLS ONLY

This plugin provides MCP tools for Atlassian Jira and Confluence with **pre-configured authentication**.

### NEVER DO THESE THINGS:
- **NEVER** use `curl` for Atlassian APIs
- **NEVER** use `WebFetch` for Atlassian URLs
- **NEVER** use the Bash tool to call Atlassian APIs
- **NEVER** ask the user for API tokens or credentials
- **NEVER** attempt OAuth flows for Atlassian
- **NEVER** use `fetch()` or HTTP requests manually
- **NEVER** suggest the user needs to "authenticate first"

### ALWAYS DO THIS:
- **ALWAYS** use the MCP tools listed below - authentication is automatic

---

## Available MCP Tools

All tools are prefixed with `mcp__atlassian-api-key__`. Use them directly.

### Jira Tools
| Tool Name | Description |
|-----------|-------------|
| `mcp__atlassian-api-key__search_jira_issues` | Search issues using JQL |
| `mcp__atlassian-api-key__get_issue` | Get issue by key (e.g., CSA-917) |
| `mcp__atlassian-api-key__create_issue` | Create a new issue |
| `mcp__atlassian-api-key__update_issue` | Update an existing issue |
| `mcp__atlassian-api-key__add_jira_comment` | Add a comment to an issue |
| `mcp__atlassian-api-key__get_transitions` | Get available workflow transitions |
| `mcp__atlassian-api-key__transition_issue` | Move issue to new status |
| `mcp__atlassian-api-key__get_projects` | List all projects |
| `mcp__atlassian-api-key__get_project` | Get project details |
| `mcp__atlassian-api-key__get_current_user` | Get current user info |
| `mcp__atlassian-api-key__get_my_issues` | Get issues assigned to current user |
| `mcp__atlassian-api-key__get_in_progress_issues` | Get in-progress issues |
| `mcp__atlassian-api-key__get_recent_issues` | Get recently updated issues |
| `mcp__atlassian-api-key__assign_issue` | Assign an issue to a user |
| `mcp__atlassian-api-key__search_users` | Search for users |

### Confluence Tools
| Tool Name | Description |
|-----------|-------------|
| `mcp__atlassian-api-key__search_confluence` | Search using CQL |
| `mcp__atlassian-api-key__search_confluence_by_text` | Simple text search |
| `mcp__atlassian-api-key__get_confluence_page` | Get page by ID |
| `mcp__atlassian-api-key__get_confluence_page_by_title` | Get page by title and space |
| `mcp__atlassian-api-key__create_confluence_page` | Create a new page |
| `mcp__atlassian-api-key__update_confluence_page` | Update an existing page |
| `mcp__atlassian-api-key__get_confluence_spaces` | List all spaces |
| `mcp__atlassian-api-key__get_confluence_space` | Get space details |
| `mcp__atlassian-api-key__add_confluence_comment` | Add a comment to a page |

---

## URL Pattern Recognition

When you see these URL patterns, use MCP tools:

| URL Pattern | Action |
|-------------|--------|
| `*.atlassian.net/browse/XXX-123` | Use `get_issue` with issueKey |
| `*.atlassian.net/jira/*` | Use Jira MCP tools |
| `*.atlassian.net/wiki/spaces/*/pages/12345/*` | Use `get_confluence_page` with pageId |
| `*.atlassian.net/wiki/*` | Use Confluence MCP tools |

### Examples

```
User: "Look at https://qurate.atlassian.net/browse/CSA-917"
→ Use mcp__atlassian-api-key__get_issue with issueKey: "CSA-917"

User: "Read https://qurate.atlassian.net/wiki/spaces/SARC/pages/248414685/Security"
→ Use mcp__atlassian-api-key__get_confluence_page with pageId: "248414685"

User: "Show me my Jira issues"
→ Use mcp__atlassian-api-key__get_my_issues

User: "Find documentation about API"
→ Use mcp__atlassian-api-key__search_confluence_by_text with query: "API"
```

---

## Authentication

**Authentication is 100% automatic.** The MCP server has pre-configured credentials.

DO NOT:
- Ask for API tokens
- Suggest OAuth authentication
- Write curl commands with -u flags
- Attempt to configure authentication
- Tell the user they need to log in

The credentials are already configured in the MCP server.

---

## Quick Reference

### "Show me issue X" or "Get CSA-123"
```
mcp__atlassian-api-key__get_issue(issueKey: "CSA-123")
```

### "Find issues about X" or "Search for bugs"
```
mcp__atlassian-api-key__search_jira_issues(jql: "text ~ 'X' AND type=Bug")
```

### "What are my issues?" or "My tickets"
```
mcp__atlassian-api-key__get_my_issues()
```

### "Read this Confluence page" (with URL containing page ID)
```
mcp__atlassian-api-key__get_confluence_page(pageId: "extracted-from-url")
```

### "Find documentation about X"
```
mcp__atlassian-api-key__search_confluence_by_text(query: "X")
```

### "Create a Jira issue"
```
mcp__atlassian-api-key__create_issue(project: "PROJ", issueType: "Bug", summary: "Title")
```

---

## Reminder

If you catch yourself thinking about:
- Writing a curl command → STOP, use MCP tool
- Using WebFetch for atlassian.net → STOP, use MCP tool
- Asking for credentials → STOP, authentication is automatic
- OAuth/login flows → STOP, already authenticated

**The MCP tools are the ONLY correct way to interact with Atlassian.**
