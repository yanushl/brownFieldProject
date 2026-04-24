---
name: sf-init-lwc
description: Analyze LWC components and generate lwc.md documenting THIS project's structure, patterns, and conventions. Creates a "snapshot" of how the team builds components. Use when setting up AI context for LWC development.
---

# LWC Structure Analyzer

## Purpose

**Analyze** existing Lightning Web Components and document how THIS project builds frontend. The output enables AI to write components consistent with the project's existing style.

**This is ANALYSIS, not prescription.** We document what IS, not what SHOULD BE.

## Output

Creates `lwc.md` in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/lwc.md` | `globs: ["**/lwc/**/*.js", "**/lwc/**/*.html", "**/lwc/**/*.css"]`<br>`alwaysApply: false` |
| **Claude Code** | `.claude/rules/lwc.md` | `paths: ["**/lwc/**/*.js", "**/lwc/**/*.html", "**/lwc/**/*.css"]` |
| **Copilot** | `.github/instructions/lwc.instructions.md` | `applyTo: "**/lwc/**/*.js,**/lwc/**/*.html,**/lwc/**/*.css"` |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## LWC Patterns`) |

## References (What to Look For)

These files guide the analysis process — what patterns to detect.

| Reference | Use for |
|-----------|---------|
| [ANALYSIS_CHECKLIST.md](references/ANALYSIS_CHECKLIST.md) | Complete checklist of aspects to analyze |
| [TEMPLATE_PATTERNS.md](references/TEMPLATE_PATTERNS.md) | Template syntax patterns to detect |

---

## Analysis Workflow

### Phase 1: Component Inventory

```
1. Glob: **/lwc/*/*.js-meta.xml
2. Count total components
3. Identify package directories (force-app, other packages)
```

**Document:**
- Total component count
- Distribution across packages
- Folder organization pattern

### Phase 2: File Structure Analysis

For each major component, check structure:

| Structure Type | Indicators |
|----------------|------------|
| Simple | Just .js, .html, .css, .js-meta.xml |
| With Tests | Has `__tests__/` folder |
| Service Layer | Has `apexService.js`, `Service.js` |
| DTO Layer | Has `dto/` folder |
| Shared Utils | Located in `utils/`, `shared/` |

**Document:** Which structure pattern(s) are used.

### Phase 3: Data Source Analysis

Search for patterns:

| Pattern | Search | Document |
|---------|--------|----------|
| Wire Service | `@wire(` | Count, show example |
| Imperative Apex | `import.*from '@salesforce/apex/'` (without @wire) | Count, show pattern |
| LDS | `import { getRecord` | Usage pattern |
| GraphQL | `import.*from 'lightning/uiGraphQLApi'` | If present |
| Refresh pattern | `refreshApex(` | How data is refreshed |

### Phase 4: Communication Patterns

| Pattern | Search | Document |
|---------|--------|----------|
| @api properties | `@api` decorator | Count, naming |
| Custom Events | `new CustomEvent(` | Event names, bubbles/composed |
| LMS | `import.*from 'lightning/messageService'` | Channel names |
| pubsub | Custom pubsub module | If present |

### Phase 5: Template Patterns

Check HTML files for:

| Aspect | Modern | Deprecated |
|--------|--------|------------|
| Conditionals | `lwc:if` | `if:true` |
| Iteration | `for:each` with `key` | Missing keys |
| Dynamic classes | Via getter | Inline expressions |

**Document:** Which syntax style is used. Any anti-patterns present?

### Phase 6: State Management

| Pattern | Search |
|---------|--------|
| @track | `@track` decorator |
| Getters | `get propertyName()` |
| Reactive props | Class fields |
| Store pattern | Shared state module |

### Phase 7: Lifecycle Usage

| Hook | Search | Document |
|------|--------|----------|
| connectedCallback | `connectedCallback()` | What's initialized |
| renderedCallback | `renderedCallback()` | DOM manipulation |
| disconnectedCallback | `disconnectedCallback()` | Cleanup pattern |

### Phase 8: Styling Analysis

| Aspect | How to Check |
|--------|--------------|
| SLDS usage | `slds-` classes in HTML |
| Custom CSS | Non-SLDS styles |
| CSS variables | `var(--` usage |
| Scoped styles | `:host` in CSS |

### Phase 9: Testing Approach

| Aspect | Check |
|--------|-------|
| Test files | `*.test.js` existence |
| Mock patterns | `jest.mock(` usage |
| DOM cleanup | `afterEach` patterns |
| Coverage | Config files |

### Phase 10: Error Handling

| Pattern | Search |
|---------|--------|
| Try-catch | `try {` in async methods |
| Toast | `ShowToastEvent` import |
| Wire errors | `.error` property handling |

---

## Output Template

