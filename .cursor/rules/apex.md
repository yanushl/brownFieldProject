---
description: Apex structure and conventions used in THIS project — extracted from actual code
globs: ["**/*.cls", "**/*.trigger"]
alwaysApply: false
---

# Apex Structure

> How Apex code is structured in this project. Extracted from actual code — document what IS, not what should be.

## Project Structure

| Metric | Value |
|--------|-------|
| Total classes | 9 |
| Production classes | 6 |
| Test classes | 3 |
| Triggers | 0 |
| Folder structure | **Flat** — all in `force-app/main/default/classes/` |

### Class Distribution

| Type | Count | Classes |
|------|-------|---------|
| LWC/Aura Controllers | 4 | `OrderController`, `ProductController`, `ProductRecordInfoController`, `CommunitiesLandingController` |
| Wrapper / DTO | 1 | `PagedResult` |
| App Builder Utility | 1 | `HeroDetailsPositionCustomPicklist` |
| Test Classes | 3 | `TestOrderController`, `TestProductController`, `CommunitiesLandingControllerTest` |
| Services | 0 | — none |
| Selectors | 0 | — none |
| Triggers | 0 | — none |
| Batch / Queueable | 0 | — none |

---

## Trigger Framework

**Framework used:** None — no triggers exist in this project.

---

## Naming Conventions (Observed)

These are extracted from existing code, not prescribed.

### Classes

| Type | Convention | Examples |
|------|------------|---------|
| LWC Controller | `[Object]Controller` | `OrderController`, `ProductController`, `ProductRecordInfoController` |
| Communities / VF Controller | `[Feature]Controller` | `CommunitiesLandingController` |
| App Builder Picklist | `[ComponentName]CustomPicklist` | `HeroDetailsPositionCustomPicklist` |
| Wrapper | Descriptive noun | `PagedResult` |
| Test class | `Test[ClassName]` OR `[ClassName]Test` | `TestOrderController`, `CommunitiesLandingControllerTest` |

> Note: Test class naming is **inconsistent** in this project — both `Test` prefix and `Test` suffix are used. `TestOrderController` and `TestProductController` use the prefix pattern; `CommunitiesLandingControllerTest` uses the suffix pattern.

### Methods

| Element | Convention | Examples |
|---------|------------|---------|
| Controller methods | camelCase verb-noun | `getOrderItems`, `getProducts`, `getSimilarProducts`, `getRecordInfo` |
| Test methods | descriptive camelCase | `testGetOrderItems`, `getProducts_works`, `getSimilarProducts_works` |
| Test setup | `@testSetup` static method | `setup()`, `createProducts()` |

### Variables & Constants

| Element | Convention | Examples |
|---------|------------|---------|
| Local variables | camelCase | `orderItems`, `whereClause`, `criteria`, `pageSize`, `offset` |
| Parameters | camelCase | `orderId`, `productId`, `familyId`, `filters`, `pageNumber` |
| Constants | `UPPER_SNAKE_CASE` | `PAGE_SIZE = 9`, `DISCOUNT = 0.6` (in LWC JS), `PRODUCT_NAME1`, `PRODUCT_NAME2` |
| Inner class properties | camelCase | `searchKey`, `maxPrice`, `categories`, `materials`, `levels` |
| Test constants | `private static final String` | `PRODUCT_NAME1`, `PRODUCT_NAME2` |

---

## Controller Pattern

All controllers are entry points for LWC components. They use static methods only — no instantiation.

**Example — `OrderController.cls`:**

```apex
public with sharing class OrderController {
    @AuraEnabled(Cacheable=true)
    public static Order_Item__c[] getOrderItems(Id orderId) {
        return [
            SELECT
                Id,
                Qty_S__c,
                Qty_M__c,
                Qty_L__c,
                Price__c,
                Product__r.Name,
                Product__r.MSRP__c,
                Product__r.Picture_URL__c
            FROM Order_Item__c
            WHERE Order__c = :orderId
            WITH USER_MODE
        ];
    }
}
```

**Example — `ProductController.cls` (more complex with filters and pagination):**

