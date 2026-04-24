# LWC Code Review: productTile

**Date:** 2026-04-24
**Reviewer:** Claude (lwc-reviewer skill)
**Total Score:** 19/25

---

## Score Summary

| Category                 | Score     | Rating     |
| ------------------------ | --------- | ---------- |
| Bundle Structure         | 5/5       | Excellent  |
| JS Code Quality          | 4/5       | Good       |
| Template & Accessibility | 3/5       | Acceptable |
| Performance              | 4/5       | Good       |
| Error Handling & UX      | 3/5       | Acceptable |
| **Total**                | **19/25** | **Good**   |

Rating scale: 1 = Critical issues, 2 = Needs work, 3 = Acceptable, 4 = Good, 5 = Excellent

---

## Bundle Structure (5/5)

**Files reviewed:**

- `productTile.js` (41 lines)
- `productTile.html` (29 lines)
- `productTile.css` (21 lines)
- `productTile.js-meta.xml`
- `__tests__/productTile.test.js`

**Findings:**

| #   | Issue                                         | Severity       | Details                                                                                                                                                                                                             |
| --- | --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Exemplary single-responsibility structure     | Low (positive) | JS is 41 lines, HTML is 29 lines. Single `@api product` setter, two event handlers, no wire calls. Textbook presentational component. The addition of `year` (lines 22, 29) fits cleanly without growing the class. |
| 2   | CSS uses custom values instead of SLDS tokens | Low            | `productTile.css`: `padding: 8px`, `border-radius: 0.25rem`, `height: 120px` use raw values. SLDS spacing tokens (`--lwc-spacingSmall`) and shape tokens exist. Pre-existing issue.                                 |

**Recommendations:**

- No structural changes needed. Consider replacing raw CSS values with SLDS design tokens in a future CSS cleanup.

---

## JS Code Quality (4/5)

**Naming conventions check:** Pass (checked against references/lwc-naming-conventions.md)

**Findings:**

| #   | Issue                                                 | Severity       | Details                                                                                                                                                                                                                                                      |
| --- | ----------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `_product` underscore prefix on private backing field | Low            | Convention states "Private reactive properties: no underscore prefix needed (LWC reactivity handles it)." The `_product` backing field (line 11) uses the underscore convention. This is harmless but inconsistent with the stated convention. Pre-existing. |
| 2   | `year` property correctly added                       | Low (positive) | `year` is camelCase (line 29), extracted from `value.Year__c` in the setter (line 22). Follows the exact pattern of `pictureUrl`, `name`, `msrp`.                                                                                                            |
| 3   | `handleClick` and `handleDragStart` follow convention | Low (positive) | Both use `handle*` prefix, verb-first, camelCase. Event detail is a primitive (`this.product.Id`) — convention recommends a plain object `{ detail: { id: ... } }`, but this is a pre-existing pattern.                                                      |

**Recommendations:**

- No immediate changes needed from our additions. In a future refactor, rename `_product` to `product` as the backing field and use a different name for the getter/setter.

---

## Template & Accessibility (3/5)

**SLDS compliance:** Yes
**Semantic HTML:** Partial

**Findings:**

| #   | Issue                                       | Severity       | Details                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `alt="Product picture"` is not descriptive  | Medium         | `productTile.html` line 8: the image alt text is a generic static string. Screen readers announce "Product picture" for every tile regardless of which bike is shown. Should be `alt={name}` to announce the product name. Pre-existing issue.                                          |
| 2   | `<a>` used without `href` as a click target | Medium         | Line 3: `<a onclick={handleClick}>` — an anchor without `href` is not keyboard-accessible by default (no `tabindex`, no Enter key activation in all browsers). Pre-existing issue. Consider `<button>` with SLDS reset styling or add `href="javascript:void(0)"` with `role="button"`. |
| 3   | Year display is conditional and null-safe   | Low (positive) | `<template lwc:if={year}>` (line 22) correctly hides the paragraph when Year is blank. Uses modern `lwc:if` directive.                                                                                                                                                                  |
| 4   | No ARIA label for year value                | Low            | `<p class="slds-align_absolute-center">Year: {year}</p>` — readable visually, but a screen reader-friendly pattern would use `<dt>Year</dt><dd>{year}</dd>` inside a `<dl>`. Minor improvement opportunity.                                                                             |

**Recommendations:**

- Change `alt="Product picture"` to `alt={name}` for descriptive image alt text (one character change, high accessibility impact).
- For the pre-existing `<a>` issue: add `tabindex="0"` and a `keydown` handler for Enter/Space to make the tile fully keyboard-accessible.

---

## Performance (4/5)

**Data fetching pattern:** N/A (presentational — no wire/Apex calls)
**Listener cleanup:** N/A (no manual listeners)

**Findings:**

| #   | Issue                                                  | Severity       | Details                                                                                                                                     |
| --- | ------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pure presentational component                          | Low (positive) | No wire calls, no imperative Apex, no `connectedCallback`. All data arrives via the `@api product` setter. Minimal render footprint.        |
| 2   | Setter runs synchronously with no expensive operations | Low (positive) | The `set product()` setter (lines 17–23) only assigns 4 primitive fields. The addition of `this.year = value.Year__c` adds negligible cost. |

**Recommendations:**

- No performance concerns. N/A — scored 4 as there are no async concerns to evaluate.

---

## Error Handling & UX (3/5)

**Async error handling:** N/A (no async operations)
**UI states covered:** N/A for loading/error; null handling partial

**Findings:**

| #   | Issue                                     | Severity       | Details                                                                                                                                                                                                                                                                               |
| --- | ----------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No null guard in `set product()` setter   | Medium         | If `product` is set to `null` or `undefined`, line 19 (`value.Picture_URL__c`) throws a TypeError. Pre-existing issue; our addition of `this.year = value.Year__c` (line 22) adds a 4th potential throw. A guard `if (!value) return;` at the start of the setter would prevent this. |
| 2   | Year display gracefully handles undefined | Low (positive) | `<template lwc:if={year}>` means `undefined`, `null`, and empty string all correctly suppress the Year paragraph.                                                                                                                                                                     |

**Recommendations:**

- Add `if (!value) return;` as the first line of `set product()` to prevent TypeErrors if the component is ever rendered without a product value.

---

## Top Priority Actions

1. **[Template & Accessibility]** Change `alt="Product picture"` to `alt={name}` — one attribute change, WCAG 2.1 Level A compliance fix, high impact for screen reader users.
2. **[Error Handling]** Add `if (!value) return;` guard at the top of `set product()` — prevents TypeError crash if the component mounts before product data arrives.
3. **[Template & Accessibility]** Add `tabindex="0"` and `onkeydown` handler to the `<a>` element for keyboard navigation (pre-existing, but impactful for accessibility compliance).
