# Slack PR Notifications — Free Options

Three paths ranked by friction:

## 1. Slack Workflow Builder webhook (best, no admin needed)

- Slack → Tools → Workflow Builder → New → trigger: "Webhook"
- Define vars matching GitHub payload (e.g. `pr_title`, `pr_url`, `author`)
- Add step: "Send message to channel"
- Get webhook URL
- GitHub repo → Settings → Webhooks → add URL, content-type `application/json`, events: Pull requests, PR reviews

**Catch:** Slack workflow webhook expects flat JSON with declared keys. GitHub payload is nested → may need transform.

## 2. GitHub Actions → Slack webhook (most flexible)

- Workflow `.github/workflows/slack-pr.yml` on `pull_request` events
- Use action like `slackapi/slack-github-action` or plain `curl` to webhook URL
- Lets you format message however you want, picks fields out of `${{ github.event.pull_request }}`
- Still needs Slack webhook URL (from path 1 or installed Incoming Webhooks app)

## 3. Official GitHub Slack app (slack.github.com)

Free, but install requires Slack workspace admin approval. Likely blocked.

## Constraint check

- Workspace admin approval needed for ANY new app install
- Workflow Builder = built-in, no install, no admin → usually open to all members
- If Workflow Builder disabled → blocked, fall back to personal Slack workspace + cross-post manually

## Recommend

Path 1 + 2 combo. Workflow Builder gives webhook URL. GitHub Action posts to it with custom formatting. No paid features, no admin approval beyond Workflow Builder access.

**Verify first:** open Slack, check if "Workflow Builder" appears under Tools menu. If yes → green light.
