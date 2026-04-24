# sf-init-all

> Meta-skill that runs all analysis skills in sequence to create a complete project snapshot.

## Purpose

Instead of running each skill individually, `sf-init-all` orchestrates the full analysis workflow in the correct order, ensuring dependencies are respected.

## When to Use

- **New project onboarding** — generate complete AI context from scratch
- **Major refactoring** — refresh all documentation after significant changes
- **Team setup** — create consistent context for all team members

## Usage

### Full Analysis

```
User: /sf-init-all
```

### With Platform Target

```
User: /sf-init-all for Cursor
User: /sf-init-all for GitHub Copilot
User: /sf-init-all for all platforms
```

### Selective Analysis

```
User: /sf-init-all --skip lwc,integrations
User: /sf-init-all --only apex,testing,devops
```

## Execution Order

Skills run in dependency order:

```
1. sf-init-context      → project.md (foundation)
2. sf-init-business     → business.md (domain knowledge)
3. sf-init-data-model   → data-model.md (object structure)
4. sf-init-architecture → architecture.md (patterns overview)
5. sf-init-apex         → apex.md (Apex specifics)
6. sf-init-lwc          → lwc.md (frontend patterns)
7. sf-init-testing      → testing.md (test patterns)
8. sf-init-integrations → integrations.md (external APIs)
9. sf-init-security     → security.md (permissions)
10. sf-init-devops      → devops.md (CI/CD)
```

## Output

Creates/updates all files in platform-specific location:

**Cursor:** `.cursor/rules/`  
**Claude Code:** `.claude/rules/`  
**Copilot:** `.github/instructions/`  
**Windsurf:** `.windsurfrules`

```
[platform-rules-dir]/
├── INDEX.md          ← Updated with all files
├── project.md
├── business.md
├── data-model.md
├── architecture.md
├── apex.md
├── lwc.md
├── testing.md
├── integrations.md
├── security.md
└── devops.md
```

## Prerequisites

- Salesforce project with `force-app/` structure
- For full analysis: configured MCP servers (Salesforce, Chrome DevTools)
- For minimal analysis: just local code files

## Time Estimate

| Project Size | Approximate Time |
|--------------|------------------|
| Small (< 50 classes) | 5-10 minutes |
| Medium (50-200 classes) | 10-20 minutes |
| Large (> 200 classes) | 20-40 minutes |

## See Also

- Individual skill READMEs for detailed options
- [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific output
