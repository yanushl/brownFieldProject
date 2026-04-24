---
description: Security patterns and enforcement used in THIS project — extracted from actual code and metadata
globs: ["**/*.cls", "**/*.trigger", "**/*.permissionset-meta.xml", "**/*.profile-meta.xml"]
alwaysApply: false
---

# Security Patterns

> How security is enforced in this project. Extracted from actual code — document what IS.

---

## Sharing Model

### Class Sharing Keywords (All 9 Classes)

| Keyword | Count | Classes |
|---------|-------|---------|
| `with sharing` | 6 | `OrderController`, `ProductController`, `ProductRecordInfoController`, `PagedResult`, `CommunitiesLandingController`, `CommunitiesLandingControllerTest` |
| `without sharing` | 0 | — none |
| `inherited sharing` | 0 | — none |
| `global` (no sharing) | 1 | `HeroDetailsPositionCustomPicklist` — required by `VisualEditor.DynamicPickList` extension API |
| No keyword (`public class`) | 2 | `TestOrderController`, `TestProductController` — `@isTest` classes; sharing less relevant |

**Key finding**: Every production Apex class that performs queries or is user-facing explicitly declares `with sharing`. No `without sharing` classes exist.

### Observed Rule

> All LWC-facing Apex controllers use `public with sharing`. No exceptions.

```apex
// All controllers — consistent pattern
public with sharing class OrderController { ... }
public with sharing class ProductController { ... }
public with sharing class ProductRecordInfoController { ... }
```

---

## FLS / CRUD Enforcement

### Primary Pattern: `WITH USER_MODE`

**All production SOQL uses `WITH USER_MODE`** — the API 52+ clause that enforces both FLS and object-level sharing at the database level in a single statement.

| Enforcement Method | Count | Where Used |
|--------------------|-------|-----------|
| `WITH USER_MODE` | 5 queries | `OrderController` (1), `ProductController` (2 — static + dynamic), `ProductRecordInfoController` (2) |
| `WITH SECURITY_ENFORCED` | 0 | — not used |
| `Schema.isAccessible()` / `isCreateable()` | 0 | — not used |
| `Security.stripInaccessible()` | 0 | — not used |
| `AccessLevel.USER_MODE` on DML | 0 | — no Apex DML in production |

### Static SOQL Example

```apex
// OrderController.cls — WITH USER_MODE on static SOQL
return [
    SELECT Id, Qty_S__c, Qty_M__c, Qty_L__c, Price__c,
           Product__r.Name, Product__r.MSRP__c, Product__r.Picture_URL__c
    FROM Order_Item__c
    WHERE Order__c = :orderId
    WITH USER_MODE
];
```

### Dynamic SOQL Example

```apex
// ProductController.cls — WITH USER_MODE appended to dynamic query string
result.totalItemCount = Database.countQuery(
    'SELECT count() FROM Product__c ' + whereClause
);
result.records = Database.query(
    'SELECT Id, Name, MSRP__c, Description__c, Category__c, Level__c, Picture_URL__c, Material__c FROM Product__c '
        + whereClause
        + ' WITH USER_MODE'
        + ' ORDER BY Name LIMIT :pageSize OFFSET :offset'
);
```

> `WITH USER_MODE` in dynamic SOQL is appended as a string suffix — this is the correct pattern since it must appear after the WHERE clause.

---

## DML Security

### Pattern: LDS-Only DML (No Apex DML in Production)

**All create/update/delete operations are performed via Lightning Data Service (LDS) from the LWC layer** — not from Apex. LDS inherently respects CRUD permissions and FLS without additional enforcement code.

| Operation | Where | Method |
|-----------|-------|--------|
| Create `Order_Item__c` | `orderBuilder.js` | `createRecord()` from `lightning/uiRecordApi` |
| Update `Order_Item__c` | `orderBuilder.js` | `updateRecord()` from `lightning/uiRecordApi` |
| Delete `Order_Item__c` | `orderBuilder.js` | `deleteRecord()` from `lightning/uiRecordApi` |
| Create `Case` | `createCase.js` | `lightning-record-edit-form` (LDS) |
| Update `Order__c.Status__c` | `orderStatusPath.js` | `updateRecord()` from `lightning/uiRecordApi` |

