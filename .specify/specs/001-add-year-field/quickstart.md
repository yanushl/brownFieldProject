# Quickstart: Add Year Field to Product Catalog

**Feature**: 001-add-year-field | **Branch**: `001-add-year-field`

---

## Prerequisites

- Salesforce CLI (`sf`) installed and authenticated to a Dev Hub org
- Node.js 22.18.0 (via Volta) — run `node --version` to verify
- npm dependencies installed — `npm install`

---

## Deploy & Test (Scratch Org)

### 1. Create scratch org

```bash
sf org create scratch \
  --definition-file config/project-scratch-def.json \
  --alias ebikes-year \
  --duration-days 7 \
  --set-default
```

### 2. Deploy all metadata

```bash
sf deploy metadata --source-dir force-app --target-org ebikes-year
```

### 3. Import sample data

```bash
sf apex run --file scripts/apex/ecobikes-sample-data.apex --target-org ebikes-year
```

### 4. Assign permission set

```bash
sf org assign permset --name ebikes --target-org ebikes-year
```

### 5. Open org and verify

```bash
sf org open --target-org ebikes-year
```

**Manual checks:**

- Open any `Product__c` record → Year field is visible and editable
- Open the E-Bikes Experience Cloud community → Product catalog shows Year checkboxes
- Select a year → only matching products + products with no year appear
- Open a product tile → Year is displayed on the card (if set)

---

## Run Tests

### Jest (LWC unit tests)

```bash
npm test
```

Expected: all tests pass, including new year-related tests in
`productFilter.test.js` and `productTile.test.js`.

### Apex tests

```bash
sf apex run test \
  --class-names TestProductController \
  --target-org ebikes-year \
  --result-format human \
  --synchronous
```

Expected: all methods pass, ≥75% coverage on `ProductController`.

### Lint & Format

```bash
npm run lint
npm run prettier:verify
```

---

## Acceptance Criteria Verification

| AC                                     | How to Verify                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Year__c` field exists on `Product__c` | `sf sobject describe --sobject Product__c --target-org ebikes-year` — confirm `Year__c` in fields list |
| Year filter in catalog LWC             | Open community catalog → Year checkbox section visible                                                 |
| Year on product card                   | Set Year on a product record → open catalog → tile shows year                                          |
| Year on page layout                    | Open any Product record → Year field visible                                                           |
| `ebikes` PS grants read/edit           | Assign PS to a user → confirm field visible and editable                                               |
