# Security Analysis Checklist

> Use this checklist to ensure comprehensive analysis of security patterns.

## Sharing Keywords

- [ ] Count classes with `with sharing`
- [ ] Count classes with `without sharing`
- [ ] Count classes with `inherited sharing`
- [ ] Count classes with no sharing keyword
- [ ] Document justification for `without sharing` usage
- [ ] Check if sharing is consistent by layer (Controller, Service, Selector)

## FLS/CRUD Enforcement

### Query Security
- [ ] Check for `WITH SECURITY_ENFORCED` usage
- [ ] Check for `WITH USER_MODE` usage
- [ ] Identify queries without security enforcement
- [ ] Note if enforcement is in Selector layer only

### DML Security
- [ ] Check for `AccessLevel.USER_MODE` usage
- [ ] Check for Schema CRUD checks before DML
- [ ] Check for `Security.stripInaccessible()` usage
- [ ] Identify DML without security checks

### Programmatic Checks
- [ ] Schema.sObjectType.*.isAccessible()
- [ ] Schema.sObjectType.*.isCreateable()
- [ ] Schema.sObjectType.*.isUpdateable()
- [ ] Schema.sObjectType.*.isDeletable()
- [ ] Field-level checks (fields.*.isAccessible())

## Permission Model

### Permission Sets
- [ ] List all Permission Sets in project
- [ ] Document purpose of each
- [ ] Note object permissions granted
- [ ] Note field permissions granted
- [ ] Note Apex class access

### Custom Permissions
- [ ] List all Custom Permissions
- [ ] Find where each is checked in code
- [ ] Document purpose of each

### Profiles (if in source)
- [ ] Note any profile customizations
- [ ] Check for profile-specific logic in code

## Injection Prevention

### SOQL Injection
- [ ] Find all dynamic SOQL (`Database.query`)
- [ ] Verify bind variables used
- [ ] Check for `String.escapeSingleQuotes()` usage
- [ ] Flag any string concatenation in queries

### SOSL Injection
- [ ] Find all dynamic SOSL
- [ ] Verify proper escaping

## Sensitive Data

### Logging
- [ ] Check debug statements for sensitive data
- [ ] Check exception messages for PII
- [ ] Check custom logging for sensitive fields

### Hardcoded Secrets
- [ ] Search for hardcoded passwords
- [ ] Search for hardcoded API keys
- [ ] Search for hardcoded tokens
- [ ] Verify secrets use Named Credentials or Protected Custom Settings

## XSS Prevention (LWC/Aura)

- [ ] Check for `innerHTML` usage
- [ ] Verify `textContent` used for user data
- [ ] Check for `lwc:dom="manual"` usage
- [ ] Review any DOM manipulation

## CSRF Protection

- [ ] Verify VF pages have CSRF token
- [ ] Check REST endpoints for proper authentication

## Security Testing

- [ ] Look for `System.runAs()` in tests
- [ ] Check if negative security scenarios tested
- [ ] Verify FLS/CRUD failures are tested
- [ ] Check if sharing is tested

## Audit Trail

- [ ] Check for custom audit logging
- [ ] Note what operations are logged
- [ ] Check if user context is captured
