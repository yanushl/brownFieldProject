---
name: sf-init-architecture
description: Analyze Salesforce project architecture and generate architecture.md. Documents trigger frameworks, service layers, folder structure, naming conventions, and Flow patterns. Use when setting up AI context for consistent code generation or onboarding new developers.
---

# Architecture Patterns Initializer

## Purpose

Document the architectural patterns and conventions used in the project so AI can generate consistent code.

## Output

Creates `architecture.md` in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/architecture.md` | `globs: ["**/*.cls", "**/*.trigger", "**/*.flow-meta.xml"]`<br>`alwaysApply: false` |
| **Claude Code** | `.claude/rules/architecture.md` | `paths: ["**/*.cls", "**/*.trigger", "**/*.flow-meta.xml"]` |
| **Copilot** | `.github/instructions/architecture.instructions.md` | `applyTo: "**/*.cls,**/*.trigger,**/*.flow-meta.xml"` |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Architecture`) |

---

## Analysis Steps

### 1. Identify Trigger Framework

Search for trigger handler patterns:

```
Look in:
- force-app/**/triggers/
- force-app/**/classes/triggerHandlers/
- force-app/**/classes/*TriggerHandler.cls
```

Document:
- Handler naming convention (e.g., `tr_ObjectTriggerHandler`)
- Recursion prevention pattern (static flags, trigger context checks)
- Before/After separation
- Bulk processing approach

### 2. Identify Service Layer Pattern

Search for service layer implementation:

```
Look for:
- *Service.cls, *Selector.cls, *Controller.cls
- fflib patterns (fflib_SObjectUnitOfWork, fflib_SObjectSelector)
- Custom patterns in classes/services/, classes/selectors/
```

Document:
- Layer separation (Controller → Service → Selector → Domain)
- Naming conventions for each layer
- DML management approach (centralized vs distributed)

### 3. Analyze Folder Structure

List and categorize folders in `classes/`:

```
Common patterns:
- controllers/    # @AuraEnabled methods
- services/       # Business logic
- selectors/      # SOQL queries
- triggerHandlers/# Trigger logic
- dto/            # Data transfer objects
- utils/          # Utilities
- helpers/        # Domain helpers
- batches/        # Batchable classes
- queueables/     # Queueable classes
- schedulers/     # Schedulable classes
- invocable/      # Flow invocable actions
- tests/          # Test classes
```

### 4. Identify Naming Conventions

Extract patterns from existing classes:

| Type | Pattern | Example |
|------|---------|---------|
| Trigger Handler | `tr_<Object>TriggerHandler` | `tr_CaseTriggerHandler` |
| Selector | `<Object>Selector` | `AccountSelector` |
| Controller | `<Feature>Controller` | `SearchController` |
| Test | `test_<ClassName>` or `<ClassName>Test` | `test_tr_apiInteraction` |
| Batch | `tr_<Purpose>Batch` | `tr_BulkUpdateBatch` |
| Queueable | `tr_<Purpose>Queueable` | `tr_ProcessRecordsQueueable` |

### 5. Check for DML/FLS Management

Look for centralized utilities:

```
Search for:
- DMLManager, dmlManager
- flsCrudManager, SecurityUtil
- SObjectAccessDecision usage
```

### 6. Identify Anti-Patterns

Search for common issues to document what to avoid:

```
Anti-patterns to check:
- SOQL in loops: for.*\[SELECT
- DML in loops: for.*(insert|update|delete)
- Missing sharing: class\s+\w+\s*\{ (without "sharing")
- Empty catch blocks: catch\s*\([^)]+\)\s*\{\s*\}
- Hardcoded IDs: ['"][0-9a-zA-Z]{15,18}['"]
```

### 7. Check for Framework Usage

Look for established frameworks:

| Framework | Search Pattern | Purpose |
|-----------|---------------|---------|
| Trigger Actions Framework (TAF) | `TriggerAction`, `MetadataTriggerHandler` | Trigger management |
| fflib | `fflib_SObject`, `UnitOfWork` | Enterprise patterns |
| Nebula Logger | `Logger.`, `LogEntryEventBuilder` | Logging framework |
| AT4DX | `ApplicationFactory`, `di_` | Dependency injection |

### 8. Guard Clause Pattern

Check if project uses early returns:

```apex
public void process(Account acc) {
    if (acc == null) return;
    if (acc.Id == null) return;
    // main logic...
}
```

### 9. Salesforce Flows Architecture

Analyze Flow usage in project:

```
Look in:
- force-app/**/flows/*.flow-meta.xml
```

Document:
- Flow Naming Convention (Auto_, Before_, Screen_, Sched_, Event_, Sub_)
- Flow vs Apex Decision Matrix
- Variable Naming (var_, col_, rec_, inp_, out_)
- Anti-Patterns

See [FLOW_BEST_PRACTICES.md](references/FLOW_BEST_PRACTICES.md) for detailed guidance.

---

## Output Template

```markdown
# Architecture & Patterns

## Overview

[One paragraph describing the architectural approach]

## Trigger Framework

### Pattern
[Description of the trigger handler pattern used]

### Naming Convention
- Triggers: `tr_<ObjectName>.trigger`
- Handlers: `tr_<ObjectName>TriggerHandler.cls`

### Example
\`\`\`apex
trigger tr_Case on Case (before insert, after insert, ...) {
    new tr_CaseTriggerHandler().run();
}
\`\`\`

### Recursion Prevention
[How the project prevents trigger recursion]

## Service Layer

### Layers
| Layer | Responsibility | Naming |
|-------|----------------|--------|
| Controller | @AuraEnabled entry points | `*Controller` |
| Service | Business logic | `*Service` |
| Selector | SOQL queries | `*Selector` |
| Domain | Object-specific logic | `*Helper` |

### Example Flow
\`\`\`
LWC → Controller.method() → Service.process() → Selector.query()
                                              → DMLManager.save()
\`\`\`

## Folder Structure

\`\`\`
force-app/main/default/classes/
├── controllers/     # @AuraEnabled controllers
├── services/        # Business logic
├── selectors/       # SOQL queries
...
\`\`\`

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| ... | ... | ... |

## DML & Security

[How DML operations and FLS checks are handled]

## Flows Architecture

[Document Flow naming conventions and patterns if used]
```

---

## Verification

After generating, verify:
- [ ] At least 3 code examples from actual project
- [ ] All naming conventions documented with examples
- [ ] Folder structure matches actual project
- [ ] No generic examples - all from this codebase
- [ ] Anti-patterns section included
- [ ] Framework usage documented (TAF, fflib, etc.)
