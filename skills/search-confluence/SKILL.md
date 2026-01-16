---
name: search-confluence
description: "Search and access Confluence documentation using MCP tools. Find pages by title, search content, list spaces, and retrieve page content. Use when looking for documentation, internal wiki pages, process guides, or any company knowledge in Confluence. ALWAYS use MCP tools, NEVER use curl or WebFetch."
---

# Search Confluence

## CRITICAL: Use MCP Tools Only

**NEVER use curl, WebFetch, or Bash for Confluence.** Authentication is pre-configured in the MCP server.

All tool names start with `mcp__atlassian-api-key__`:
- `mcp__atlassian-api-key__search_confluence`
- `mcp__atlassian-api-key__search_confluence_by_text`
- `mcp__atlassian-api-key__get_confluence_page`
- `mcp__atlassian-api-key__get_confluence_page_by_title`
- etc.

---

## Keywords
search confluence, find documentation, find pages, wiki search, confluence pages, documentation search, internal docs, search docs, find in confluence, knowledge base, company wiki

## Overview

Comprehensive Confluence search and access capabilities using both simple text search and advanced CQL (Confluence Query Language) for finding documentation, pages, and knowledge base articles.

**Use this skill when:** Users need to find documentation, search wiki pages, or access company knowledge stored in Confluence.

---

## Common Search Patterns

### Simple Text Search

**Search by keywords:**
```
search_confluence_by_text(
  query: "API authentication"
)
```

**Search with more results:**
```
search_confluence_by_text(
  query: "deployment guide",
  limit: 50
)
```

---

### Advanced CQL Search

**Search by title:**
```
search_confluence(
  cql: "title ~ 'API Guide' AND type=page"
)
```

**Search in specific space:**
```
search_confluence(
  cql: "space=DEV AND text ~ 'authentication'"
)
```

**Search by date:**
```
search_confluence(
  cql: "text ~ 'release' AND lastModified >= '2024-01-01'"
)
```

**Combine multiple criteria:**
```
search_confluence(
  cql: "space=DOCS AND title ~ 'getting started' AND type=page"
)
```

---

## Working with Pages

### Get Page by ID

```
get_confluence_page(
  pageId: "123456789"
)
```

Returns full page content including HTML storage format.

### Get Page by Title and Space

```
get_confluence_page_by_title(
  spaceKey: "DEV",
  title: "API Documentation"
)
```

Finds exact page by title within a space.

### Create New Page

```
create_confluence_page(
  spaceKey: "DEV",
  title: "New Feature Documentation",
  content: "<p>This is the page content in HTML format</p>"
)
```

Optional: Add `parentId` to create as child page.

### Update Existing Page

```
update_confluence_page(
  pageId: "123456789",
  title: "Updated Title",
  content: "<p>Updated content</p>",
  version: 5  // Current version number
)
```

**Important:** Always get current version first with `get_confluence_page`.

---

## Working with Spaces

### List All Spaces

```
get_confluence_spaces(
  limit: 50
)
```

### List Specific Space Type

```
get_confluence_spaces(
  limit: 50,
  type: "global"  // or "personal"
)
```

### Get Space Details

```
get_confluence_space(
  spaceKey: "DEV"
)
```

Returns space info including description and homepage.

---

## CQL Reference

### Operators
- `=` - equals
- `!=` - not equals
- `~` - contains (fuzzy match)
- `!~` - does not contain
- `>`, `<`, `>=`, `<=` - comparison for dates/numbers
- `IN` - match any in list
- `NOT IN` - not in list

### Fields
- `title` - Page title
- `text` - All text content
- `space` - Space key
- `type` - Content type (page, blogpost, comment)
- `creator` - Page creator
- `contributor` - Anyone who edited
- `created` - Creation date
- `lastModified` - Last modification date
- `label` - Page labels

### Examples

**By creator:**
```cql
creator = currentUser() AND type = page
```

**By label:**
```cql
label = "important" AND space = DEV
```

**Recent pages:**
```cql
lastModified >= now("-7d") AND type = page
```

