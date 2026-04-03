# GitHub Rulesets

These JSON files are importable GitHub branch rulesets for a small student team using this flow:

- `feature/*` -> `development`
- `development` -> `main`

They are intentionally lightweight for a 10-week practicum or hackathon-style project.

## Files

- `dev-branch-protection.json` applies to `development`
- `main-branch-protection.json` applies to `main`

## What They Enforce

Both rulesets do the same thing on different branches:

- Prevent branch deletion
- Prevent force-pushes
- Require linear history
- Require pull requests before merging
- Require 1 approving review
- Dismiss approvals when new commits are pushed
- Require review threads to be resolved
- Allow only squash merges

They do not require:

- CI status checks
- CODEOWNERS approval
- signed commits
- approval from someone other than the last pusher

That is intentional. The goal is to protect the important branches without adding too much process for a short student project.

## How To Import

In the GitHub repository:

1. Go to `Settings` -> `Rules` -> `Rulesets`
2. Create a new branch ruleset, or use the import option if GitHub shows it in your UI
3. Import or recreate the matching JSON file
4. Save the ruleset as `Active`
5. Repeat for the other branch

## Before You Import

Check these first so the rulesets match the repo's workflow:

1. Go to `Settings` -> `General`
2. In merge options, enable `Allow squash merging`
3. If you want a cleaner history, disable merge commits
4. Confirm `development` is the default working branch for the team
5. Check for older branch protection rules or overlapping rulesets on `main` and `development`
6. Add a mentor or admin bypass actor in GitHub if you want an emergency path for stuck PRs
7. If the repo has no CI yet, leave status checks out for now

## Recommended Team Workflow

- Open feature PRs into `development`
- Merge with squash after 1 teammate approval
- When `development` is stable, open a release PR into `main`
- Do not commit directly to `development` or `main`

## Notes

- These files do nothing until they are imported into GitHub
- Admins may still be able to bypass rules depending on repo settings and bypass lists
- If the team later adds CI, the next upgrade is to require 1-2 status checks on `main`
