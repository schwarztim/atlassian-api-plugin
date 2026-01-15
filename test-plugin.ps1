# Atlassian API Plugin Test Script for Windows
# Verify the plugin is properly configured and working

$ErrorActionPreference = "Stop"

# Test results
$script:Failed = 0

# Colors
function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║  Atlassian API Plugin Test Suite          ║" -ForegroundColor Blue
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Write-Test {
    param($Message)
    Write-Host "▶ $Message ... " -ForegroundColor Blue -NoNewline
}

function Write-Success {
    param($Message = "✓ PASS")
    Write-Host $Message -ForegroundColor Green
}

function Write-Fail {
    param($Message)
    Write-Host "✗ FAIL" -ForegroundColor Red
    Write-Host "  $Message" -ForegroundColor Red
}

# Test 1: Check files exist
function Test-Files {
    Write-Test "Checking plugin files"

    if (-not (Test-Path ".claude-plugin/plugin.json")) {
        Write-Fail "Missing .claude-plugin/plugin.json"
        return $false
    }

    if (-not (Test-Path ".mcp.json")) {
        Write-Fail "Missing .mcp.json - run .\install.ps1 first"
        return $false
    }

    if (-not (Test-Path "mcp-server/index.js")) {
        Write-Fail "Missing mcp-server/index.js"
        return $false
    }

    if (-not (Test-Path "mcp-server/node_modules")) {
        Write-Fail "Dependencies not installed - run: cd mcp-server; npm install"
        return $false
    }

    Write-Success
    return $true
}

# Test 2: Check configuration
function Test-Config {
    Write-Test "Validating configuration"

    $content = Get-Content ".mcp.json" -Raw
    if (-not ($content -match "atlassian-api-key")) {
        Write-Fail "Invalid .mcp.json format"
        return $false
    }

    if ($content -match "your-domain.atlassian.net") {
        Write-Fail "Configuration not completed - run .\install.ps1"
        return $false
    }

    if ($content -match "your-api-token-here") {
        Write-Fail "API token not configured"
        return $false
    }

    Write-Success
    return $true
}

# Load environment from config
function Get-EnvFromConfig {
    $config = Get-Content ".mcp.json" | ConvertFrom-Json
    $env = $config.'atlassian-api-key'.env

    if (-not $env.JIRA_URL -or -not $env.JIRA_EMAIL -or -not $env.JIRA_API_TOKEN) {
        return $null
    }

    return $env
}

# Test 3: Test MCP server
function Test-McpServer {
    Write-Test "Testing MCP server"

    $envVars = Get-EnvFromConfig
    if (-not $envVars) {
        Write-Fail "Failed to load configuration"
        return $false
    }

    # Set environment variables
    $env:JIRA_URL = $envVars.JIRA_URL
    $env:JIRA_EMAIL = $envVars.JIRA_EMAIL
    $env:JIRA_API_TOKEN = $envVars.JIRA_API_TOKEN

    # Test tools list
    $input = '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
    try {
        $output = $input | node mcp-server/index.js 2>$null | Select-Object -Last 1

        if (-not ($output -match "search_jira_issues")) {
            Write-Fail "MCP server not responding correctly"
            return $false
        }

        if (-not ($output -match "search_confluence")) {
            Write-Fail "Confluence tools not loaded"
            return $false
        }

        Write-Success
        return $true
    }
    catch {
        Write-Fail "MCP server error: $_"
        return $false
    }
}

# Test 4: Test API connection
function Test-ApiConnection {
    Write-Test "Testing Atlassian API connection"

    $envVars = Get-EnvFromConfig
    if (-not $envVars) {
        Write-Fail "Failed to load configuration"
        return $false
    }

    # Simple API test - get current user
    $auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($envVars.JIRA_EMAIL):$($envVars.JIRA_API_TOKEN)"))

    try {
        $response = Invoke-WebRequest -Uri "$($envVars.JIRA_URL)/rest/api/3/myself" `
            -Headers @{
            "Authorization" = "Basic $auth"
            "Accept"        = "application/json"
        } `
            -Method GET `
            -UseBasicParsing `
            -ErrorAction Stop

        if ($response.StatusCode -eq 200) {
            Write-Success
            return $true
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Fail "Authentication failed - check your API token"
        }
        elseif ($statusCode -eq 404) {
            Write-Fail "Invalid Atlassian URL"
        }
        else {
            Write-Fail "Connection failed (HTTP $statusCode)"
        }
        return $false
    }

    return $false
}

# Test 5: Count available tools
function Test-ToolCount {
    Write-Test "Counting available tools"

    $envVars = Get-EnvFromConfig
    if (-not $envVars) {
        Write-Fail "Failed to load configuration"
        return $false
    }

    # Set environment variables
    $env:JIRA_URL = $envVars.JIRA_URL
    $env:JIRA_EMAIL = $envVars.JIRA_EMAIL
    $env:JIRA_API_TOKEN = $envVars.JIRA_API_TOKEN

    $input = '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
    try {
        $output = $input | node mcp-server/index.js 2>$null | Select-Object -Last 1
        $toolCount = ([regex]::Matches($output, '"name":"[^"]*"')).Count

        if ($toolCount -ne 24) {
            Write-Fail "Expected 24 tools, found $toolCount"
            return $false
        }

        Write-Success "✓ PASS (24 tools: 15 Jira + 9 Confluence)"
        return $true
    }
    catch {
        Write-Fail "Tool count error: $_"
        return $false
    }
}

# Main test suite
function Invoke-Tests {
    Write-Header

    if (-not (Test-Files)) { $script:Failed++ }
    if (-not (Test-Config)) { $script:Failed++ }
    if (-not (Test-McpServer)) { $script:Failed++ }
    if (-not (Test-ApiConnection)) { $script:Failed++ }
    if (-not (Test-ToolCount)) { $script:Failed++ }

    Write-Host ""
    if ($script:Failed -eq 0) {
        Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║  All Tests Passed! ✓                       ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your plugin is ready to use!"
        Write-Host "Start Claude Code with: claude"
        exit 0
    }
    else {
        Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Red
        Write-Host "║  $script:Failed Test(s) Failed                          ║" -ForegroundColor Red
        Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please fix the issues above and run .\test-plugin.ps1 again"
        exit 1
    }
}

# Run tests
Invoke-Tests
