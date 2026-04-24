<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 (template) → 1.0.0 (initial ratification)
Added sections:
  - Core Principles (I–V)
  - Salesforce Platform Constraints
  - Development Workflow & Quality Gates
  - Governance
Templates requiring updates:
  ✅ constitution.md — written from template
  ⚠  .specify/templates/plan-template.md — review for Salesforce-specific references
  ⚠  .specify/templates/spec-template.md — review for SF metadata / LWC sections
  ⚠  .specify/templates/tasks-template.md — review for Apex test task category
Follow-up TODOs: none — all placeholders resolved
-->

# eBikes LWC Constitution

## Core Principles

### I. Salesforce-First Architecture (NON-NEGOTIABLE)

All features MUST be implemented using native Salesforce platform capabilities.
Lightning Web Components (LWC) for UI, Apex (`public with sharing`) for server-side
logic, and standard Salesforce metadata types (custom objects, fields, permission sets,
page layouts) for configuration. No external frameworks, no off-platform backends.

**Rationale**: The project is a Salesforce reference application. Every design decision
must be demonstrable and reproducible within a standard Salesforce scratch org.

### II. Security by Default (NON-NEGOTIABLE)

Every piece of code MUST enforce Salesforce security at all layers:

- All production Apex classes MUST declare `public with sharing`.
- All SOQL (static and dynamic) MUST include `WITH USER_MODE`.
- Dynamic SOQL MUST use bind variables exclusively — string concatenation with
  user-supplied input is forbidden.
- New fields and objects MUST have FLS configured in the `ebikes` permission set
  before any LWC references them.
- Experience Cloud–exposed Apex methods MUST include `scope='global'` on
  `@AuraEnabled` annotations.

**Rationale**: The app runs in multi-user orgs (including Experience Cloud guest/auth
contexts). Sharing violations or FLS bypasses are not acceptable even in a demo app
that may be adapted for production use.

### III. Test Coverage is Non-Negotiable

All new Apex MUST have a corresponding test class achieving ≥75% line coverage
(Salesforce minimum). New LWC components MUST have a Jest unit test file.

- Apex test classes MUST use the `Test` prefix naming convention (e.g., `TestProductController`).
- Test setup MUST use `@testSetup` for shared data; direct DML in setup is acceptable.
- Assertions MUST use the modern `Assert` class (`Assert.areEqual`, `Assert.isTrue`) —
  `System.assertEquals` is forbidden in new code.
- `@IsTest(SeeAllData=true)` MUST NOT be used in new test classes.
- Jest tests MUST mock all `@wire` adapters and Apex imports.

**Rationale**: Untested code blocks scratch org deployment and CI pipeline.

### IV. Consistency with Existing Patterns

New code MUST follow the conventions already established in the codebase:

- **Apex**: Static `@AuraEnabled` methods on controller classes; inner class DTOs
  for complex inputs; `PagedResult` wrapper for paginated data.
- **LWC**: Wire service for data fetching; Lightning Message Service (LMS) for
  cross-component communication on the same page; `@salesforce/schema` imports
  for field/object references.
- **Metadata**: `__c` suffix for all custom fields/objects; camelCase API names
  (e.g., `Year__c`, not `year__c`); new fields added to `Product__c` page layout
  and the `ebikes` permission set.
- **Naming**: Controllers named `[Object]Controller`; test classes named
  `Test[ClassName]`.

**Rationale**: Consistency reduces cognitive load for learners using this app as a
reference and prevents conflicting patterns that confuse contributors.

### V. Simplicity Over Engineering (YAGNI)

Introduce complexity only when required by the acceptance criteria:

- No service layer unless business logic cannot fit cleanly in a controller.
- No trigger framework unless triggers are required.
- No third-party npm packages unless native LWC cannot accomplish the goal.
- LWC components MUST be single-responsibility; split large components into
  smaller child components rather than adding conditional logic.

**Rationale**: This is a sample app. Learners MUST be able to understand each
component in isolation. Over-engineering obscures the learning intent.

---

## Salesforce Platform Constraints

| Constraint                       | Value                                             |
| -------------------------------- | ------------------------------------------------- |
| Salesforce API version           | **65.0** (Winter '26)                             |
| Node.js version                  | **22.18.0** (via Volta)                           |
| Scratch org features required    | Communities, Walkthroughs, EnableSetPasswordInApi |
| Permission set granting access   | `ebikes`                                          |
| Experience Cloud                 | MUST be enabled for community features            |
| Page size (product catalog)      | Fixed at **9 products per page**                  |
| LMS channel for filter events    | `ProductsFiltered__c`                             |
| Platform Event for manufacturing | `Manufacturing_Event__e`                          |

New metadata deployed to scratch org MUST pass `sf deploy metadata --dry-run`
before being committed.

---

## Development Workflow & Quality Gates

All changes MUST pass the following gates before merging to `main`:

1. **Formatting**: `npm run prettier:verify` — no unformatted files.
2. **Linting**: `npm run lint` — zero ESLint errors.
3. **Jest tests**: `npm test` — all unit tests pass.
4. **Scratch org deploy**: `sf deploy metadata` — no deployment errors.
5. **Apex tests**: All Apex test classes pass with ≥75% coverage in scratch org.
6. **GitHub Actions CI**: Full pipeline green on push.

Pre-commit hooks (Husky + lint-staged) enforce formatting and lint locally.
Bypassing hooks (`--no-verify`) is forbidden on feature branches.

**Branch strategy**: Feature branches off `main`; squash-merge via PR.
Every PR MUST reference the user story or issue it addresses.

---

## Governance

This constitution supersedes all other development guidance for the eBikes LWC project.
In cases of conflict between a `.cursor/rules/*.md` file and this constitution,
this constitution takes precedence.

**Amendment procedure**:

1. Propose change in a PR with rationale.
2. Increment `CONSTITUTION_VERSION` per semantic versioning:
    - MAJOR: principle removal or redefinition.
    - MINOR: new principle or section added.
    - PATCH: wording clarification or typo fix.
3. Update `LAST_AMENDED_DATE` to the amendment date (ISO 8601).
4. Update dependent templates if the amendment affects spec, plan, or task structure.

**Compliance**: All PRs are reviewed against this constitution.
Reviewers MUST flag any violation of Principles I–III as a blocking issue.
Violations of Principles IV–V are advisory unless they contradict I–III.

**Runtime guidance**: See `.cursor/rules/` for detailed patterns extracted from
the existing codebase (apex.md, lwc.md, security.md, data-model.md, business.md).

---

**Version**: 1.0.0 | **Ratified**: 2026-04-24 | **Last Amended**: 2026-04-24
