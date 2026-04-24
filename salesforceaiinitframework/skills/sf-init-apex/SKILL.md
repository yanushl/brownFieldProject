---
name: sf-init-apex
description: Analyze existing Apex code and generate apex.md documenting THIS project's structure, conventions, and examples. Creates a "snapshot" of how the team writes code. Use when setting up AI context for Apex development.
---

# Apex Structure Analyzer

## Purpose

**Analyze** existing Apex code and document how THIS project is structured. The output enables AI to write code consistent with the project's existing style.

**This is ANALYSIS, not prescription.** We document what IS, not what SHOULD BE.

## Output

Creates `apex.md` in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/apex.md` | `globs: ["**/*.cls", "**/*.trigger"]`<br>`alwaysApply: false` |
| **Claude Code** | `.claude/rules/apex.md` | `paths: ["**/*.cls", "**/*.trigger"]` |
| **Copilot** | `.github/instructions/apex.instructions.md` | `applyTo: "**/*.cls,**/*.trigger"` |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Apex Patterns`) |

## References (What to Look For)

These files provide ideas on WHAT to analyze. They are NOT copied to output — they guide the analysis process.

| Reference | Use for |
|-----------|---------|
| [NAMING_CONVENTIONS.md](references/NAMING_CONVENTIONS.md) | Patterns to detect in naming |
| [ANALYSIS_CHECKLIST.md](references/ANALYSIS_CHECKLIST.md) | Checklist of aspects to analyze |

---

## Analysis Workflow

### Phase 1: Discover Project Structure

```
1. Glob: force-app/**/classes/**/*.cls
2. Glob: force-app/**/triggers/*.trigger
3. Count files, identify folders structure
```

**Document:** How is the project organized? (flat, by feature, by layer)

### Phase 2: Identify Class Types

Categorize ALL classes found:

| Type | Search Pattern | What to document |
|------|---------------|------------------|
| Controllers | `*Controller.cls` | List them, show example |
| Services | `*Service.cls` | List them, show example |
| Selectors | `*Selector.cls` | List them, show example |
| Helpers | `*Helper.cls` | List them, show example |
| Utils | `*Util.cls`, `*Utils.cls` | List them, show example |
| Handlers | `*Handler.cls`, `*TriggerHandler.cls` | List them, show example |
| Batches | `*Batch.cls` | List them, show example |
| Queueables | `*Queueable.cls` | List them, show example |
| Tests | `*Test.cls`, `test_*.cls` | Count, note naming pattern |
| DTOs | `*DTO.cls`, `*Wrapper.cls`, classes in `dto/` | List them |

### Phase 3: Analyze Trigger Framework

**Question:** Does this project use a trigger framework?

```
Search for:
- MetadataTriggerHandler, TriggerAction.* — TAF pattern
- TriggerHandler base class — custom handler pattern
- Trigger.new directly in .trigger files — no framework
```

**Document:** Which framework (if any), show real trigger example from project.

### Phase 4: Extract Naming Conventions

**Question:** How does THIS team name things?

Analyze actual names found in codebase:

| Element | Pattern Found | Examples from Project |
|---------|--------------|----------------------|
| Controllers | `???` | `SearchController`, `...` |
| Services | `???` | `AccountService`, `...` |
| Test classes | `???` | `AccountServiceTest` or `test_AccountService`? |
| Variables | `???` | camelCase? prefixes? |
| Constants | `???` | UPPER_SNAKE? |

### Phase 5: Analyze Code Patterns

#### Controller Pattern
- How do controllers handle errors? (try-catch? AuraHandledException?)
- How do they call services?
- What do they return? (primitives, wrappers, JSON?)

#### Service Pattern  
- Do services call selectors or query directly?
- How is business logic organized?
- Static methods or instance?

#### Selector Pattern
- Is there a selector per object?
- How are queries structured?
- Security? (WITH USER_MODE, WITH SECURITY_ENFORCED?)

#### Async Patterns
- Which async approach is used? (Batch, Queueable, @future)
- How do they handle errors?
- State management?

#### Exception Handling
- Are there custom exception classes?
- How are errors propagated?
- Logging approach?

### Phase 6: Extract Real Examples

For each pattern found, extract **1-2 REAL examples** from the codebase.

