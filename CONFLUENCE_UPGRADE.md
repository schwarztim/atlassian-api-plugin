# Confluence Support Added! 🎉

Your Atlassian plugin now has **full Confluence support** in addition to Jira.

## What's New

### ✨ 9 New Confluence Tools

**Search Tools:**
1. `search_confluence(cql, limit, expand)` - Advanced CQL search
2. `search_confluence_by_text(query, limit)` - Simple text search

**Page Management:**
3. `get_confluence_page(pageId, expand)` - Get page by ID
4. `get_confluence_page_by_title(spaceKey, title, expand)` - Get page by title
5. `create_confluence_page(spaceKey, title, content, parentId)` - Create pages
6. `update_confluence_page(pageId, title, content, version)` - Update pages
7. `add_confluence_comment(pageId, comment)` - Comment on pages

**Space Management:**
8. `get_confluence_spaces(limit, type)` - List all spaces
9. `get_confluence_space(spaceKey)` - Get space details

### 🎯 New Skill: `/search-confluence`

Advanced Confluence search skill with:
- CQL query examples
- Simple text search patterns
- Content formatting guide
- Page management workflows
- Common use cases and troubleshooting

## Quick Test

Try these commands in Claude Code:

```
"Search Confluence for API documentation"
"Find pages about deployment in the DEV space"
"List all Confluence spaces"
"Show me recent pages updated in the last week"
```

Or use the skill:
```
/search-confluence authentication guide
```

## Updated Tools Count

**Before:** 15 tools (Jira only)
**After:** 24 tools (15 Jira + 9 Confluence)

## What Can You Do Now?

### Documentation Search
```
"Find the API deployment guide in Confluence"
→ Uses search_confluence_by_text or search_confluence with CQL
```

### Page Access
```
"Show me the authentication page from the DEV space"
→ Uses get_confluence_page_by_title
```

### Content Management
```
"Create a new page in the DOCS space for the new feature"
→ Uses create_confluence_page
```

### Space Exploration
```
"What Confluence spaces do I have access to?"
→ Uses get_confluence_spaces
```

## CQL Examples

CQL (Confluence Query Language) works like JQL for Jira:

**By title:**
```cql
title ~ "API Guide" AND type=page
```

**In specific space:**
```cql
space=DEV AND text ~ "authentication"
```

**Recent pages:**
```cql
lastModified >= now("-7d") AND type=page
```

**Multiple criteria:**
```cql
space IN (DEV, DOCS) AND title ~ "deployment" AND lastModified >= "2024-01-01"
```

## Content Format

Confluence uses **Storage Format** (HTML-like) for pages:

**Simple paragraph:**
```html
<p>This is content</p>
```

**Formatted text:**
```html
<p><strong>Bold</strong> and <em>italic</em></p>
```

**Headings:**
```html
<h2>Section Title</h2>
```

**Lists:**
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

## File Structure

```
AtlassianPlugin/
├── mcp-server/
│   └── index.js                 # ✅ Updated with Confluence API
├── skills/
│   ├── triage-issue/            # Jira bug triage
│   ├── search-jira/             # Jira search
│   └── search-confluence/       # ✅ NEW: Confluence search
└── README.md                    # ✅ Updated documentation
```

## API Compatibility

Both Jira and Confluence use the same:
- ✅ API token (from .mcp.json)
- ✅ Same Atlassian URL
- ✅ Same authentication method

No additional configuration needed!

## Testing the Integration

1. **Start Claude Code:**
   ```bash
   cd ~/Scripts/AtlassianPlugin
   claude
   ```

2. **Test Confluence search:**
   ```
   "Search Confluence for documentation"
   ```

3. **Test spaces:**
   ```
   "List my Confluence spaces"
   ```

4. **Use the skill:**
   ```
   /search-confluence API guide
   ```

## Troubleshooting

### "Confluence API error (404)"
- Check that your Atlassian instance has Confluence enabled
- Verify the space key is correct (case-sensitive)
- Ensure you have permission to access the space

### Page not found
- Try searching by text first to find the exact page title
- Check space key is correct
- Verify page hasn't been deleted or archived

### Content format issues
- Use Confluence storage format (HTML-like)
- Reference existing pages for format examples
- Start with simple content, add complexity gradually

## Next Steps

### Explore Your Confluence
```
"What Confluence spaces exist?"
"Show me recently updated pages"
"Find pages about [your topic]"
```

### Create Documentation
```
"Create a new page in the DOCS space documenting the new API feature"
```

### Update Existing Pages
```
"Find the deployment guide and update it with the new process"
```

## Documentation

- Full README: `README.md`
- Confluence Skill: `skills/search-confluence/SKILL.md`
- MCP Server: `mcp-server/index.js` (lines 48-71 for Confluence API)

---

**Status**: ✅ Fully operational
**Tools**: 24 (15 Jira + 9 Confluence)
**Skills**: 3 (/triage-issue, /search-jira, /search-confluence)
