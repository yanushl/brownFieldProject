# Callout Patterns Reference

> Common patterns to detect during integration analysis.

## Endpoint Configuration Patterns

### Pattern 1: Named Credential (Recommended)

```apex
req.setEndpoint('callout:MyNamedCredential/api/v1/resource');
```

**Indicators:** `callout:` prefix

### Pattern 2: Custom Metadata

```apex
Integration_Setting__mdt setting = Integration_Setting__mdt.getInstance('MyAPI');
req.setEndpoint(setting.Endpoint__c + '/api/v1/resource');
```

**Indicators:** `__mdt.getInstance`, Custom Metadata query

### Pattern 3: Custom Setting

```apex
API_Settings__c settings = API_Settings__c.getOrgDefaults();
req.setEndpoint(settings.Base_URL__c + '/api/v1/resource');
```

**Indicators:** `__c.getOrgDefaults()`, `__c.getInstance()`

### Pattern 4: Hardcoded (Anti-pattern)

```apex
req.setEndpoint('https://api.example.com/v1/resource');
```

**Indicators:** Full URL string literals

---

## Authentication Patterns

### OAuth 2.0 with Named Credential

```apex
// Automatic - Named Credential handles token
req.setEndpoint('callout:OAuthCredential/resource');
```

### Manual OAuth Token

```apex
String accessToken = getAccessToken(); // Custom method
req.setHeader('Authorization', 'Bearer ' + accessToken);
```

### API Key Header

```apex
req.setHeader('X-API-Key', apiKey);
// or
req.setHeader('Authorization', 'ApiKey ' + apiKey);
```

### Basic Authentication

```apex
String credentials = username + ':' + password;
String encoded = EncodingUtil.base64Encode(Blob.valueOf(credentials));
req.setHeader('Authorization', 'Basic ' + encoded);
```

### JWT Bearer

```apex
String jwt = generateJWT(claims, privateKey);
req.setHeader('Authorization', 'Bearer ' + jwt);
```

---

## Response Handling Patterns

### Simple Status Check

```apex
if (res.getStatusCode() == 200) {
    // Success
}
```

### Range Check

```apex
if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
    // Success
}
```

### Comprehensive Check

```apex
Integer statusCode = res.getStatusCode();
switch on statusCode {
    when 200, 201, 204 {
        // Success cases
    }
    when 400 {
        throw new BadRequestException(res.getBody());
    }
    when 401 {
        throw new UnauthorizedException('Token expired');
    }
    when 403 {
        throw new ForbiddenException('Access denied');
    }
    when 404 {
        throw new NotFoundException('Resource not found');
    }
    when 429 {
        throw new RateLimitException('Rate limit exceeded');
    }
    when 500, 502, 503 {
        throw new ServerErrorException('Server error: ' + statusCode);
    }
    when else {
        throw new IntegrationException('Unexpected status: ' + statusCode);
    }
}
```

---

## Retry Patterns

### Simple Retry

```apex
Integer maxRetries = 3;
Integer retryCount = 0;

while (retryCount < maxRetries) {
    try {
        HttpResponse res = http.send(req);
        if (res.getStatusCode() == 200) {
            return res;
        }
        retryCount++;
    } catch (CalloutException e) {
        retryCount++;
        if (retryCount >= maxRetries) {
            throw e;
        }
    }
}
```

### Exponential Backoff (via Queueable)

```apex
public class RetryableCallout implements Queueable, Database.AllowsCallouts {
    private Integer retryCount;
    private Integer maxRetries = 3;
    
    public void execute(QueueableContext context) {
        try {
            makeCallout();
        } catch (Exception e) {
            if (retryCount < maxRetries) {
                // Schedule retry with delay
                System.enqueueJob(new RetryableCallout(retryCount + 1));
            }
        }
    }
}
```

---

## Async Callout Patterns

### @future

```apex
@future(callout=true)
public static void makeAsyncCallout(String payload) {
    // Callout code
}
```

**Limitations:** No return value, can't chain, limited params

### Queueable (Preferred)

```apex
public class CalloutQueueable implements Queueable, Database.AllowsCallouts {
    private List<SObject> records;
    
    public CalloutQueueable(List<SObject> records) {
        this.records = records;
    }
    
    public void execute(QueueableContext context) {
        // Make callout
        // Can chain another Queueable
    }
}

// Enqueue
System.enqueueJob(new CalloutQueueable(records));
```

### Batch

```apex
public class CalloutBatch implements Database.Batchable<SObject>, Database.AllowsCallouts {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id FROM Account]);
    }
    
    public void execute(Database.BatchableContext bc, List<SObject> scope) {
        // Make callout per batch
    }
    
    public void finish(Database.BatchableContext bc) {
        // Completion logic
    }
}
```

---

## Mock Patterns

### Single Endpoint Mock

```apex
@isTest
public class SingleMock implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('{"success": true}');
        return res;
    }
}
```

### Multi-Endpoint Mock

```apex
@isTest
public class MultiMock implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        String endpoint = req.getEndpoint();
        
        if (endpoint.contains('/users')) {
            res.setStatusCode(200);
            res.setBody('{"users": []}');
        } else if (endpoint.contains('/orders')) {
            res.setStatusCode(200);
            res.setBody('{"orders": []}');
        } else {
            res.setStatusCode(404);
        }
        
        return res;
    }
}
```

### Configurable Mock

```apex
@isTest
public class ConfigurableMock implements HttpCalloutMock {
    private Integer statusCode;
    private String body;
    
    public ConfigurableMock(Integer statusCode, String body) {
        this.statusCode = statusCode;
        this.body = body;
    }
    
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(this.statusCode);
        res.setBody(this.body);
        return res;
    }
}

// Usage
Test.setMock(HttpCalloutMock.class, new ConfigurableMock(500, '{"error": "Server Error"}'));
```

### Static Resource Mock

```apex
StaticResourceCalloutMock mock = new StaticResourceCalloutMock();
mock.setStaticResource('MockResponse');
mock.setStatusCode(200);
mock.setHeader('Content-Type', 'application/json');
Test.setMock(HttpCalloutMock.class, mock);
```
