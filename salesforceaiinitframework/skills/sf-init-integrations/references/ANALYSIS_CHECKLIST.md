# Integration Analysis Checklist

> Use this checklist to ensure comprehensive analysis of integration patterns.

## Named Credentials & Authentication

- [ ] List all Named Credentials in the project
- [ ] Identify authentication protocol for each (OAuth, Basic, JWT, Certificate)
- [ ] Check for Legacy vs Enhanced Named Credentials
- [ ] Document any External Credentials
- [ ] Note certificate usage for mutual TLS

## HTTP Callout Classes

- [ ] Find all classes making HTTP callouts
- [ ] Document endpoint configuration pattern (Named Credential, Custom Setting, hardcoded)
- [ ] Identify HTTP methods used (GET, POST, PUT, PATCH, DELETE)
- [ ] Check timeout configuration
- [ ] Note Content-Type and Accept headers
- [ ] Document custom headers

## Request Building

- [ ] How is request body built? (JSON.serialize, manual)
- [ ] How are query parameters handled?
- [ ] URL encoding approach
- [ ] Request wrapper/DTO classes

## Response Handling

- [ ] Status code checking pattern
- [ ] Response deserialization approach
- [ ] Error response parsing
- [ ] Success criteria (200 only? 2xx range?)

## Error Handling

- [ ] Custom exception classes for integrations
- [ ] Retry logic presence and pattern
- [ ] Circuit breaker patterns
- [ ] Logging approach for failures
- [ ] Graceful degradation

## Async Patterns

- [ ] @future(callout=true) usage
- [ ] Queueable with Database.AllowsCallouts
- [ ] Batch with Database.AllowsCallouts
- [ ] Chained async jobs

## Platform Events

- [ ] List all Platform Events (*__e)
- [ ] Document publishers (Apex, Flow, Process Builder)
- [ ] Document subscribers (Trigger, Flow, CometD)
- [ ] Event payload structure

## External Services

- [ ] OpenAPI/Swagger based services
- [ ] Auto-generated Apex classes
- [ ] Schema location

## Testing

- [ ] HttpCalloutMock implementations
- [ ] Static resource mocks
- [ ] Multi-endpoint mock patterns
- [ ] Error scenario coverage

## Governor Limits

- [ ] Callout count awareness (max 100)
- [ ] Response size handling (max 12 MB)
- [ ] Timeout configuration (max 120s)
- [ ] Long-running callout handling

## Security

- [ ] Sensitive data in logs?
- [ ] Credentials in code?
- [ ] Certificate rotation process
