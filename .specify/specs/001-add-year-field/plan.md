# Implementation Plan: Add Year Field to Product Catalog

**Branch**: `001-add-year-field` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/001-add-year-field/spec.md`

---

## Summary

Add a `Year__c` Picklist field (values: 2020–2026) to `Product__c`. Wire it into the existing
`productFilter` LWC as a multi-select checkbox section (matching Category/Level/Material pattern)
and display it on the `productTile` LWC card. Extend `ProductController.getProducts` to filter
by year — products with no year always appear alongside year-matched products. Update the `ebikes`
permission set with read/edit FLS, and add `Year__c` to the `Product__c` page layout.

---

## Technical Context

**Language/Version**: Apex (Salesforce API 65.0), JavaScript ES2022 (LWC), XML (Metadata)
**Primary Dependencies**: `@salesforce/schema`, `lightning/uiObjectInfoApi` (`getPicklistValues`), `lightning/messageService` (LMS)
**Storage**: Salesforce Custom Object — `Product__c` (existing)
**Testing**: Jest (`@salesforce/sfdx-lwc-jest`) for LWC; Apex test classes with `Assert` API
**Target Platform**: Salesforce scratch org (Dev Hub required); Experience Cloud community page
**Performance Goals**: Year filter must not increase response time beyond the existing filter baseline (server-side SOQL with bind variables)
**Constraints**: API 65.0; `WITH USER_MODE` on all SOQL; `public with sharing`; bind variables only in dynamic SOQL
**Scale/Scope**: 7 picklist values; modifies 2 LWC components, 1 Apex class, 1 Apex test class, 1 field metadata file, 1 permission set, 1 page layout

---

## Constitution Check

| Principle               | Status  | Notes                                                                                                                                                                  |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Salesforce-First     | ✅ PASS | Native SF metadata (Picklist field), existing LWC components, existing Apex controller                                                                                 |
| II. Security by Default | ✅ PASS | `WITH USER_MODE` already in ProductController; FLS added to `ebikes` PS; `with sharing` preserved; bind variables used in dynamic SOQL                                 |
| III. Test Coverage      | ✅ PASS | New Jest tests for `productFilter` year checkbox + `productTile` year display; `TestProductController` updated for year filter logic                                   |
| IV. Consistency         | ✅ PASS | `Year__c` follows `Category__c` picklist field pattern; filter follows categories/levels/materials checkbox pattern; controller follows existing `Filters` DTO pattern |
| V. Simplicity           | ✅ PASS | No new components; no new Apex classes; no new LMS channels; extends existing patterns only                                                                            |

**Gate result: PASS — proceed to Phase 0**

---

## Project Structure

### Documentation (this feature)

```text
.specify/specs/001-add-year-field/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (created by /speckit-tasks)
```

### Source Code Changes

```text
force-app/main/default/
├── objects/
│   └── Product__c/
│       └── fields/
│           └── Year__c.field-meta.xml              [NEW]
├── permissionsets/
│   └── ebikes.permissionset-meta.xml               [MODIFIED — add Year__c FLS]
├── layouts/ (if managed in repo)
│   └── Product__c-Product Layout.layout-meta.xml   [MODIFIED — add Year__c to layout]
├── classes/
│   ├── ProductController.cls                       [MODIFIED — Filters DTO + SOQL]
│   └── TestProductController.cls                   [MODIFIED — year filter tests]
└── lwc/
    ├── productFilter/
    │   ├── productFilter.js                        [MODIFIED — @wire + handler]
    │   ├── productFilter.html                      [MODIFIED — Year section]
    │   └── __tests__/
    │       ├── productFilter.test.js               [MODIFIED — year checkbox tests]
    │       └── data/
    │           └── getPicklistValues.json          [MODIFIED — add year mock data]
    └── productTile/
        ├── productTile.js                          [MODIFIED — expose year from product]
        ├── productTile.html                        [MODIFIED — display year]
        └── __tests__/
            └── productTile.test.js                 [MODIFIED — year display test]
