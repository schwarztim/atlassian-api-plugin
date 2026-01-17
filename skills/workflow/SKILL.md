---
name: workflow
description: This skill should be used when the user says "workflow", "daily tasks", "morning routine", "what do I need to do today", or wants to review their pending work across systems.
---

# Daily Workflow

Review and manage daily tasks across all connected systems. Presents a unified view of what needs attention.

## Workflow

### Step 1: Identify User

```
mcp__atlassian-api-key__get_current_user
```

### Step 2: Gather Tasks from All Systems

Run these in parallel:

**Jira:**
```
mcp__atlassian-api-key__get_my_issues - Tickets assigned to you
mcp__atlassian-api-key__get_in_progress_issues - Your active work
mcp__atlassian-api-key__get_recent_issues - Recent activity on your tickets
```

**If Jira search fails (410 Gone - deprecated API):**
- Fall back to individual ticket lookups using `get_issue`
- Note the limitation in output
- Show workaround in QUICK ACTIONS

**[Future: Email]**
```
# mcp__microsoft-outlook__list-emails - Unread/flagged emails
# mcp__microsoft-outlook__get-my-mentions - Emails where you're mentioned
```

**[Future: Teams]**
```
# mcp__microsoft-teams__get_my_mentions - Teams mentions
# mcp__microsoft-teams__get_recent_messages - Unread messages
```

### Step 3: Present Daily Summary with Proposed Responses

```
DAILY WORKFLOW - [Date]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JIRA - NEEDS YOUR RESPONSE ([count])

For each ticket that needs response, show:

1. [KEY] - [Title]
   Status: [Status] | Priority: [Priority]
   @[Person] ([date]): "[Brief snippet of their question]"
   → https://qurate.atlassian.net/browse/[KEY]

   PROPOSED RESPONSE:
   ┌─────────────────────────────────────────┐
   │ [Researched response draft using MCPs] │
   │                                         │
   │ Sources:                                │
   │ • [Source 1] - [URL]                    │
   │ • [Source 2] - [URL]                    │
   └─────────────────────────────────────────┘

   Reply: "yay 1" to post | "nay 1" to skip | "edit 1" to revise

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JIRA - IN PROGRESS ([count])
Your active work:

1. [KEY] - [Title] | Status: [Status]
   → https://qurate.atlassian.net/browse/[KEY]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JIRA - ASSIGNED TO YOU ([count])
Backlog items:

1. [KEY] - [Title] | Priority: [Priority]
   → https://qurate.atlassian.net/browse/[KEY]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Future sections: EMAIL, TEAMS, CALENDAR, etc.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK ACTIONS:
• "yay [number]" - Post the proposed response
• "nay [number]" - Skip that ticket
• "edit [number]" - Revise the proposed response
• "workflow refresh" - Refresh this list
• "[number]" - Show full ticket details
```

### Step 4: Handle User Actions

**Approve and post response:**
- User says "yay 1" or "yay [KEY]" or "yes to 1" → Post the proposed response using `mcp__atlassian-api-key__add_jira_comment`
- Confirm posting with: "✓ Posted response to [KEY]"

**Decline response:**
- User says "nay 1" or "nay [KEY]" or "skip 1" → Skip that ticket, don't post
- Confirm: "Skipped [KEY]"

**Edit response:**
- User says "edit 1" or "edit [KEY]" or provides revisions → Update the drafted response, show revised version for approval
- Wait for "yay" or "nay" on revised version

**View details:**
- User says "1" or "show 1" → Show full ticket details with all comments

**Manual response (bypass research):**
- User says "respond to 1" or "jiraupdate [KEY]" → Invoke jiraupdate skill for manual research/drafting

**Refresh:**
- User says "refresh" or "workflow refresh" → Re-run the workflow

**Mark done:**
- User says "done with 1" → Ask if they want to update ticket status

## Categorization Logic

**NEEDS YOUR RESPONSE:**
For each ticket, fetch full details with comments using:
```
mcp__atlassian-api-key__get_issue with expand=["renderedFields","changelog","comment"]
```

A ticket needs your response ONLY if:
1. You're the assignee OR @mentioned in latest comment, AND
2. **CRITICAL**: The LAST comment author is NOT you (check `comment.comments[-1].author.accountId` != your accountId), AND
3. The last comment is asking a question or requesting action

**FALSE POSITIVE PREVENTION:**
- If YOU posted the last comment, EXCLUDE from "NEEDS YOUR RESPONSE"
- If someone replied after you, INCLUDE it
- If no new activity since your last comment, EXCLUDE it

**Research & Draft Response:**
When a ticket truly needs your response:
1. Use available MCPs to research:
   - `mcp__atlassian-api-key__search_confluence` - Internal docs
   - `mcp__microsoft-teams__search_messages` - Team conversations
   - Web search for external solutions
   - Any other relevant MCPs for context
2. Draft a proposed response
3. Show proposed response with sources
4. Wait for "yay" or "nay" approval
5. ONLY post after explicit approval

**IN PROGRESS:**
- Assigned to you with status containing "In Progress", "In Development", "Active"

**ASSIGNED (Backlog):**
- Assigned to you with status "Open", "To Do", "Backlog", etc.

## Output Rules

- Clean ASCII formatting (no emojis)
- Show counts in section headers
- Include direct URLs
- Keep snippets brief (< 50 chars)
- Sort by priority/urgency
- Group by action needed

## Extensibility

This skill is designed to grow. Future integrations:
- Email (Outlook) - Unread, flagged, mentions
- Teams - Mentions, unread channels
- Calendar - Today's meetings
- GitHub - PR reviews requested
- Custom reminders

Add new sections by updating Step 2 and Step 3.
