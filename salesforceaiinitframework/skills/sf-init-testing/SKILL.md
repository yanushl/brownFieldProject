---
name: sf-init-testing
description: Analyze Apex test patterns and generate testing.md. Documents test file naming, @TestSetup patterns, mock implementations, assertion styles, and LWC Jest testing. Includes 120-point test scoring rubric. Use when setting up AI context for test development.
---

# Apex Unit Test Patterns Initializer

## Purpose

Document the testing patterns, conventions, and requirements so AI can generate consistent, high-quality tests.

## Output

Creates `testing.md` in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/testing.md` | `globs: ["**/*Test.cls", "**/test_*.cls", "**/*.test.js"]`<br>`alwaysApply: false` |
| **Claude Code** | `.claude/rules/testing.md` | `paths: ["**/*Test.cls", "**/test_*.cls", "**/*.test.js"]` |
| **Copilot** | `.github/instructions/testing.instructions.md` | `applyTo: "**/*Test.cls,**/test_*.cls,**/*.test.js"` |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Testing Patterns`) |

## References

- [TEST_PATTERNS.md](references/TEST_PATTERNS.md) - Common test patterns and mocks

---

## Analysis Steps

### 1. Identify Test File Patterns

Search for test classes:

```
Patterns to look for:
- test_*.cls
- *Test.cls
- *_Test.cls
```

Document:
- Primary naming convention used
- Location of test files (dedicated `tests/` folder or alongside classes)
- Test class annotations (@isTest, with sharing)

### 2. Analyze Test Setup Patterns

Look for common test setup approaches:

```apex
// Pattern 1: @TestSetup method
@TestSetup
static void setup() { ... }

// Pattern 2: Inline setup in each test

// Pattern 3: TestDataFactory class
TestDataFactory.createAccount();
```

Document:
- Which pattern is used
- What objects are commonly created in setup
- Custom settings initialization

### 3. Identify Mock Patterns

Search for mock implementations:

```
Look for:
- HttpCalloutMock implementations
- StubProvider implementations
- test_mockCalloutGenerator (or similar)
```

Document:
- Mock class naming
- How different response scenarios are handled (200, 401, 404)
- Where mock classes are located

### 4. Analyze Assertion Patterns

Check assertion style:

```apex
// Legacy style
System.assertEquals(expected, actual);

// Modern style (preferred)
Assert.areEqual(expected, actual);
Assert.isTrue(condition);
Assert.isNull(value);
```

### 5. Check Coverage Requirements

Look for:
- Minimum coverage thresholds
- Positive and negative scenario coverage

### 6. Analyze LWC Jest Tests

If LWC exists, check:

```
Look for:
- __tests__/ folders in LWC components
- jest.config.js configuration
- Mock patterns for @salesforce/apex
```

---

## Test Scoring (120-point rubric)

| Category | Points | Key Rules |
|----------|--------|-----------|
| Test Coverage | 25 | 90%+ class coverage; all public methods tested |
| Assertion Quality | 25 | Assert class used; meaningful messages |
| Bulk Testing | 20 | Test with 251+ records |
| Test Data | 20 | TestDataFactory used; no hardcoded IDs |
| Isolation | 15 | SeeAllData=false; mock external callouts |
| Documentation | 15 | Method names describe scenario |

---

## Output Template

```markdown
# Apex Unit Test Patterns

## File Naming
- Convention: `test_<ClassName>.cls` or `<ClassName>Test.cls`
- Location: `force-app/main/default/classes/tests/`

## Test Class Structure

\`\`\`apex
@isTest
private class test_MyClass {
    
    @TestSetup
    static void setup() {
        // Create custom settings
        Thomson_KYC_Settings__c settings = new Thomson_KYC_Settings__c(
            Name = 'ThomsonKYC',
            isProduction__c = false
        );
        insert settings;
        
        // Create test records
        Contact testContact = new Contact(LastName = 'Test');
        insert testContact;
    }
    
    @IsTest
    static void methodName_scenario_expectedResult() {
        // Arrange
        
        // Act
        Test.startTest();
        // method call
        Test.stopTest();
        
        // Assert
        Assert.areEqual(expected, actual, 'Description');
    }
}
\`\`\`

## HTTP Callout Mocking

\`\`\`apex
@IsTest
static void apiCall_success() {
    Test.setMock(HttpCalloutMock.class, new test_mockCalloutGenerator());
    
    Test.startTest();
    HttpResponseDTO res = MyService.callApi();
    Test.stopTest();
    
    Assert.areEqual(200, res.statusCode);
}

@IsTest
static void apiCall_unauthorized() {
    Test.setMock(HttpCalloutMock.class, new test_mockCalloutGenerator401());
    
    Test.startTest();
    HttpResponseDTO res = MyService.callApi();
    Test.stopTest();
    
    Assert.areEqual(401, res.statusCode);
}
\`\`\`

## Assertion Style (Modern Assert Class)

| Method | Usage |
|--------|-------|
| `Assert.areEqual(expected, actual)` | Equality check |
| `Assert.areNotEqual(a, b)` | Inequality check |
| `Assert.isTrue(condition)` | Boolean true |
| `Assert.isFalse(condition)` | Boolean false |
| `Assert.isNull(value)` | Null check |
| `Assert.isNotNull(value)` | Not null check |

Always include message:
\`\`\`apex
Assert.areEqual(10, results.size(), 'Should return 10 records');
\`\`\`

## Coverage Requirements
- Minimum: 75% (Salesforce requirement)
- Target: 85%+ for critical classes

## LWC Jest Testing

\`\`\`javascript
import { createElement } from 'lwc';
import MyComponent from 'c/myComponent';
import getRecords from '@salesforce/apex/MyController.getRecords';

jest.mock('@salesforce/apex/MyController.getRecords', () => ({
    default: jest.fn()
}), { virtual: true });

describe('c-my-component', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('displays records', async () => {
        getRecords.mockResolvedValue([{ Id: '001', Name: 'Test' }]);
        
        const element = createElement('c-my-component', { is: MyComponent });
        document.body.appendChild(element);
        
        await Promise.resolve();
        
        expect(element.shadowRoot.querySelectorAll('.item').length).toBe(1);
    });
});
\`\`\`
```

---

## Common Test Failures

| Failure | Cause | Fix |
|---------|-------|-----|
| `MIXED_DML_OPERATION` | User + non-setup object | Use `System.runAs()` |
| `REQUIRED_FIELD_MISSING` | Test data incomplete | Add to TestDataFactory |
| `DUPLICATE_VALUE` | Unique field conflict | Use dynamic values |
| `FIELD_CUSTOM_VALIDATION_EXCEPTION` | Validation rule | Meet criteria in test data |

---

## Agentic Test-Fix Loop

When test fails:
1. Parse failure message and stack trace
2. Identify root cause:
   - AssertException → Check expected vs actual
   - NullPointerException → Add null checks
   - DmlException → Check validation rules
   - LimitException → Reduce SOQL/DML
3. Generate fix
4. Re-run (max 3 attempts)

---

## Verification

- [ ] Test naming convention matches existing tests
- [ ] Mock patterns are from actual project
- [ ] At least 2 complete test examples from codebase
- [ ] Both Apex and LWC testing covered (if LWC exists)
- [ ] Assertion style matches project convention
- [ ] Bulk test pattern documented (251+ records)
- [ ] Common failures and fixes listed
