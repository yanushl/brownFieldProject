# Feature Specification: Add Year Field to Product Catalog

**Feature Branch**: `001-add-year-field`
**Created**: 2026-04-24
**Status**: Draft
**Input**: User description: "Add Year**c field to Product**c; display on product card LWC; add as filter in product catalog LWC; add to page layout; grant access via ebikes permission set."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Filter Products by Manufacturing Year (Priority: P1)

As a sales representative browsing the product catalog, I want to filter the list of
e-bikes by manufacturing year so that I can quickly surface only the models that are
relevant to a customer's preferences or budget cycle.

**Why this priority**: Filtering is the most direct business value of this feature —
it allows the sales rep to reduce the product set before presenting options. Without
it, the year field adds display value only. This is the core use case stated in the
user story.

**Independent Test**: Can be fully tested by opening the product catalog, selecting
one or more year values in the filter panel, and verifying that only products matching
those years are displayed. Delivers standalone value as a productivity tool for sales.

**Acceptance Scenarios**:

1. **Given** the product catalog is open with no filters applied, **When** a sales rep
   selects one or more manufacturing years from the Year filter, **Then** the product
   list refreshes to show all products matching the selected year(s) **plus** any
   products that have no Year value set.

2. **Given** a year filter is active, **When** the sales rep clears the year filter,
   **Then** all products are shown again regardless of year.

3. **Given** no products exist for a selected year, **When** the year filter is applied,
   **Then** an appropriate empty-state message is displayed (consistent with existing
   no-results behaviour).

4. **Given** multiple filter criteria are active (e.g., category + year), **When** the
   catalog reloads, **Then** only products matching ALL active filters are shown
   (AND logic, consistent with existing filter behaviour).

---

### User Story 2 — View Manufacturing Year on Product Card (Priority: P2)

As a sales representative viewing individual product tiles in the catalog, I want to
see the manufacturing year displayed on each product card so that I can present
model-year information to customers without opening a separate detail page.

**Why this priority**: Displaying the year on the tile is secondary to filtering — it
adds at-a-glance context but does not change the product selection workflow on its own.

**Independent Test**: Can be tested by opening the product catalog and verifying that
the year value is visible on each product card for products that have a year set.

**Acceptance Scenarios**:

1. **Given** a product has a manufacturing year set, **When** its tile is displayed in
   the catalog, **Then** the year value is shown on the card in a clearly labelled
   field.

2. **Given** a product has no manufacturing year set, **When** its tile is displayed,
   **Then** the year field area is either hidden or shows a neutral empty state (no
   broken layout).

---

### User Story 3 — View and Edit Year on Product Record Page (Priority: P3)

As an administrator or product manager, I want the manufacturing year to appear on the
Product record page so that I can view and edit it alongside other product attributes
without customising the page layout myself.

**Why this priority**: The record page is an admin/back-office concern. Sales reps
primarily use the Experience Cloud catalog; the record page is a support surface for
data entry and governance.

**Independent Test**: Can be tested by opening any Product record in Salesforce and
confirming the Year field is visible and editable in the standard page layout.

**Acceptance Scenarios**:

1. **Given** a Product record is open in Salesforce, **When** the standard page layout
   is rendered, **Then** the Year field is visible in an appropriate section.

2. **Given** a user with the `ebikes` permission set opens a Product record, **When**
   they edit the record, **Then** the Year field is editable and saves correctly.

3. **Given** a user without the `ebikes` permission set, **When** they view a Product
   record, **Then** they cannot see or edit the Year field (field-level security
   respected).

---

### Edge Cases

- What happens when a product's year value is removed after being set — does the
  filter option for that year disappear when no products match it? (Note: products
  with no Year always appear, so removal does not cause a product to be hidden.)
- When a Year filter is active, the result set includes both year-matched products
  and "no year" products — the UI should make this behaviour clear to the user.
- How does the year filter behave when all visible products share the same year —
  is a single-option filter still shown?
- What is the valid range of year values — are future years allowed? Years before
  a reasonable lower bound (e.g., 2000)?
