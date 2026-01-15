# Contributing to Atlassian API Plugin

First off, thank you for considering contributing to the Atlassian API Plugin! It's people like you that make this tool better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this code.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
## Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Run command '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 14.0]
- Node.js version: [e.g., 18.17.0]
- Claude Code version: [e.g., 1.0.0]
- Plugin version: [e.g., 1.0.0]

## Additional Context
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Clear title** - Summarize the enhancement in the title
- **Detailed description** - Explain the enhancement and why it would be useful
- **Use cases** - Provide specific examples of how this would be used
- **Alternatives** - Describe any alternative solutions you've considered

### Pull Requests

**Before submitting a pull request:**

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `cd mcp-server && npm install`
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Write clear commit messages**

**Pull Request Process:**

1. Update the README.md with details of changes if applicable
2. Update any relevant documentation
3. The PR will be merged once you have the sign-off of a maintainer

**Pull Request Template:**
```markdown
## Description
What does this PR do?

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
How has this been tested?

- [ ] Tested with Jira API
- [ ] Tested with Confluence API
- [ ] Tested with example configuration
- [ ] All existing tests pass

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published
```

## Development Setup

### Prerequisites

- Node.js v18 or higher
- Git
- Claude Code CLI
- Atlassian Cloud account with API token

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/atlassian-api-plugin.git
cd atlassian-api-plugin

# Install dependencies
cd mcp-server
npm install
cd ..

# Create your configuration
cp .mcp.json.example .mcp.json
# Edit .mcp.json with your credentials

# Test the plugin
./test-plugin.sh
```

### Project Structure

```
atlassian-api-plugin/
├── .claude-plugin/          # Plugin metadata
├── mcp-server/              # MCP server implementation
│   ├── index.js            # Main server code
│   └── package.json        # Node.js dependencies
├── skills/                  # Claude Code skills
│   ├── triage-issue/       # Bug triage skill
│   ├── search-jira/        # Jira search skill
│   └── search-confluence/  # Confluence search skill
├── docs/                    # Additional documentation
├── install.sh              # Installation script
├── test-plugin.sh          # Testing script
└── README.md               # Main documentation
```

## Coding Standards

### JavaScript Style Guide

We follow standard JavaScript best practices:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Use them
- **Naming**: camelCase for variables and functions
- **Comments**: Use JSDoc for functions

**Example:**
```javascript
/**
 * Search Jira issues using JQL
 * @param {string} jql - The JQL query string
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Object>} Search results
 */
async function searchIssues(jql, maxResults = 50) {
  const data = await jiraApi('search', 'POST', {
    jql,
    maxResults
  });

  return data;
}
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(confluence): add page creation support

Added support for creating new Confluence pages with parent page linking.

Closes #123
```

```
fix(jira): handle null priority field

Fixed crash when issue has no priority set by adding null check.

Fixes #456
```

## Testing

### Manual Testing

```bash
# Test the MCP server directly
cd mcp-server
JIRA_URL="https://test.atlassian.net" \
JIRA_EMAIL="test@example.com" \
JIRA_API_TOKEN="test-token" \
node index.js <<< '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
```

### Integration Testing

```bash
# Use the test script
./test-plugin.sh
```

## Adding New Features

### Adding a New MCP Tool

1. **Define the tool** in `mcp-server/index.js` in the `ListToolsRequestSchema` handler
2. **Implement the handler** in the `CallToolRequestSchema` handler
3. **Test the tool** with real API calls
4. **Document the tool** in README.md
5. **Add examples** in relevant skills

### Adding a New Skill

1. **Create skill directory**: `skills/your-skill-name/`
2. **Create SKILL.md** with frontmatter:
```markdown
---
name: your-skill-name
description: "What this skill does"
---

# Your Skill Name

[Content here]
```
3. **Document usage** with examples and workflows
4. **Update README.md** to list the new skill

## Documentation

- Keep README.md up to date with new features
- Document all new MCP tools and skills
- Include examples for complex features
- Update CHANGELOG.md for each release

## Questions?

Feel free to open an issue with your question, or reach out to the maintainers:

- Timothy Schwarz - timothy.schwarz@qvc.com
- GitHub Issues: https://github.com/schwarztim/atlassian-api-plugin/issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
