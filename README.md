# eBikes LWC — Brownfield Project

A Salesforce Lightning Web Components application for managing e-bike products and reseller orders. Built on the [ebikes-lwc](https://github.com/trailheadapps/ebikes-lwc) sample app, extended with custom features developed using a spec-driven workflow.

---

## Features

- **Product Catalog** — browse, filter, and search products via an Experience Cloud storefront
- **Year Filter** — filter products by manufacturing year (2020–2026); null-year products always appear in results
- **Product Tiles** — each tile displays name, price, and manufacturing year
- **Order Builder** — drag-and-drop products to build and submit reseller orders
- **Similar Products** — product detail page shows related bikes from the same family

---

## Tech Stack

- Salesforce Lightning Web Components (LWC)
- Apex (`with sharing`, `USER_MODE` SOQL)
- Lightning Message Service (LMS)
- Experience Cloud (Digital Experiences)
- Jest for LWC unit tests
- Salesforce CLI (`sf`) for org management and deployment

---

## Quick Start (Scratch Org)

```bash
# 1. Authorize your Dev Hub
sf org login web -d -a myhuborg

# 2. Clone the repo
git clone https://github.com/yanushl/brownFieldProject
cd brownFieldProject

# 3. Create a scratch org
sf org create scratch -d -f config/project-scratch-def.json -a ebikes

# 4. Deploy metadata
sf project deploy start

# 5. Assign permission set
sf org assign permset -n ebikes

# 6. Import sample data
sf data tree import -p ./data/sample-data-plan.json

# 7. Publish the Experience Cloud site
sf community publish -n E-Bikes

# 8. Open the org
sf org open
```

In **Setup → Themes and Branding**, activate the **Lightning Lite** theme, then open the **E-Bikes** app in App Launcher.

---

## Development

### Install dependencies

```bash
npm install
```

### Run LWC unit tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run prettier
```

A pre-commit hook (Husky + lint-staged) automatically runs Prettier, ESLint, and Jest on every commit.

---

## Project Structure

```
force-app/main/default/
├── classes/          # Apex controllers and test classes
├── lwc/              # Lightning Web Components
│   ├── productFilter/    # Filter panel (category, level, material, year)
│   ├── productTile/      # Product card tile
│   ├── productTileList/  # Product grid
│   ├── productCard/      # Product detail card
│   └── orderBuilder/     # Drag-and-drop order builder
├── objects/          # Custom objects and fields (Product__c, Order__c, …)
├── permissionsets/   # ebikes permission set
└── layouts/          # Page layouts
```

---

## Key Custom Metadata

| Item                  | Type                 | Purpose                                        |
| --------------------- | -------------------- | ---------------------------------------------- |
| `Product__c`          | Custom Object        | Product catalog                                |
| `Product__c.Year__c`  | Picklist (2020–2026) | Manufacturing year filter                      |
| `Order__c`            | Custom Object        | Reseller order                                 |
| `ProductsFiltered__c` | LMS Message Channel  | Filter → product list communication            |
| `ebikes`              | Permission Set       | Grants access to all custom objects and fields |