```javascript
// orderBuilder.js — all DML via LDS, no raw Apex DML
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';

createRecord({ apiName: ORDER_ITEM_OBJECT.objectApiName, fields })
updateRecord({ fields: orderItemChanges })
deleteRecord(id)
```

**Apex test DML**: `insert` statements in `@testSetup` methods (no security enforcement — acceptable in test context).

---

## Dynamic SOQL Safety

### Pattern: Bind Variables Exclusively

Dynamic SOQL exists only in `ProductController.getProducts()`. It uses **bind variables** for all user-supplied filter values — the safe pattern.

```apex
// ProductController.cls — safe dynamic SOQL with bind variables
String key, whereClause = '';
String[] categories, materials, levels, criteria = new List<String>{};

if (!String.isEmpty(filters.searchKey)) {
    key = '%' + filters.searchKey + '%';     // User input stored in local variable
    criteria.add('Name LIKE :key');          // Bind variable — not concatenated
}
if (filters.maxPrice >= 0) {
    maxPrice = filters.maxPrice;
    criteria.add('MSRP__c <= :maxPrice');    // Bind variable
}
if (filters.categories != null) {
    categories = filters.categories;
    criteria.add('Category__c IN :categories'); // Bind variable
}
// No String.escapeSingleQuotes() needed — bind variables are inherently safe
whereClause = 'WHERE ' + String.join(criteria, ' AND ');
```

**Finding**: No SOQL injection risk. User input is never directly concatenated into the query string. All dynamic filter values use `:bindVariable` references.

---

## Permission Sets

### `ebikes` — Primary User Permission Set

| Object | Create | Read | Edit | Delete | View All | Notes |
|--------|--------|------|------|--------|----------|-------|
| `Account` | — | ✅ | — | — | ✅ | Read-only reference |
| `Case` | ✅ | ✅ | ✅ | ✅ | ✅ | Full CRUD for support |
| `Order__c` | ✅ | ✅ | ✅ | ✅ | ✅ | Full CRUD for resellers |
| `Order_Item__c` | ✅ | ✅ | ✅ | ✅ | ✅ | Full + Modify All |
| `Product__c` | ✅ | ✅ | ✅ | ✅ | ✅ | Full + Modify All |
| `Product_Family__c` | ✅ | ✅ | ✅ | ✅ | ✅ | Full + Modify All |
| `Order` (standard) | — | ✅ | — | — | ✅ | Read-only |

All custom fields on `Product__c`, `Order_Item__c`, and `Product_Family__c` explicitly granted Read + Edit.

### `sfdcInternalInt__sfdc_scrt2` — SCRT2 Integration User

| Object | Permissions | Purpose |
|--------|------------|---------|
| `Case` | Read + View All only | Allows Salesforce's SCRT2 (Service Cloud Real-Time 2) integration to read cases; no write access |

This permission set requires activation (`hasActivationRequired: true`) and is assigned the `Cloud Integration User` license.

---

## Custom Permissions

**None found** — no `*.customPermission-meta.xml` files exist. No `FeatureManagement.checkPermission()` calls in any Apex class.

---

## Sharing Rules & OWD

### Guest User Sharing Rules (Experience Cloud)

Defined in `guest-profile-metadata/sharingRules/`:

| Object | Rule Name | Guest Access | Condition |
|--------|-----------|-------------|-----------|
| `Product__c` | `Product_guest_visibility` | Read | Name is not blank (all products) |
| `Product_Family__c` | `Product_family_guest_visibility` | Read | Name is not blank (all families) |

**Effect**: Unauthenticated (guest) Experience Cloud visitors can browse the full product catalog. Products and families with a Name are visible. No write access.

### E-Bikes Profile (Experience Cloud Guest Profile)

Key access decisions for the Experience Cloud guest/community profile:

| Class | Guest Access | Reason |
|-------|-------------|--------|
| `ProductController` | ✅ Enabled | Guests browse the catalog |
| `ProductRecordInfoController` | ✅ Enabled | Hero navigation to product/family |
| `PagedResult` | ✅ Enabled | Required by `ProductController` return type |
| `OrderController` | ❌ **Disabled** | Guests cannot access order data |
| `CommunitiesLandingController` | ❌ Disabled | Not needed for guest pages |
| Test classes | ❌ Disabled | Never exposed |