```

---

## Phase 0: Research

No external unknowns. All patterns are directly observable from the existing codebase.
Decisions are documented below.

### research.md findings

**Decision 1: Picklist field structure**

- Decision: Mirror `Category__c.field-meta.xml` exactly — `<restricted>true</restricted>`, inline `<valueSetDefinition>` with 7 `<value>` entries (2020–2026), `<required>false</required>`
- Rationale: Consistent metadata format; restricted picklist prevents invalid values
- Alternatives rejected: Global value set (unnecessary for a single-object field); Number type (rejected in clarification Q1)

**Decision 2: SOQL filter — "include no-year products"**

- Decision: When `years` filter is active, use `(Year__c IN :years OR Year__c = null)` combined with AND logic for all other active filters
- Rationale: Accepted in clarification Q3 — products with no year must always appear; the OR condition inside parentheses preserves correct AND combination with other criteria
- Alternatives rejected: Separate union query (complex, two Apex calls); client-side filter (bypasses server-side pagination)

**Decision 3: productFilter lazy-init pattern**

- Decision: Extend the existing `handleCheckboxChange` lazy-init block to initialise `this.filters.years` from `this.years.data.values` alongside categories/levels/materials
- Rationale: Exact match for the existing initialisation pattern — no architectural change
- Alternatives rejected: Eager initialisation (inconsistent with existing component behaviour)

**Decision 4: productTile year display**

- Decision: Add `year` as a new property extracted in the `set product()` setter; display with a `<p>` below the price line, guarded by `lwc:if={year}`
- Rationale: Matches the existing `name`/`msrp`/`pictureUrl` extraction pattern; conditional display handles products with no year cleanly
- Alternatives rejected: Adding a `@salesforce/schema` import directly to productTile (tile is a presentational component that receives data from its parent — it should not fetch its own data)

**Decision 5: Page layout**

- Decision: If `Product__c-Product Layout.layout-meta.xml` is not committed to the repo, add it. Place `Year__c` in the "Product Information" section alongside `Category__c`, `Level__c`, `Material__c`
- Rationale: Spec AC requires field visible on record page without manual admin steps post-deploy
- Note: Layout file was not found in the repo at plan time — file must be created

---

## Phase 1: Design & Contracts

### data-model.md

See [data-model.md](./data-model.md) (generated below).

### Contracts

No external API contracts — all communication is internal to the Salesforce org:

- LWC → Apex via `@wire(getProducts, ...)` (existing wire adapter, extended)
- productFilter → productTileList via `ProductsFiltered__c` LMS message (existing channel, extended with `years` array)

The `ProductsFiltered__c` LMS message payload gains a new optional `years` key:

```json
{
    "filters": {
        "searchKey": "...",
        "maxPrice": 10000,
        "categories": ["Mountain", "Commuter"],
        "levels": ["..."],
        "materials": ["..."],
        "years": ["2024", "2025"]
    }
}
```

### Implementation Details

#### 1. New Field: `Year__c` on `Product__c`

**File**: `force-app/main/default/objects/Product__c/fields/Year__c.field-meta.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Year__c</fullName>
    <externalId>false</externalId>
    <label>Year</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>true</sorted>
            <value><fullName>2020</fullName><default>false</default><label
                >2020</label></value>
            <value><fullName>2021</fullName><default>false</default><label
                >2021</label></value>
            <value><fullName>2022</fullName><default>false</default><label
                >2022</label></value>
            <value><fullName>2023</fullName><default>false</default><label
                >2023</label></value>
            <value><fullName>2024</fullName><default>false</default><label
                >2024</label></value>
            <value><fullName>2025</fullName><default>false</default><label
                >2025</label></value>
            <value><fullName>2026</fullName><default>false</default><label
                >2026</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>
```

#### 2. Permission Set: `ebikes`

**File**: `force-app/main/default/permissionsets/ebikes.permissionset-meta.xml`

Add the following `<fieldPermissions>` entry (alphabetically by field name, after existing `Product__c` fields):

```xml
<fieldPermissions>
    <editable>true</editable>
    <field>Product__c.Year__c</field>
    <readable>true</readable>
</fieldPermissions>
```

#### 3. Page Layout: `Product__c`

**File**: `force-app/main/default/layouts/Product__c-Product Layout.layout-meta.xml`

Create layout file (if absent) or add to the "Product Information" section:

```xml
<layoutItem>
    <behavior>Edit</behavior>
    <field>Year__c</field>
