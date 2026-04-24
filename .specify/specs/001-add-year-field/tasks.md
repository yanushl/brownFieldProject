# Tasks: Add Year Field to Product Catalog

**Input**: Design documents from `.specify/specs/001-add-year-field/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | data-model.md ✅ | quickstart.md ✅

**Branch**: `001-add-year-field`
**Total tasks**: 17
**User stories**: 3 (P1: Filter, P2: Card Display, P3: Record Page)

---

## Phase 1: Setup

**Purpose**: Confirm environment is ready — no new files needed here.

- [x] T001 Verify scratch org is created and `sf deploy metadata --dry-run` passes from branch `001-add-year-field`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Salesforce metadata that ALL three user stories depend on. MUST be complete before any story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Create `Year__c` Picklist field (values 2020–2026, restricted, not required) in `force-app/main/default/objects/Product__c/fields/Year__c.field-meta.xml`
- [x] T003 [P] Add `Product__c.Year__c` FLS (readable + editable) to `force-app/main/default/permissionsets/ebikes.permissionset-meta.xml`

**Checkpoint**: Deploy field + permission set to scratch org — `sf deploy metadata --source-dir force-app/main/default/objects/Product__c/fields/Year__c.field-meta.xml` and PS. Confirm field exists on Product\_\_c and is accessible to `ebikes` PS user.

---

## Phase 3: User Story 1 — Filter Products by Year (Priority: P1) 🎯 MVP

**Goal**: Sales rep can select one or more year values in the product catalog filter panel and receive filtered results. Products with no Year value always appear.

**Independent Test**: Open product catalog community page → Year checkbox section appears → select year(s) → product list updates correctly, null-year products always visible.

### Implementation for User Story 1

- [x] T004 [P] Add `years` field (`String[]`, `@AuraEnabled`) to the `Filters` inner class in `force-app/main/default/classes/ProductController.cls`
- [x] T005 [P] Add `Year__c` to the `SELECT` field list in `getProducts` dynamic SOQL in `force-app/main/default/classes/ProductController.cls`
- [x] T006 [P] Add year mock data entry to `force-app/main/default/lwc/productFilter/__tests__/data/getPicklistValues.json` (values: 2020–2026)
- [x] T007 Add year filter criteria `(Year__c IN :years OR Year__c = null)` to the dynamic WHERE clause builder in `getProducts` in `force-app/main/default/classes/ProductController.cls` (depends on T004, T005)
- [x] T008 [P] [US1] Import `YEAR_FIELD` from `@salesforce/schema/Product__c.Year__c`, add `@wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: YEAR_FIELD }) years` wire property in `force-app/main/default/lwc/productFilter/productFilter.js`
- [x] T009 [US1] Extend `handleCheckboxChange` lazy-init block to initialise `this.filters.years` from `this.years.data.values` (alongside categories/levels/materials) in `force-app/main/default/lwc/productFilter/productFilter.js` (depends on T008)
- [x] T010 [US1] Add Year `<section>` with multi-select checkboxes (matching Category/Level/Material pattern) to `force-app/main/default/lwc/productFilter/productFilter.html` (depends on T009)
- [x] T011 [US1] Update `force-app/main/default/lwc/productFilter/__tests__/productFilter.test.js` — add tests: (a) year checkboxes render when wire emits years data, (b) unchecking a year publishes correct LMS `years` array, (c) year error state renders `c-error-panel` (depends on T006, T009, T010)
- [x] T012 [US1] Update `force-app/main/default/classes/TestProductController.cls` — set `Year__c` on test `Product__c` records in `@testSetup`; add test: filter by year returns matching product; add test: filter by year still returns product with null `Year__c` (depends on T004, T007)

**Checkpoint**: Run `npm test` (productFilter tests pass) and `sf apex run test --class-names TestProductController` (year filter tests pass). Open community catalog and verify Year filter section works end-to-end.

---

## Phase 4: User Story 2 — View Year on Product Card (Priority: P2)

**Goal**: Each product tile in the catalog displays the manufacturing year when one is set. Tiles for products without a year show no broken layout.

**Independent Test**: Set `Year__c = 2024` on a product record → open catalog → tile shows "Year: 2024". Set `Year__c` to blank → tile shows no year field.

### Implementation for User Story 2

- [x] T013 [P] [US2] Add `year` property and extract `this.year = value.Year__c` in the `set product()` setter in `force-app/main/default/lwc/productTile/productTile.js` (depends on T005 — Year\_\_c must be in SOQL SELECT)
- [x] T014 [US2] Add `<template lwc:if={year}><p class="slds-align_absolute-center">Year: {year}</p></template>` below the price `<p>` in `force-app/main/default/lwc/productTile/productTile.html` (depends on T013)
- [x] T015 [US2] Update `force-app/main/default/lwc/productTile/__tests__/productTile.test.js` — add tests: (a) year label renders when `product.Year__c` is set, (b) year element absent when `product.Year__c` is null (depends on T013, T014)

**Checkpoint**: Run `npm test` (productTile tests pass). Open catalog, confirm year displays on product cards where set and is absent where not set.

---

## Phase 5: User Story 3 — View and Edit Year on Record Page (Priority: P3)

**Goal**: `Year__c` field is visible and editable on the standard `Product__c` page layout. Requires no manual admin configuration after deployment.

**Independent Test**: Deploy layout → open any Product record → Year field visible in Product Information section → edit and save a year value successfully.

### Implementation for User Story 3

- [x] T016 [US3] Create `force-app/main/default/layouts/Product__c-Product Layout.layout-meta.xml` — add `Year__c` field in the "Product Information" layout section with `<behavior>Edit</behavior>` (depends on T002)

**Checkpoint**: Deploy layout → open Product record → Year field present and editable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, code quality gates, and deployment validation.

- [x] T017 [P] Run `npm run lint` and fix any ESLint errors in modified LWC files (`productFilter.js`, `productFilter.html`, `productTile.js`, `productTile.html`)
- [x] T017a [P] Run `npm run prettier:verify` and format any files that fail in modified LWC and Apex files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1 — Filter)**: Depends on Phase 2 complete
- **Phase 4 (US2 — Card)**: Depends on Phase 2 complete + T005 complete (Year\_\_c in SOQL)
- **Phase 5 (US3 — Layout)**: Depends on T002 complete (field must exist before layout references it)
- **Phase 6 (Polish)**: Depends on all desired story phases complete

### Within Phase 3

```
T004 ──┐
T005 ──┼── T007 ── (SOQL ready)
       │
