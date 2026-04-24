---
name: sf-init-data-model
description: Analyze Salesforce data model from metadata, documentation, or org. Generates data-model.md documenting objects, fields, relationships, validation rules, and automation. Supports sf CLI, Schema Builder screenshots, or external documentation links.
---

# Data Model Initializer

## Purpose

Analyze and document the Salesforce data model to provide AI agents with understanding of:
- Custom and standard objects in use
- Field definitions and data types
- Relationships between objects
- Business rules (validation, automation)
- Security model (FLS, sharing)

## Output

Creates `data-model.md` in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/data-model.md` | `globs: ["**/*.object-meta.xml", "**/*.field-meta.xml"]`<br>`alwaysApply: false` |
| **Claude Code** | `.claude/rules/data-model.md` | `paths: ["**/*.object-meta.xml", "**/*.field-meta.xml"]` |
| **Copilot** | `.github/instructions/data-model.instructions.md` | `applyTo: "**/*.object-meta.xml,**/*.field-meta.xml"` |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Data Model`) |

---

## Input Options

### Option 1: Project Metadata (Preferred)

Analyze existing `force-app/**/objects/` directory:

```
force-app/
└── main/default/objects/
    ├── Account/
    │   ├── fields/
    │   ├── recordTypes/
    │   └── validationRules/
    ├── CustomObject__c/
    │   ├── CustomObject__c.object-meta.xml
    │   ├── fields/
    │   └── ...
```

### Option 2: Documentation Links

User provides URLs to data model documentation:

```
Sources:
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/123/Data+Model
- ERD Diagram: https://lucidchart.com/documents/xxx
- Schema Builder: [screenshot]
```

### Option 3: Org Retrieval (sf CLI)

```bash
# Retrieve all custom objects
sf project retrieve start --metadata CustomObject

# Retrieve specific objects
sf project retrieve start --metadata "CustomObject:KYC_Screening_Case__c"
```

---

## Retrieval Methods

### Method 1: Local Metadata Analysis

```
1. Glob: force-app/**/objects/**/*.object-meta.xml
2. Glob: force-app/**/objects/**/fields/*.field-meta.xml
3. Parse XML to extract:
   - Object definitions
   - Field metadata
   - Relationships
   - Validation rules
```

### Method 2: MCP - Salesforce Org

If MCP connector available:

```
Use MCP: salesforce
Actions:
- Describe sObject (get object metadata)
- Describe field (get field details)
- Query relationships
```

### Method 3: Chrome DevTools / Playwright

For Schema Builder or documentation:

```
Use MCP: chrome-devtools
Steps:
1. Navigate to Setup > Schema Builder or doc URL
2. Take screenshot for visual ERD
3. Extract text content for field lists
```

### Method 4: sf CLI

```bash
# List all objects
sf sobject list --sobject-type custom

# Describe specific object
sf sobject describe --sobject-name CustomObject__c --json

# Export schema
sf data export tree --query "SELECT ... FROM EntityDefinition"
```

---

## What to Analyze

### Core Elements

| Element | Source | Priority |
|---------|--------|----------|
| **Custom Objects** | `*.object-meta.xml` | High |
| **Custom Fields** | `fields/*.field-meta.xml` | High |
| **Relationships** | Lookup/MD field definitions | High |
| **Record Types** | `recordTypes/*.recordType-meta.xml` | Medium |
| **Validation Rules** | `validationRules/*.validationRule-meta.xml` | Medium |
| **Formula Fields** | Field type = Formula | Medium |
| **Rollup Summary** | Field type = Summary | Medium |

### Extended Elements

| Element | Source | Priority |
|---------|--------|----------|
| **Field Dependencies** | `*.object-meta.xml` | Low |
| **Picklist Values** | `fields/*.field-meta.xml` | Low |
| **Triggers** | `triggers/*.trigger-meta.xml` | Low |
| **Flows on Object** | `flows/*.flow-meta.xml` | Low |
| **Field History** | Object settings | Low |
| **Sharing Rules** | `sharingRules/` | Low |

### Security Elements

| Element | Description |
|---------|-------------|
| **FLS** | Field-Level Security by profile |
| **OWD** | Organization-Wide Defaults |
| **Sharing Rules** | Criteria/Owner-based sharing |
| **Permission Sets** | Object/Field access |

---

## Workflow

```
1. Determine data source:
   ├── Local metadata exists? → Analyze files
   ├── sf CLI available? → Retrieve from org
   ├── URLs provided? → Fetch via MCP/WebFetch
   └── None? → Ask user for input
   ↓
2. Collect object metadata:
   ├── List all custom objects
   ├── Include relevant standard objects
   └── Filter by namespace if needed
   ↓
3. For each object:
   ├── Extract fields (name, type, required, description)
   ├── Identify relationships (Lookup, Master-Detail, External)
   ├── List record types
   ├── List validation rules
   └── Note triggers/flows
   ↓
4. Build relationship map:
   ├── Parent-child relationships
   ├── Junction objects (many-to-many)
   └── External lookups
   ↓
5. Generate ERD diagram (Mermaid)
   ↓
6. Create DATA_MODEL.md
   ↓
7. Verify with user
```

---

## Field Type Reference

