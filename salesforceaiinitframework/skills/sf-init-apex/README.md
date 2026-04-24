# sf-init-apex

> Analyze existing Apex code and create a "snapshot" of how THIS project writes Apex.

## What It Analyzes

- Class types and distribution (Controllers, Services, Selectors, etc.)
- Trigger framework usage
- Naming conventions (observed, not prescribed)
- Controller patterns (error handling, return types)
- Service patterns (static vs instance, query approach)
- Selector patterns (security, structure)
- Async patterns (Batch, Queueable, @future)
- Exception handling approach
- Security patterns (sharing, FLS, query security)
- Testing patterns (naming, setup, assertions)

## Output

- **Creates:** `apex.md` (platform-specific location)
- **Updates:** `INDEX.md` with apex.md reference

See [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific paths.

**Philosophy:** This is ANALYSIS, not prescription. We document what IS, not what SHOULD BE.

## How to Run

### Basic Usage

```
Use skill: sf-init-apex
```

### With Focus

```
Use skill: sf-init-apex
Focus: Analyze only Service and Selector classes
```

### Specific Directory

```
Use skill: sf-init-apex
Path: force-app/main/default/classes/services/
```

## Example Prompts

| Goal | Prompt |
|------|--------|
| Full analysis | `Analyze Apex code structure using sf-init-apex` |
| Class inventory | `Use sf-init-apex to count and categorize all Apex classes` |
| Naming conventions | `Extract naming conventions from existing Apex code` |
| Patterns only | `Document Controller and Service patterns with sf-init-apex` |
| Async focus | `Analyze Batch and Queueable patterns in the project` |
| Update | `Refresh apex.md - we added new service classes` |

## Prerequisites

| Source | Required |
|--------|----------|
| Apex classes | `force-app/**/classes/**/*.cls` |
| Triggers | `force-app/**/triggers/*.trigger` |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `sf-init-architecture` | Run BEFORE to understand overall structure |
| `sf-init-data-model` | Run BEFORE to understand objects |
| `sf-init-testing` | Run AFTER for test patterns |
| `sf-init-lwc` | Run alongside for full stack |

## References

- [NAMING_CONVENTIONS.md](references/NAMING_CONVENTIONS.md) - Patterns to detect in naming
- [ANALYSIS_CHECKLIST.md](references/ANALYSIS_CHECKLIST.md) - Aspects to analyze

## What It Extracts

### Class Types

| Type | Search Pattern |
|------|---------------|
| Controllers | `*Controller.cls` |
| Services | `*Service.cls` |
| Selectors | `*Selector.cls` |
| Helpers | `*Helper.cls` |
| Utils | `*Util.cls`, `*Utils.cls` |
| Handlers | `*Handler.cls`, `*TriggerHandler.cls` |
| Batches | `*Batch.cls` |
| Queueables | `*Queueable.cls` |
| DTOs | `*DTO.cls`, `*Wrapper.cls` |

### Patterns Documented

| Pattern | What's Documented |
|---------|------------------|
| Controller | Error handling, return types, service calls |
| Service | Static vs instance, query approach, DML |
| Selector | Security, structure, one per object? |
| Async | Which approach, error handling, state |
| Exception | Custom classes, propagation, logging |

## Output Features

- Class inventory with counts
- Real code examples from the project
- Naming convention tables (extracted, not assumed)
- Security patterns observed
- Trigger framework documentation

## Notes

- **Extract, don't prescribe** — document what IS
- **Real examples only** — every code block from actual project
- **Observe patterns** — if team uses `test_` prefix, document that
- **Note gaps** — if no selectors exist, note it neutrally
