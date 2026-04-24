# sf-init-data-model

> Analyze Salesforce data model and document objects, fields, relationships, and automation.

## What It Analyzes

- Custom and standard objects in use
- Field definitions and data types
- Relationships (Lookup, Master-Detail, Junction)
- Record types and their use cases
- Validation rules
- Formula and rollup summary fields
- Triggers and automation on objects
- Namespace handling for managed packages

## Output

- **Creates:** `data-model.md` (platform-specific location)
- **Updates:** `INDEX.md` with data-model.md reference

See [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific paths.

## How to Run

### Basic Usage (from project metadata)

```
Use skill: sf-init-data-model
```

### From Org

```
Use skill: sf-init-data-model
Source: org
Target-org: my-sandbox
```

### With Focus

```
Use skill: sf-init-data-model
Focus: Only custom objects with namespace tr_wc1__
```

### From Documentation

```
Use skill: sf-init-data-model

Sources:
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/123/Data+Model
- ERD: https://lucidchart.com/documents/xxx
```

## Example Prompts

| Goal | Prompt |
|------|--------|
| From metadata | `Analyze data model from force-app/main/default/objects/` |
| From org | `Use sf-init-data-model to retrieve and document objects from my-sandbox` |
| Specific objects | `Document only KYC_Screening_Case__c and related objects` |
| With ERD | `Create data-model.md with entity relationship diagram` |
| Update | `Refresh data-model.md - we added new fields to Account` |

## Prerequisites

| Source | Required |
|--------|----------|
| Local metadata | `force-app/**/objects/` directory |
| Org retrieval | Authenticated sf CLI (`sf org login`) |
| Documentation | MCP or WebFetch for URLs |
| Schema Builder | MCP: `chrome-devtools` for screenshots |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `sf-init-context` | Run BEFORE to understand project purpose |
| `sf-init-business` | Run BEFORE to understand domain terminology |
| `sf-init-architecture` | Run AFTER to see how data is accessed |
| `sf-init-apex` | Run AFTER to see how code interacts with data |

## Input Sources

The skill can analyze data from:

1. **Project Metadata** (Preferred)
   - `force-app/**/objects/**/*.object-meta.xml`
   - `force-app/**/objects/**/fields/*.field-meta.xml`

2. **sf CLI**
   - `sf sobject list --sobject-type custom`
   - `sf sobject describe --sobject-name Object__c`

3. **External Documentation**
   - Confluence pages with data model
   - ERD diagrams (Lucidchart, draw.io)
   - Schema Builder screenshots

## Output Features

- ERD diagram in Mermaid format
- Detailed field tables per object
- Relationship summaries
- Validation rules documentation
- Namespace-aware documentation
- Automation summary (triggers, flows)

## Notes

- Focus on business-critical objects first
- Note circular relationships for potential issues
- Flag required fields without validation rules
- Check for field sprawl (objects with 100+ fields)
- Document namespaces for managed packages
