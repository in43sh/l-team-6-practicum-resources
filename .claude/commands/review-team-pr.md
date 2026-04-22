---
description: Review a single team PR by number or URL
argument-hint: <pr-number-or-url>
---

Review pull request: $ARGUMENTS

1. **Fetch** with `gh pr view $ARGUMENTS` and `gh pr diff $ARGUMENTS`. Read the description, linked issue (`gh issue view <n>`), target branch, and CI status. If intent is unclear or the description doesn't match the diff, flag it rather than guessing.

2. **Check the Jira ticket**: Extract the ticket key from the branch name (e.g. `CTD-123` in `feature/CTD-123-some-description`). Run `acli jira --action getIssue --issue <TICKET-KEY>` to fetch the ticket. Read its summary, description, and acceptance criteria. Then verify:
   - Does the PR title/description reference this ticket?
   - Does the diff address what the ticket asks for — no more, no less?
   - Are any acceptance criteria clearly unmet? Flag them as blocking.
   - If no ticket key is found in the branch name, note it and continue.

3. **Read existing reviews and comments** with `gh pr reviews $ARGUMENTS --json author,state,body` and `gh api repos/{owner}/{repo}/pulls/{pr}/comments`. Note what's already been flagged so you don't repeat it — only add new findings.

4. **Read `mvp.md`** for project context. Flag any diff changes that contradict the spec or implement features marked as post-MVP or deferred.

5. **Review the diff** against these criteria. Cite `file:line` for each finding:
   - **Correctness** — logic bugs, off-by-one, unhandled edge cases, race conditions, null/undefined handling.
   - **Scope** — is it focused? Flag unrelated changes sneaked in.
   - **Security** — injection, auth/authz gaps, secrets, unsafe deserialization, XSS, SSRF, unsafe file/path handling, missing input validation at boundaries.
   - **Tests** — are new behaviors actually tested? Do tests exercise the change or just assert tautologies?
   - **Readability** — naming, dead code, over-abstraction, comments explaining "what" instead of "why".
   - **Consistency** — does it follow patterns already in the codebase? Check neighboring files before suggesting a different approach.
   - **Performance** — N+1s, unnecessary re-renders, unbounded loops, sync work that should be async.
   - **Breaking changes / migrations** — API shape changes, DB migrations, config changes needing coordination.

6. **Output**:

   **PR #N — `<title>`** (@author)

   **Summary:** one sentence on what it does.

   **Blocking issues** (must fix before merge):
   - `file:line` — description

   **Suggestions** (non-blocking):
   - `file:line` — description

   **Nits** (optional):
   - `file:line` — description

   **Verdict:** approve / request changes / needs discussion

**Rules:** Don't invent problems — if the PR is clean, say so. Don't post to GitHub, approve, or request changes via `gh` unless I ask. If the PR depends on another open PR, call it out. If you can't verify a claim (e.g., test coverage without running tests), say so.
