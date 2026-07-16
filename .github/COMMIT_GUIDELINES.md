# Commit guidelines

- Every commit must read as the work of a single human author.
- No AI/tool attribution anywhere in commit messages or PR text — no "Co-Authored-By: Claude", no "Generated with ...", no mentions of Claude, Anthropic, ChatGPT, Copilot, or any other AI assistant.
- Commit messages must be short: one line, or up to two lines only if genuinely needed. No bullet lists, no long bodies.
- Push work in small, feature-sized chunks rather than one large dump.

A local `commit-msg` hook (`.githooks/commit-msg`) rejects commits that violate the attribution rule. It's enabled per-clone via:

```
git config core.hooksPath .githooks
```
