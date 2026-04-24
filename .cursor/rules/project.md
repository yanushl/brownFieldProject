---
description: Project overview, goals, stakeholders, and technical context for the eBikes LWC application
alwaysApply: true
---

# Project Overview

## Project Name

**E-Bikes LWC** — A Salesforce Lightning Web Components sample application demonstrating B2B product catalog management, reseller order building, and real-time manufacturing status tracking on the Salesforce Platform.

---

## Problem Statement

Salesforce developers need concrete, real-world reference examples to learn Lightning Web Components, Experience Cloud, and modern Salesforce developer tooling. The eBikes app solves this by providing a fully working fictitious B2B e-commerce application — an electric bicycle manufacturer managing products and reseller orders — that showcases LWC patterns, Apex integration, Platform Events, LDS, and CI/CD pipelines in a single coherent codebase.

---

## Goals & Objectives

1. **Demonstrate LWC best practices** — Showcase wire service, Lightning Message Service (LMS), EMP API, drag-and-drop UI, and Lightning Data Service (LDS) patterns in a realistic application context
2. **Show Experience Cloud integration** — Provide a working Experience Cloud (Community) site accessible to resellers as guest/authenticated users
3. **Serve as a Trailhead learning resource** — Support the [Quick Start: Explore the E-Bikes Sample App](https://trailhead.salesforce.com/en/content/learn/projects/quick-start-ebikes-sample-app) Trailhead project
4. **Provide a modern developer tooling reference** — Demonstrate Prettier, ESLint, Husky pre-commit hooks, Jest unit tests, UTAM UI tests, and GitHub Actions CI/CD
5. **Demonstrate real-time platform integration** — Show how `Manufacturing_Event__e` Platform Events and EMP API enable live status updates without page refreshes
6. **Enable Pub Sub API / Change Data Capture demo** — Optional companion app ([ebikes-manufacturing](https://github.com/trailheadapps/ebikes-manufacturing)) demonstrates LWR + Pub Sub API integration

---

## Key Stakeholders

| Role | Team / Responsibility |
|------|-----------------------|
| **Project Owner / Maintainer** | Salesforce Trailhead Apps team — maintains the open-source repository at [trailheadapps/ebikes-lwc](https://github.com/trailheadapps/ebikes-lwc) |
| **Community Contributors** | External developers — submit bug fixes and feature PRs via fork; must sign Salesforce CLA |
| **Salesforce Developer Community** | Primary consumers of the sample app as a learning reference |

---

## Target Users

- **Primary**: Salesforce developers learning LWC, Experience Cloud, and Apex integration patterns
- **Secondary (fictitious)**: Resellers browsing the eBikes product catalog and placing orders through the Experience Cloud community portal

---

## Constraints & Assumptions

### Technical Constraints
- Requires Salesforce Platform (no standalone/off-platform deployment)
- API version: **65.0** (Winter '26)
- Node.js version: **22.18.0** (enforced via [Volta](https://volta.sh/))
- Scratch org requires **Dev Hub** with `Communities`, `Walkthroughs`, and `EnableSetPasswordInApi` features enabled
- Developer Edition / Trailhead Playground deployments require manual Experience Cloud setup steps
- Experience Cloud (Digital Experiences) must be enabled in the target org
- Pub Sub API demo requires the separate [ebikes-manufacturing](https://github.com/trailheadapps/ebikes-manufacturing) companion app

### Business Constraints
- License: **CC0-1.0** (public domain — free to use, modify, distribute)
- This is a **sample/demo app** — not intended for production deployment without modification
- Reseller discount (40% off MSRP) is hardcoded as a constant; a TODO in the code notes it should move to a custom field on `Account`

### Assumptions
- Developers have Salesforce CLI (`sf`) installed and a Dev Hub org available
- For Experience Cloud features, the org has Digital Experiences enabled
- The `ebikes` permission set must be assigned to users for full access
- Java 11+ required if using the Apex Prettier plugin for code formatting

---

## Success Criteria

- [x] LWC components render correctly in the E-Bikes app in Lightning Experience
- [x] Experience Cloud (E-Bikes Community) site is publishable and accessible
- [x] All Jest unit tests pass (`npm test`)
- [x] ESLint and Prettier checks pass (`npm run lint`, `npm run prettier:verify`)
- [x] Apex tests pass in scratch org with ≥75% coverage
- [x] GitHub Actions CI pipeline passes on push to `main`
- [ ] UTAM UI tests pass against a live org (manual/optional)

---

## Key Integrations

| System | Purpose |
|--------|---------|
| **Salesforce Experience Cloud** | Hosts the reseller-facing E-Bikes community portal |
| **Lightning Message Service (LMS)** | Decouples the `productFilter` panel from the `productTileList` via `ProductsFiltered__c` message channel |
| **EMP API / Platform Events** | `Manufacturing_Event__e` streams real-time order status updates to the `orderStatusPath` LWC |
| **Lightning Data Service (LDS)** | Used for all `Case` record CRUD and `Order_Item__c` create/update/delete without custom Apex |
| **Salesforce Apex** | `ProductController`, `OrderController`, `ProductRecordInfoController` provide server-side data for LWC wire adapters |
| **Pub Sub API + ebikes-manufacturing** | Optional companion LWR app demonstrating Change Data Capture and Pub Sub API (separate repo) |
| **Codecov** | Code coverage reporting for both LWC (Jest) and Apex tests via GitHub Actions |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI Framework** | Lightning Web Components (LWC) |
| **Backend** | Salesforce Apex (`with sharing`) |
| **Data** | Custom objects: `Product__c`, `Product_Family__c`, `Order__c`, `Order_Item__c`, `Manufacturing_Event__e` |
| **Community** | Salesforce Experience Cloud (Digital Experiences) |
| **Unit Testing** | Jest + `@salesforce/sfdx-lwc-jest` |
| **UI Testing** | UTAM + WebdriverIO |
| **Linting** | ESLint (`@salesforce/eslint-config-lwc`) |
| **Formatting** | Prettier + `prettier-plugin-apex` |
| **Pre-commit** | Husky + lint-staged |
| **CI/CD** | GitHub Actions (format → lint → Jest → scratch org → Apex tests) |
| **Package Manager** | npm (Node 22.18.0 via Volta) |
| **SF API Version** | 65.0 (Winter '26) |

---

## Repository

- **GitHub**: [https://github.com/trailheadapps/ebikes-lwc](https://github.com/trailheadapps/ebikes-lwc)
- **Trailhead**: [Quick Start: Explore the E-Bikes Sample App](https://trailhead.salesforce.com/en/content/learn/projects/quick-start-ebikes-sample-app)
- **Companion App**: [https://github.com/trailheadapps/ebikes-manufacturing](https://github.com/trailheadapps/ebikes-manufacturing)
- **Branch strategy**: `main` is the single production branch; topic branches squash-merged via PR
- **Contribution**: External PRs via fork; Salesforce CLA required

---

*Sources: README.md, package.json, sfdx-project.json, config/project-scratch-def.json, .github/workflows/ci.yml, CONTRIBUTION.md, codebase analysis*  
*Generated: 2026-04-24*
