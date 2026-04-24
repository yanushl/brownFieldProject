---
name: sf-init-security
description: Analyze security patterns and generate security.md. Documents FLS/CRUD enforcement, sharing keywords, Permission Sets, Custom Permissions, and security best practices. Creates a "snapshot" of how the team handles security. Use when setting up AI context for secure development.
---

# Security Patterns Analyzer

## Purpose

**Analyze** existing security implementations and document how THIS project enforces data security. The output enables AI to write secure code consistent with the project's existing patterns.

**This is ANALYSIS, not prescription.** We document what IS, not what SHOULD BE.

## Output

Creates `security.md` in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/security.md` | `globs: ["**/*.cls", "**/*.permissionset-meta.xml", "**/*.profile-meta.xml"]`<br>`alwaysApply: false` |
| **Claude Code** | `.claude/rules/security.md` | `paths: ["**/*.cls", "**/*.permissionset-meta.xml"]` |
| **Copilot** | `.github/instructions/security.instructions.md` | `applyTo: "**/*.cls,**/*.permissionset-meta.xml"` |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Security Patterns`) |

## References (What to Look For)

| Reference | Use for |
|-----------|---------|
| [ANALYSIS_CHECKLIST.md](references/ANALYSIS_CHECKLIST.md) | Complete checklist of security aspects |
| [SECURITY_PATTERNS.md](references/SECURITY_PATTERNS.md) | Common security patterns to detect |

---

## Analysis Workflow

### Phase 1: Sharing Keyword Analysis

Analyze ALL Apex classes for sharing declarations:

```apex
// Search for:
public with sharing class ...
public without sharing class ...
public inherited sharing class ...
public class ... // No keyword = implicit inherited sharing (API 54+)
```

**Document distribution:**

| Keyword | Count | Examples |
|---------|-------|----------|
| `with sharing` | X | `AccountService`, `SearchController` |
| `without sharing` | X | `SystemLogger`, `AdminUtility` |
| `inherited sharing` | X | `BaseService`, `UtilityClass` |
| No keyword | X | `OldClass`, `LegacyHelper` |

**Flag:** Classes with `without sharing` should have documented justification.

### Phase 2: FLS/CRUD Enforcement

Search for FLS enforcement patterns:

```apex
// Pattern 1: Query-level enforcement (API 48+)
SELECT Id, Name FROM Account WITH SECURITY_ENFORCED

// Pattern 2: Query-level with user mode (API 52+)
SELECT Id, Name FROM Account WITH USER_MODE

// Pattern 3: Programmatic checks
Schema.sObjectType.Account.isAccessible()
Schema.sObjectType.Account.fields.Name.isAccessible()
Schema.sObjectType.Account.isCreateable()
Schema.sObjectType.Account.isUpdateable()
Schema.sObjectType.Account.isDeletable()

// Pattern 4: Security.stripInaccessible()
Security.stripInaccessible(AccessType.READABLE, records)
Security.stripInaccessible(AccessType.CREATABLE, records)
Security.stripInaccessible(AccessType.UPDATABLE, records)
```

**Document:**

| Enforcement Method | Usage Count | Where Used |
|--------------------|-------------|------------|
| `WITH SECURITY_ENFORCED` | X | `AccountSelector` |
| `WITH USER_MODE` | X | `SearchService` |
| Schema checks | X | `AccountService` |
| `stripInaccessible()` | X | `DataImportService` |
| No enforcement | X | ⚠️ Flag these |

### Phase 3: DML Security

Check how DML operations handle security:

```apex
// User mode DML (API 52+)
Database.insert(records, AccessLevel.USER_MODE);
Database.update(records, AccessLevel.USER_MODE);
Database.delete(records, AccessLevel.USER_MODE);

// Or with DML options
Database.DMLOptions dmlOptions = new Database.DMLOptions();
// Then: Database.insert(records, dmlOptions);

// System mode (default)
insert records; // No security check
```

### Phase 4: Permission Sets Analysis

```
1. Glob: force-app/**/permissionsets/*.permissionset-meta.xml
2. For each Permission Set:
   - Name and description
   - Object permissions
   - Field permissions
   - Apex class access
   - Custom permissions
```

**Document:**

| Permission Set | Purpose | Key Permissions |
|----------------|---------|-----------------|
| `Sales_User` | Sales team access | Account CRUD, Contact CRUD |
| `Admin_Tools` | Admin utilities | Custom Permissions, all objects |

### Phase 5: Custom Permissions

```
1. Glob: force-app/**/customPermissions/*.customPermission-meta.xml
2. For each Custom Permission:
   - Name and purpose
   - Where it's checked in code
```

Search for usage:

```apex
FeatureManagement.checkPermission('Custom_Permission_Name')
```

**Document:**

| Custom Permission | Purpose | Checked In |
|-------------------|---------|------------|
| `Bypass_Validation` | Skip validation rules | `ValidationService.cls` |
| `Access_Admin_Panel` | Show admin UI | `AdminController.cls` |

### Phase 6: Sharing Rules & OWD

If metadata is available:
```
1. Check force-app/**/sharingRules/*.sharingRules-meta.xml
2. Note Organization-Wide Defaults from org
```

### Phase 7: SOQL Injection Prevention

Search for dynamic SOQL:

```apex
// Vulnerable pattern
String query = 'SELECT Id FROM Account WHERE Name = \'' + userInput + '\'';
Database.query(query);

// Safe patterns
String query = 'SELECT Id FROM Account WHERE Name = :userInput';
Database.query(query);

// Or with escapeSingleQuotes
String safeInput = String.escapeSingleQuotes(userInput);
```

**Flag:** Any dynamic SOQL without proper escaping.