- What happens if a large number of distinct year values accumulate over time —
  does the filter panel remain usable?

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The product data model MUST support storing a manufacturing year value
  for each product as a **Picklist field** with exactly 7 valid values: **2020, 2021,
  2022, 2023, 2024, 2025, 2026** — free-text entry is not permitted.

- **FR-002**: The product catalog filter panel MUST include a Year filter control
  that allows sales reps to select one or more year values to narrow results.

- **FR-003**: The product catalog MUST apply the Year filter in combination with all
  other active filters using AND logic — consistent with existing filter behaviour.
  Products with **no Year value set MUST always be included** in results regardless
  of which Year filter values are selected.

- **FR-004**: Each product card in the catalog MUST display the manufacturing year
  value when one is set for that product.

- **FR-005**: The Product record page layout MUST include the Year field so it is
  visible and editable by authorised users in Salesforce.

- **FR-006**: The `ebikes` permission set MUST grant both read and edit access to the
  Year field, so that all users with that permission set can view and update year
  values.

- **FR-007**: Users without the `ebikes` permission set MUST NOT have access to the
  Year field (field-level security enforcement).

- **FR-008**: The Year filter options displayed in the catalog MUST be driven by the
  defined set of valid year values — not derived dynamically from existing data — to
  ensure a consistent, predictable filter experience.

### Key Entities

- **Product** (`Product__c`): An individual e-bike model sold through the platform.
  Gains a new **Manufacturing Year** attribute representing the model year of the
  product. This attribute has a constrained set of valid values (specific years).

- **Product Filter** (catalog filter panel): The interactive panel that allows sales
  reps to narrow the product list. Gains a Year filter control alongside the existing
  Category, Level, and Material filters.

- **Product Card** (catalog tile): The visual summary of a product shown in the
  catalog grid. Gains a Year display element.

- **`ebikes` Permission Set**: The Salesforce access grant used by all eBikes app
  users. Must be updated to include read/edit access to the new Year field.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A sales rep can filter the product catalog by one or more manufacturing
  years and receive a correctly filtered result set within the same response time as
  existing filters (no perceptible degradation).

- **SC-002**: 100% of product cards in the catalog that have a year value set display
  that year — no products with a year are shown without it.

- **SC-003**: A user with the `ebikes` permission set can open any Product record,
  see the Year field, change its value, and save successfully — in a single
  uninterrupted interaction.

- **SC-004**: A user without the `ebikes` permission set cannot see or edit the Year
  field on any Product record or in any LWC component — confirmed by testing with a
  user that lacks the permission set.

- **SC-005**: The Year field appears on the Product page layout without requiring
  any manual admin configuration after deployment.

---

## Clarifications

### Session 2026-04-24

- Q: Should the Year field be a Picklist or a Number type? → A: **Picklist** — predefined set of year values; multi-select checkbox filter matching the existing Category/Level/Material pattern.
- Q: What year range should the Picklist cover? → A: **2020–2026** (7 values).
- Q: Should products without a Year value appear in results when a Year filter is active? → A: **Include** — products with no Year set always appear alongside filtered results regardless of which Year values are selected.

---

## Assumptions

- The Year field is a **Picklist** (not a Number) with exactly 7 values: **2020–2026**.
  This aligns with the existing pattern for Category, Level, and Material fields on
  `Product__c` and matches the multi-select checkbox filter pattern already used in
  the product catalog.

- The Year filter in the catalog will follow the same multi-select checkbox pattern
  used by Category, Level, and Material — no range slider or date-picker interaction
  is required in this iteration.

- Products without a manufacturing year set are valid and will **always appear** in
  the catalog — both when no Year filter is active and when one or more Year values
  are selected. The Year filter adds products matching the selected year(s) on top of
  the always-visible "no year" products.

- The feature is scoped to the product catalog Experience Cloud page and the standard
  Salesforce product record page. No other pages, reports, or list views require
  changes in this iteration.

- The `ebikes` permission set is the sole access vehicle — no profile-level FLS
  changes are needed.
