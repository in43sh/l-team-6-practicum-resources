---
description: Review a single team PR by number or URL
argument-hint: <pr-number-or-url>
---

Review pull request: $ARGUMENTS

## Steps

1. **Fetch metadata** with `gh pr view $ARGUMENTS` and `gh pr diff $ARGUMENTS`. Note author, title, description, linked issue, target branch, and CI status. If the PR references an issue, read that too (`gh issue view <n>`).

2. **Understand the intent.** Read the description and linked issue. If intent is unclear or the description doesn't match the diff, flag it rather than guessing.

3. **Review the diff** against these criteria. For each finding, cite `file:line`:
   - **Correctness** — logic bugs, off-by-one, unhandled edge cases, race conditions, null/undefined handling.
   - **Scope** — is it focused? Flag unrelated changes sneaked in.
   - **Security** — injection, auth/authz gaps, secrets, unsafe deserialization, XSS, SSRF, unsafe file/path handling, missing input validation at boundaries.
   - **Tests** — are new behaviors actually tested? Do tests exercise the change or just assert tautologies?
   - **Readability** — naming, dead code, over-abstraction, comments explaining "what" instead of "why".
   - **Consistency** — does it follow patterns already in the codebase? Check neighboring files before suggesting a different approach.
   - **Performance** — N+1s, unnecessary re-renders, unbounded loops, sync work that should be async.
   - **Breaking changes / migrations** — API shape changes, DB migrations, config changes needing coordination.

4. **Output in this format**:

   **PR #N — `<title>`** (@author)

   **Summary:** one sentence on what it does.

   **Blocking issues** (must fix before merge):
   - `file:line` — description

   **Suggestions** (non-blocking):
   - `file:line` — description

   **Nits** (optional style/wording):
   - `file:line` — description

   **Verdict:** approve / request changes / needs discussion

## Rules

- Cite exact `file:line` for every concrete finding. No hand-waving.
- Don't invent problems to seem thorough — if the PR is clean, say so.
- Do NOT post comments to GitHub, approve, or request changes via `gh` unless I explicitly ask. Review output stays local.
- If the PR depends on another open PR or unmerged branch, call that out.
- If you can't verify a claim (e.g., test coverage without running tests), say so instead of asserting it.
