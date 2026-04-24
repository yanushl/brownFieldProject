---
name: sf-init-integrations
description: Analyze integration patterns and generate integrations.md. Documents Named Credentials, HTTP callout patterns, authentication methods, error handling, Platform Events, and External Services. Creates a "snapshot" of how the team builds integrations. Use when setting up AI context for integration development.
---

# Integration Patterns Analyzer

## Purpose

**Analyze** existing integration code and document how THIS project handles external communications. The output enables AI to write integration code consistent with the project's existing patterns.

**This is ANALYSIS, not prescription.** We document what IS, not what SHOULD BE.

## Output

Creates `integrations.md` in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/integrations.md` | `globs: ["**/*.cls", "**/*.namedCredential-meta.xml", "**/*.externalServiceRegistration-meta.xml"]`<br>`alwaysApply: false` |
| **Claude Code** | `.claude/rules/integrations.md` | `paths: ["**/*.cls", "**/*.namedCredential-meta.xml"]` |
| **Copilot** | `.github/instructions/integrations.instructions.md` | `applyTo: "**/*.cls,**/*.namedCredential-meta.xml"` |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Integration Patterns`) |

## References (What to Look For)

| Reference | Use for |
|-----------|---------|
| [ANALYSIS_CHECKLIST.md](references/ANALYSIS_CHECKLIST.md) | Complete checklist of aspects to analyze |
| [CALLOUT_PATTERNS.md](references/CALLOUT_PATTERNS.md) | Common callout patterns to detect |

---

## Analysis Workflow

### Phase 1: Named Credentials Inventory

```
1. Glob: force-app/**/namedCredentials/*.namedCredential-meta.xml
2. Parse each file for:
   - Name and label
   - Endpoint URL pattern
   - Authentication protocol (OAuth, Password, JWT, etc.)
   - Certificate usage
```

**Document:**

| Named Credential | Endpoint | Auth Type | Used By |
|------------------|----------|-----------|---------|
| `MyService` | `https://api.example.com` | OAuth 2.0 | `MyServiceCallout.cls` |

### Phase 2: External Services (OpenAPI)

```
1. Glob: force-app/**/externalServiceRegistrations/*.externalServiceRegistration-meta.xml
2. Check for:
   - Service name
   - Schema reference
   - Operations available
```

**Document:** Which external services are registered and their purpose.

### Phase 3: HTTP Callout Pattern Analysis

Search for callout classes and analyze patterns:

```apex
// Search patterns:
- HttpRequest / HttpResponse usage
- new Http().send(
- callout: prefix in endpoints
```

**For each callout class, document:**

| Aspect | What to Look For |
|--------|------------------|
| **Base URL handling** | Hardcoded? Named Credential? Custom Setting? |
| **HTTP methods used** | GET, POST, PUT, PATCH, DELETE |
| **Headers** | Content-Type, Authorization, custom headers |
| **Timeout** | `setTimeout()` value (default 10s, max 120s) |
| **Body serialization** | `JSON.serialize()`, manual string building? |
| **Response handling** | Status code checks, JSON.deserialize pattern |

### Phase 4: Authentication Patterns

Identify how authentication is handled:

| Pattern | Search For |
|---------|------------|
| **Named Credential** | `callout:CredentialName` |
| **OAuth Token** | `access_token`, `Bearer `, token refresh logic |
| **API Key** | `X-API-Key`, `apiKey` headers |
| **Basic Auth** | `Authorization: Basic`, `EncodingUtil.base64Encode` |
| **JWT** | `JWT`, `jsonwebtoken`, certificate signing |
| **Certificate** | `setClientCertificateName()` |

### Phase 5: Error Handling Patterns

Analyze how callout errors are handled:

```apex
// Look for:
try {
    HttpResponse res = http.send(req);
    if (res.getStatusCode() != 200) {
        // How is this handled?
    }
} catch (CalloutException e) {
    // Retry? Log? Throw custom exception?
}
```

**Document:**

| Aspect | Pattern Found |
|--------|---------------|
| Success codes | 200 only? 2xx range? |
| Error response parsing | Is error body parsed? |
| Retry logic | Present? How many retries? |
| Circuit breaker | Any pattern to prevent repeated failures? |
| Logging | How are failures logged? |
| Custom exceptions | `IntegrationException`, `CalloutException`? |

### Phase 6: Async Callout Patterns

Callouts from triggers require async:

```apex
// Look for:
- @future(callout=true)
- Queueable with Database.AllowsCallouts
- Batch with Database.AllowsCallouts
```

**Document:** Which async pattern is used and why.

### Phase 7: Platform Events

```
1. Glob: force-app/**/objects/*__e/*.object-meta.xml
2. For each platform event:
   - Name and purpose
   - Fields (payload structure)
   - Publishers (who publishes)
   - Subscribers (triggers, flows, Apex)
```

### Phase 8: Mock Patterns for Testing

Search for mock implementations:

```apex
// Look for:
- implements HttpCalloutMock
- Test.setMock(HttpCalloutMock.class, ...)
- MultiStaticResourceCalloutMock
- StaticResourceCalloutMock
```

**Document:**

| Aspect | Pattern Found |
|--------|---------------|
| Mock class location | Same file? Separate `*Mock.cls`? |
| Response simulation | Static JSON? Dynamic based on request? |
| Multi-response mocks | How are different endpoints mocked? |
| Error scenario mocks | Are failure cases tested? |

