# Data Model: Add Year Field to Product Catalog

**Feature**: 001-add-year-field
**Date**: 2026-04-24

---

## Changes to Existing Entities

### Product**c — New Field: `Year**c`

| Attribute     | Value                                |
| ------------- | ------------------------------------ |
| API Name      | `Year__c`                            |
| Label         | Year                                 |
| Type          | Picklist                             |
| Required      | false                                |
| Restricted    | true (no custom values allowed)      |
| Default Value | (none)                               |
| Indexed       | No (picklist fields are not indexed) |

**Valid Values (2020–2026)**:

| API Value | Label |
| --------- | ----- |
| `2020`    | 2020  |
| `2021`    | 2021  |
| `2022`    | 2022  |
| `2023`    | 2023  |
| `2024`    | 2024  |
| `2025`    | 2025  |
| `2026`    | 2026  |

**Null behaviour**: Null is a valid state — products without a manufacturing year
will continue to be displayed in the catalog. When the Year filter is active,
null-year products are always included in results.

---

## Updated ERD (Product\_\_c excerpt)

```
Product__c {
    Text       Name
    Lookup     Product_Family__c
    Currency   MSRP__c
    LongText   Description__c
    Picklist   Category__c
    Picklist   Level__c
    Picklist   Material__c
    URL        Picture_URL__c
    Picklist   Year__c          ← NEW
    Text       Motor__c
    Text       Battery__c
    Text       Charger__c
    Text       Fork__c
    Text       Front_Brakes__c
    Text       Rear_Brakes__c
    Picklist   Frame_Color__c
    Picklist   Handlebar_Color__c
    Picklist   Seat_Color__c
    Picklist   Waterbottle_Color__c
}
```

---

## Access Control Changes

### `ebikes` Permission Set

| Field                | Readable | Editable |
| -------------------- | -------- | -------- |
| `Product__c.Year__c` | ✅ true  | ✅ true  |

All users assigned the `ebikes` permission set gain read and edit access.
Users without this permission set cannot see or modify `Year__c`.

---

## Filter Logic Change (ProductController)

The `Filters` DTO in `ProductController.cls` gains a new `years` field:

| Field   | Type       | Filter Logic                                                                 |
| ------- | ---------- | ---------------------------------------------------------------------------- |
| `years` | `String[]` | `(Year__c IN :years OR Year__c = null)` — null-year products always included |

The OR condition is wrapped in parentheses to ensure correct precedence when
combined with AND-joined criteria from other active filters.

---

## LMS Message Schema Change

The `ProductsFiltered__c` LMS message payload `filters` object gains an
optional `years` key:

```json
{
    "filters": {
        "searchKey": "",
        "maxPrice": 10000,
        "categories": ["Mountain"],
        "levels": ["Beginner"],
        "materials": ["Aluminium"],
        "years": ["2024", "2025"]
    }
}
```

`years` is omitted when no year filter is active (lazy-init pattern, matching
`categories`/`levels`/`materials`).
