# sf-init-business

> Extract business processes, user journeys, and domain terminology to document HOW the system works.

## What It Analyzes

- Core business flows (happy paths)
- User journeys and personas
- Business rules and validation logic
- Edge cases and exception handling
- Domain terminology and glossary
- Workflow triggers and outcomes
- Actor responsibilities

## Output

- **Creates:** `business.md` (platform-specific location)
- **Updates:** `INDEX.md` with business.md reference

See [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific paths.

## How to Run

### Basic Usage

```
Use skill: sf-init-business
```

### With Sources

```
Use skill: sf-init-business

Sources:
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/123/User+Stories
- Jira Filter: https://company.atlassian.net/issues/?filter=12345
- Miro Board: https://miro.com/app/board/xxx
```

### With Focus

```
Use skill: sf-init-business
Focus: Document only the screening workflow and approval process
```

## Example Prompts

| Goal | Prompt |
|------|--------|
| Full extraction | `Use sf-init-business to document all business processes from Confluence` |
| From user stories | `Extract business flows from our Jira user stories` |
| Specific flow | `Document the customer onboarding flow using sf-init-business` |
| Add glossary | `Use sf-init-business to create a domain terminology glossary` |
| Update flows | `Refresh business.md with the new approval workflow` |

## Prerequisites

For automatic extraction:

| Source Type | Required |
|-------------|----------|
| Confluence | MCP: `confluence` connector |
| Jira | MCP: `jira` connector |
| Miro/Figma | MCP: `chrome-devtools` or `playwright` |
| Manual | No prerequisites |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `sf-init-context` | Run BEFORE business to establish project overview |
| `sf-init-data-model` | Run AFTER to understand data structure |
| `sf-init-architecture` | Run AFTER to see how flows are implemented |

## Difference from sf-init-context

| sf-init-context | sf-init-business |
|-----------------|------------------|
| **What** is the project | **How** does it work |
| Goals, stakeholders | Workflows, user journeys |
| High-level overview | Step-by-step processes |
| Static information | Dynamic flows |

## Output Features

- Mermaid diagrams for complex flows
- Business rules tables with enforcement details
- Domain glossary with context-specific definitions
- Edge cases and exception handling

## Notes

- Focus on WHAT happens, not HOW it's implemented technically
- Use Mermaid diagrams for complex flows
- Document "why" behind business rules when known
- Mark uncertain information with `[?]` or `[TODO: verify]`