### Phase 9: Rate Limiting & Governor Limits

Check for patterns handling limits:

```apex
// Look for:
- Limits.getCallouts() / Limits.getLimitCallouts()
- Bulkification of callouts
- Callout chaining (one callout triggers another)
```

### Phase 10: Request/Response DTOs

```
1. Look for wrapper classes used in integrations
2. Check for JSON annotations: @JsonAccess, @AuraEnabled
3. Document DTO naming pattern: *Request, *Response, *DTO
```

---

## Output Template

```markdown
---
description: Integration patterns and callout conventions used in THIS project
globs: ["**/*Callout*.cls", "**/*Service*.cls", "**/*Integration*.cls", "**/*Api*.cls"]
alwaysApply: false
---

# Integration Patterns

> How external integrations are built in this project.

## Named Credentials

| Name | Endpoint | Auth Type | Purpose |
|------|----------|-----------|---------|
| `ExampleAPI` | `https://api.example.com` | OAuth 2.0 | Main external service |

## External Services

| Service | Schema | Operations |
|---------|--------|------------|
| [None found / List services] |

---

## HTTP Callout Pattern

### Base Pattern (Observed)

\`\`\`apex
// Real example from project
public class ExampleCallout {
    private static final String NAMED_CREDENTIAL = 'callout:ExampleAPI';
    
    public ExampleResponse makeRequest(ExampleRequest request) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CREDENTIAL + '/endpoint');
        req.setMethod('POST');
        req.setTimeout(120000);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(request));
        
        HttpResponse res = new Http().send(req);
        
        if (res.getStatusCode() == 200) {
            return (ExampleResponse) JSON.deserialize(res.getBody(), ExampleResponse.class);
        } else {
            throw new IntegrationException('Callout failed: ' + res.getStatusCode());
        }
    }
}
\`\`\`

### Endpoint Configuration

| Aspect | Pattern |
|--------|---------|
| Base URL | [Named Credential / Custom Metadata / Hardcoded] |
| Path building | [String concatenation / UriBuilder / etc.] |
| Query params | [Manual encoding / PageReference / etc.] |

### Headers Used

| Header | Value/Pattern |
|--------|---------------|
| Content-Type | `application/json` |
| Accept | `application/json` |
| [Custom headers found] |

---

## Authentication

**Primary method:** [Named Credential with OAuth 2.0 / etc.]

### Token Management (if applicable)

\`\`\`apex
// Token refresh pattern if found
\`\`\`

---

## Error Handling

### Status Code Handling

\`\`\`apex
// Real pattern from project
if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
    // Success
} else if (res.getStatusCode() == 401) {
    // Auth error - refresh token?
} else if (res.getStatusCode() == 429) {
    // Rate limited - retry?
} else {
    // Other error
}
\`\`\`

### Custom Exceptions

| Exception Class | When Thrown |
|-----------------|-------------|
| `IntegrationException` | Callout failures |
| [Others found] |

### Retry Logic

[Describe retry pattern if found, or note absence]

---

## Async Callouts

### Pattern Used

| Context | Async Method |
|---------|--------------|
| From Trigger | `@future(callout=true)` |
| Bulk processing | `Queueable` with `Database.AllowsCallouts` |
| Large data | `Batch` with `Database.AllowsCallouts` |

### Example

\`\`\`apex
// Real async callout example from project
\`\`\`

---

## Platform Events

| Event | Purpose | Publisher | Subscriber |
|-------|---------|-----------|------------|
| `Order_Update__e` | Notify external system | OrderTrigger | External subscription |

---

## Request/Response DTOs

### Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Request | `*Request` | `SearchRequest` |
| Response | `*Response` | `SearchResponse` |
| Wrapper | `*DTO` | `AccountDTO` |

### Example DTO

\`\`\`apex
// Real DTO from project
public class SearchRequest {
    public String query;
    public Integer pageSize;
    public Integer pageNumber;
}
\`\`\`

---

## Testing Callouts

### Mock Pattern

\`\`\`apex
// Real mock implementation from project
@isTest
public class ExampleCalloutMock implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('{"status": "success"}');
        return res;
    }
}
\`\`\`

### Usage in Tests

\`\`\`apex
@isTest
static void testCallout() {
    Test.setMock(HttpCalloutMock.class, new ExampleCalloutMock());
    // Test code
}
\`\`\`

---

## Governor Limits Awareness

| Limit | Value | Project Handling |
|-------|-------|------------------|
| Callouts per transaction | 100 | [How handled] |
| Timeout | 120s max | [Configured value] |
| Response size | 12 MB | [Any handling] |

---

## Integration Inventory

| Class | Type | External System | Status |
|-------|------|-----------------|--------|
| `ExampleCallout` | REST | Example API | Active |
| [List all integration classes] |

---

*Generated by sf-init-integrations on [DATE]*
```

---

## Analysis Commands

### Find Named Credentials

```bash
find force-app -name "*.namedCredential-meta.xml" -exec basename {} \;
```

### Find Callout Classes

```bash
grep -r "HttpRequest\|HttpResponse\|Http().send" force-app --include="*.cls" -l
```

### Find Platform Events

```bash
find force-app -path "*__e*" -name "*.object-meta.xml"
```

### Find Mock Classes

```bash
grep -r "implements HttpCalloutMock" force-app --include="*.cls" -l
```
