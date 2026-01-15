# Atlassian API Plugin for Claude Code

## IMPORTANT: Use MCP Tools, NOT curl/fetch

This plugin provides MCP tools for Atlassian Jira and Confluence. **ALWAYS use these tools instead of curl, fetch, or WebFetch for any Atlassian operations.**

## Available MCP Tools

### Confluence Tools (USE THESE for wiki/documentation)
- `search_confluence` - Search Confluence using CQL queries
- `search_confluence_by_text` - Simple text search in Confluence
- `get_confluence_page` - Get a page by ID
- `get_confluence_page_by_title` - Get a page by title and space
- `create_confluence_page` - Create a new page
- `update_confluence_page` - Update an existing page
- `get_confluence_spaces` - List all spaces
- `get_confluence_space` - Get space details
- `add_confluence_comment` - Add a comment to a page

### Jira Tools (USE THESE for issues/projects)
- `search_jira_issues` - Search using JQL
- `get_issue` - Get issue details
- `create_issue` - Create a new issue
- `update_issue` - Update an issue
- `add_jira_comment` - Add a comment
- `get_transitions` - Get available transitions
- `transition_issue` - Move issue through workflow
- `get_projects` - List all projects
- `get_project` - Get project details
- `get_current_user` - Get current user info
- `get_my_issues` - Get issues assigned to current user
- `get_in_progress_issues` - Get in-progress issues
- `get_recent_issues` - Get recently updated issues
- `assign_issue` - Assign an issue
- `search_users` - Search for users

## When User Asks About Confluence/Wiki

If the user mentions:
- Confluence, wiki, documentation, pages, spaces
- URLs containing `atlassian.net/wiki`
- Creating, reading, or updating documentation

**ALWAYS use the Confluence MCP tools above. NEVER use WebFetch or curl.**

## When User Asks About Jira

If the user mentions:
- Jira, issues, tickets, bugs, stories, epics
- URLs containing `atlassian.net/browse` or `atlassian.net/jira`
- Creating, searching, or updating issues

**ALWAYS use the Jira MCP tools above. NEVER use WebFetch or curl.**

## Example Usage Patterns

### Reading a Confluence Page
```
User: "Look at https://qurate.atlassian.net/wiki/spaces/SARC/pages/248414685/CSSM+-+Web+Security"
DO: Use get_confluence_page with ID 248414685
DON'T: Use WebFetch or curl
```

### Creating a Confluence Page
```
User: "Create a page in the SARC space"
DO: Use create_confluence_page with spaceKey "SARC"
DON'T: Use curl with the Confluence API
```

### Searching Confluence
```
User: "Find all pages about security"
DO: Use search_confluence with query 'text ~ "security"'
DON'T: Use WebFetch to search
```

### Getting Jira Issues
```
User: "Show me my Jira issues"
DO: Use get_my_issues or search_jira_issues
DON'T: Use curl with the Jira API
```

## Authentication

Authentication is handled automatically by the MCP server. You do NOT need to:
- Pass API tokens
- Use curl with -u flags
- Handle base64 encoding
- Manage auth headers

The MCP tools handle all authentication transparently.

## Performance

MCP tools are:
- Faster than curl (no shell spawning overhead)
- More reliable (proper error handling)
- Authenticated automatically
- Type-safe with proper JSON parsing

## Critical Rule

**If you find yourself writing curl commands or using WebFetch for Atlassian URLs, STOP and use the MCP tools instead.**
