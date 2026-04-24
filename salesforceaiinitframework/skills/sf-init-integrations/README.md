# sf-init-integrations

> Analyze integration patterns and generate documentation for AI context.

## Purpose

Creates a "snapshot" of how YOUR project handles external integrations — Named Credentials, HTTP callouts, authentication patterns, error handling, and Platform Events.

## Usage

```
User: /sf-init-integrations
```

### With Platform Target

```
User: /sf-init-integrations for Cursor
User: /sf-init-integrations for GitHub Copilot
```

## What It Analyzes

| Area | What We Look For |
|------|------------------|
| **Named Credentials** | Endpoints, auth types, usage |
| **HTTP Callouts** | Request building, headers, timeouts |
| **Authentication** | OAuth, API Key, JWT, certificates |
| **Error Handling** | Status codes, retries, exceptions |
| **Async Patterns** | @future, Queueable, Batch callouts |
| **Platform Events** | Event definitions, publishers, subscribers |
| **Testing** | Mock patterns, coverage |

## Output

Creates `integrations.md` (platform-specific location) with:

- Named Credentials inventory
- HTTP callout base pattern (with real code example)
- Authentication approach
- Error handling patterns
- Async callout patterns
- Platform Events list
- Request/Response DTOs
- Mock patterns for testing

## Prerequisites

- Salesforce project with `force-app/` structure
- Existing integration code to analyze

## Example Output Sections

### Named Credentials Table

```markdown
| Name | Endpoint | Auth Type | Purpose |
|------|----------|-----------|---------|
| `PaymentGateway` | `https://api.stripe.com` | OAuth 2.0 | Payment processing |
| `ShippingAPI` | `https://api.fedex.com` | API Key | Shipping rates |
```

### Callout Pattern

```apex
public class PaymentService {
    private static final String NAMED_CRED = 'callout:PaymentGateway';
    
    public PaymentResponse charge(PaymentRequest request) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CRED + '/v1/charges');
        req.setMethod('POST');
        req.setTimeout(60000);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(request));
        
        HttpResponse res = new Http().send(req);
        // ...
    }
}
```

## See Also

- [SKILL.md](SKILL.md) — Full skill definition
- [references/ANALYSIS_CHECKLIST.md](references/ANALYSIS_CHECKLIST.md) — What to look for
- [references/CALLOUT_PATTERNS.md](references/CALLOUT_PATTERNS.md) — Common patterns
