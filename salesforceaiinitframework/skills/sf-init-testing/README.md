# sf-init-testing

> Analyze Apex test patterns and LWC Jest testing to document how THIS project writes tests.

## What It Analyzes

### Apex Tests
- Test file naming convention (`*Test.cls`, `test_*.cls`)
- @TestSetup patterns
- Mock implementations (HttpCalloutMock, StubProvider)
- Assertion styles (modern `Assert` vs legacy `System.assertEquals`)
- Test data creation (TestDataFactory patterns)
- Coverage requirements
- Bulk testing patterns (251+ records)

### LWC Tests
- Jest configuration
- Mock patterns for @salesforce/apex
- DOM cleanup in afterEach
- Component testing approach

## Output

- **Creates:** `testing.md` (platform-specific location)
- **Updates:** `INDEX.md` with testing.md reference

See [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific paths.

## How to Run

### Basic Usage

```
Use skill: sf-init-testing
```

### With Focus

```
Use skill: sf-init-testing
Focus: Analyze only HTTP callout mocking patterns
```

### Apex Only

```
Use skill: sf-init-testing
Scope: apex
```

## Example Prompts

| Goal | Prompt |
|------|--------|
| Full analysis | `Analyze test patterns using sf-init-testing` |
| Mock patterns | `Document HTTP callout mock patterns in our tests` |
| Setup patterns | `Extract @TestSetup patterns from existing tests` |
| Assertions | `Check which assertion style we use (Assert vs System.assert)` |
| Jest | `Analyze LWC Jest testing patterns` |
| Update | `Refresh testing.md - we updated TestDataFactory` |

## Prerequisites

| Source | Required |
|--------|----------|
| Apex tests | `**/*Test.cls`, `**/test_*.cls` |
| LWC tests | `**/__tests__/*.test.js` |
| Jest config | `jest.config.js` |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `sf-init-apex` | Run BEFORE to understand code patterns |
| `sf-init-lwc` | Run BEFORE for LWC structure |
| `sf-init-architecture` | Understand service layer for mocking |

## References

- [TEST_PATTERNS.md](references/TEST_PATTERNS.md) - Common test patterns and mocks

## What It Extracts

### Test Class Patterns

| Pattern | Detection |
|---------|-----------|
| @TestSetup | `@TestSetup` annotation |
| TestDataFactory | `TestDataFactory.` calls |
| Mock classes | `implements HttpCalloutMock` |
| Stub provider | `implements StubProvider` |

### Assertion Styles

| Modern | Legacy |
|--------|--------|
| `Assert.areEqual()` | `System.assertEquals()` |
| `Assert.isTrue()` | `System.assert()` |
| `Assert.isNull()` | `System.assertEquals(null, x)` |

### Test Scoring (120 points)

| Category | Points |
|----------|--------|
| Test Coverage | 25 |
| Assertion Quality | 25 |
| Bulk Testing | 20 |
| Test Data | 20 |
| Isolation | 15 |
| Documentation | 15 |

## Output Features

- Test class inventory
- Naming convention documentation
- Real @TestSetup examples
- Mock class patterns
- Assertion style used
- Common test failures and fixes
- LWC Jest patterns (if LWC exists)

## Notes

- Document ACTUAL patterns from the project
- Note if tests use `SeeAllData=true` (anti-pattern)
- Include both Apex and LWC testing if applicable
- Document bulk test patterns (251+ records)
