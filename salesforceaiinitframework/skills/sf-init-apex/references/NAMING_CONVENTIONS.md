# Naming Conventions Analysis Checklist

> What to look for when analyzing naming conventions in a project.

## Classes — What to Detect

| Type | Common Patterns to Look For |
|------|----------------------------|
| Controllers | `*Controller`, `*Ctrl` |
| Services | `*Service`, `*Svc` |
| Selectors | `*Selector`, `*Queries` |
| Handlers | `*Handler`, `*TriggerHandler` |
| Helpers | `*Helper`, `*Util`, `*Utils` |
| Batches | `*Batch`, `*BatchJob`, `Batch_*` |
| Queueables | `*Queueable`, `*Queue`, `*Job` |
| Schedulables | `*Scheduler`, `*Schedule`, `Scheduled_*` |
| Tests | `*Test`, `*Tests`, `test_*`, `Test_*` |
| Exceptions | `*Exception`, `*Error` |
| DTOs/Wrappers | `*DTO`, `*Wrapper`, `*Request`, `*Response` |
| TAF Actions | `TA_*`, `TriggerAction_*` |

**Questions to answer:**
- What suffix/prefix pattern does this project use?
- Are there exceptions to the pattern?
- Is there consistency across the codebase?

---

## Variables — What to Detect

| Type | Common Patterns |
|------|-----------------|
| Lists | `accounts`, `accountList`, `lstAccounts` |
| Sets | `accountIds`, `accountIdSet`, `setAccountIds` |
| Maps | `accountsById`, `accountMap`, `mapAccountsById` |
| Booleans | `isActive`, `hasError`, `bActive` |
| Constants | `MAX_RETRIES`, `STATUS_ACTIVE`, `kMaxRetries` |

**Questions to answer:**
- Does the project use Hungarian notation (prefixes like `lst`, `map`, `str`)?
- How are collection variable names structured?
- Are constants UPPER_SNAKE or another format?

---

## Methods — What to Detect

| Purpose | Common Patterns |
|---------|-----------------|
| Getters | `get*`, `retrieve*`, `fetch*`, `obtain*` |
| Setters | `set*`, `update*`, `assign*` |
| Boolean checks | `is*`, `has*`, `can*`, `should*` |
| Actions | `process*`, `handle*`, `execute*`, `run*` |
| Creation | `create*`, `build*`, `make*`, `generate*` |
| Validation | `validate*`, `check*`, `verify*` |

---

## Triggers — What to Detect

| Pattern | Example |
|---------|---------|
| Object name only | `AccountTrigger` |
| With suffix | `Account_Trigger`, `AccountTrg` |
| Prefixed | `tr_Account`, `Trigger_Account` |

---

## Test Classes — What to Detect

| Pattern | Example |
|---------|---------|
| Suffix | `AccountServiceTest` |
| Prefix | `Test_AccountService`, `test_AccountService` |
| Separate folder | `/tests/AccountServiceTest.cls` |

---

## Analysis Output Format

Document what you FIND, not what you expect:

```markdown
### Naming Conventions (Observed)

| Element | Pattern Found | Examples |
|---------|--------------|----------|
| Controllers | `*Controller` | `SearchController`, `LeadController` |
| Services | `*Service` | `AccountService`, `OrderService` |
| Tests | `test_*` | `test_AccountService`, `test_OrderService` |
| Maps | Hungarian (`map*`) | `mapAccountsById`, `mapContactsByEmail` |
| Booleans | `is*` prefix | `isActive`, `isValid`, `isProcessed` |
```

**Note:** If patterns are inconsistent, document that:
> "Mixed test naming: some use `*Test` suffix, others use `test_*` prefix"