**Format:**
```
File: force-app/main/default/classes/AccountService.cls
Lines: 15-30
```
```apex
// Actual code from the project
```

---

## Output Template

```markdown
---
description: Apex structure and conventions used in THIS project
globs: ["**/*.cls", "**/*.trigger"]
alwaysApply: false
---

# Apex Structure

> How Apex code is structured in this project.

## Project Structure

| Metric | Value |
|--------|-------|
| Total classes | X |
| Total triggers | X |
| Test classes | X |
| Folder structure | [flat / by-feature / by-layer] |

### Class Distribution

| Type | Count | Examples |
|------|-------|----------|
| Controllers | X | `SearchController`, `...` |
| Services | X | `AccountService`, `...` |
| Selectors | X | `AccountSelector`, `...` |
| ... | ... | ... |

---

## Trigger Framework

**Framework used:** [TAF / Custom Handler / None]

**Trigger pattern:**
\`\`\`apex
// Real trigger from project
\`\`\`

**Handler pattern (if any):**
\`\`\`apex
// Real handler from project
\`\`\`

---

## Naming Conventions (Observed)

These conventions are **extracted from existing code**, not prescribed.

### Classes

| Type | Convention | Examples |
|------|------------|----------|
| Controller | [pattern found] | `SearchController` |
| Service | [pattern found] | `AccountService` |
| Test | [pattern found] | `AccountServiceTest` |

### Variables & Methods

| Element | Convention | Examples |
|---------|------------|----------|
| Local variables | [observed] | `accountList`, `...` |
| Maps | [observed] | `accountsById`, `...` |
| Constants | [observed] | `MAX_RETRIES`, `...` |
| Methods | [observed] | `getAccounts()`, `...` |

---

## Controller Pattern

Entry points for LWC/Aura components.

**Example from project:**
\`\`\`apex
// File: [path]
// Real code from project showing controller pattern
\`\`\`

**Observations:**
- Error handling: [how errors are handled]
- Return types: [wrappers, primitives, etc.]
- Service calls: [how services are invoked]

---

## Service Pattern

Business logic layer.

**Example from project:**
\`\`\`apex
// File: [path]
// Real code from project showing service pattern
\`\`\`

**Observations:**
- Static vs instance methods: [which is used]
- Query approach: [direct SOQL vs selectors]
- DML approach: [direct vs centralized]

---

## Selector Pattern

Data access layer (if used).

**Example from project:**
\`\`\`apex
// File: [path]
// Real code from project showing selector pattern
\`\`\`

---

## Async Patterns

### Batch Jobs

\`\`\`apex
// Real batch example from project
\`\`\`

### Queueables

\`\`\`apex
// Real queueable example from project
\`\`\`

---

## Exception Handling

**Custom exceptions found:**
- `[CustomException]` — used for [purpose]

**Error handling pattern:**
\`\`\`apex
// Real example of try-catch from project
\`\`\`

---

## Security Patterns (Observed)

| Aspect | Usage in Project |
|--------|-----------------|
| Sharing keywords | `with sharing` / `without sharing` / `inherited sharing` |
| FLS enforcement | `WITH USER_MODE` / `WITH SECURITY_ENFORCED` / `stripInaccessible` / none |
| Query security | bind variables / string concatenation |

---

## Testing Patterns

**Test class naming:** `[pattern]`

**Test setup approach:**
\`\`\`apex
// Real @TestSetup example if exists
\`\`\`

**Assertion style:**
- `Assert.areEqual()` (modern) or `System.assertEquals()` (legacy)?

---

*Analyzed from: [X] classes, [Y] triggers*
*Generated: [date]*
```

---

## Verification Checklist

After generating, verify:

- [ ] All class types counted and categorized
- [ ] Naming conventions extracted from ACTUAL code (not assumed)
- [ ] At least 1 real example for each pattern used in project
- [ ] Trigger framework identified (or noted as "none")
- [ ] Security patterns observed and documented
- [ ] Test patterns observed

---

## Notes

- **Extract, don't prescribe** — document what IS, not what SHOULD BE
- **Real examples only** — every code block should be from the actual project
- **Observe patterns** — if the team uses `test_` prefix, document that (don't "correct" it)
- **Note gaps** — if something is missing (no selectors, no test setup), note it neutrally
