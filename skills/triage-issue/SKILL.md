---
name: triage-issue
description: "Intelligently triage bug reports and error messages by searching for duplicates in Jira and offering to create new issues or add comments to existing ones. Searches Jira for similar issues, identifies duplicates, checks fix history, and helps create well-structured bug reports."
---

# Triage Issue

## Keywords
triage bug, check duplicate, is this a duplicate, search for similar issues, create bug ticket, file a bug, report this error, triage this error, bug report, error message, similar issues, duplicate bug

## Overview

Automatically triage bug reports and error messages by searching Jira for duplicates, identifying similar past issues, and helping create well-structured bug tickets or add context to existing issues.

**Use this skill when:** Users need to triage error messages, bug reports, or issues to determine if they're duplicates and take appropriate action.

---

## Workflow

Follow this process to effectively triage issues:

### Step 1: Extract Key Information

Analyze the bug report or error message to identify search terms.

#### Extract These Elements:

**Error signature:**
- Error type or exception name (e.g., "NullPointerException", "TimeoutError")
- Error code or status (e.g., "500", "404", "ERR_CONNECTION_REFUSED")
- Specific error message text (key phrases, not full stack trace)

**Context:**
- Component or system affected (e.g., "authentication", "payment gateway", "API")
- Environment (e.g., "production", "staging", "mobile app")
- User actions leading to error (e.g., "during login", "when uploading file")

**Symptoms:**
- Observable behavior (e.g., "page blank", "infinite loading", "data not saving")
- Impact (e.g., "users can't login", "payments failing")

---

### Step 2: Search for Duplicates

Search Jira using extracted keywords to find similar or duplicate issues.

Use the `search_jira_issues` MCP tool with targeted JQL queries:

**Search 1: Error-focused**
```
search_jira_issues(
  jql: 'project="YOUR_PROJECT" AND (text ~ "error signature" OR summary ~ "error signature") AND type=Bug ORDER BY created DESC',
  maxResults: 20
)
```

**Search 2: Component-focused**
```
search_jira_issues(
  jql: 'project="YOUR_PROJECT" AND text ~ "component keywords" AND type=Bug ORDER BY updated DESC',
  maxResults: 20
)
```

**Search 3: Symptom-focused**
```
search_jira_issues(
  jql: 'project="YOUR_PROJECT" AND summary ~ "symptom keywords" AND type=Bug ORDER BY priority DESC',
  maxResults: 20
)
```

---

### Step 3: Analyze Results

For each potential duplicate found:

1. **Get full details** using `get_issue(issueKey: "KEY-123")`
2. **Check status:**
   - If RESOLVED/CLOSED: Note the resolution and when it was fixed
   - If OPEN: This is a potential active duplicate
3. **Compare details:**
   - Do error messages match?
   - Same component/system?
   - Similar symptoms?

---

### Step 4: Present Findings to User

Format your findings clearly:

**If duplicates found:**
```
🔍 Found potential duplicates:

1. [KEY-123] Similar error in authentication module
   Status: RESOLVED (Fixed in v2.1.0)
   Resolution: Timeout increased from 5s to 30s

2. [KEY-456] Same NullPointerException
   Status: OPEN
   Priority: High
   Assigned to: John Doe

Would you like to:
1. Add your details as a comment to KEY-456
2. Create a new issue (if this is actually different)
3. Get more details about a specific issue
```

**If no duplicates found:**
```
✅ No duplicates found.

Would you like me to create a new bug ticket with this information?
I'll structure it with:
- Clear summary
- Steps to reproduce
- Error details
- Environment information
```

---

### Step 5: Take Action

Based on user choice:

**Option A: Add comment to existing issue**
```
add_comment(
  issueKey: "KEY-123",
  comment: "Additional occurrence reported: [details from user's report]"
)
```

**Option B: Create new issue**
```
create_issue(
  project: "PROJ",
  issueType: "Bug",
  summary: "[Clear, specific summary]",
  description: "[Structured description with error details, steps, impact]",
  priority: "High"  // if applicable
)
```

---

## Best Practices

### Search Strategy
- Use multiple searches with different keywords
- Include both exact matches and fuzzy matches
- Search recent issues first, then expand timeframe
- Check both open AND resolved issues

### Duplicate Detection
- Look for similar error messages (not just exact matches)
- Consider different environments (prod vs staging)
- Check if same root cause even if symptoms differ
- Review fix dates - old fixes may have regressed

### Issue Creation
- Use clear, specific summaries
- Include complete error messages
- Add steps to reproduce
- Specify environment details
- Set appropriate priority based on impact

---

## Example Usage

**User:** "Triage this error: 'Connection timeout after 5 seconds when calling /api/auth/login on mobile app'"

**Assistant:**
1. Extract: error="Connection timeout", component="auth login mobile"
2. Search for similar timeout and login issues
3. Find KEY-789 with same error, resolved last month
4. Find KEY-890 open issue with mobile auth problems
5. Present both to user with details
6. Based on user input, either comment on KEY-890 or create new issue

---

## Tips

- Always search BEFORE creating to avoid duplicates
- Check both summary and description fields
- Consider that users may describe same issue differently
- Look at comments on existing issues for additional context
- When in doubt, ask user if found issues match their problem