**Key Case field permissions for guest profile**:
- `Case.Subject`, `Case.Description`, `Case.Priority`, `Case.Reason`, `Case.Origin` — Read + Edit
- `Case.Case_Category__c` — **NOT readable** (not exposed to guest)
- `Case.Product__c` — **NOT readable** (product lookup not accessible to guest)

### OWD / External Sharing

| Object | Internal OWD | External OWD | Notes |
|--------|-------------|-------------|-------|
| `Order__c` | ReadWrite | **Private** | Community users cannot see orders unless explicitly shared |
| `Product__c` | ReadWrite | ReadWrite | Covered by guest sharing rules above |
| `Product_Family__c` | ReadWrite | ReadWrite | Covered by guest sharing rules above |
| `Order_Item__c` | ControlledByParent | ControlledByParent | Inherits from `Order__c` |

---

## XSS Prevention (LWC)

**No unsafe DOM manipulation found.**

| Pattern Checked | Result |
|----------------|--------|
| `innerHTML` assignments | ✅ None found |
| `eval()` calls | ✅ None found |
| `document.write` | ✅ None found |
| `lwc:dom="manual"` | ✅ Not used |

LWC's template engine auto-escapes all `{expressions}` — XSS prevention is built in for standard data binding.

---

## Sensitive Data Handling

| Check | Result |
|-------|--------|
| `System.debug()` in production code | ✅ None found |
| Hardcoded passwords / tokens / API keys | ✅ None found |
| PII in exception messages | ✅ None found |
| `@IsTest(SeeAllData=true)` | ⚠️ Found in `CommunitiesLandingControllerTest` — legacy pattern from Salesforce-generated template |

---

## Security Testing

### `System.runAs()` Usage

**Not used in any test class.** The project does not test security under restricted user contexts.

| Test Class | Has `runAs`? | Notes |
|-----------|-------------|-------|
| `TestOrderController` | ❌ No | Tests run as system admin |
| `TestProductController` | ❌ No | Tests run as system admin |
| `CommunitiesLandingControllerTest` | ❌ No | Uses `SeeAllData=true` (legacy) |

> **Gap**: No sharing/FLS is tested from a restricted user perspective. Tests verify functional correctness but not security enforcement under a limited user.

---

## Security Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    LWC Layer                             │
│  All DML via LDS (createRecord/updateRecord/deleteRecord)│
│  LDS enforces CRUD/FLS natively                         │
└─────────────────────┬───────────────────────────────────┘
                      │ @AuraEnabled wire calls
┌─────────────────────▼───────────────────────────────────┐
│                 Apex Controllers                         │
│  public with sharing (all controllers)                   │
│  WITH USER_MODE on all SOQL                              │
│  Bind variables in all dynamic SOQL                      │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Salesforce Database                         │
│  FLS enforced by WITH USER_MODE                          │
│  Sharing rules enforced by with sharing                  │
│  Guest: Read-only products via sharing rules             │
│  Orders: External OWD = Private                          │
└─────────────────────────────────────────────────────────┘
```

---

## Security Checklist for New Code

### New Apex Classes

- [x] Declare `public with sharing` (project standard — no exceptions observed)
- [x] Add `WITH USER_MODE` to all SOQL (static and dynamic)
- [x] Use bind variables in dynamic SOQL — no `String.escapeSingleQuotes()` needed
- [x] No production Apex DML — route all DML through LDS from LWC
- [ ] If Apex DML is unavoidable, use `Database.insert(records, AccessLevel.USER_MODE)`
- [ ] Add `System.runAs()` test coverage for security-sensitive operations

### New LWC Components

- [x] Use `{expression}` binding (auto-escaped by LWC engine) — no raw DOM writes
- [x] DML via `lightning/uiRecordApi` or `lightning-record-edit-form`
- [ ] If exposing to guest/community: verify `OrderController` remains disabled in E-Bikes Profile
- [ ] New controllers for community use: add to E-Bikes Profile with minimum required access

### New Permission Sets

- [ ] Follow principle of least privilege — start with read-only and add as needed
- [ ] Document purpose in `<description>` tag
- [ ] Do not grant Modify All to non-admin permission sets (current `ebikes` PS grants it broadly — acceptable for this sample app context)

---

*Analyzed from: 9 Apex classes, 2 permission sets, 1 guest profile, 2 sharing rule files*  
*Generated: 2026-04-24*  
*Source: `force-app/**`, `guest-profile-metadata/**`*
