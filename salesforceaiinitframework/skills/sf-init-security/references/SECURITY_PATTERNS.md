# Security Patterns Reference

> Common patterns to detect during security analysis.

## Sharing Keyword Patterns

### With Sharing (Recommended Default)

```apex
public with sharing class AccountService {
    // Respects user's record-level access
    public List<Account> getAccounts() {
        return [SELECT Id, Name FROM Account];
    }
}
```

**Use for:** Controllers, Services, user-facing operations

### Without Sharing (Use Sparingly)

```apex
public without sharing class SystemLogger {
    // Ignores sharing rules - can see all records
    public void logError(String message) {
        insert new Error_Log__c(Message__c = message);
    }
}
```

**Use for:** System operations, logging, admin utilities

**⚠️ Always document why `without sharing` is needed.**

### Inherited Sharing (Utility Classes)

```apex
public inherited sharing class StringUtils {
    // Inherits sharing from calling class
    public static String truncate(String input, Integer maxLength) {
        return input?.left(maxLength);
    }
}
```

**Use for:** Utility classes, base classes, libraries

---

## FLS/CRUD Enforcement Patterns

### Pattern 1: WITH SECURITY_ENFORCED (Query-Level)

```apex
public List<Account> getAccounts() {
    return [
        SELECT Id, Name, Phone, Industry
        FROM Account
        WHERE IsActive__c = true
        WITH SECURITY_ENFORCED
    ];
}
```

**Pros:** Simple, declarative
**Cons:** Throws exception if ANY field inaccessible

### Pattern 2: WITH USER_MODE (API 52+)

```apex
public List<Account> getAccounts() {
    return [
        SELECT Id, Name, Phone, Industry
        FROM Account
        WITH USER_MODE
    ];
}
```

**Behavior:** Silently removes inaccessible fields, respects sharing

### Pattern 3: Security.stripInaccessible()

```apex
public List<Account> getAccounts() {
    List<Account> accounts = [SELECT Id, Name, Phone, Industry FROM Account];
    
    SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.READABLE,
        accounts
    );
    
    return (List<Account>) decision.getRecords();
}
```

**Pros:** Doesn't throw, can check removed fields
**Cons:** More verbose

### Pattern 4: Schema Checks (Manual)

```apex
public List<Account> getAccounts() {
    if (!Schema.sObjectType.Account.isAccessible()) {
        throw new SecurityException('No access to Account');
    }
    
    List<String> fields = new List<String>();
    
    if (Schema.sObjectType.Account.fields.Name.isAccessible()) {
        fields.add('Name');
    }
    if (Schema.sObjectType.Account.fields.Phone.isAccessible()) {
        fields.add('Phone');
    }
    
    String query = 'SELECT Id, ' + String.join(fields, ', ') + ' FROM Account';
    return Database.query(query);
}
```

**Pros:** Fine-grained control
**Cons:** Verbose, error-prone

---

## DML Security Patterns

### Pattern 1: AccessLevel.USER_MODE (API 52+)

```apex
public void createAccounts(List<Account> accounts) {
    Database.insert(accounts, AccessLevel.USER_MODE);
}
```

### Pattern 2: Manual CRUD Check

```apex
public void createAccounts(List<Account> accounts) {
    if (!Schema.sObjectType.Account.isCreateable()) {
        throw new SecurityException('Cannot create Account records');
    }
    insert accounts;
}
```

### Pattern 3: stripInaccessible for DML

```apex
public void updateAccounts(List<Account> accounts) {
    SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.UPDATABLE,
        accounts
    );
    update decision.getRecords();
}
```

---

## SOQL Injection Prevention

### ❌ Vulnerable Pattern

```apex
public List<Account> search(String searchTerm) {
    String query = 'SELECT Id, Name FROM Account WHERE Name LIKE \'%' + searchTerm + '%\'';
    return Database.query(query);
}
```

### ✅ Safe Pattern 1: Bind Variables

```apex
public List<Account> search(String searchTerm) {
    String searchPattern = '%' + searchTerm + '%';
    return [SELECT Id, Name FROM Account WHERE Name LIKE :searchPattern];
}
```

### ✅ Safe Pattern 2: Dynamic with Binding

```apex
public List<Account> search(String searchTerm) {
    String searchPattern = '%' + searchTerm + '%';
    String query = 'SELECT Id, Name FROM Account WHERE Name LIKE :searchPattern';
    return Database.query(query);
}
```

### ✅ Safe Pattern 3: Escape Single Quotes

```apex
public List<Account> search(String searchTerm) {
    String safeTerm = String.escapeSingleQuotes(searchTerm);
    String query = 'SELECT Id, Name FROM Account WHERE Name LIKE \'%' + safeTerm + '%\'';
    return Database.query(query);
}
```

---

## Custom Permission Check Pattern

```apex
public class FeatureController {
    
    public static Boolean canAccessAdminPanel() {
        return FeatureManagement.checkPermission('Access_Admin_Panel');
    }
    
    @AuraEnabled
    public static void performAdminAction() {
        if (!canAccessAdminPanel()) {
            throw new AuraHandledException('Insufficient privileges');
        }
        // Admin logic here
    }
}
```

---

## Security Testing Patterns

### Test With Limited User

```apex
@isTest
static void testRestrictedUserAccess() {
    // Create user with minimal permissions
    User limitedUser = TestDataFactory.createStandardUser();
    
    System.runAs(limitedUser) {
        try {
            AccountService.createAccount(new Account(Name = 'Test'));
            Assert.fail('Expected SecurityException');
        } catch (SecurityException e) {
            Assert.isTrue(e.getMessage().contains('Cannot create'));
        }
    }
}
```

### Test FLS Enforcement

```apex
@isTest
static void testFieldLevelSecurity() {
    User limitedUser = TestDataFactory.createUserWithoutFieldAccess('Account', 'Phone');
    
    System.runAs(limitedUser) {
        List<Account> accounts = AccountSelector.getAccountsWithPhone();
        
        // Verify Phone field is not accessible
        for (Account acc : accounts) {
            Assert.isNull(acc.Phone, 'Phone should be stripped');
        }
    }
}
```

### Test Sharing Rules

```apex
@isTest
static void testRecordVisibility() {
    User owner = TestDataFactory.createUser('Sales');
    User other = TestDataFactory.createUser('Service');
    
    Account privateAccount;
    System.runAs(owner) {
        privateAccount = new Account(Name = 'Private');
        insert privateAccount;
    }
    
    System.runAs(other) {
        List<Account> visible = [SELECT Id FROM Account WHERE Id = :privateAccount.Id];
        Assert.isTrue(visible.isEmpty(), 'Record should not be visible');
    }
}
```

---

## Anti-Patterns to Flag

### Hardcoded Credentials

```apex
// ❌ BAD
private static final String API_KEY = 'sk-1234567890abcdef';
private static final String PASSWORD = 'secretpassword';
```

### Sensitive Data in Debug

```apex
// ❌ BAD
System.debug('User password: ' + password);
System.debug('API Response: ' + response.getBody()); // May contain tokens
```

### Missing Sharing Keyword on Sensitive Class

```apex
// ❌ Should have explicit sharing keyword
public class PaymentService {
    public void processPayment() {
        // Handles financial data without clear sharing model
    }
}
```

### No FLS on User-Facing Query

```apex
// ❌ BAD - Returns all fields without checking access
@AuraEnabled
public static List<Account> getAccounts() {
    return [SELECT Id, Name, Phone, Revenue__c FROM Account];
}
```