### Phase 8: XSS Prevention (LWC/Aura)

Check for unsafe patterns in JavaScript:

```javascript
// Vulnerable
element.innerHTML = userInput;

// Safe
element.textContent = userInput;
// or use lwc:dom="manual" carefully
```

### Phase 9: Sensitive Data Handling

Check for patterns around sensitive data:

```apex
// Look for:
- Debug statements with sensitive data
- System.debug(password);
- Logging PII (Personally Identifiable Information)
- Hardcoded credentials
```

### Phase 10: Test Security

Check if security is tested:

```apex
// Look for:
System.runAs(limitedUser) {
    // Test that user can/cannot access
}
```

---

## Output Template

```markdown
---
description: Security patterns and enforcement used in THIS project
globs: ["**/*.cls", "**/*.trigger"]
alwaysApply: false
---

# Security Patterns

> How security is enforced in this project.

## Sharing Model

### Class Sharing Keywords

| Keyword | Count | Purpose | Examples |
|---------|-------|---------|----------|
| `with sharing` | X | User-facing operations | `AccountService` |
| `without sharing` | X | System operations | `SystemLogger` |
| `inherited sharing` | X | Utility classes | `StringUtils` |

### When to Use Each

| Context | Keyword | Rationale |
|---------|---------|-----------|
| Controllers | `with sharing` | Respect user visibility |
| Services | `with sharing` | Business logic respects sharing |
| Selectors | `with sharing` | Query respects sharing |
| System utilities | `without sharing` | Logging, admin functions |
| Base classes | `inherited sharing` | Let caller decide |

### ⚠️ Without Sharing Justification

| Class | Reason for without sharing |
|-------|---------------------------|
| `SystemLogger` | Must log regardless of user permissions |
| `AdminService` | Admin-only operations |

---

## FLS/CRUD Enforcement

### Primary Pattern

\`\`\`apex
// Pattern used in this project
[Real example from codebase]
\`\`\`

### Enforcement by Layer

| Layer | Method | Example |
|-------|--------|---------|
| Selector | `WITH SECURITY_ENFORCED` | `AccountSelector` |
| Service | `stripInaccessible()` | `ImportService` |
| Controller | Schema checks | `AccountController` |

### CRUD Check Pattern

\`\`\`apex
// Before DML
if (!Schema.sObjectType.Account.isCreateable()) {
    throw new SecurityException('Insufficient privileges');
}
\`\`\`

---

## Permission Sets

| Permission Set | Purpose | Assigned To |
|----------------|---------|-------------|
| `Sales_User` | Sales team access | Sales profiles |
| `Admin_Tools` | Admin features | System admins |

---

## Custom Permissions

| Permission | Purpose | Usage |
|------------|---------|-------|
| `Bypass_Validation` | Skip validation | `if (FeatureManagement.checkPermission('Bypass_Validation'))` |

---

## Dynamic SOQL Safety

### Pattern Used

\`\`\`apex
// Bind variables (safe)
String query = 'SELECT Id FROM Account WHERE Name = :searchTerm';
Database.query(query);

// Or with escaping
String safeInput = String.escapeSingleQuotes(userInput);
\`\`\`

### ⚠️ Review Required

| Class | Line | Issue |
|-------|------|-------|
| [List any unsafe dynamic SOQL] |

---

## Sensitive Data

### Logging Rules

- [ ] No passwords in debug logs
- [ ] No PII in exception messages
- [ ] Sensitive fields masked

### Hardcoded Credentials

| Status | Notes |
|--------|-------|
| ✅ None found | OR |
| ⚠️ Found in `ClassName.cls` | [Details] |

---

## Security Testing

### Test Patterns

\`\`\`apex
@isTest
static void testRestrictedAccess() {
    User limitedUser = TestDataFactory.createLimitedUser();
    
    System.runAs(limitedUser) {
        try {
            // Attempt restricted operation
            Assert.fail('Should have thrown exception');
        } catch (SecurityException e) {
            Assert.isTrue(e.getMessage().contains('Insufficient'));
        }
    }
}
\`\`\`

---

## Security Checklist for New Code

- [ ] Class has appropriate sharing keyword
- [ ] SOQL uses `WITH SECURITY_ENFORCED` or `WITH USER_MODE`
- [ ] DML checks CRUD or uses `AccessLevel.USER_MODE`
- [ ] Dynamic SOQL uses bind variables
- [ ] No sensitive data in logs
- [ ] Security tested with `System.runAs()`

---

*Generated by sf-init-security on [DATE]*
```

---

## Analysis Commands

### Find Sharing Keywords

```bash
grep -r "with sharing\|without sharing\|inherited sharing" force-app --include="*.cls" -l
```

### Find FLS Patterns

```bash
grep -r "WITH SECURITY_ENFORCED\|WITH USER_MODE\|isAccessible\|stripInaccessible" force-app --include="*.cls"
```

### Find Dynamic SOQL

```bash
grep -r "Database.query\|Database.getQueryLocator" force-app --include="*.cls" -l
```

### Find Custom Permission Checks

```bash
grep -r "checkPermission\|FeatureManagement" force-app --include="*.cls"
```

### Find Debug with Sensitive Terms

```bash
grep -ri "debug.*password\|debug.*secret\|debug.*token\|debug.*apikey" force-app --include="*.cls"
```
);
\`\`\`

## Permission Sets

| Permission Set | Purpose | Assigned To |
|----------------|---------|-------------|

## Custom Permissions

| Permission | Purpose | Check Pattern |
|------------|---------|---------------|
```

---

## Verification

- [ ] All sharing patterns documented
- [ ] FLS enforcement patterns extracted
- [ ] Permission sets listed
- [ ] Anti-patterns identified
