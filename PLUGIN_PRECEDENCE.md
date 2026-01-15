# Plugin Precedence & Usage Guide

## How It Works

### Your Setup

You now have **TWO** Atlassian plugins available:

1. **Official Atlassian Plugin (OAuth-based)**
   - Name: `atlassian`
   - Location: `~/.claude/plugins/cache/claude-plugins-official/atlassian/`
   - Authentication: OAuth 2.1 (browser-based)
   - MCP Server: `atlassian` (SSE to Atlassian cloud)
   - Available: Globally (everywhere)

2. **Your Custom Plugin (API key-based)**
   - Name: `atlassian-api`
   - Location: `~/Scripts/AtlassianPlugin/`
   - Authentication: API key (config file)
   - MCP Server: `atlassian-api-key` (local Node.js server)
   - Available: When in `AtlassianPlugin` directory or subdirectories

### Plugin Precedence Rules

**When you're in `~/Scripts/AtlassianPlugin/` (or subdirectories):**
- ✅ Your API key plugin is active
- ✅ Local `.mcp.json` loads the `atlassian-api-key` MCP server
- ✅ All 24 tools (Jira + Confluence) use API authentication
- ✅ Skills: `/triage-issue`, `/search-jira`, `/search-confluence` use your plugin
- ❌ Official OAuth plugin's MCP server is NOT loaded

**When you're in any other directory:**
- ✅ Official OAuth plugin is available (if configured)
- ❌ Your API key plugin is NOT available
- ❌ Local `.mcp.json` is not loaded

## Why Two Separate Names?

- **Plugin name**: `atlassian-api` vs `atlassian` (different plugins)
- **MCP server name**: `atlassian-api-key` vs `atlassian` (different MCP connections)

This prevents conflicts and ensures:
1. No naming collisions
2. Clear distinction between OAuth and API key approaches
3. You can use whichever plugin you want based on directory

## Usage Scenarios

### Scenario 1: Always Use API Key Plugin

**Setup:** Work exclusively in the AtlassianPlugin directory

```bash
cd ~/Scripts/AtlassianPlugin
claude
```

All Atlassian operations will use your API key plugin.

### Scenario 2: Use API Key for Specific Projects

**Setup:** Symlink or copy `.mcp.json` to project directories

```bash
cd ~/my-project
ln -s ~/Scripts/AtlassianPlugin/.mcp.json .mcp.json
claude
```

Now your project uses API key authentication.

### Scenario 3: Use OAuth Everywhere Else

**Setup:** Just use Claude Code normally outside AtlassianPlugin

```bash
cd ~/any-other-directory
claude
```

The official OAuth plugin will be available (requires browser auth).

## Disabling the Official Plugin (Optional)

If you want to **only** use your API key plugin and never use OAuth:

### Option A: Disable Globally

```bash
# List installed plugins
ls ~/.claude/plugins/cache/claude-plugins-official/

# Remove official Atlassian plugin
rm -rf ~/.claude/plugins/cache/claude-plugins-official/atlassian
```

### Option B: Use API Key Plugin Everywhere

Create a global MCP configuration:

```bash
cat > ~/.claude/mcp.json << 'EOF'
{
  "atlassian-api-key": {
    "command": "node",
    "args": ["/Users/timothy.schwarz/Scripts/AtlassianPlugin/mcp-server/index.js"],
    "env": {
      "JIRA_URL": "https://qurate.atlassian.net",
      "JIRA_EMAIL": "timothy.schwarz@qvc.com",
      "JIRA_API_TOKEN": "your-token-here"
    }
  }
}
EOF
```

⚠️ **Warning**: This exposes your API token globally. Only do this if you understand the security implications.

## Checking Which Plugin Is Active

When you start Claude Code, you can verify which plugin is loaded:

```bash
cd ~/Scripts/AtlassianPlugin
claude
```

Then ask:
```
"What Atlassian tools do you have available?"
```

Look for:
- Tool names starting with `atlassian-api-key__` → Your plugin
- Tool names starting with `atlassian__` → OAuth plugin
- Skills `/triage-issue`, `/search-jira`, `/search-confluence` → Your plugin

## Tool Name Prefixes

MCP tools are prefixed with their server name:

**Your API Key Plugin:**
- `atlassian-api-key__search_jira_issues`
- `atlassian-api-key__search_confluence`
- `atlassian-api-key__get_my_issues`
- etc.

**Official OAuth Plugin:**
- `atlassian__searchJiraIssues`
- `atlassian__searchConfluence`
- etc.

Claude automatically uses the right tools based on context.

## Best Practice Recommendations

### For Development Work

✅ **Recommended**: Use API key plugin
- Always works (no browser auth needed)
- Faster (no OAuth flow)
- Works in scripts and automation
- Better for CI/CD integration

**Setup:**
```bash
cd ~/Scripts/AtlassianPlugin
# Work here or symlink .mcp.json to your projects
```

### For Ad-hoc Exploration

✅ **Either works**: API key or OAuth
- API key is faster if already configured
- OAuth is easier if you don't have API token yet

### For Team Sharing

⚠️ **OAuth** might be better:
- No API tokens to share
- Each team member uses their own credentials
- Better audit trail

## Troubleshooting

### "I'm getting OAuth prompts but I want API key"

**Cause**: You're not in the AtlassianPlugin directory
**Fix**: `cd ~/Scripts/AtlassianPlugin` before starting Claude

### "No Atlassian tools available"

**Cause**: Neither plugin is loaded
**Fix**:
- Check you're in AtlassianPlugin directory for API key plugin
- Or check OAuth plugin is installed for global usage

### "Wrong plugin is being used"

**Cause**: MCP server name conflict
**Fix**: Already fixed! Your plugin uses `atlassian-api-key` (unique name)

### "How do I know which plugin I'm using?"

**Check**:
1. Ask Claude: "What Atlassian MCP server is loaded?"
2. Tool names will show the prefix
3. Local `.mcp.json` in current directory = API key plugin

## Security Considerations

### API Key Plugin (Your Custom Plugin)
- ✅ API token stored in `.mcp.json`
- ✅ Protected by `.gitignore`
- ⚠️ Anyone with access to the file has your credentials
- ⚠️ Token doesn't expire automatically

### OAuth Plugin (Official)
- ✅ Browser-based authentication
- ✅ Token managed by Atlassian
- ✅ Better for SSO environments
- ⚠️ Requires periodic re-authentication

## Summary

| Feature | Your Location | Plugin Used | Auth Type |
|---------|--------------|-------------|-----------|
| In AtlassianPlugin dir | `~/Scripts/AtlassianPlugin/` | API key plugin | API token |
| Other directories | Anywhere else | OAuth plugin | Browser OAuth |
| Tool prefix | | `atlassian-api-key__*` | `atlassian__*` |
| Skills available | In plugin dir | ✅ Yes | ❌ No |
| Configuration | | `.mcp.json` (local) | Cloud config |

**Recommendation**: Use the API key plugin in the AtlassianPlugin directory for consistent, fast, offline-capable access to Jira and Confluence!
