# sf-init-lwc

> Analyze Lightning Web Components and create a "snapshot" of how THIS project builds frontend.

## What It Analyzes

- Component inventory and distribution
- File structure patterns (simple vs service layer)
- Data source approach (Wire, Imperative, LDS, GraphQL)
- Communication patterns (@api, Custom Events, LMS)
- Template patterns (lwc:if vs if:true, iteration keys)
- State management (@track, getters, stores)
- Lifecycle hooks usage
- Styling approach (SLDS, custom CSS, variables)
- Error handling patterns
- Testing approach (Jest setup, mocking)

## Output

- **Creates:** `lwc.md` (platform-specific location)
- **Updates:** `INDEX.md` with lwc.md reference

See [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific paths.

**Philosophy:** This is ANALYSIS, not prescription. We document what IS, not what SHOULD BE.

## How to Run

### Basic Usage

```
Use skill: sf-init-lwc
```

### With Focus

```
Use skill: sf-init-lwc
Focus: Analyze only data fetching patterns and error handling
```

### Specific Package

```
Use skill: sf-init-lwc
Path: force-app/main/default/lwc/
```

## Example Prompts

| Goal | Prompt |
|------|--------|
| Full analysis | `Analyze LWC components using sf-init-lwc` |
| Component inventory | `Use sf-init-lwc to list and categorize all components` |
| Data patterns | `Document Wire vs Imperative usage in LWC` |
| Events | `Analyze Custom Event patterns in our LWC` |
| Template syntax | `Check if we use modern lwc:if or deprecated if:true` |
| Update | `Refresh lwc.md - we added new components` |

## Prerequisites

| Source | Required |
|--------|----------|
| LWC components | `**/lwc/*/*.js` |
| Templates | `**/lwc/*/*.html` |
| Styles | `**/lwc/*/*.css` |
| Tests | `**/lwc/*/__tests__/*.test.js` |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `sf-init-apex` | Run alongside for full stack patterns |
| `sf-init-architecture` | Run BEFORE for overall structure |
| `sf-init-testing` | Covers LWC Jest testing too |

## References

- [ANALYSIS_CHECKLIST.md](references/ANALYSIS_CHECKLIST.md) - Complete analysis checklist
- [TEMPLATE_PATTERNS.md](references/TEMPLATE_PATTERNS.md) - Template patterns to detect

## What It Extracts

### Data Sources

| Pattern | Detection |
|---------|-----------|
| Wire Service | `@wire(` decorator |
| Imperative Apex | `import...from '@salesforce/apex/'` |
| LDS | `import { getRecord }` |
| GraphQL | `lightning/uiGraphQLApi` |

### Communication

| Pattern | Detection |
|---------|-----------|
| @api | `@api` decorator |
| Custom Events | `new CustomEvent(` |
| LMS | `lightning/messageService` |

### Template Syntax

| Modern | Deprecated |
|--------|------------|
| `lwc:if` | `if:true` |
| `lwc:elseif` | `if:false` |
| `lwc:else` | — |

### Anti-Patterns Detected

- Inline expressions in templates
- Missing keys in for:each
- Method calls in templates
- Inline event arguments

## Output Features

- Component inventory with counts
- Real code examples from project
- Data source distribution
- Event naming conventions (observed)
- Template syntax style identification
- Lifecycle hook usage
- Styling approach documentation

## Notes

- **Extract, don't prescribe** — document what IS
- **Real examples only** — every code block from actual project
- **Observe patterns** — if team uses `if:true`, document that
- **Note gaps** — if no tests exist, note it neutrally
- **Focus on consistency** — note if patterns are mixed
