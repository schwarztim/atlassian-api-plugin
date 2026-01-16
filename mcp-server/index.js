#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Agent } from "node:http";
import https from "node:https";

// Get credentials from environment variables
const ATLASSIAN_URL = process.env.JIRA_URL || "https://your-domain.atlassian.net";
const ATLASSIAN_EMAIL = process.env.JIRA_EMAIL;
const ATLASSIAN_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!ATLASSIAN_EMAIL || !ATLASSIAN_API_TOKEN) {
  console.error("Error: JIRA_EMAIL and JIRA_API_TOKEN environment variables must be set");
  process.exit(1);
}

// Create Basic Auth header (cached)
const authHeader = Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString('base64');

// HTTP/2 Agent with connection pooling for performance
// keepAlive reuses TCP connections, reducing latency on repeated requests
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000, // Keep connections alive for 30 seconds
  maxSockets: 50, // Max concurrent connections
  maxFreeSockets: 10, // Max idle connections to keep
  timeout: 60000 // 60 second timeout
});

// Helper function to make Jira API calls
async function jiraApi(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    agent: httpsAgent // Use connection pooling agent
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${ATLASSIAN_URL}/rest/api/3/${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jira API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Helper function to make Confluence API calls
async function confluenceApi(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    agent: httpsAgent // Use connection pooling agent
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${ATLASSIAN_URL}/wiki/rest/api/${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Confluence API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Helper function to make Confluence API v2 calls (improved performance)
async function confluenceApiV2(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    agent: httpsAgent // Use connection pooling agent
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${ATLASSIAN_URL}/wiki/api/v2/${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Confluence API v2 error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Create MCP server
const server = new Server(
  {
    name: "atlassian-mcp-server",
    version: "2.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ========== JIRA TOOLS ==========
      {
        name: "search_jira_issues",
        description: "Search Jira issues using JQL (Jira Query Language). Most versatile search tool. Examples: 'project=PROJ AND status=Open', 'assignee=currentUser() AND priority=High'",
        inputSchema: {
          type: "object",
          properties: {
            jql: {
              type: "string",
              description: "JQL query string (e.g., 'project=CSA AND priority=High')"
            },
            fields: {
              type: "array",
              items: { type: "string" },
              description: "Fields to return (default: key, summary, status, priority, assignee, updated)",
              default: ["key", "summary", "status", "priority", "assignee", "updated"]
            },
            maxResults: {
              type: "number",
              description: "Maximum number of results to return (default: 50)",
              default: 50
            }
          },
          required: ["jql"]
        }
      },
      {
        name: "get_issue",
        description: "Get detailed information about a specific Jira issue by key (e.g., CSA-917). Returns full issue details including description, comments, attachments, and history.",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: {
              type: "string",
              description: "The issue key (e.g., CSA-917, TEXP-7360)"
            },
            expand: {
              type: "array",
              items: { type: "string" },
              description: "Additional data to expand (e.g., changelog, renderedFields)",
              default: []
            }
          },
          required: ["issueKey"]
        }
      },
      {
        name: "create_issue",
        description: "Create a new Jira issue. Requires project key, issue type, and summary at minimum.",
        inputSchema: {
          type: "object",
          properties: {
            project: {
              type: "string",
              description: "Project key (e.g., CSA, TEXP)"
            },
            issueType: {
              type: "string",
              description: "Issue type (e.g., Bug, Story, Task, Epic)"
            },
            summary: {
              type: "string",
              description: "Issue summary/title"
            },
            description: {
              type: "string",
              description: "Issue description (optional)"
            },
            priority: {
              type: "string",
              description: "Priority name (e.g., High, Medium, Low) (optional)"
            },
            assignee: {
              type: "string",
              description: "Assignee account ID or email (optional)"
            },
            labels: {
              type: "array",
              items: { type: "string" },
              description: "Labels to add (optional)"
            }
          },
          required: ["project", "issueType", "summary"]
        }
      },
      {
        name: "update_issue",
        description: "Update an existing Jira issue. Can update any editable field.",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: {
              type: "string",
              description: "The issue key to update"
            },
            fields: {
              type: "object",
              description: "Fields to update (e.g., {summary: 'New title', description: 'New desc'})"
            }
          },
          required: ["issueKey", "fields"]
        }
      },
      {
        name: "add_jira_comment",
        description: "Add a comment to a Jira issue",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: {
              type: "string",
              description: "The issue key (e.g., CSA-917)"
            },
            comment: {
              type: "string",
              description: "The comment text to add"
            }
          },
          required: ["issueKey", "comment"]
        }
      },
      {
        name: "get_transitions",
        description: "Get available workflow transitions for an issue (e.g., To Do -> In Progress -> Done)",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: {
              type: "string",
              description: "The issue key"
            }
          },
          required: ["issueKey"]
        }
      },
      {
        name: "transition_issue",
        description: "Transition an issue to a new status (e.g., move to In Progress, Done, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: {
              type: "string",
              description: "The issue key"
            },
            transitionId: {
              type: "string",
              description: "The transition ID (use get_transitions to find available transitions)"
            },
            comment: {
              type: "string",
              description: "Optional comment to add with the transition"
            }
          },
          required: ["issueKey", "transitionId"]
        }
      },
      {
        name: "get_projects",
        description: "Get list of all accessible Jira projects",
        inputSchema: {
          type: "object",
          properties: {
            maxResults: {
              type: "number",
              description: "Maximum number of results (default: 50)",
              default: 50
            }
          }
        }
      },
      {
        name: "get_project",
        description: "Get detailed information about a specific project",
        inputSchema: {
          type: "object",
          properties: {
            projectKey: {
              type: "string",
              description: "The project key (e.g., CSA, TEXP)"
            }
          },
          required: ["projectKey"]
        }
      },
      {
        name: "get_current_user",
        description: "Get information about the currently authenticated user",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_my_issues",
        description: "Get Jira issues assigned to the current user. Excludes closed/cancelled/done issues by default.",
        inputSchema: {
          type: "object",
          properties: {
            includeCompleted: {
              type: "boolean",
              description: "Include completed/closed/cancelled issues (default: false)",
              default: false
            },
            maxResults: {
              type: "number",
              description: "Maximum number of results to return (default: 50)",
              default: 50
            }
          }
        }
      },
      {
        name: "get_in_progress_issues",
        description: "Get issues currently in progress assigned to the current user",
        inputSchema: {
          type: "object",
          properties: {
            maxResults: {
              type: "number",
              description: "Maximum number of results to return (default: 50)",
              default: 50
            }
          }
        }
      },
      {
        name: "get_recent_issues",
        description: "Get recently updated issues assigned to the current user",
        inputSchema: {
          type: "object",
          properties: {
            days: {
              type: "number",
              description: "Number of days to look back (default: 7)",
              default: 7
            },
            maxResults: {
              type: "number",
              description: "Maximum number of results to return (default: 50)",
              default: 50
            }
          }
        }
      },
      {
        name: "assign_issue",
        description: "Assign an issue to a user",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: {
              type: "string",
              description: "The issue key"
            },
            accountId: {
              type: "string",
              description: "The account ID of the user to assign (use 'me' for current user, or null to unassign)"
            }
          },
          required: ["issueKey"]
        }
      },
      {
        name: "search_users",
        description: "Search for users by name or email to get their account IDs",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (name or email)"
            },
            maxResults: {
              type: "number",
              description: "Maximum results (default: 10)",
              default: 10
            }
          },
          required: ["query"]
        }
      },

      // ========== CONFLUENCE TOOLS ==========
      {
        name: "search_confluence",
        description: "Search Confluence pages using CQL (Confluence Query Language). Examples: 'title ~ \"API\" AND type=page', 'space=DEV AND text ~ \"authentication\"'",
        inputSchema: {
          type: "object",
          properties: {
            cql: {
              type: "string",
              description: "CQL query string (e.g., 'title ~ \"API\" AND type=page')"
            },
            limit: {
              type: "number",
              description: "Maximum number of results (default: 25)",
              default: 25
            },
            expand: {
              type: "string",
              description: "Additional data to expand (e.g., 'body.storage,version')",
              default: "space,version"
            }
          },
          required: ["cql"]
        }
      },
      {
        name: "get_confluence_page",
        description: "Get a Confluence page by ID with full content",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "The page ID"
            },
            expand: {
              type: "string",
              description: "Fields to expand (default: body.storage,version,space)",
              default: "body.storage,version,space"
            }
          },
          required: ["pageId"]
        }
      },
      {
        name: "get_confluence_page_by_title",
        description: "Get a Confluence page by title and space key",
        inputSchema: {
          type: "object",
          properties: {
            spaceKey: {
              type: "string",
              description: "The space key (e.g., 'DEV', 'DOCS')"
            },
            title: {
              type: "string",
              description: "The page title"
            },
            expand: {
              type: "string",
              description: "Fields to expand (default: body.storage,version)",
              default: "body.storage,version"
            }
          },
          required: ["spaceKey", "title"]
        }
      },
      {
        name: "create_confluence_page",
        description: "Create a new Confluence page",
        inputSchema: {
          type: "object",
          properties: {
            spaceKey: {
              type: "string",
              description: "The space key where the page will be created"
            },
            title: {
              type: "string",
              description: "Page title"
            },
            content: {
              type: "string",
              description: "Page content in Confluence storage format (HTML-like)"
            },
            parentId: {
              type: "string",
              description: "Parent page ID (optional, for creating child pages)"
            }
          },
          required: ["spaceKey", "title", "content"]
        }
      },
      {
        name: "update_confluence_page",
        description: "Update an existing Confluence page",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "The page ID to update"
            },
            title: {
              type: "string",
              description: "New page title"
            },
            content: {
              type: "string",
              description: "New page content in Confluence storage format"
            },
            version: {
              type: "number",
              description: "Current version number (required for updates)"
            }
          },
          required: ["pageId", "title", "content", "version"]
        }
      },
      {
        name: "get_confluence_spaces",
        description: "Get list of all accessible Confluence spaces",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of results (default: 25)",
              default: 25
            },
            type: {
              type: "string",
              description: "Space type filter: 'global' or 'personal' (optional)"
            }
          }
        }
      },
      {
        name: "get_confluence_space",
        description: "Get detailed information about a specific Confluence space",
        inputSchema: {
          type: "object",
          properties: {
            spaceKey: {
              type: "string",
              description: "The space key (e.g., 'DEV', 'DOCS')"
            }
          },
          required: ["spaceKey"]
        }
      },
      {
        name: "add_confluence_comment",
        description: "Add a comment to a Confluence page",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "The page ID to comment on"
            },
            comment: {
              type: "string",
              description: "Comment text"
            }
          },
          required: ["pageId", "comment"]
        }
      },
      {
        name: "search_confluence_by_text",
        description: "Simple text search across all Confluence pages. Good for quick searches without CQL.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search text"
            },
            limit: {
              type: "number",
              description: "Maximum results (default: 25)",
              default: 25
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_confluence_page_v2",
        description: "Get a Confluence page using the v2 API with improved performance and optional public link. Returns page content with better response control than v1.",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "The page ID"
            },
            includePublicLink: {
              type: "boolean",
              description: "Include public link data if available (default: false)",
              default: false
            },
            bodyFormat: {
              type: "string",
              description: "Format for body content: 'storage', 'atlas_doc_format', or 'view' (default: storage)",
              default: "storage"
            }
          },
          required: ["pageId"]
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // ========== JIRA HANDLERS ==========
      case "search_jira_issues": {
        const { jql, fields = ["key", "summary", "status", "priority", "assignee", "updated"], maxResults = 50 } = args;

        const data = await jiraApi('search', 'POST', {
          jql,
          fields,
          maxResults
        });

        const issues = data.issues.map(issue => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status?.name,
          priority: issue.fields.priority?.name || "None",
          assignee: issue.fields.assignee?.displayName || "Unassigned",
          updated: issue.fields.updated
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ total: data.total, maxResults: data.maxResults, issues }, null, 2)
            }
          ]
        };
      }

      case "get_issue": {
        const { issueKey, expand = [] } = args;
        const expandParam = expand.length > 0 ? `?expand=${expand.join(',')}` : '';
        const issue = await jiraApi(`issue/${issueKey}${expandParam}`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                key: issue.key,
                summary: issue.fields.summary,
                description: issue.fields.description,
                status: issue.fields.status.name,
                priority: issue.fields.priority?.name || "None",
                assignee: issue.fields.assignee?.displayName || "Unassigned",
                reporter: issue.fields.reporter?.displayName,
                created: issue.fields.created,
                updated: issue.fields.updated,
                labels: issue.fields.labels || [],
                comments: issue.fields.comment?.comments?.map(c => ({
                  author: c.author.displayName,
                  created: c.created,
                  body: c.body
                })) || []
              }, null, 2)
            }
          ]
        };
      }

      case "create_issue": {
        const { project, issueType, summary, description, priority, assignee, labels } = args;

        const fields = {
          project: { key: project },
          issuetype: { name: issueType },
          summary
        };

        if (description) {
          fields.description = {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: description }]
              }
            ]
          };
        }

        if (priority) {
          fields.priority = { name: priority };
        }

        if (assignee) {
          fields.assignee = { id: assignee };
        }

        if (labels && labels.length > 0) {
          fields.labels = labels;
        }

        const result = await jiraApi('issue', 'POST', { fields });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                issueKey: result.key,
                issueId: result.id,
                url: `${ATLASSIAN_URL}/browse/${result.key}`
              }, null, 2)
            }
          ]
        };
      }

      case "update_issue": {
        const { issueKey, fields } = args;

        await jiraApi(`issue/${issueKey}`, 'PUT', { fields });

        return {
          content: [
            {
              type: "text",
              text: `Successfully updated ${issueKey}`
            }
          ]
        };
      }

      case "add_jira_comment": {
        const { issueKey, comment } = args;

        await jiraApi(`issue/${issueKey}/comment`, 'POST', {
          body: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: comment }]
              }
            ]
          }
        });

        return {
          content: [
            {
              type: "text",
              text: `Successfully added comment to ${issueKey}`
            }
          ]
        };
      }

      case "get_transitions": {
        const { issueKey } = args;
        const data = await jiraApi(`issue/${issueKey}/transitions`);

        const transitions = data.transitions.map(t => ({
          id: t.id,
          name: t.name,
          to: t.to.name
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ issueKey, transitions }, null, 2)
            }
          ]
        };
      }

      case "transition_issue": {
        const { issueKey, transitionId, comment } = args;

        const payload = {
          transition: { id: transitionId }
        };

        if (comment) {
          payload.update = {
            comment: [{
              add: {
                body: {
                  type: "doc",
                  version: 1,
                  content: [{
                    type: "paragraph",
                    content: [{ type: "text", text: comment }]
                  }]
                }
              }
            }]
          };
        }

        await jiraApi(`issue/${issueKey}/transitions`, 'POST', payload);

        return {
          content: [
            {
              type: "text",
              text: `Successfully transitioned ${issueKey}`
            }
          ]
        };
      }

      case "get_projects": {
        const { maxResults = 50 } = args;
        const data = await jiraApi(`project/search?maxResults=${maxResults}`);

        const projects = data.values.map(p => ({
          key: p.key,
          name: p.name,
          type: p.projectTypeKey,
          lead: p.lead?.displayName
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ total: data.total, projects }, null, 2)
            }
          ]
        };
      }

      case "get_project": {
        const { projectKey } = args;
        const project = await jiraApi(`project/${projectKey}`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                key: project.key,
                name: project.name,
                description: project.description,
                lead: project.lead?.displayName,
                url: project.url,
                issueTypes: project.issueTypes?.map(it => it.name) || []
              }, null, 2)
            }
          ]
        };
      }

      case "get_current_user": {
        const user = await jiraApi('myself');

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                accountId: user.accountId,
                displayName: user.displayName,
                emailAddress: user.emailAddress,
                timeZone: user.timeZone
              }, null, 2)
            }
          ]
        };
      }

      case "get_my_issues": {
        const includeCompleted = args.includeCompleted || false;
        const maxResults = args.maxResults || 50;

        let jql = "assignee=currentUser()";
        if (!includeCompleted) {
          jql += " AND status NOT IN (Done, Closed, Cancelled, Resolved)";
        }
        jql += " ORDER BY priority DESC, updated DESC";

        const data = await jiraApi('search', 'POST', {
          jql,
          fields: ["key", "summary", "status", "priority", "updated", "assignee"],
          maxResults
        });

        const issues = data.issues.map(issue => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name || "None",
          updated: issue.fields.updated
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ total: data.total, issues }, null, 2)
            }
          ]
        };
      }

      case "get_in_progress_issues": {
        const maxResults = args.maxResults || 50;

        const data = await jiraApi('search', 'POST', {
          jql: 'assignee=currentUser() AND status IN ("In Progress", "In Development") ORDER BY priority DESC',
          fields: ["key", "summary", "status", "priority"],
          maxResults
        });

        const issues = data.issues.map(issue => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name || "None"
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ total: data.total, issues }, null, 2)
            }
          ]
        };
      }

      case "get_recent_issues": {
        const days = args.days || 7;
        const maxResults = args.maxResults || 50;

        const data = await jiraApi('search', 'POST', {
          jql: `assignee=currentUser() AND updated >= -${days}d ORDER BY updated DESC`,
          fields: ["key", "summary", "status", "updated"],
          maxResults
        });

        const issues = data.issues.map(issue => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          updated: issue.fields.updated
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ total: data.total, issues }, null, 2)
            }
          ]
        };
      }

      case "assign_issue": {
        const { issueKey, accountId } = args;

        const payload = accountId === null ? { accountId: null } :
                       accountId === 'me' ? { accountId: '-1' } :
                       { accountId };

        await jiraApi(`issue/${issueKey}/assignee`, 'PUT', payload);

        return {
          content: [
            {
              type: "text",
              text: `Successfully assigned ${issueKey}`
            }
          ]
        };
      }

      case "search_users": {
        const { query, maxResults = 10 } = args;
        const data = await jiraApi(`user/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}`);

        const users = data.map(u => ({
          accountId: u.accountId,
          displayName: u.displayName,
          emailAddress: u.emailAddress,
          active: u.active
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ users }, null, 2)
            }
          ]
        };
      }

      // ========== CONFLUENCE HANDLERS ==========
      case "search_confluence": {
        const { cql, limit = 25, expand = "space,version" } = args;

        const data = await confluenceApi(`content/search?cql=${encodeURIComponent(cql)}&limit=${limit}&expand=${expand}`);

        const pages = data.results.map(page => ({
          id: page.id,
          type: page.type,
          title: page.title,
          space: page.space?.key,
          url: `${ATLASSIAN_URL}/wiki${page._links.webui}`,
          lastModified: page.version?.when
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ total: data.size, pages }, null, 2)
            }
          ]
        };
      }

      case "get_confluence_page": {
        const { pageId, expand = "body.storage,version,space" } = args;

        const page = await confluenceApi(`content/${pageId}?expand=${expand}`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: page.id,
                type: page.type,
                title: page.title,
                space: page.space?.key,
                version: page.version?.number,
                lastModified: page.version?.when,
                content: page.body?.storage?.value,
                url: `${ATLASSIAN_URL}/wiki${page._links.webui}`
              }, null, 2)
            }
          ]
        };
      }

      case "get_confluence_page_by_title": {
        const { spaceKey, title, expand = "body.storage,version" } = args;

        const data = await confluenceApi(`content?spaceKey=${spaceKey}&title=${encodeURIComponent(title)}&expand=${expand}`);

        if (data.results.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: "Page not found" }, null, 2)
              }
            ]
          };
        }

        const page = data.results[0];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: page.id,
                type: page.type,
                title: page.title,
                space: spaceKey,
                version: page.version?.number,
                lastModified: page.version?.when,
                content: page.body?.storage?.value,
                url: `${ATLASSIAN_URL}/wiki${page._links.webui}`
              }, null, 2)
            }
          ]
        };
      }

      case "create_confluence_page": {
        const { spaceKey, title, content, parentId } = args;

        const pageData = {
          type: "page",
          title,
          space: { key: spaceKey },
          body: {
            storage: {
              value: content,
              representation: "storage"
            }
          }
        };

        if (parentId) {
          pageData.ancestors = [{ id: parentId }];
        }

        const result = await confluenceApi('content', 'POST', pageData);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                pageId: result.id,
                title: result.title,
                url: `${ATLASSIAN_URL}/wiki${result._links.webui}`
              }, null, 2)
            }
          ]
        };
      }

      case "update_confluence_page": {
        const { pageId, title, content, version } = args;

        const pageData = {
          version: { number: version + 1 },
          title,
          type: "page",
          body: {
            storage: {
              value: content,
              representation: "storage"
            }
          }
        };

        const result = await confluenceApi(`content/${pageId}`, 'PUT', pageData);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                pageId: result.id,
                title: result.title,
                version: result.version.number,
                url: `${ATLASSIAN_URL}/wiki${result._links.webui}`
              }, null, 2)
            }
          ]
        };
      }

      case "get_confluence_spaces": {
        const { limit = 25, type } = args;

        let url = `space?limit=${limit}`;
        if (type) {
          url += `&type=${type}`;
        }

        const data = await confluenceApi(url);

        const spaces = data.results.map(space => ({
          key: space.key,
          name: space.name,
          type: space.type,
          url: `${ATLASSIAN_URL}/wiki${space._links.webui}`
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ total: data.size, spaces }, null, 2)
            }
          ]
        };
      }

      case "get_confluence_space": {
        const { spaceKey } = args;

        const space = await confluenceApi(`space/${spaceKey}?expand=description.plain,homepage`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                key: space.key,
                name: space.name,
                type: space.type,
                description: space.description?.plain?.value,
                homepage: space.homepage?.title,
                url: `${ATLASSIAN_URL}/wiki${space._links.webui}`
              }, null, 2)
            }
          ]
        };
      }

      case "add_confluence_comment": {
        const { pageId, comment } = args;

        const commentData = {
          type: "comment",
          container: { id: pageId, type: "page" },
          body: {
            storage: {
              value: `<p>${comment}</p>`,
              representation: "storage"
            }
          }
        };

        await confluenceApi('content', 'POST', commentData);

        return {
          content: [
            {
              type: "text",
              text: `Successfully added comment to page ${pageId}`
            }
          ]
        };
      }

      case "search_confluence_by_text": {
        const { query, limit = 25 } = args;

        const cql = `text ~ "${query}" AND type=page`;
        const data = await confluenceApi(`content/search?cql=${encodeURIComponent(cql)}&limit=${limit}&expand=space,version`);

        const pages = data.results.map(page => ({
          id: page.id,
          title: page.title,
          space: page.space?.key,
          url: `${ATLASSIAN_URL}/wiki${page._links.webui}`,
          lastModified: page.version?.when
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ total: data.size, pages }, null, 2)
            }
          ]
        };
      }

      case "get_confluence_page_v2": {
        const { pageId, includePublicLink = false, bodyFormat = "storage" } = args;

        let endpoint = `pages/${pageId}?body-format=${bodyFormat}`;
        if (includePublicLink) {
          endpoint += '&include-public-link=true';
        }

        const page = await confluenceApiV2(endpoint);

        const result = {
          id: page.id,
          status: page.status,
          title: page.title,
          spaceId: page.spaceId,
          parentId: page.parentId,
          parentType: page.parentType,
          version: page.version?.number,
          createdAt: page.version?.createdAt,
          authorId: page.authorId,
          body: page.body?.[bodyFormat]?.value,
          _links: page._links
        };

        if (includePublicLink && page.publicLink) {
          result.publicLink = page.publicLink;
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Atlassian MCP server (Jira + Confluence) running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
