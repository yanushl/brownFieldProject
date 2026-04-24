# Salesforce Flow Best Practices

> Reference guide for Flow development patterns and anti-patterns.

---

## When NOT to Use Flow

Before building a Flow, evaluate simpler alternatives:

| Requirement | Better Alternative |
|-------------|-------------------|
| Same-record field calculation | **Formula Field** |
| Data validation with error | **Validation Rule** |
| Parent aggregate from children | **Roll-Up Summary Field** |
| Field defaulting on create | **Field Default Value** |
| Conditional field visibility | **Dynamic Forms** |

### When Flow IS Right

| Scenario | Why Flow |
|----------|----------|
| Complex multi-object updates | Orchestrate related changes |
| User interaction required | Screen Flows for guided processes |
| Scheduled automation | Time-based execution |
| Platform Event handling | Real-time event processing |
| Complex approval routing | Dynamic approval matrix |

---

## Flow Naming Conventions

| Flow Type | Prefix | Example |
|-----------|--------|---------|
| Record-Triggered (After) | `Auto_` | `Auto_Lead_Assignment` |
| Record-Triggered (Before) | `Before_` | `Before_Lead_Validate` |
| Screen Flow | `Screen_` | `Screen_New_Customer` |
| Scheduled | `Sched_` | `Sched_Daily_Cleanup` |
| Platform Event | `Event_` | `Event_Order_Completed` |
| Autolaunched/Subflow | `Sub_` | `Sub_Send_Email` |

**Format**: `[Prefix]_Object_Action` using PascalCase

---

## Variable Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `var_` | Regular variables | `var_AccountName` |
| `col_` | Collections | `col_ContactIds` |
| `rec_` | Record variables | `rec_Account` |
| `inp_` | Input variables | `inp_RecordId` |
| `out_` | Output variables | `out_IsSuccess` |

**Element Names**: PascalCase_With_Underscores (e.g., `Check_Account_Type`)

---

## Critical Anti-Patterns

### MUST AVOID

| Anti-Pattern | Impact | Correct Pattern |
|--------------|--------|-----------------|
| After-Save updating same object without entry conditions | **Infinite loop** | Add entry conditions |
| Get Records inside Loop | Governor limit (100 SOQL) | Query BEFORE loop |
| Create/Update/Delete inside Loop | Governor limit (150 DML) | Collect → single DML after |
| DML without Fault Path | Silent failures | Add Fault connector |
| Get Records without null check | NullPointerException | Add Decision after query |
| `storeOutputAutomatically=true` | Security risk | Select fields explicitly |
| Hardcoded Salesforce ID | Deployment failure | Use input variable or CMDT |

### $Record Usage (Record-Triggered)

**CRITICAL**: `$Record` is single record, NOT a collection. Platform handles batching.

```
✅ GOOD: Use $Record directly
Decision: {!$Record.StageName} equals "Closed Won"
Assignment: Set rec_Task.WhatId = {!$Record.Id}

❌ BAD: Query the trigger object (wastes SOQL)
Get Records: Account where Id = {!$Record.Id}
```

### No Parent Traversal in Get Records

Get Records CANNOT query `Parent.Field`. Use two-step pattern:

```
Step 1: Get Contact → Store ContactId, AccountId
Step 2: Get Account → Filter by Id = AccountId
Step 3: Use Account.Name
```

---

## 110-Point Scoring System

| Category | Points | Key Checks |
|----------|--------|------------|
| Design & Naming | 20 | Naming conventions, descriptions, element organization |
| Logic & Structure | 20 | Proper branching, no redundant elements |
| Architecture | 15 | Subflow usage, separation of concerns |
| Performance & Bulk Safety | 20 | No SOQL/DML in loops, filters on queries |
| Error Handling | 20 | Fault paths on all DML, rollback strategy |
| Security | 15 | System vs User mode, FLS consideration |

**Thresholds**:
| Score | Rating |
|-------|--------|
| 99-110 | Excellent |
| 88-98 | Very Good |
| 77-87 | Good |
| 66-76 | Needs Work |
| <66 | Critical Issues |

---

## Flow vs Apex Decision

### Escalate to Apex When

| Scenario | Why Apex |
|----------|----------|
| >5 nested decision branches | Flow becomes unreadable |
| Complex math/string manipulation | Apex is more expressive |
| External HTTP callouts | Better error handling, retry logic |
| Complex data transformations | Apex collections are more powerful |
| Performance-critical bulk ops | Apex is faster for 10K+ records |
| Unit testing requirements | Apex test classes provide coverage |

### Hybrid Pattern (Recommended)

```
Flow (orchestration):
├── Start: Record-Triggered
├── Decision: Is Complex?
│   ├── Yes → Apex Action: ProcessComplex (Invocable)
│   └── No  → Simple Assignments
└── Update Records
```

---

## Error Handling (Three-Tier)

### Tier 1: Input Validation
- Check null/empty values BEFORE DML
- Show validation error screen

### Tier 2: DML Error Handling
- Add fault paths to ALL DML elements
- Capture `{!$Flow.FaultMessage}`

### Tier 3: Rollback
- Delete created records on failure
- Restore original values

**Error Message Pattern**:
```
"Failed to create Contact for Account {!rec_Account.Id}: {!$Flow.FaultMessage}"
```

---

## Performance Best Practices

### Query Optimization

| Practice | Why |
|----------|-----|
| Always add filter conditions | Limit result set |
| Use indexed fields for large objects | Filter on Id, Name, CreatedDate |
| Enable `getFirstRecordOnly` for single records | Avoid collection overhead |
| Disable `storeOutputAutomatically` | Specify only needed fields |

### Transform vs Loop

| Use Transform | Use Loop |
|---------------|----------|
| Data mapping (Contact[] → OpportunityContactRole[]) | Per-record IF/ELSE |
| Bulk field assignments | Counters/running totals |
| Simple formulas | State tracking |

Transform is 30-50% faster for collections.

---

## Custom Metadata for Business Logic

Store thresholds/settings in CMDT, not hardcoded:

```
Decision: Check_Discount
Condition: {!$Record.Amount} >= {!$CustomMetadata.Flow_Settings__mdt.Discount_Threshold.Value__c}
```

**Never store Salesforce IDs in CMDT** — IDs differ between orgs!

---

## Testing Checklist

- [ ] Test happy path manually
- [ ] Test with 200+ records (bulk)
- [ ] Test with different profiles
- [ ] Verify debug logs for errors
- [ ] Test all decision branches
- [ ] Test error/fault paths
- [ ] Deploy as Draft first, then Activate

---

## XML Element Ordering (for metadata)

Elements must be alphabetically ordered:
```
apiVersion → assignments → decisions → description → 
formulas → label → loops → processType → 
recordCreates → recordLookups → recordUpdates → 
screens → start → status → variables
```


