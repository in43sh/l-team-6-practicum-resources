---
description: Review a team PR by number or URL
argument-hint: <pr-number-or-url>
---

Review PR $ARGUMENTS.

1. Fetch with `gh pr view $ARGUMENTS` and `gh pr diff $ARGUMENTS`. Read the linked issue if there is one.
2. Check the diff for: correctness, scope creep, security, test coverage, readability, consistency with existing patterns, performance, and breaking changes.
3. Output:

   **PR — title** (@author) — one-sentence summary.

   **Blocking:** `file:line` — issue
   **Suggestions:** `file:line` — issue
   **Nits:** `file:line` — issue
   **Verdict:** approve / request changes / needs discussion

Rules: cite `file:line` for every finding. Don't invent problems. Don't post to GitHub unless asked. Say so if you can't verify something.
