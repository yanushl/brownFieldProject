# sf-init-architecture

> Analyze project architecture and document trigger frameworks, service layers, folder structure, and patterns.

## What It Analyzes

- Trigger framework pattern (TAF, custom handler, none)
- Service layer architecture (Controller → Service → Selector)
- Folder structure organization
- Naming conventions used
- DML and FLS management approach
- Framework usage (fflib, Nebula Logger, AT4DX)
- Salesforce Flows architecture
- Guard clause patterns

## Output

- **Creates:** `architecture.md` (platform-specific location)
- **Updates:** `INDEX.md` with architecture.md reference

See [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific paths.

## How to Run

### Basic Usage

```
Use skill: sf-init-architecture
```

### With Focus

```
Use skill: sf-init-architecture
Focus: Analyze only trigger framework and service layer
```

### Specific Package

```
Use skill: sf-init-architecture
Package: force-app/main/default/
```

## Example Prompts

| Goal | Prompt |
|------|--------|
| Full analysis | `Analyze project architecture using sf-init-architecture` |
| Triggers only | `Use sf-init-architecture to document trigger framework` |
| Service layer | `Document service layer pattern with sf-init-architecture` |
| Flows | `Analyze Flow patterns and naming conventions` |
| With anti-patterns | `Analyze architecture and note any anti-patterns found` |
| Update | `Refresh architecture.md - we added new selectors` |

## Prerequisites

| Source | Required |
|--------|----------|
| Apex code | `force-app/**/classes/**/*.cls` |
| Triggers | `force-app/**/triggers/*.trigger` |
| Flows | `force-app/**/flows/*.flow-meta.xml` |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `sf-init-data-model` | Run BEFORE to understand objects |
| `sf-init-apex` | Run AFTER to document code patterns |
| `sf-init-lwc` | Run AFTER for frontend patterns |
| `sf-init-testing` | Run AFTER for test patterns |

## What It Detects

### Trigger Frameworks

| Framework | Detection Pattern |
|-----------|------------------|
| TAF | `TriggerAction`, `MetadataTriggerHandler` |
| fflib | `fflib_SObject`, `UnitOfWork` |
| Custom Handler | `*TriggerHandler` base class |
| No Framework | Logic directly in `.trigger` files |

### Service Layer Patterns

| Layer | Purpose | Naming |
|-------|---------|--------|
| Controller | @AuraEnabled entry points | `*Controller` |
| Service | Business logic | `*Service` |
| Selector | SOQL queries | `*Selector` |
| Domain | Object-specific logic | `*Helper`, `*Domain` |

### Anti-Patterns Detected

- SOQL in loops
- DML in loops  
- Missing sharing declarations
- Empty catch blocks
- Hardcoded IDs

## References

- [FLOW_BEST_PRACTICES.md](references/FLOW_BEST_PRACTICES.md) - Flow naming and patterns

## Output Features

- Layer architecture diagrams
- Naming convention tables
- Real code examples from project
- Anti-pattern warnings
- Framework-specific documentation

## Notes

- All examples in output should be from the ACTUAL project
- Document what IS, not what SHOULD BE
- Note inconsistencies if naming conventions vary
- Include Flow architecture if Flows are used