```apex
public with sharing class ProductController {
    static Integer PAGE_SIZE = 9;

    public class Filters {
        @AuraEnabled
        public String searchKey { get; set; }
        @AuraEnabled
        public Decimal maxPrice { get; set; }
        @AuraEnabled
        public String[] categories { get; set; }
        @AuraEnabled
        public String[] materials { get; set; }
        @AuraEnabled
        public String[] levels { get; set; }
    }

    @AuraEnabled(Cacheable=true scope='global')
    public static PagedResult getProducts(Filters filters, Integer pageNumber) {
        String key, whereClause = '';
        Decimal maxPrice;
        String[] categories, materials, levels, criteria = new List<String>{};
        if (filters != null) {
            // ... build criteria list
            if (criteria.size() > 0) {
                whereClause = 'WHERE ' + String.join(criteria, ' AND ');
            }
        }
        Integer pageSize = ProductController.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.pageNumber = pageNumber;
        result.totalItemCount = Database.countQuery(
            'SELECT count() FROM Product__c ' + whereClause
        );
        result.records = Database.query(
            'SELECT Id, Name, MSRP__c, Description__c, Category__c, Level__c, Picture_URL__c, Material__c FROM Product__c ' +
                whereClause + ' WITH USER_MODE ORDER BY Name LIMIT :pageSize OFFSET :offset'
        );
        return result;
    }
}
```

**Observations:**
- **Sharing**: All controllers use `public with sharing`
- **Caching**: All read methods use `@AuraEnabled(Cacheable=true)`
- **Experience Cloud scope**: Methods exposed to Experience Cloud use `scope='global'` — required when LWC is used on a community page
- **Error handling**: No explicit `try-catch` or `AuraHandledException` wrapping — errors propagate naturally; the LWC handles wire errors client-side
- **Return types**: SObject arrays, custom wrapper class (`PagedResult`), `List<String>` primitives
- **No service layer**: Controllers contain business logic and queries directly — no intermediary service or selector classes
- **Static methods only**: No instance methods on controllers

---

## Dynamic SOQL Filter Pattern

The project has one notable pattern for building filtered queries dynamically in `ProductController`.

```apex
// Build criteria list
String[] criteria = new List<String>{};
if (!String.isEmpty(filters.searchKey)) {
    key = '%' + filters.searchKey + '%';
    criteria.add('Name LIKE :key');
}
if (filters.maxPrice >= 0) {
    maxPrice = filters.maxPrice;
    criteria.add('MSRP__c <= :maxPrice');
}
if (filters.categories != null) {
    categories = filters.categories;
    criteria.add('Category__c IN :categories');
}
// Join with AND
if (criteria.size() > 0) {
    whereClause = 'WHERE ' + String.join(criteria, ' AND ');
}
// Execute
result.totalItemCount = Database.countQuery('SELECT count() FROM Product__c ' + whereClause);
result.records = Database.query('SELECT ... FROM Product__c ' + whereClause + ' WITH USER_MODE ...');
```

**Key details:**
- Bind variables (`:key`, `:maxPrice`, `:categories`, etc.) are used even in dynamic SOQL — safe from SOQL injection
- `WITH USER_MODE` appended to dynamic query string
- Separate `Database.countQuery()` for total count, `Database.query()` for actual records
- `LIMIT :pageSize OFFSET :offset` for pagination

---

## Wrapper / DTO Pattern

Reusable result wrappers use `@AuraEnabled` on properties (not methods).

**`PagedResult.cls`:**

```apex
public with sharing class PagedResult {
    @AuraEnabled
    public Integer pageSize { get; set; }

    @AuraEnabled
    public Integer pageNumber { get; set; }

    @AuraEnabled
    public Integer totalItemCount { get; set; }

    @AuraEnabled
    public Object[] records { get; set; }
}
```

**Inner class DTO pattern** (nested in `ProductController`):

```apex
public class Filters {
    @AuraEnabled
    public String searchKey { get; set; }
    @AuraEnabled
    public Decimal maxPrice { get; set; }
    @AuraEnabled
    public String[] categories { get; set; }
    // ...
}
```

**Observations:**
- Wrapper classes use `public with sharing`
- Properties use `{ get; set; }` auto-properties
- `Object[]` used for polymorphic record type in `PagedResult.records`
- Inner classes used for request DTOs (e.g. `Filters`) nested inside the controller

---

## App Builder Utility Pattern

One class extends `VisualEditor.DynamicPickList` to provide dynamic picklist values in App Builder component properties.

**`HeroDetailsPositionCustomPicklist.cls`:**

```apex
global class HeroDetailsPositionCustomPicklist extends VisualEditor.DynamicPickList {
    global override VisualEditor.DataRow getDefaultValue() {
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow('Right', 'right');
        return defaultValue;
    }
    global override VisualEditor.DynamicPickListRows getValues() {
        VisualEditor.DynamicPickListRows myValues = new VisualEditor.DynamicPickListRows();
        myValues.addRow(new VisualEditor.DataRow('Left', 'left'));
        myValues.addRow(new VisualEditor.DataRow('Right', 'right'));
        return myValues;
    }
}
```

