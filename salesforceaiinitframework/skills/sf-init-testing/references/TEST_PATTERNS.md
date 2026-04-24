# Apex Test Patterns Reference

> Common patterns for Apex unit testing based on sf-skills best practices.

---

## TestDataFactory Pattern

```apex
@isTest
public class TestDataFactory {
    
    public static Account createAccount() {
        return createAccount(null);
    }
    
    public static Account createAccount(Map<String, Object> overrides) {
        Account acc = new Account(
            Name = 'Test Account ' + System.now().getTime(),
            BillingStreet = '123 Test St',
            BillingCity = 'Test City',
            BillingState = 'CA',
            BillingPostalCode = '12345',
            BillingCountry = 'USA'
        );
        
        if (overrides != null) {
            for (String field : overrides.keySet()) {
                acc.put(field, overrides.get(field));
            }
        }
        
        return acc;
    }
    
    public static Contact createContact(Id accountId) {
        return new Contact(
            FirstName = 'Test',
            LastName = 'Contact ' + System.now().getTime(),
            AccountId = accountId,
            Email = 'test' + System.now().getTime() + '@example.com'
        );
    }
    
    public static List<Account> createAccounts(Integer count) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(createAccount(new Map<String, Object>{
                'Name' => 'Test Account ' + i
            }));
        }
        return accounts;
    }
}
```

---

## HTTP Callout Mock Pattern

### Base Mock Generator

```apex
@isTest
public class MockHttpResponseGenerator implements HttpCalloutMock {
    
    protected Integer statusCode;
    protected String responseBody;
    protected Map<String, String> headers;
    
    public MockHttpResponseGenerator(Integer statusCode, String responseBody) {
        this.statusCode = statusCode;
        this.responseBody = responseBody;
        this.headers = new Map<String, String>();
    }
    
    public MockHttpResponseGenerator withHeader(String key, String value) {
        this.headers.put(key, value);
        return this;
    }
    
    public HttpResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(this.statusCode);
        res.setBody(this.responseBody);
        for (String key : headers.keySet()) {
            res.setHeader(key, headers.get(key));
        }
        return res;
    }
}
```

### Specific Status Code Mocks

```apex
// Success mock
@isTest
public class test_mockCalloutGenerator implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('{"success": true, "data": []}');
        res.setHeader('Content-Type', 'application/json');
        return res;
    }
}

// 401 Unauthorized mock
@isTest
public class test_mockCalloutGenerator401 implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(401);
        res.setBody('{"error": "Unauthorized"}');
        return res;
    }
}

// 404 Not Found mock
@isTest
public class test_mockCalloutGenerator404 implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(404);
        res.setBody('{"error": "Not found"}');
        return res;
    }
}
```

---

## Bulk Test Pattern (251+ Records)

```apex
@isTest
private class test_BulkOperations {
    
    private static final Integer BULK_COUNT = 251; // Beyond 200 trigger limit
    
    @TestSetup
    static void setup() {
        List<Account> accounts = TestDataFactory.createAccounts(BULK_COUNT);
        insert accounts;
    }
    
    @IsTest
    static void triggerHandler_bulkInsert_shouldProcessAll() {
        List<Account> accounts = [SELECT Id FROM Account];
        
        Test.startTest();
        // Simulate bulk update
        for (Account acc : accounts) {
            acc.Description = 'Updated';
        }
        update accounts;
        Test.stopTest();
        
        // Verify all processed
        List<Account> updated = [SELECT Id, Description FROM Account WHERE Description = 'Updated'];
        Assert.areEqual(BULK_COUNT, updated.size(), 'All records should be updated');
    }
}
```

---

## System.runAs Pattern (Avoid MIXED_DML_OPERATION)

```apex
@isTest
private class test_UserOperations {
    
    @IsTest
    static void createUserWithAccount() {
        // Create user first (setup object)
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User testUser = new User(
            FirstName = 'Test',
            LastName = 'User',
            Email = 'testuser@example.com',
            Username = 'testuser' + System.now().getTime() + '@example.com',
            Alias = 'tuser',
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            ProfileId = p.Id
        );
        insert testUser;
        
        // Run as user to avoid MIXED_DML_OPERATION
        System.runAs(testUser) {
            Test.startTest();
            Account acc = new Account(Name = 'Test Account');
            insert acc;
            Test.stopTest();
            
            Assert.isNotNull(acc.Id, 'Account should be created');
        }
    }
}
```

---

## Exception Testing Pattern

```apex
@isTest
private class test_ExceptionHandling {
    
    @IsTest
    static void service_nullInput_shouldThrowException() {
        Boolean exceptionThrown = false;
        String exceptionMessage;
        
        Test.startTest();
        try {
            MyService.processRecord(null);
        } catch (MyServiceException e) {
            exceptionThrown = true;
            exceptionMessage = e.getMessage();
        }
        Test.stopTest();
        
        Assert.isTrue(exceptionThrown, 'Exception should be thrown for null input');
        Assert.areEqual('Record ID is required', exceptionMessage, 'Exception message should match');
    }
}
```

---

## Async Test Pattern (Queueable/Batch)

```apex
@isTest
private class test_AsyncOperations {
    
    @IsTest
    static void queueable_shouldProcessRecords() {
        // Arrange
        Account acc = TestDataFactory.createAccount();
        insert acc;
        
        // Act
        Test.startTest();
        System.enqueueJob(new MyQueueable(new List<Id>{ acc.Id }));
        Test.stopTest(); // Forces queueable to complete
        
        // Assert - verify side effects
        Account updated = [SELECT Id, Description FROM Account WHERE Id = :acc.Id];
        Assert.areEqual('Processed', updated.Description, 'Record should be processed');
    }
    
    @IsTest
    static void batch_shouldProcessAllRecords() {
        // Arrange
        List<Account> accounts = TestDataFactory.createAccounts(50);
        insert accounts;
        
        // Act
        Test.startTest();
        Database.executeBatch(new MyBatch(), 200);
        Test.stopTest(); // Forces batch to complete
        
        // Assert
        List<Account> processed = [SELECT Id FROM Account WHERE Status__c = 'Processed'];
        Assert.areEqual(50, processed.size(), 'All records should be processed');
    }
}
```

---

## Negative Scenario Patterns

```apex
@isTest
private class test_NegativeScenarios {
    
    @IsTest
    static void api_serverError_shouldHandleGracefully() {
        Test.setMock(HttpCalloutMock.class, new test_mockCalloutGenerator500());
        
        Test.startTest();
        ApiResult result = MyService.callExternalApi();
        Test.stopTest();
        
        Assert.isFalse(result.isSuccess, 'Should not succeed on 500 error');
        Assert.isNotNull(result.errorMessage, 'Should have error message');
    }
    
    @IsTest
    static void query_noResults_shouldReturnEmptyList() {
        Test.startTest();
        List<Account> results = MySelector.searchByName('NonExistentName12345');
        Test.stopTest();
        
        Assert.isNotNull(results, 'Should return list, not null');
        Assert.areEqual(0, results.size(), 'Should be empty list');
    }
}
```

---

## Test Method Naming Convention

```
methodName_scenario_expectedResult

Examples:
- getAccount_validId_returnsAccount
- getAccount_nullId_throwsException
- processRecords_bulkInsert_handlesAll
- apiCall_timeout_retriesThreeTimes
```