**Multiple spaces:**
```cql
space IN (DEV, DOCS, ENG) AND title ~ "API"
```

---

## Content Format

Confluence uses **Storage Format** (HTML-like) for page content.

### Basic Formatting

**Paragraph:**
```html
<p>This is a paragraph</p>
```

**Bold and Italic:**
```html
<p><strong>Bold text</strong> and <em>italic text</em></p>
```

**Headings:**
```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
```

**Lists:**
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<ol>
  <li>First</li>
  <li>Second</li>
</ol>
```

**Links:**
```html
<p><a href="https://example.com">Link text</a></p>
```

**Code:**
```html
<ac:structured-macro ac:name="code">
  <ac:plain-text-body><![CDATA[
    function example() {
      return true;
    }
  ]]></ac:plain-text-body>
</ac:structured-macro>
```

---

## Workflow Examples

### Find and Update Documentation

```
1. search_confluence_by_text(query: "API authentication guide")
2. get_confluence_page(pageId: "found-page-id")
3. Review current content and version
4. update_confluence_page(
     pageId: "found-page-id",
     title: "API Authentication Guide",
     content: "<updated HTML content>",
     version: current_version
   )
```

### Create Documentation Structure

```
1. get_confluence_space(spaceKey: "DEV")
2. create_confluence_page(
     spaceKey: "DEV",
     title: "API Documentation",
     content: "<p>Main API docs</p>"
   )
   // Returns pageId for parent
3. create_confluence_page(
     spaceKey: "DEV",
     title: "Authentication",
     content: "<p>Auth details</p>",
     parentId: "parent-page-id"
   )
```

### Search Across Multiple Spaces

```
search_confluence(
  cql: "space IN (DEV, DOCS, ENG) AND text ~ 'deployment' AND lastModified >= '2024-01-01'",
  limit: 50
)
```

---

## Tips and Best Practices

### Search Tips
1. **Start broad, narrow down** - Use simple text search first, then CQL for precision
2. **Use space filters** - Limit to relevant spaces for faster, more relevant results
3. **Check recent pages** - Use `lastModified` to find up-to-date content
4. **Try multiple keywords** - If one search fails, try synonyms or related terms

### Content Tips
1. **Always get current version** - Before updating, fetch the page to get version number
2. **Use proper HTML** - Follow Confluence storage format for rich content
3. **Test locally first** - Create test pages before updating production docs
4. **Add labels** - Use labels for better organization and searchability

### Performance
- Simple text search is faster than complex CQL
- Limit results to what you need (default: 25)
- Search specific spaces rather than all spaces
- Use date filters to reduce result sets

---

## Common Use Cases

### Documentation Updates
```
"Find the API deployment guide and update it with the new process"
1. search_confluence_by_text(query: "API deployment guide")
2. get_confluence_page(pageId: "result-id")
3. update_confluence_page with new content
```

### Knowledge Discovery
```
"What documentation exists about authentication?"
1. search_confluence_by_text(query: "authentication")
2. Review titles and spaces
3. get_confluence_page for detailed content
```

### Creating Guides
```
"Create a new onboarding guide in the DEV space"
1. get_confluence_space(spaceKey: "DEV")
2. create_confluence_page with structured content
```

### Finding Recent Updates
```
"Show me recently updated pages in the DOCS space"
search_confluence(
  cql: "space=DOCS AND lastModified >= now('-7d') ORDER BY lastModified DESC"
)
```

---

## Troubleshooting

**Page not found?**
- Check space key is correct (case-sensitive)
- Verify you have permission to access the space
- Try searching by text instead of exact title

**Version conflict on update?**
- Get fresh page data with `get_confluence_page`
- Use the latest version number
- Ensure no one else is editing simultaneously

**Empty search results?**
- Try simpler search terms
- Remove date/space filters
- Use `~` for fuzzy matching instead of `=`
- Check you have access to the spaces

**HTML formatting issues?**
- Use Confluence storage format, not plain HTML
- Test with simple content first
- Check for special characters that need escaping
- Reference existing pages for format examples
