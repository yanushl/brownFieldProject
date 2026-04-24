# AGENTS.md

> AI agent instructions for the **Salesforce AI Init Framework** — a context engineering framework that creates project snapshots for AI-enabled Salesforce development.

---

## Project Overview

This repository contains **analysis skills** (`sf-init-*`) that examine Salesforce projects and generate context documentation for AI coding tools (Cursor, Claude Code, GitHub Copilot, Windsurf).

**Core philosophy: Analysis, not prescription.**
- Document what IS in the target project, not what SHOULD BE
- Extract patterns FROM existing code, not impose best practices
- Every output should answer: "How does THIS team write code?"

---

## Repository Structure

```
SalesforceAIInitFramework/
├── AGENTS.md                    # This file
├── README.md                    # Human-facing documentation
├── skills/                      # All sf-init-* skills
│   ├── sf-init-all/             # Meta-skill — runs all skills in order
│   ├── sf-init-context/         # Project overview, stakeholders
│   ├── sf-init-business/        # Business processes, glossary
│   ├── sf-init-data-model/      # Objects, fields, relationships
│   ├── sf-init-architecture/    # Trigger frameworks, service layers, Flows
│   ├── sf-init-apex/            # Apex structure, naming, patterns
│   ├── sf-init-lwc/             # LWC components, events, styling
│   ├── sf-init-testing/         # Test patterns, mocking, coverage
│   ├── sf-init-integrations/    # Named Credentials, callouts, Platform Events
│   ├── sf-init-security/        # FLS, CRUD, sharing, permissions
│   ├── sf-init-devops/          # CI/CD, environments, deployment
│   └── sf-init-docs/            # Documentation standards (in progress)
├── artifacts/                   # Ready-to-copy files (not skill-generated)
└── docs/                        # Additional documentation
    └── CROSS_PLATFORM.md        # Multi-platform configuration guide
```

Each skill folder follows this structure:
```
skills/sf-init-{name}/
├── SKILL.md              # Skill definition — the agent follows this
├── README.md             # Usage examples and invocation prompts
└── references/           # Analysis checklists (guide WHAT to look for, NOT copied to output)
```

> `sf-init-docs` currently has only `SKILL.md` — `README.md` is not yet written.

---

## Skill Anatomy

Every `SKILL.md` uses this structure:

```markdown
---
name: sf-init-{name}
description: One-line description of what the skill analyzes and produces.
---

# Title

## Purpose
What this skill does. Restate the analysis-not-prescription principle.

## Output
What file it creates, where, and what platform frontmatter to apply.

## References
Links to files in references/ that guide the analysis.

## Analysis Workflow
Phase-by-phase instructions: what to scan, what to document, how to extract examples.

## Output Template
The exact markdown template the generated file should follow.

## Verification Checklist
A checklist the agent runs after generating output to confirm quality.

## Notes
Key reminders (e.g., "Extract, don't prescribe", "Real examples only").
```

---

## Adding a New Skill

When adding a new `sf-init-*` skill:

1. Create folder `skills/sf-init-{name}/`
2. Write `SKILL.md` following the anatomy above
3. Write `README.md` with invocation examples and prerequisites
4. Add `references/ANALYSIS_CHECKLIST.md` listing what to look for
5. Register the skill in `sf-init-all/SKILL.md` execution order

**Naming convention:** `sf-init-{domain}` — always lowercase, hyphen-separated.

**Do NOT create skills for:**
- Code review or refactoring (out of scope — framework is for analysis only)
- Teaching best practices (prescriptive skills contradict the core philosophy)
- One-off utilities that belong in `artifacts/` instead

---

## Platform Output Formats

Skills generate context documentation in platform-specific locations. User specifies target when invoking.

| Platform | Output Location | Frontmatter |
|----------|----------------|-------------|
| Cursor | `.cursor/rules/` | `globs`, `alwaysApply` |
| Claude Code | `.claude/rules/` | `paths` |
| GitHub Copilot | `.github/instructions/` | `applyTo` |
| Windsurf | `.windsurfrules` | None (single concatenated file) |

**Universal path for skills installation:** `.claude/skills/` — read by Cursor, Copilot, and Claude Code.

When supporting all platforms simultaneously, see `docs/CROSS_PLATFORM.md`.

---

## MCP Servers

Skills can pull richer context using these MCP servers:

| Server | Use case | Config key |
|--------|----------|------------|
| `salesforce` (`@tsmztech/mcp-server-salesforce`) | Query org metadata, describe objects, run SOQL | `SALESFORCE_CONNECTION_TYPE: "Salesforce_CLI"` |
| `chrome-devtools` | Navigate authenticated documentation pages | Pre-configured |
| `confluence` | Pull from Confluence spaces and pages | Requires auth |

**Salesforce MCP setup:**
```bash
sf config set target-org YourOrgAlias --global
```

**Common MCP issues:**
- `EACCES` on npm: `sudo chown -R $(id -u):$(id -g) ~/.npm`
- `NoDefaultEnvError`: run the `sf config set` command above
- Namespace mismatch: use `salesforce_search_objects` to discover actual API names

---

## Key Constraints

- **Never prescribe.** If you catch yourself writing "you should use X pattern" in a skill output, rewrite it as "this project uses X pattern".
- **Real examples only.** Every code block in skill output must be extracted from the target project's actual code.
- **Flat output structure.** One file per skill in the platform rules directory. No nested folders.
- **Modular skills.** Each skill must work independently. A user may run only `sf-init-apex` without running others.
- **Reference files stay local.** Files in `references/` are internal analysis guides — they are never copied to the output project.

---

## Testing a Skill

To test a skill against a real project:

```
Open project: /Users/Artsiom_Sushchenia/WebstormProjects/csr-dev
(World-Check Customer Risk Screener — real Salesforce project used for testing)

Invoke: /sf-init-[skill-name]
Check output in the platform-specific rules directory
```

---

## Continuing Development

Start a new session by reading:

1. `AGENTS.md` — this file
2. `README.md` — full project overview and usage

Then proceed with the task.
