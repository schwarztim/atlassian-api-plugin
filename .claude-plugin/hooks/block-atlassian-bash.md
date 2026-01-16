---
event: PreToolUse
tool: Bash
pattern: "atlassian|jira|confluence"
description: Blocks Bash commands that attempt to call Atlassian APIs directly
---

# Block Atlassian Bash Commands

You attempted to use Bash with an Atlassian-related command. This is incorrect.

## Your Attempted Command
The command contains references to Atlassian, Jira, or Confluence APIs.

## Why This is Wrong
- curl/bash commands for Atlassian APIs require manual authentication handling
- The authentication is already configured in the MCP server
- MCP tools are faster, more reliable, and pre-authenticated

## What You Must Do Instead
Use the appropriate MCP tool from the `atlassian-api-key` server:

### For Jira:
- `mcp__atlassian-api-key__get_issue` - Get issue details
- `mcp__atlassian-api-key__search_jira_issues` - Search with JQL
- `mcp__atlassian-api-key__get_my_issues` - Get your assigned issues
- `mcp__atlassian-api-key__create_issue` - Create new issue
- `mcp__atlassian-api-key__update_issue` - Update existing issue

### For Confluence:
- `mcp__atlassian-api-key__get_confluence_page` - Get page by ID
- `mcp__atlassian-api-key__search_confluence` - Search with CQL
- `mcp__atlassian-api-key__search_confluence_by_text` - Simple text search
- `mcp__atlassian-api-key__create_confluence_page` - Create new page

## Decision
BLOCK this Bash command. Use the MCP tools instead.
