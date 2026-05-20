#!/usr/bin/env bash
set -euo pipefail

# Posts or updates a PR comment with the generated llms.txt preview.
# Called by the preview-llms workflow after generate-llms.mjs has run.
#
# Required env vars (set by the workflow):
#   GH_TOKEN   - GitHub token for API access
#   PR_NUMBER  - Pull request number
#   REPO       - owner/repo string
#   RUN_ID     - Workflow run ID (for artifact link)

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${PR_NUMBER:?PR_NUMBER is required}"
: "${REPO:?REPO is required}"
: "${RUN_ID:?RUN_ID is required}"

MARKER='<!-- llms-txt-preview -->'
COMMENT_FILE=$(mktemp)
trap 'rm -f "$COMMENT_FILE"' EXIT

{
  echo "$MARKER"
  echo '### Generated `llms.txt` preview'
  echo ''
  echo '<details open>'
  echo '<summary><code>llms.txt</code></summary>'
  echo ''
  echo '```markdown'
  cat llms.txt
  echo '```'
  echo ''
  echo '</details>'
  echo ''
  echo '<details>'
  echo '<summary><code>llms-full.txt</code> header</summary>'
  echo ''
  echo '```'
  head -3 llms-full.txt
  echo '```'
  echo ''
  echo '</details>'
  echo ''
  echo "> [Download full files](https://github.com/${REPO}/actions/runs/${RUN_ID}) from workflow artifacts, or run \`node scripts/generate-llms.mjs\` locally."
} > "$COMMENT_FILE"

COMMENT_ID=$(gh api "repos/${REPO}/issues/${PR_NUMBER}/comments" \
  --jq ".[] | select(.body | contains(\"${MARKER}\")) | .id" \
  | head -1)

if [ -n "$COMMENT_ID" ]; then
  jq -Rs '{body: .}' "$COMMENT_FILE" | \
    gh api "repos/${REPO}/issues/comments/${COMMENT_ID}" -X PATCH --input -
else
  gh pr comment "$PR_NUMBER" --body-file "$COMMENT_FILE"
fi
