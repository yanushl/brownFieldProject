# LWC Code Review: productFilter

**Date:** 2026-04-24
**Reviewer:** Claude (lwc-reviewer skill)
**Total Score:** 17/25

---

## Score Summary

| Category                 | Score     | Rating     |
| ------------------------ | --------- | ---------- |
| Bundle Structure         | 4/5       | Good       |
| JS Code Quality          | 3/5       | Acceptable |
| Template & Accessibility | 3/5       | Acceptable |
| Performance              | 4/5       | Good       |
| Error Handling & UX      | 3/5       | Acceptable |
| **Total**                | **17/25** | **Good**   |

Rating scale: 1 = Critical issues, 2 = Needs work, 3 = Acceptable, 4 = Good, 5 = Excellent

---

## Bundle Structure (4/5)

**Files reviewed:**

- `productFilter.js` (113 lines)
- `productFilter.html` (119 lines)
- `productFilter.css` (8 lines)
- `productFilter.js-meta.xml`
- `__tests__/productFilter.test.js`
- `__tests__/productFilter.accessibility.test.js`
- `__tests__/data/getPicklistValues.json`

**Findings:**

| #   | Issue                                    | Severity | Details                                                                                                                                                                                                                       |
| --- | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Wire properties named as raw data fields | Low      | `categories`, `levels`, `materials`, `years` — naming conventions recommend `wiredCategories` etc. to signal they are wire results, not plain arrays. Pre-existing pattern; new `years` property follows the same convention. |
| 2   | All 4 wire calls live in the same file   | Low      | No separation concern yet — 113 lines is within the acceptable threshold. If more filters are added, consider a separate `filterConfig.js` service.                                                                           |

**Recommendations:**

- When adding a 5th filter, extract the picklist wire calls into a reusable service module to keep the class under 150 lines.

---

## JS Code Quality (3/5)

**Naming conventions check:** Partial (checked against references/lwc-naming-conventions.md)

**Findings:**

| #   | Issue                                         | Severity | Details                                                                                                                                                                                                                                             |
| --- | --------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hardcoded magic string for recordTypeId       | Medium   | `'012000000000000AAA'` appears 4 times in `productFilter.js` (lines 33, 39, 45, 51) — and now a 4th time for `YEAR_FIELD`. This is an unexplained magic string. Extract as a named constant: `const DEFAULT_RECORD_TYPE_ID = '012000000000000AAA';` |
| 2   | Wire property naming diverges from convention | Low      | Convention (`lwc-naming-conventions.md`): "Wire property names should describe the data: `wiredAccounts`, `wiredContactResult`". All 4 picklist wires use plain noun names (`categories`, `levels`, `materials`, `years`).                          |
| 3   | `handleCheckboxChange` does two things        | Low      | The method both mutates the filter array (lines 83–93) and publishes the LMS message (line 95). A private `_updateFilter` helper would separate concerns.                                                                                           |

**Recommendations:**

- Extract `const DEFAULT_RECORD_TYPE_ID = '012000000000000AAA';` as a module-level constant and reference it in all four `@wire` calls.
- Rename wire properties to `wiredCategories`, `wiredLevels`, `wiredMaterials`, `wiredYears` for convention alignment (requires template updates).

---

## Template & Accessibility (3/5)

**SLDS compliance:** Yes
**Semantic HTML:** Partial

**Findings:**

| #   | Issue                                        | Severity       | Details                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `<h1>` used for section labels inside a card | Medium         | `productFilter.html` lines 20, 46, 72, 95 all use `<h1>` for "Category", "Material", "Level", "Year". A page should have a single `<h1>`. These section labels inside a `lightning-card` should be `<h2>` or `<h2>` elements. Screen readers announce multiple `<h1>` as the same document level, which is confusing. |
| 2   | Year section follows consistent pattern      | Low (positive) | The new Year `<section>` (lines 94–116) is structurally identical to the existing Category/Material/Level sections — consistent spacing, error handling, and `data-filter` attributes.                                                                                                                                |

**Recommendations:**

- Change all four `<h1>` section labels to `<h2>` in `productFilter.html`. This is a pre-existing issue made more impactful now that there are 4 of them.

---

## Performance (4/5)

**Data fetching pattern:** Wire
**Listener cleanup:** N/A (no manual event listeners)

**Findings:**

| #   | Issue                                  | Severity       | Details                                                                                                                                                                       |
| --- | -------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Debounce correctly applied             | Low (positive) | `delayedFireFilterChangeEvent` clears the previous `setTimeout` before scheduling a new one (line 104–111). The 350ms `DELAY` constant is well-named and appropriately sized. |
| 2   | `lwc:if` used throughout               | Low (positive) | All template conditionals use the modern `lwc:if` directive (not deprecated `if:true`). The new Year section follows this correctly.                                          |
| 3   | Fourth `@wire(getPicklistValues)` call | Low            | Adding the `years` wire adds a 4th concurrent UI API request on component load. This is negligible at 4 wires but worth noting.                                               |

**Recommendations:**

- No immediate action required. Acceptable as-is.

---

## Error Handling & UX (3/5)

**Async error handling:** Complete (all 4 wires have error branches)
**UI states covered:** Error ✅ | Loading ✗ | Empty ✗

**Findings:**

| #   | Issue                                                  | Severity       | Details                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No loading state while picklist wires are pending      | Medium         | When `categories.data` and `categories.error` are both undefined (wire still in flight), the section renders empty with only the `<h1>` heading visible. A `lightning-spinner` or skeleton would improve perceived performance. Pre-existing issue; the new Year section inherits the same gap. |
| 2   | Error state handled for all 4 wires                    | Low (positive) | Each filter section has a `lwc:if={*.error}` branch rendering `c-error-panel`. The Year section correctly includes `errors={years.error}` and a friendly message.                                                                                                                               |
| 3   | Lazy-init guard can throw if any wire is still pending | Low            | `handleCheckboxChange` accesses `this.categories.data.values` without a null check (line 70). If a checkbox fires before all 4 wires resolve, this throws. Pre-existing issue; `years` wire adds a 4th potential failure point.                                                                 |

**Recommendations:**

- Add a null guard in the lazy-init block: `if (this.categories?.data && this.levels?.data && this.materials?.data && this.years?.data)` before accessing `.values`.
- Add a `<lightning-spinner>` alternative-name="Loading filters" inside each section when `!*.data && !*.error`.

---

## Top Priority Actions

1. **[JS Quality]** Extract `'012000000000000AAA'` as `const DEFAULT_RECORD_TYPE_ID` at module level — affects all 4 `@wire` calls, easy fix, eliminates the magic string.
2. **[Template & Accessibility]** Change all four `<h1>` section labels to `<h2>` — WCAG 2.1 violation (multiple `<h1>` on a page), one-line change per section.
3. **[Error Handling]** Add a null guard `if (this.categories?.data && ...)` in the lazy-init block of `handleCheckboxChange` to prevent a TypeError if a checkbox fires before all 4 picklist wires resolve.