**Observations:**
- Uses `global` access modifier (required for `VisualEditor.DynamicPickList`)
- Overrides `getDefaultValue()` and `getValues()`
- Used in LWC `heroDetails` component to offer position choices in App Builder

---

## Exception Handling

**Custom exceptions:** None — no custom exception classes exist in this project.

**Error handling pattern:** No explicit `try-catch` blocks in production Apex. Controllers let exceptions propagate; the LWC handles errors via `wire` error branches or `catch` in imperative calls.

```apex
// No try-catch — typical pattern in this project:
@AuraEnabled(Cacheable=true)
public static Order_Item__c[] getOrderItems(Id orderId) {
    return [SELECT ... FROM Order_Item__c WHERE Order__c = :orderId WITH USER_MODE];
}
```

---

## Security Patterns (Observed)

| Aspect | Usage in Project |
|--------|-----------------|
| Sharing keywords | `public with sharing` on all production classes; `global` on App Builder utility |
| FLS / Record access | `WITH USER_MODE` in all SOQL (both static and dynamic) |
| Query security | Bind variables used exclusively — no string concatenation with user input |
| stripInaccessible | Not used |
| CRUD checks | Not explicit — relies on `with sharing` + `WITH USER_MODE` |

---

## Testing Patterns

**Test class naming:** Inconsistent — both `Test[ClassName]` prefix and `[ClassName]Test` suffix used.

**Test setup approach — using `@testSetup`:**

```apex
// From TestOrderController.cls
@testSetup
static void setup() {
    Account acc = new Account(Name = 'Sample Account');
    insert acc;

    Order__c order = new Order__c(Account__c = acc.Id);
    insert order;

    Product__c p = new Product__c(Name = 'Sample Product');
    insert p;

    Order_Item__c orderItem = new Order_Item__c(
        Order__c = order.Id,
        Product__c = p.Id
    );
    insert orderItem;
}
```

**Test data constants:**

```apex
// From TestProductController.cls
private static final String PRODUCT_NAME1 = 'Sample Bike 1';
private static final String PRODUCT_NAME2 = 'Sample Bike 2';
```

**Assertion style:** Modern `Assert` class (not legacy `System.assertEquals`):

```apex
Assert.areEqual(1, orderItems.size());
Assert.areEqual(PRODUCT_NAME1, ((Product__c) result.records[0]).Name);
Assert.isTrue(String.isEmpty(url));
```

**`SeeAllData` usage:** `CommunitiesLandingControllerTest` uses `@IsTest(SeeAllData=true)` — a legacy pattern inherited from the Salesforce-generated Communities controller template. Avoid in new tests.

**Direct DML in tests:** No test data factory — records are created inline in `@testSetup`. Minimal fields set (only required ones).

**Test method count:**

| Class | Methods |
|-------|---------|
| `TestOrderController` | 1 (`testGetOrderItems`) |
| `TestProductController` | 2 (`getProducts_works`, `getSimilarProducts_works`) |
| `CommunitiesLandingControllerTest` | 1 (`testCommunitiesLandingController`) |

---

## Async Patterns

**Batch jobs:** None  
**Queueables:** None  
**@future:** None  

All operations are synchronous. Real-time async communication uses Platform Events (`Manufacturing_Event__e`) consumed by the LWC EMP API — not Apex async.

---

## Key Notes for New Apex in This Project

1. **Always use `public with sharing`** — all production classes do this
2. **Add `WITH USER_MODE`** to all SOQL — project-wide pattern
3. **Use bind variables** in dynamic SOQL — never concatenate user input
4. **Use `@AuraEnabled(Cacheable=true)`** for read-only LWC wire methods
5. **Add `scope='global'`** on methods called from Experience Cloud components
6. **No service layer exists** — new code that fits the existing pattern goes directly in a controller; for complex logic, consider introducing a service but note it's a new pattern for this project
7. **Test classes**: prefer `Test` prefix to align with majority pattern (`TestOrderController`, `TestProductController`)
8. **Use `Assert.areEqual()`** — not `System.assertEquals()`
9. **No trigger framework** — if adding triggers, establish the pattern explicitly

---

*Analyzed from: 9 classes, 0 triggers*  
*Generated: 2026-04-24*  
*Source: `force-app/main/default/classes/**`*
