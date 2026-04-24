# sf-init-context

> Extract project context from external sources and create the foundational `project.md` documentation.

## What It Analyzes

- Project name, purpose, and problem statement
- Business goals and objectives
- Key stakeholders and their responsibilities
- Target users and personas
- Technical and business constraints
- Success criteria and timelines
- Key integrations with external systems

## Output

- **Creates:** `project.md` (platform-specific location)
- **Creates:** `INDEX.md` (if not exists)
- **Updates:** `INDEX.md` with project.md reference

See [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific paths.

This is typically the **first skill to run** when initializing a new project.

## How to Run

### Basic Usage

```
Use skill: sf-init-context
```

### With Sources

```
Use skill: sf-init-context

Sources:
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/123/Overview
- Google Docs: https://docs.google.com/document/d/xxx/edit
- Jira Epic: https://company.atlassian.net/browse/PROJ-123
```

### With Focus

```
Use skill: sf-init-context
Focus: Extract only technical constraints and integrations
```

## Example Prompts

| Goal | Prompt |
|------|--------|
| Full extraction | `Use sf-init-context to extract project context from our Confluence documentation` |
| From multiple sources | `Initialize project context from: [URL1], [URL2], [URL3]` |
| Manual input | `Use sf-init-context - I'll paste the project overview manually` |
| Update existing | `Refresh project.md with new information from [URL]` |

## Prerequisites

For automatic extraction, one of:

| Source Type | Required |
|-------------|----------|
| Confluence | MCP: `confluence` connector |
| Web pages | MCP: `chrome-devtools` or `playwright` |
| Public pages | Built-in `WebFetch` tool |
| Manual | No prerequisites (paste content) |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `sf-init-business` | After context, to document HOW the system works |
| `sf-init-data-model` | After context, to document data structure |
| `sf-init-architecture` | After business, to document technical patterns |

## Retrieval Methods

The skill automatically selects the best method:

1. **Confluence MCP** - For Atlassian Confluence pages
2. **Chrome DevTools MCP** - For authenticated web pages
3. **WebFetch** - For public pages
4. **Manual Input** - When MCP not available

## Notes

- This skill creates the `INDEX.md` navigation file if it doesn't exist
- Keep `project.md` under 200 lines for AI context efficiency
- Mark uncertain information with `[?]` or `[TODO: verify]`
- Update when project scope changes