</layoutItem>
```

#### 4. Apex: `ProductController.cls`

**Changes:**

- Add `years` field to the `Filters` inner class
- Add year filter criteria to `getProducts` using `(Year__c IN :years OR Year__c = null)`
- Add `Year__c` to the `SELECT` field list in both static and dynamic queries in `getProducts`

```apex
// Add to Filters inner class:
@AuraEnabled
public String[] years { get; set; }

// Add to getProducts filter block (after materials filter):
if (filters.years != null) {
    years = filters.years;
    criteria.add('(Year__c IN :years OR Year__c = null)');
}

// Add Year__c to SELECT in getProducts dynamic SOQL:
'SELECT Id, Name, MSRP__c, Description__c, Category__c, Level__c,
 Picture_URL__c, Material__c, Year__c FROM Product__c '
```

> Note: `Year__c` does not need to be added to `getSimilarProducts` unless the product detail page needs to display it — out of scope for this feature.

#### 5. LWC: `productFilter`

**productFilter.js changes:**

- Import `YEAR_FIELD` from `@salesforce/schema/Product__c.Year__c`
- Add `@wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: YEAR_FIELD }) years;`
- Extend `handleCheckboxChange` lazy-init to include `this.filters.years = this.years.data.values.map(item => item.value);`

**productFilter.html changes:**

- Add a new `<section>` after the Level section following the identical checkbox pattern:

```html
<section>
    <h1>Year</h1>
    <template lwc:if="{years.data}">
        <template for:each="{years.data.values}" for:item="year">
            <lightning-input
                key="{year.value}"
                label="{year.label}"
                data-filter="years"
                data-value="{year.value}"
                type="checkbox"
                checked
                onchange="{handleCheckboxChange}"
            ></lightning-input>
        </template>
    </template>
    <template lwc:if="{years.error}">
        <c-error-panel
            type="inlineMessage"
            friendly-message="Error loading years"
            errors="{years.error}"
        ></c-error-panel>
    </template>
</section>
```

#### 6. LWC: `productTile`

**productTile.js changes:**

- Declare `year` property
- Extract `Year__c` in the `set product()` setter: `this.year = value.Year__c;`

**productTile.html changes:**

- Add below the price `<p>`:

```html
<template lwc:if="{year}">
    <p class="slds-align_absolute-center">Year: {year}</p>
</template>
```

#### 7. Apex Test: `TestProductController.cls`

- Set `Year__c` on test `Product__c` records in `@testSetup`
- Add test case: filter by year matching the test product — verify correct count returned
- Add test case: filter by year with `null`-year product in org — verify null-year product appears in results

#### 8. Jest Tests: `productFilter`

**`__tests__/data/getPicklistValues.json`**: Add a second mock entry for years (or extend the existing mock structure to support multiple field calls).

**`productFilter.test.js` additions:**

- Test: year checkboxes render when `getPicklistValues` wire is emitted for `Year__c`
- Test: unchecking a year checkbox publishes LMS message with correct `years` array
- Test: year filter error state renders `c-error-panel`

#### 9. Jest Tests: `productTile`

**`productTile.test.js` additions:**

- Test: year is displayed when `product.Year__c` is set
- Test: year section is absent when `product.Year__c` is null/undefined

---

## Complexity Tracking

No constitution violations. No complexity justification required.

---

## Deployment Sequence

1. Deploy `Year__c.field-meta.xml` (field must exist before permission set or layout references it)
2. Deploy `ebikes.permissionset-meta.xml` (FLS update)
3. Deploy `Product__c-Product Layout.layout-meta.xml` (page layout)
4. Deploy `ProductController.cls` + `TestProductController.cls` (Apex)
5. Deploy `productFilter` LWC (JS + HTML)
6. Deploy `productTile` LWC (JS + HTML)
7. Run Apex tests in scratch org
8. Run `npm test` for Jest unit tests
9. Manually assign `ebikes` permission set to test user and verify all 5 ACs

**One-shot command (after scratch org setup):**

```bash
sf deploy metadata --source-dir force-app --target-org <alias>
```
