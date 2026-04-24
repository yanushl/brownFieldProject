# LWC Analysis Checklist

> What to look for when analyzing LWC components in a project.
> Use this to know WHAT to analyze, not to judge the code.

---

## Component Inventory — What to Count

| Metric | How to Find |
|--------|-------------|
| Total components | Count folders in `**/lwc/` |
| Simple vs Complex | Components with just .js/.html vs those with Service.js, apexService.js |
| Shared utilities | Components in `**/lwc/utils/` or `**/lwc/shared/` |
| Test coverage | Components with `__tests__/` folder |

---

## File Structure — What to Detect

### Simple Component Pattern
```
componentName/
├── componentName.js
├── componentName.html
├── componentName.css
└── componentName.js-meta.xml
```

### Complex Component Pattern (Service Layer)
```
componentName/
├── componentName.js          # UI logic only
├── componentName.html
├── componentName.css
├── componentName.js-meta.xml
├── apexService.js           # Apex call wrappers
├── Service.js               # Business logic
└── dto/                     # Data models
```

**Questions:**
- Does project use service layer separation?
- Where are shared utilities located?
- Is there a consistent folder structure?

---

## Data Source Patterns — What to Detect

| Pattern | How to Detect | Document |
|---------|---------------|----------|
| Wire Service | `@wire(` decorator | Count, show examples |
| Imperative Apex | `import ... from '@salesforce/apex/'` + manual calls | Count, show pattern |
| LDS (getRecord) | `import { getRecord } from 'lightning/uiRecordApi'` | Usage pattern |
| GraphQL | `import { gql, graphql } from 'lightning/uiGraphQLApi'` | If present |
| Static Resources | `import ... from '@salesforce/resourceUrl/'` | Count |

**Questions:**
- Wire or Imperative preferred?
- Is LDS used for record operations?
- How is data cached? (wire cache, localStorage, custom)

---

## Communication Patterns — What to Detect

| Pattern | How to Detect |
|---------|---------------|
| @api properties | `@api propertyName` |
| Custom Events | `new CustomEvent(`, `dispatchEvent(` |
| LMS | `import { publish, subscribe } from 'lightning/messageService'` |
| pubsub | Custom pubsub module usage |

**Document:**
- Event naming convention (lowercase? kebab-case?)
- bubbles/composed settings used
- LMS channel names

---

## Template Patterns — What to Detect

| Pattern | Modern | Deprecated | Document |
|---------|--------|------------|----------|
| Conditionals | `lwc:if`, `lwc:elseif`, `lwc:else` | `if:true`, `if:false` | Which is used? |
| Iteration | `for:each` with `key` | Missing keys | Key approach |
| Dynamic classes | Getter returning string | Inline expressions | Pattern used |
| Slots | `<slot>`, `<slot name="x">` | — | Usage |

**Anti-patterns to detect:**
- Inline expressions in template (`{a + b}`, ternaries)
- Missing keys in for:each
- Inline event arguments

---

## State Management — What to Detect

| Pattern | How to Detect |
|---------|---------------|
| Reactive properties | Class fields without decorator |
| @track | `@track` decorator (for nested objects) |
| Getters | `get propertyName()` for computed values |
| Singleton store | Shared module with state |
| @lwc/state | `import { atom, computed } from '@lwc/state'` |

**Questions:**
- How is component state managed?
- Are computed values using getters?
- Is there cross-component state sharing?

---

## Lifecycle Hooks — What to Detect

| Hook | Search Pattern | Document Usage |
|------|---------------|----------------|
| constructor | `constructor()` | Initialization pattern |
| connectedCallback | `connectedCallback()` | Data fetching, subscriptions |
| renderedCallback | `renderedCallback()` | DOM manipulation |
| disconnectedCallback | `disconnectedCallback()` | Cleanup pattern |
| errorCallback | `errorCallback(` | Error boundary usage |

**Questions:**
- Do components clean up in disconnectedCallback?
- Is renderedCallback guarded against infinite loops?

---

## Styling — What to Detect

| Aspect | How to Detect |
|--------|---------------|
| SLDS classes | `slds-*` class names in HTML |
| Custom CSS | Non-SLDS styles in .css files |
| CSS variables | `var(--slds-*` or custom `--var-*` |
| Dynamic styles | Getters returning style strings |
| Scoped styles | `:host` selector usage |

**Questions:**
- SLDS-first or custom CSS?
- Dark mode ready (CSS variables vs hardcoded colors)?

---

## Accessibility — What to Detect

| Aspect | How to Detect |
|--------|---------------|
| ARIA labels | `aria-label`, `aria-labelledby` |
| ARIA roles | `role=` attributes |
| Keyboard handling | `onkeydown`, `onkeyup` handlers |
| Focus management | `this.template.querySelector(...).focus()` |
| Live regions | `aria-live` |

---

## Testing — What to Detect

| Aspect | How to Detect |
|--------|---------------|
| Jest setup | `jest.config.js`, `__tests__/` folders |
| Test files | `*.test.js` files |
| Mock patterns | `jest.mock(` |
| DOM cleanup | `afterEach` with DOM cleanup |
| Apex mocking | Mocked `@salesforce/apex/*` imports |

**Questions:**
- What mocking approach is used?
- Is DOM cleanup performed?
- Are wire adapters mocked?

---

## Error Handling — What to Detect

| Pattern | How to Detect |
|---------|---------------|
| Try-catch | `try {` blocks in JS |
| Error properties | `@track error`, `this.error` |
| Toast notifications | `import { ShowToastEvent }` |
| Error components | Custom error display components |
| Wire error handling | `wiredResult.error` checks |

---

## Flow Integration — What to Detect

| Pattern | How to Detect |
|---------|---------------|
| Flow inputs | `@api` with `role="inputOnly"` in meta.xml |
| Flow outputs | `FlowAttributeChangeEvent` |
| Flow navigation | `FlowNavigationFinishEvent` |
| Available actions | `@api availableActions` |

---

## Performance Patterns — What to Detect

| Pattern | How to Detect |
|---------|---------------|
| Debouncing | `setTimeout` with `clearTimeout` pattern |
| Lazy loading | `lwc:if` to defer rendering |
| Caching | localStorage usage, custom cache |
| Virtual scrolling | Custom or library implementation |

---

## Output Format

Document what you FIND:

```markdown
### Data Source Approach (Observed)

| Pattern | Count | Example Component |
|---------|-------|-------------------|
| Wire Service | 12 | `accountList`, `contactCard` |
| Imperative Apex | 8 | `orderForm`, `searchResults` |
| LDS | 3 | `recordDetail` |
```

**Do NOT:**
- Score the code
- Say what's "wrong"
- Prescribe fixes

**DO:**
- Describe what IS
- Show real examples
- Note patterns (consistent or inconsistent)
