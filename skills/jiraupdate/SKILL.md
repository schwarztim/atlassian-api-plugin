---
name: jiraupdate
description: This skill should be used when the user says "jiraupdate", "respond to jira ticket", "answer jira ticket", or provides a Jira ticket URL/key wanting a researched response drafted.
---

# Jira Ticket Responder

Research Jira tickets and draft responses for user approval before posting.

## Workflow

### Step 1: Get Ticket & Identify User

```
mcp__atlassian-api-key__get_issue with expand=["renderedFields"]
mcp__atlassian-api-key__get_current_user
```

### Step 2: Analyze & Present Summary

Present to user:

```
JIRA TICKET SUMMARY

Ticket: [KEY] - [Title]
URL: https://qurate.atlassian.net/browse/[KEY]
Status: [Status]
Assignee: [Name]

THE ASK:
[2-3 sentence summary of what is being requested/reported]

WHY YOU'RE NEEDED:
[Reason - e.g., "You were @mentioned by Jason Silva asking for clarification"]

LATEST ACTIVITY:
[Who commented last and what they said, briefly]
```

### Step 3: Research (if response needed)

Use available MCPs silently:
- Confluence for internal docs
- Akamai for CDN/security issues
- Web search for external solutions
- Other MCPs as relevant

### Step 4: Present Proposed Response

Show the drafted comment for approval:

```
PROPOSED RESPONSE:
---
[The exact comment that would be posted]
---

SOURCES:
• [Source 1] - [URL]
• [Source 2] - [URL]

Reply "yes" to post, "no" to cancel, or provide edits.
```

### Step 5: Wait for Approval

**DO NOT POST until user explicitly approves.**

- "yes" / "yay" / "post it" / "send" → Post the comment
- "no" / "nay" / "cancel" → Don't post, ask what to change
- User provides edits → Revise and show again for approval

### Step 6: Post & Confirm (only after approval)

After user says yes:

```
mcp__atlassian-api-key__add_jira_comment
```

Confirm:
```
POSTED

Ticket: https://qurate.atlassian.net/browse/[KEY]
Comment posted successfully.
```

## Comment Format

Plain text only (Jira Cloud ADF breaks wiki markup):

```
Hi [Name],

This is an automated response. beep boop

---

[One line answer/solution]

SECTION:
1. Step one
2. Step two

DOCS:
• Page - https://url

---

Let me know if you need clarification.
```

## Rules

- NO wiki markup (h2., *, #, [], {code})
- CAPS for headers
- • for bullets
- Plain URLs only
- Always get approval before posting
- Show sources used
