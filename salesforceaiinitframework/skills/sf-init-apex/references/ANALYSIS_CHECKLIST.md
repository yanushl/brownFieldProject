# Apex Analysis Checklist

> Checklist of aspects to analyze when examining Apex code in a project.
> Use this to know WHAT to look for, not to judge the code.

---

## Code Organization — What to Check

| Aspect | Questions to Answer |
|--------|---------------------|
| Folder structure | How are classes organized? (flat, by feature, by layer) |
| Class count | How many classes total? By type? |
| Trigger structure | One per object? Multiple? Using framework? |
| Layer separation | Are there distinct Controller/Service/Selector layers? |

---

## Bulkification — What to Check

| Pattern | How to Detect | Document |
|---------|---------------|----------|
| SOQL in loops | `for.*\[SELECT` pattern | Count occurrences, show examples |
| DML in loops | `for.*(insert|update|delete)` | Count occurrences, show examples |
| Collection usage | `Map<Id,`, `Set<Id>` patterns | Show how project uses maps/sets |
| Bulk tests | `for.*251` or `200+` in test classes | Note if present/absent |

**Analysis output:** "Project has X classes with SOQL in loops, Y with DML in loops"

---

## Security — What to Check

| Pattern | How to Detect | Document |
|---------|---------------|----------|
| Sharing keywords | `with sharing`, `without sharing`, `inherited sharing` | Count each, note if any classes missing |
| FLS enforcement | `WITH USER_MODE`, `WITH SECURITY_ENFORCED`, `stripInaccessible` | Which approach is used? |
| Dynamic SOQL | `Database.query(` | Does it use bind variables or concatenation? |
| Hardcoded IDs | 15/18-char ID patterns in code | Count occurrences |

**Analysis output:** "Project uses `with sharing` in X% of classes, `WITH USER_MODE` in Y SOQL queries"

---

## Testing — What to Check

| Aspect | How to Detect | Document |
|--------|---------------|----------|
| Test class naming | `*Test.cls` vs `test_*.cls` | Which pattern? |
| Test setup | `@TestSetup` usage | Present? How structured? |
| Assertions | `Assert.` vs `System.assert` | Which is used? |
| Bulk tests | 200+ or 251 records in tests | Present? |
| Mock patterns | `HttpCalloutMock`, `StubProvider` | What mocking approach? |
| Test data | `TestDataFactory` or inline creation | Which pattern? |

**Analysis output:** "Test classes use `*Test` naming, `@TestSetup` in X classes, modern `Assert.` class"

---

## Architecture — What to Check

| Pattern | How to Detect | Document |
|---------|---------------|----------|
| Trigger framework | `MetadataTriggerHandler`, `TriggerAction.*`, custom handler | Which framework? |
| Logic in triggers | Code directly in `.trigger` files | Present? How much? |
| Service layer | `*Service.cls` classes | How many? What do they do? |
| Selector pattern | `*Selector.cls` classes | Used? How structured? |
| DTO pattern | `*DTO.cls`, `*Wrapper.cls` | Used? |

**Analysis output:** "Project uses TAF framework, has 5 service classes, no dedicated selectors"

---

## Error Handling — What to Check

| Pattern | How to Detect | Document |
|---------|---------------|----------|
| Custom exceptions | `extends Exception` | List them |
| AuraHandledException | Usage in @AuraEnabled methods | How errors are surfaced to LWC? |
| Try-catch patterns | `try {` blocks | Specific vs generic Exception? |
| Empty catch | `catch.*\{.*\}` with no content | Present? |
| Logging | `System.debug`, logging framework | What approach? |

**Analysis output:** "3 custom exception classes, AuraHandledException used in all controllers"

---

## Async Patterns — What to Check

| Pattern | How to Detect | Document |
|---------|---------------|----------|
| Batch jobs | `implements Database.Batchable` | Count, show pattern |
| Queueables | `implements Queueable` | Count, show pattern |
| Schedulables | `implements Schedulable` | Count, show pattern |
| @future | `@future` methods | Count, callout=true? |
| Chaining | `System.enqueueJob` in execute | Do they chain? |

**Analysis output:** "5 batch classes, 3 queueables (none chained), 2 schedulables"

---

## Code Style — What to Check

| Aspect | How to Detect | Document |
|--------|---------------|----------|
| Class naming | Analyze actual names | Pattern used |
| Method naming | Analyze method names | camelCase? verbs? |
| Variable naming | Analyze variable names | Conventions? Abbreviations? |
| Constants | `static final` usage | UPPER_SNAKE? |
| Comments | `//`, `/**/`, ApexDoc | Style used? |

**Analysis output:** "PascalCase classes, camelCase methods, Hungarian notation for maps (mapAccountsById)"

---

## Output Format

For each category, document:

1. **What is present** — patterns actually found
2. **Examples** — real code from the project
3. **Observations** — patterns, consistency, gaps (neutral tone)

**Do NOT:**
- Score the code
- Say what's "wrong"
- Prescribe fixes
- Compare to "best practices"

**DO:**
- Describe what IS
- Show real examples
- Note patterns (consistent or inconsistent)
- Enable AI to follow the same patterns
