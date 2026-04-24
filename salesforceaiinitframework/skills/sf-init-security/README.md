# sf-init-security

> Analyze security patterns and generate documentation for AI context.

## Purpose

Creates a "snapshot" of how YOUR project enforces security — sharing keywords, FLS/CRUD checks, Permission Sets, and secure coding practices.

## Usage

```
User: /sf-init-security
```

### With Platform Target

```
User: /sf-init-security for Cursor
User: /sf-init-security for GitHub Copilot
```

## What It Analyzes

| Area | What We Look For |
|------|------------------|
| **Sharing Keywords** | `with sharing`, `without sharing`, `inherited sharing` |
| **FLS Enforcement** | `WITH SECURITY_ENFORCED`, `WITH USER_MODE`, Schema checks |
| **CRUD Checks** | `isAccessible()`, `isCreateable()`, `stripInaccessible()` |
| **Permission Sets** | Object/field permissions, custom permissions |
| **SOQL Injection** | Dynamic queries, bind variables, escaping |
| **Sensitive Data** | Hardcoded secrets, debug logging |
| **Security Testing** | `System.runAs()` patterns |

## Output

Creates `security.md` (platform-specific location) with:

- Sharing keyword distribution across classes
- FLS/CRUD enforcement patterns (with real examples)
- Permission Sets inventory
- Custom Permissions and their usage
- SOQL injection prevention patterns
- Sensitive data handling guidelines
- Security testing patterns

## Prerequisites

- Salesforce project with `force-app/` structure
- Existing Apex classes to analyze

## Why This Matters

Security errors are among the most critical:

| Issue | Impact |
|-------|--------|
| Missing `with sharing` | Users see records they shouldn't |
| No FLS check | Users see/edit fields they shouldn't |
| SOQL injection | Data breach, unauthorized access |
| Hardcoded secrets | Credential exposure |

## Example Output Sections

### Sharing Analysis

```markdown
| Keyword | Count | Examples |
|---------|-------|----------|
| `with sharing` | 45 | AccountService, ContactController |
| `without sharing` | 3 | SystemLogger, BatchProcessor |
| `inherited sharing` | 12 | StringUtils, DateHelper |
```

### FLS Pattern

```apex
// Primary pattern used in this project
public List<Account> getAccounts() {
    return [
        SELECT Id, Name, Phone
        FROM Account
        WITH SECURITY_ENFORCED
    ];
}
```

## See Also

- [SKILL.md](SKILL.md) — Full skill definition
- [references/ANALYSIS_CHECKLIST.md](references/ANALYSIS_CHECKLIST.md) — What to look for
- [references/SECURITY_PATTERNS.md](references/SECURITY_PATTERNS.md) — Common patterns