| Salesforce Type | Description | Notes |
|-----------------|-------------|-------|
| `Text` | String up to 255 chars | |
| `TextArea` | String up to 32k chars | |
| `LongTextArea` | String up to 131k chars | |
| `RichTextArea` | HTML-formatted text | |
| `Number` | Numeric with precision | |
| `Currency` | Money with currency code | |
| `Percent` | Percentage value | |
| `Date` | Date only | |
| `DateTime` | Date and time | |
| `Checkbox` | Boolean | |
| `Picklist` | Single-select | Check for dependencies |
| `MultiselectPicklist` | Multi-select | |
| `Lookup` | Reference to another object | FK relationship |
| `MasterDetail` | Parent-child with cascade delete | Strong relationship |
| `ExternalLookup` | Reference to external object | |
| `Formula` | Calculated field | Note return type |
| `Summary` | Rollup from children | Note function (SUM/COUNT/etc) |
| `AutoNumber` | Auto-generated sequence | |
| `Email` | Email format | |
| `Phone` | Phone format | |
| `Url` | URL format | |

---

## Namespace Handling

For managed packages, handle namespace prefixes:

```
Namespace: tr_wc1

Objects:
- tr_wc1__KYC_Screening_Case__c
- tr_wc1__Screening_Case_Audit_Event__c

Fields:
- tr_wc1__Screened_Name__c
- tr_wc1__Total_Matches__c
```

**Strategy**: Document with namespace, note package source.

---

## Output Template

```markdown
# Data Model

## Overview

| Metric | Count |
|--------|-------|
| Custom Objects | X |
| Custom Fields | X |
| Relationships | X |
| Record Types | X |
| Validation Rules | X |

## Namespaces

| Namespace | Package | Objects |
|-----------|---------|---------|
| `tr_wc1__` | World-Check CRS | 5 |
| (none) | Custom | 3 |

---

## Entity Relationship Diagram

\`\`\`mermaid
erDiagram
    Account ||--o{ KYC_Screening_Case__c : screens
    Contact ||--o{ KYC_Screening_Case__c : screens
    KYC_Screening_Case__c ||--o{ Screening_Case_Audit_Event__c : has
    KYC_Screening_Case__c ||--o{ Screening_Case_Export__c : exports
\`\`\`

---

## Objects

### KYC_Screening_Case__c

**Label**: KYC Screening Case  
**Namespace**: tr_wc1  
**Description**: Stores screening information and match results from World-Check One

#### Fields

| API Name | Label | Type | Required | Description |
|----------|-------|------|----------|-------------|
| Screened_Name__c | Screened Name | Text(255) | Yes | Name sent for screening |
| Entity_Type__c | Entity Type | Picklist | Yes | Individual/Organisation/Vessel |
| Total_Matches__c | Total Matches | Number(18,0) | No | Count of matches found |
| Status__c | Status | Picklist | No | Current case status |

#### Relationships

| Type | Field | Target | Description |
|------|-------|--------|-------------|
| Lookup | Account__c | Account | Source account |
| Lookup | Contact__c | Contact | Source contact |

#### Record Types

| API Name | Label | Active | Description |
|----------|-------|--------|-------------|
| Individual | Individual | Yes | For person screening |
| Organisation | Organisation | Yes | For company screening |

#### Validation Rules

| Rule Name | Active | Error Condition | Message |
|-----------|--------|-----------------|---------|
| Name_Required | Yes | ISBLANK(Screened_Name__c) | Name is required |

#### Triggers

| Name | Events | Active |
|------|--------|--------|
| tr_ScreeningCaseTrigger | before insert, before update | Yes |

---

## Relationships Summary

### Parent-Child (Master-Detail)

| Parent | Child | Relationship Name |
|--------|-------|-------------------|
| KYC_Screening_Case__c | Screening_Case_Audit_Event__c | Audit_Events |

### Lookups

| From Object | Field | To Object | Required |
|-------------|-------|-----------|----------|
| KYC_Screening_Case__c | Account__c | Account | No |
| KYC_Screening_Case__c | Contact__c | Contact | No |

### Junction Objects (Many-to-Many)

| Junction Object | Object A | Object B |
|-----------------|----------|----------|
| (none identified) | | |

---

## Validation Rules Summary

| Object | Rule | Description |
|--------|------|-------------|
| KYC_Screening_Case__c | Name_Required | Ensures name provided |

---

## Formula Fields

| Object | Field | Return Type | Formula Summary |
|--------|-------|-------------|-----------------|
| ... | ... | ... | ... |

---

## Automation Summary

### Triggers

| Object | Trigger | Handler Class |
|--------|---------|---------------|
| KYC_Screening_Case__c | tr_ScreeningCaseTrigger | tr_ScreeningCaseTriggerHandler |

### Flows

| Object | Flow Name | Type | Description |
|--------|-----------|------|-------------|
| ... | ... | ... | ... |

---

*Generated: [date]*
*Source: [metadata/org/documentation]*
```

---

## Verification Checklist

After generation, verify:

- [ ] All custom objects documented
- [ ] Standard objects in use included (Account, Contact, etc.)
- [ ] Field types accurate
- [ ] Relationships mapped correctly
- [ ] ERD diagram renders
- [ ] Namespaces handled properly
- [ ] Validation rules captured
- [ ] Record types listed

---

## Prompts for Missing Information

If metadata incomplete, ask:

```
I found X custom objects in the project. To complete the data model:

1. Are there additional objects not in source control?
2. Should I include standard object customizations?
3. Are there managed packages to document?

Please provide:
- Schema Builder screenshot, OR
- Documentation link, OR
- List of objects to focus on
```

---

## Tips

- Focus on **business-critical objects** first
- Note **circular relationships** for potential issues
- Flag **required fields** without validation rules
- Identify **data integrity risks** (orphan records)
- Check for **field sprawl** (objects with 100+ fields)
- Note **deprecated/unused fields** if visible
