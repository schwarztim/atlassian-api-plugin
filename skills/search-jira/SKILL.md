---
name: search-jira
description: "Advanced Jira search and issue management. Search across projects using JQL, find issues by various criteria, and get detailed information. Use when you need to find specific issues, search by status/assignee/priority, or explore project contents."
---

# Search Jira

## Keywords
search jira, find issues, search issues, find tickets, jira query, look up issues, find bugs, search project, my issues, assigned to me, in progress issues

## Overview

Comprehensive Jira search capabilities using JQL (Jira Query Language) for finding issues across projects with flexible filtering.

**Use this skill when:** Users need to search for specific issues, filter by criteria, or explore project contents.

---

## Common Search Patterns

### By Assignee

**My open issues:**
```
search_jira_issues(
  jql: "assignee=currentUser() AND status NOT IN (Done, Closed, Resolved) ORDER BY priority DESC"
)
```

**Issues assigned to specific person:**
```
search_jira_issues(
  jql: "assignee='john.doe@company.com' AND status=Open"
)
```

**Unassigned issues:**
```
search_jira_issues(
  jql: "assignee is EMPTY AND status=Open ORDER BY priority DESC"
)
```

---

### By Status

**In Progress issues:**
```
search_jira_issues(
  jql: "status='In Progress' AND assignee=currentUser()"
)
```

**Recently resolved:**
```
search_jira_issues(
  jql: "status=Resolved AND resolved >= -7d ORDER BY resolved DESC"
)
```

---

### By Priority

**High priority bugs:**
```
search_jira_issues(
  jql: "project=PROJ AND priority=High AND type=Bug AND status!=Done"
)
```

---

### By Time

**Updated in last 3 days:**
```
search_jira_issues(
  jql: "project=PROJ AND updated >= -3d ORDER BY updated DESC"
)
```

**Created this week:**
```
search_jira_issues(
  jql: "project=PROJ AND created >= startOfWeek() ORDER BY created DESC"
)
```

---

### By Text

**Text search in summary:**
```
search_jira_issues(
  jql: "summary ~ 'authentication error' AND type=Bug"
)
```

**Text search anywhere:**
```
search_jira_issues(
  jql: "text ~ 'database connection' ORDER BY updated DESC"
)
```

---

### Combined Filters

**My high-priority open bugs:**
```
search_jira_issues(
  jql: "assignee=currentUser() AND priority IN (High, Highest) AND type=Bug AND status NOT IN (Done, Closed)"
)
```

**Recent unresolved issues in specific project:**
```
search_jira_issues(
  jql: "project=CSA AND status NOT IN (Done, Resolved, Closed) AND updated >= -14d ORDER BY priority DESC, updated DESC"
)
```

---

## JQL Reference

### Operators
- `=` - equals
- `!=` - not equals
- `>`, `<`, `>=`, `<=` - comparison
- `IN` - match any of list: `status IN (Open, "In Progress")`
- `NOT IN` - not in list
- `~` - contains text (fuzzy match)
- `!~` - does not contain
- `IS EMPTY` - field has no value
- `IS NOT EMPTY` - field has a value

### Functions
- `currentUser()` - currently authenticated user
- `now()` - current date/time
- `startOfWeek()`, `endOfWeek()`
- `startOfMonth()`, `endOfMonth()`
- `startOfYear()`, `endOfYear()`

### Time Expressions
- `-7d` - 7 days ago
- `-2w` - 2 weeks ago
- `-3M` - 3 months ago
- `+1d` - tomorrow

### Common Fields
- `project` - Project key
- `status` - Issue status
- `assignee` - Assigned user
- `reporter` - Reporter user
- `priority` - Priority level
- `type` - Issue type (Bug, Story, Task, etc.)
- `labels` - Labels
- `summary` - Issue title
- `description` - Issue description
- `text` - Search all text fields
- `created` - Creation date
- `updated` - Last update date
- `resolved` - Resolution date

---

## Quick Access Functions

For common queries, use these shortcuts:

### Get My Issues
```
get_my_issues(includeCompleted: false, maxResults: 50)
```

### Get In Progress
```
get_in_progress_issues(maxResults: 50)
```

### Get Recent Updates
```
get_recent_issues(days: 7, maxResults: 50)
```

---

## Getting Detailed Information

### Get Full Issue Details
```
get_issue(issueKey: "PROJ-123")
```

Returns:
- Full description
- All comments
- Status and priority
- Assignee and reporter
- Creation and update timestamps
- Labels

### Get Available Transitions
```
get_transitions(issueKey: "PROJ-123")
```

Shows what status changes are available (e.g., To Do → In Progress → Done)

---

## Project Information

### List All Projects
```
get_projects(maxResults: 50)
```

### Get Project Details
```
get_project(projectKey: "CSA")
```

Returns:
- Project name and description
- Project lead
- Available issue types
- Project URL

---

## Best Practices

### Search Tips
1. **Start specific, broaden if needed** - Begin with detailed criteria, relax if no results
2. **Use ORDER BY** - Sort results meaningfully (priority, updated date, etc.)
3. **Limit results** - Use maxResults to avoid overwhelming output
4. **Multiple searches** - Run several targeted searches rather than one complex query

### Performance
- Avoid `text ~` searches on very large projects (slow)
- Use specific fields (`summary ~` instead of `text ~`)
- Add project filters to narrow scope
- Use date ranges to limit results

### Finding the Right Issues
- Check both summary and description
- Include archived/resolved issues if searching history
- Use fuzzy matching (`~`) for flexible text search
- Consider different terms users might use

---

## Example Workflows

### Find and Update Issue
```
1. search_jira_issues(jql: "summary ~ 'authentication bug' AND status=Open")
2. get_issue(issueKey: "PROJ-456")  // Get full details
3. add_comment(issueKey: "PROJ-456", comment: "Investigating this issue")
4. transition_issue(issueKey: "PROJ-456", transitionId: "21")  // Move to In Progress
```

### Bulk Status Review
```
1. search_jira_issues(jql: "assignee=currentUser() AND status='In Progress'")
2. For each issue:
   - get_issue(issueKey: "...")
   - Review status
   - Update or transition as needed
```

---

## Troubleshooting

**Too many results?**
- Add more filters (project, status, date range)
- Reduce maxResults parameter
- Add ORDER BY to get most relevant first

**No results?**
- Broaden search terms
- Check spelling and project keys
- Remove some filters
- Try different field searches (summary vs text)

**Slow searches?**
- Avoid `text ~` on large datasets
- Add project filter
- Use specific date ranges
- Search specific fields instead of all text
