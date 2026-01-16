# Atlassian API Plugin Installer for Windows
# Professional installation script for Claude Code plugin

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║  Atlassian API Plugin for Claude Code     ║" -ForegroundColor Blue
    Write-Host "║  Installation Script (Windows)             ║" -ForegroundColor Blue
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Write-Step {
    param($Message)
    Write-Host "▶ $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Check if command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Main installation
function Install-Plugin {
    Write-Header

    # Step 1: Check Node.js
    Write-Step "Checking Node.js installation..."
    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed"
        Write-Host "Please install Node.js v18 or higher from https://nodejs.org/"
        exit 1
    }

    $nodeVersion = (node --version) -replace 'v', ''
    $nodeMajor = [int]($nodeVersion -split '\.')[0]
    if ($nodeMajor -lt 18) {
        Write-Error "Node.js version must be 18 or higher (found: v$nodeVersion)"
        exit 1
    }
    Write-Success "Node.js v$nodeVersion detected"

    # Step 2: Install dependencies
    Write-Step "Installing dependencies..."
    Push-Location mcp-server
    try {
        npm install --silent 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependencies installed"
        }
        else {
            Write-Error "Failed to install dependencies"
            exit 1
        }
    }
    finally {
        Pop-Location
    }

    # Step 3: Check for existing global configuration
    # IMPORTANT: Claude Code reads from user-mcps.json, NOT mcp.json
    $userMcpsConfig = Join-Path $env:USERPROFILE ".claude\user-mcps.json"
    $pluginDir = Split-Path -Parent $PSCommandPath

    if ((Test-Path $userMcpsConfig) -and (Select-String -Path $userMcpsConfig -Pattern "atlassian-api-key" -Quiet)) {
        Write-Warning "Atlassian plugin already configured globally"
        $reply = Read-Host "Do you want to reconfigure? (y/N)"
        if ($reply -ne 'y' -and $reply -ne 'Y') {
            Write-Step "Skipping configuration"
            Write-Success "Installation complete - plugin already configured"
            exit 0
        }
    }

    # Step 4: Create global configuration
    Write-Step "Creating configuration..."
    Write-Host ""
    Write-Host "You'll need:" -ForegroundColor Yellow
    Write-Host "  1. Your Atlassian domain (e.g., company.atlassian.net)"
    Write-Host "  2. Your Atlassian email"
    Write-Host "  3. An API token from: https://id.atlassian.com/manage-profile/security/api-tokens"
    Write-Host ""

    # Get Atlassian URL
    $jiraDomain = Read-Host "Enter your Atlassian domain (without https://)"
    $jiraUrl = "https://$jiraDomain"

    # Get email
    $jiraEmail = Read-Host "Enter your Atlassian email"

    # Get API token
    Write-Host ""
    Write-Host "Please create an API token:" -ForegroundColor Yellow
    Write-Host "  1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens"
    Write-Host "  2. Click 'Create API token'"
    Write-Host "  3. Give it a name (e.g., 'Claude Code')"
    Write-Host "  4. Copy the generated token"
    Write-Host ""
    $jiraApiToken = Read-Host "Paste your API token" -AsSecureString
    $jiraApiTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($jiraApiToken)
    )

    # Ensure global config directory exists
    $configDir = Split-Path -Parent $userMcpsConfig
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }

    # Use forward slashes for cross-platform compatibility
    $mcpServerPath = (Join-Path $pluginDir "mcp-server" | Join-Path -ChildPath "index.js") -replace '\\', '/'

    # Create or update user-mcps.json (the file Claude Code actually reads)
    if ((Test-Path $userMcpsConfig) -and ((Get-Item $userMcpsConfig).Length -gt 0)) {
        # Merge with existing config
        $existingConfig = Get-Content $userMcpsConfig -Raw | ConvertFrom-Json

        # Ensure mcpServers exists
        if (-not $existingConfig.mcpServers) {
            $existingConfig | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue ([PSCustomObject]@{})
        }

        # Add or update atlassian-api-key
        $atlassianConfig = [PSCustomObject][ordered]@{
            "command" = "node"
            "args"    = @($mcpServerPath)
            "env"     = [PSCustomObject][ordered]@{
                "JIRA_URL"       = $jiraUrl
                "JIRA_EMAIL"     = $jiraEmail
                "JIRA_API_TOKEN" = $jiraApiTokenPlain
            }
        }

        if ($existingConfig.mcpServers.PSObject.Properties["atlassian-api-key"]) {
            $existingConfig.mcpServers."atlassian-api-key" = $atlassianConfig
        } else {
            $existingConfig.mcpServers | Add-Member -NotePropertyName "atlassian-api-key" -NotePropertyValue $atlassianConfig
        }

        $existingConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $userMcpsConfig -Encoding UTF8
        Write-Success "Added Atlassian to existing user-mcps.json"
    }
    else {
        # Create new user-mcps.json with proper structure
        $config = [ordered]@{
            "mcpServers" = [ordered]@{
                "atlassian-api-key" = [ordered]@{
                    "command" = "node"
                    "args"    = @($mcpServerPath)
                    "env"     = [ordered]@{
                        "JIRA_URL"       = $jiraUrl
                        "JIRA_EMAIL"     = $jiraEmail
                        "JIRA_API_TOKEN" = $jiraApiTokenPlain
                    }
                }
            }
        } | ConvertTo-Json -Depth 10

        $config | Out-File -FilePath $userMcpsConfig -Encoding UTF8
        Write-Success "Created ~/.claude/user-mcps.json"
    }
    Write-Success "Atlassian tools will be available in ALL directories"

    # Step 5: Test connection
    Write-Step "Testing Atlassian API connection..."
    if (Test-Path ".\test-plugin.ps1") {
        try {
            & ".\test-plugin.ps1" | Out-Null
            Write-Success "Connection test passed"
        }
        catch {
            Write-Warning "Connection test failed - please check your credentials"
            Write-Host "You can test manually with: .\test-plugin.ps1"
        }
    }

    # Step 6: Success message
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  Installation Complete! 🎉                 ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "✓ Atlassian tools are now available GLOBALLY" -ForegroundColor Green
    Write-Host "  You can use them from any directory!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Restart Claude Code (or start from any directory):"
    Write-Host "     claude" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  2. Try some commands from anywhere:"
    Write-Host '     "Show me my Jira issues"' -ForegroundColor Blue
    Write-Host '     "Search Confluence for documentation"' -ForegroundColor Blue
    Write-Host "     /search-jira my high priority bugs" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Configuration: ~/.claude/user-mcps.json"
    Write-Host "Documentation: README.md"
    Write-Host ""
}

# Run main installation
Install-Plugin
