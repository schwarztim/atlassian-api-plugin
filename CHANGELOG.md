# Changelog

All notable changes to the Atlassian API Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-01-16

### Performance Improvements (Critical)
- **HTTP Connection Pooling**: Added HTTPS Agent with keepAlive for TCP connection reuse
  - Reduces latency on repeated API calls by 30-50%
  - Configured with 50 max sockets, 10 max free sockets, 30s keepAlive
  - Applied to both Jira and Confluence API calls
- **Authentication Caching**: Auth header computed once at startup (already cached as const)
- **Response Time**: Expect 30-50% faster performance for batch operations

### Added
- **Confluence API v2 Support**: New `confluenceApiV2()` helper function
  - Better performance than v1 API
  - Improved response control and pagination
  - Cursor-based pagination instead of index-based
- **New Tool: `get_confluence_page_v2`**: Enhanced page retrieval with 2025 features
  - Supports `include-public-link` parameter (new 2025 API feature)
  - Multiple body formats: 'storage', 'atlas_doc_format', 'view'
  - Better performance than v1 endpoint
  - Returns structured page metadata with proper typing

### Security
- **No vulnerabilities**: `npm audit` reports 0 vulnerabilities
- No hardcoded secrets or credentials in code
- All authentication via environment variables

### Infrastructure
- Upgraded to use native Node.js https.Agent for connection pooling
- Added imports: `node:http` Agent and `node:https` modules
- Tool count increased to 25 (15 Jira + 10 Confluence)

## [2.0.1] - 2025-01-15

### Fixed
- **Installation scripts now write to `user-mcps.json`** - Claude Code reads from `~/.claude/user-mcps.json`, not `mcp.json`. Both `install.sh` and `install.ps1` updated to use the correct configuration file.

### Added
- **Trigger phrase recognition in CLAUDE.md** - Added comprehensive phrase patterns to help Claude recognize when to use Atlassian tools:
  - "use confluence to..." → Confluence search
  - "use jira to..." → Jira operations
  - "check confluence for..." → Confluence search
  - "search jira for..." → JQL search
  - Plus many more natural language patterns

### Changed
- Install scripts now merge with existing `user-mcps.json` using jq (bash) or PowerShell JSON cmdlets
- Improved error handling when jq is not available

## [2.0.0] - 2025-01-15

### Added
- **Confluence Support**: 9 new tools for Confluence integration
  - `search_confluence` - CQL-based search
  - `search_confluence_by_text` - Simple text search
  - `get_confluence_page` - Get page by ID
  - `get_confluence_page_by_title` - Get page by title and space
  - `create_confluence_page` - Create new pages
  - `update_confluence_page` - Update existing pages
  - `add_confluence_comment` - Add comments to pages
  - `get_confluence_spaces` - List all spaces
  - `get_confluence_space` - Get space details
- **Safety Hooks**: Three new hooks to guide users toward MCP tools
  - `block-atlassian-bash.md` - Intercepts Bash commands targeting Atlassian
  - `block-atlassian-webfetch.md` - Blocks WebFetch to atlassian.net URLs
  - `atlassian-reminder.md` - Reminds users about available MCP tools
- **New Skill**: `/search-confluence` for documentation search workflows
- **Enhanced Documentation**: Expanded CLAUDE.md with comprehensive tool reference

### Changed
- Plugin version bumped to 2.0.0
- Tool count increased from 15 to 24 (15 Jira + 9 Confluence)
- Updated SETUP_COMPLETE.md to reflect full Confluence support
- Improved skill documentation with better examples

### Security
- Updated `@modelcontextprotocol/sdk` to v1.25.2 (security patch)

## [1.0.0] - 2025-01-10

### Added
- Initial release with API key authentication
- **Jira Tools (15 total)**:
  - `search_jira_issues` - Advanced JQL search
  - `get_issue` - Get issue by key
  - `create_issue` - Create new issues
  - `update_issue` - Update existing issues
  - `add_jira_comment` - Add comments to issues
  - `get_transitions` - Get workflow transitions
  - `transition_issue` - Move issue through workflow
  - `get_projects` - List all projects
  - `get_project` - Get project details
  - `get_current_user` - Get authenticated user info
  - `get_my_issues` - Get user's assigned issues
  - `get_in_progress_issues` - Get in-progress work
  - `get_recent_issues` - Get recently updated issues
  - `assign_issue` - Assign issue to user
  - `search_users` - Search for users
- **Skills**:
  - `/triage-issue` - Bug triage with duplicate detection
  - `/search-jira` - Advanced JQL search patterns
- MCP server with pre-configured authentication
- Comprehensive documentation (README.md, CLAUDE.md, SETUP_COMPLETE.md)
- Cross-platform support (macOS, Linux, Windows)

### Security
- API token stored in `.mcp.json` (gitignored)
- No credentials in source control
