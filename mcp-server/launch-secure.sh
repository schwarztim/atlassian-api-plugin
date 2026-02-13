#!/bin/bash
# Secure launcher: reads API token from macOS Keychain at runtime
# Token is NEVER stored in config files

export JIRA_URL="https://qurate.atlassian.net"
export JIRA_EMAIL="timothy.schwarz@qvc.com"
export JIRA_API_TOKEN="$(security find-generic-password -s "atlassian-api-key" -a "timothy.schwarz@qvc.com" -w 2>/dev/null)"

if [ -z "$JIRA_API_TOKEN" ]; then
  echo "ERROR: Could not retrieve Atlassian API token from Keychain" >&2
  echo "Run: security add-generic-password -s 'atlassian-api-key' -a 'timothy.schwarz@qvc.com' -w 'YOUR_TOKEN'" >&2
  exit 1
fi

exec node "$(dirname "$0")/index.js"
