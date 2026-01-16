---
event: UserPromptSubmit
pattern: "(?i)(atlassian|jira|confluence|\\.atlassian\\.net|/browse/|/wiki/)"
description: Reminds Claude about available MCP tools when user mentions Atlassian
---

# Atlassian MCP Tools Reminder

The user's request involves Atlassian (Jira or Confluence).

## CRITICAL: Use MCP Tools

You have access to pre-authenticated MCP tools for Atlassian. **DO NOT** use curl, WebFetch, or Bash for Atlassian APIs.

### Available Tools

**Jira:**
- `mcp__atlassian-api-key__get_issue` - Get issue by key
- `mcp__atlassian-api-key__search_jira_issues` - Search with JQL
- `mcp__atlassian-api-key__get_my_issues` - Your assigned issues
- `mcp__atlassian-api-key__create_issue` - Create issue
- `mcp__atlassian-api-key__update_issue` - Update issue
- `mcp__atlassian-api-key__add_jira_comment` - Add comment

**Confluence:**
- `mcp__atlassian-api-key__get_confluence_page` - Get page by ID
- `mcp__atlassian-api-key__search_confluence_by_text` - Text search
- `mcp__atlassian-api-key__search_confluence` - CQL search
- `mcp__atlassian-api-key__create_confluence_page` - Create page
- `mcp__atlassian-api-key__update_confluence_page` - Update page

### URL Parsing
- `/browse/XXX-123` → Extract `XXX-123` as issue key
- `/wiki/spaces/.../pages/12345/...` → Extract `12345` as page ID

### Authentication
Already configured. Do not ask for tokens or attempt OAuth.