T006 ──┘

T008 ── T009 ── T010 ── T011

T004 + T007 ── T012
```

### Within Phase 4

```
T005 (complete from Phase 3) ── T013 ── T014 ── T015
```

### Parallel Opportunities

**Phase 2**: T002 and T003 can run in parallel (different files)

**Phase 3 start** (after Phase 2): T004, T005, T006, T008 can all start in parallel (different files)

**Phase 3 + Phase 4 overlap** (after T005 complete): T013 (US2) can start while T007/T009/T010 (US1) are still in progress

**Phase 5**: T016 can start as soon as T002 is deployed (layout needs field to exist)

---

## Parallel Execution Example: Phase 3

```
# Start these simultaneously after Phase 2 completes:
Task: T004 — Add `years` to ProductController.Filters DTO
Task: T005 — Add Year__c to SELECT in getProducts
Task: T006 — Add year mock data to getPicklistValues.json
Task: T008 — Add YEAR_FIELD wire to productFilter.js

# Then continue:
Task: T007 — Add year WHERE clause (after T004 + T005)
Task: T009 — Extend lazy-init in productFilter.js (after T008)

# Then:
Task: T010 — Add Year section to productFilter.html (after T009)
Task: T011 — productFilter tests (after T006 + T010)
Task: T012 — TestProductController year tests (after T007)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Field + Permission Set
3. ✅ Complete Phase 3: Year filter in product catalog
4. **STOP and VALIDATE**: Run tests, open community catalog, verify Year filter works
5. Deploy Phase 3 increment if approved

### Incremental Delivery

1. Phase 1 + 2 → Foundation deployed
2.  - Phase 3 (US1) → Year filter works → **MVP demo-able**
3.  - Phase 4 (US2) → Year shows on product cards
4.  - Phase 5 (US3) → Year editable on record page
5.  - Phase 6 → Quality gates pass → ready for PR

### Single-Developer Sequence

```
T001 → T002/T003 → T004/T005/T006/T008 → T007/T009 → T010/T013 → T011/T014/T015/T016 → T012 → T017/T017a
```

---

## Notes

- `[P]` = different files, no blocking dependency — safe to parallelise
- `[US1/2/3]` = maps task to the user story it delivers
- All Apex changes must maintain `WITH USER_MODE` in SOQL and `public with sharing` on the class
- The `(Year__c IN :years OR Year__c = null)` criterion MUST be wrapped in parentheses to avoid AND precedence issues
- productTile is a **presentational component** — it must NOT fetch its own data; it reads `Year__c` from the product object passed down by productTileList (which calls `getProducts`)
- Commit after each phase checkpoint at minimum
