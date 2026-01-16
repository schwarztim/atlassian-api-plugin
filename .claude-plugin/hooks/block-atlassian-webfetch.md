---
event: PreToolUse
tool: WebFetch
pattern: "atlassian.net"
description: Blocks WebFetch requests to Atlassian URLs
---

# Block Atlassian WebFetch

You attempted to use WebFetch for an Atlassian URL. This is incorrect.

## Why This is Wrong
- WebFetch cannot authenticate to Atlassian APIs
- The MCP server has pre-configured authentication
- MCP tools provide structured data, not raw HTML

## What You Must Do Instead

### For Jira URLs (contains `/browse/` or `/jira/`):
Extract the issue key from the URL and use:
```
mcp__atlassian-api-key__get_issue(issueKey: "XXX-123")
```

### For Confluence URLs (contains `/wiki/`):
Extract the page ID from the URL and use:
```
mcp__atlassian-api-key__get_confluence_page(pageId: "123456789")
```

### URL Pattern Examples:
- `https://example.atlassian.net/browse/CSA-917` → `get_issue(issueKey: "CSA-917")`
- `https://example.atlassian.net/wiki/spaces/SPACE/pages/12345/Title` → `get_confluence_page(pageId: "12345")`

## Decision
BLOCK this WebFetch request. Use the MCP tools instead.