```markdown
---
description: LWC structure and conventions used in THIS project
globs: ["**/lwc/**/*.js", "**/lwc/**/*.html"]
alwaysApply: false
---

# LWC Structure

> How Lightning Web Components are built in this project.

## Component Inventory

| Metric | Value |
|--------|-------|
| Total components | X |
| With tests | X |
| Packages | [list] |

### Component Distribution

| Type | Count | Examples |
|------|-------|----------|
| UI Components | X | `accountCard`, `searchBar` |
| Utility Components | X | `modal`, `datePicker` |
| Service Components | X | `utils`, `apexService` |

---

## File Structure (Observed)

### Standard Component
\`\`\`
componentName/
├── componentName.js
├── componentName.html
├── componentName.css
└── componentName.js-meta.xml
\`\`\`

### Complex Component (if used)
\`\`\`
componentName/
├── componentName.js          # UI logic
├── componentName.html
├── componentName.css
├── componentName.js-meta.xml
├── apexService.js           # Apex wrappers (if present)
└── Service.js               # Business logic (if present)
\`\`\`

---

## Data Source Approach

| Pattern | Usage | Example |
|---------|-------|---------|
| Wire Service | [count] components | `accountList` |
| Imperative Apex | [count] components | `orderForm` |
| LDS (getRecord) | [count] components | `recordDetail` |

### Wire Example (from project)
\`\`\`javascript
// File: [path]
// Real wire pattern from project
\`\`\`

### Imperative Example (from project)
\`\`\`javascript
// File: [path]
// Real imperative pattern from project
\`\`\`

---

## Communication Patterns

| Pattern | Usage |
|---------|-------|
| @api properties | Parent → Child |
| Custom Events | Child → Parent |
| LMS | [if used] |

### Event Naming Convention
- Event names: [lowercase / kebab-case / observed pattern]
- bubbles: [typically true/false]
- composed: [typically true/false]

### Custom Event Example (from project)
\`\`\`javascript
// File: [path]
// Real event dispatch from project
\`\`\`

\`\`\`html
<!-- Parent template -->
<!-- Real event listener from project -->
\`\`\`

---

## Template Patterns

### Conditional Rendering
**Syntax used:** [lwc:if / if:true / mixed]

\`\`\`html
<!-- Real example from project -->
\`\`\`

### Iteration Pattern
**Key approach:** [unique ID / composite / index]

\`\`\`html
<!-- Real example from project -->
\`\`\`

### Dynamic Classes
**Approach:** [getter / direct property]

\`\`\`javascript
// Real example from project
\`\`\`

---

## State Management

| Pattern | Usage |
|---------|-------|
| @track | [yes/no/when] |
| Getters | [common/rare] |
| Shared store | [if present] |

### State Example (from project)
\`\`\`javascript
// File: [path]
// Real state management from project
\`\`\`

---

## Lifecycle Hooks Usage

| Hook | Used for |
|------|----------|
| connectedCallback | [what's done] |
| renderedCallback | [what's done] |
| disconnectedCallback | [cleanup pattern] |

### Example (from project)
\`\`\`javascript
// File: [path]
// Real lifecycle usage from project
\`\`\`

---

## Styling Approach

| Aspect | Finding |
|--------|---------|
| Primary | [SLDS / Custom / Mixed] |
| CSS Variables | [used / not used] |
| Scoped styles | [:host usage] |

### CSS Example (from project)
\`\`\`css
/* File: [path] */
/* Real CSS from project */
\`\`\`

---

## Error Handling

| Pattern | Usage |
|---------|-------|
| Try-catch | [yes/no] |
| Toast notifications | [yes/no] |
| Error display | [component/inline] |

### Error Handling Example (from project)
\`\`\`javascript
// File: [path]
// Real error handling from project
\`\`\`

---

## Testing Approach

| Aspect | Finding |
|--------|---------|
| Test files | [count] |
| Mock pattern | [describe] |
| DOM cleanup | [yes/no] |

### Test Example (from project)
\`\`\`javascript
// File: [path]
// Real test pattern from project
\`\`\`

---

## meta.xml Patterns

**API Version:** [observed]

**Common targets:**
\`\`\`xml
<!-- Real meta.xml from project -->
\`\`\`

---

*Analyzed from: [X] components*
*Generated: [date]*
```

---

## Verification Checklist

After generating, verify:

- [ ] Component inventory complete
- [ ] File structure pattern(s) documented
- [ ] Data source approach documented with real examples
- [ ] Communication patterns documented
- [ ] Template syntax style identified (modern vs deprecated)
- [ ] State management approach documented
- [ ] Styling approach documented
- [ ] Error handling pattern documented
- [ ] At least 1 real example for each pattern found

---

## Notes

- **Extract, don't prescribe** — document what IS, not what SHOULD BE
- **Real examples only** — every code block should be from the actual project
- **Observe patterns** — if the team uses `if:true`, document that (don't "correct" it)
- **Note gaps** — if something is missing (no tests, no cleanup), note it neutrally
- **Focus on consistency** — note if patterns are consistent or mixed
