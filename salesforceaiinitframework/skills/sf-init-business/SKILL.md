---
name: sf-init-business
description: Extract business processes, user journeys, and domain terminology from external sources. Generates business.md with flows, rules, and glossary. Uses MCP connectors (Confluence, Jira, Playwright) for retrieval. Use when documenting HOW the system works, not just WHAT it is.
---

# Business Processes Initializer

## Purpose

Extract and document core business flows, user journeys, and domain terminology to help AI agents understand HOW the system works.

## Output

Creates `business.md` (combines processes and glossary in one file) in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/business.md` | `alwaysApply: true` |
| **Claude Code** | `.claude/rules/business.md` | No `paths` = always loaded |
| **Copilot** | `.github/instructions/business.instructions.md` | No `applyTo` = always applies |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Business Processes`) |

---

## Difference from sf-init-context

| sf-init-context | sf-init-business |
|-----------------|------------------|
| **What** is the project | **How** does it work |
| Goals, stakeholders | Workflows, user journeys |
| High-level overview | Step-by-step processes |
| Static information | Dynamic flows |

---

## Input

User provides list of URLs/sources:

```
Sources:
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/123/User+Stories
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/456/Process+Flows
- Jira Filter: https://company.atlassian.net/issues/?filter=12345 (user stories)
- Figma/Miro: https://miro.com/app/board/xxx (process diagrams)
```

---

## Retrieval Methods

### Method 1: Confluence MCP

```
Use MCP: confluence
Target pages: User Stories, Process Flows, Business Rules, Use Cases
```

### Method 2: Chrome DevTools / Playwright MCP

For authenticated sources (Miro, Figma, Jira):

```
Use MCP: chrome-devtools or playwright
Steps:
1. Navigate to URL
2. Take snapshot of process diagrams
3. Extract text from user stories
4. Parse acceptance criteria
```

### Method 3: Jira MCP

```
Use MCP: jira
Query: project = PROJ AND type = Story
Extract: Summary, Description, Acceptance Criteria
```

### Method 4: Manual Input

```
"Please provide:
- Main user flows (step by step)
- Key business rules
- Domain-specific terminology"
```

---

## Workflow

```
1. User provides source URLs
   ↓
2. For each URL:
   ├── Identify content type (User Story, Flow Diagram, Rules)
   ├── Extract using appropriate MCP/method
   └── Store raw content
   ↓
3. Categorize extracted content:
   ├── Core Flows (happy paths)
   ├── Edge Cases / Exceptions
   ├── Business Rules
   ├── User Journeys
   └── Domain Terminology
   ↓
4. Structure and generate business.md
   (combines flows, rules, and glossary)
   ↓
5. Update INDEX.md
   ↓
6. Ask user to verify/correct
```

---

## What to Extract

### Core Business Flows

| Flow Type | What to Document |
|-----------|------------------|
| **Happy Path** | Main successful scenario |
| **Trigger** | What starts this flow |
| **Steps** | Numbered sequence |
| **Outcome** | What happens at the end |
| **Actors** | Who performs each step |

### Business Rules

| Rule Type | Example |
|-----------|---------|
| **Validation** | "Email must be unique per account" |
| **Calculation** | "Discount = 15% if amount > $10K" |
| **Authorization** | "Only managers can approve > $50K" |
| **Timing** | "Cases auto-close after 30 days" |

### Domain Terminology

| Term | Why Important |
|------|---------------|
| **Domain objects** | What entities exist |
| **Statuses** | Lifecycle states |
| **Relationships** | How entities connect |
| **Abbreviations** | Team-specific terms |

---

## Output Template

### business.md

```markdown
---
description: Business processes, domain flows, and terminology glossary
globs: ["**/*.cls", "**/*.trigger", "**/*.flow-meta.xml"]
alwaysApply: false
---

# Business Processes & Domain

## Overview
[One paragraph describing the main business domain]

---

## Core Flows

### 1. [Primary Flow Name]

**Trigger**: [What initiates this flow]
**Actors**: [Who is involved]

\`\`\`mermaid
flowchart TD
    A[Start] --> B[Step 1]
    B --> C{Decision}
    C -->|Yes| D[Step 2a]
    C -->|No| E[Step 2b]
    D --> F[End]
    E --> F
\`\`\`

**Steps**:
1. **[Step Name]** - [Description]
   - Actor: [who]
   - Input: [what's needed]
   - Output: [what's produced]

**Outcome**: [What happens when flow completes]

**Business Rules**:
- [Rule 1]
- [Rule 2]

---

## Edge Cases & Exceptions

### [Exception 1]
- **Trigger**: [What causes this]
- **Handling**: [How it's resolved]

---

## Business Rules Summary

| Rule ID | Rule | Applies To | Validation |
|---------|------|------------|------------|
| BR-001 | [Rule description] | [Object/Flow] | [How enforced] |

---

## Domain Glossary

### Core Objects

| Term | Definition | Example |
|------|------------|---------|
| **[Term 1]** | [Definition in project context] | [Example usage] |

### Statuses & States

| Object | Status | Meaning |
|--------|--------|---------|
| [Object] | [Status 1] | [What it means] |

### Actions & Operations

| Action | Description | Trigger |
|--------|-------------|---------|
| [Action 1] | [What happens] | [When/how triggered] |

### Abbreviations

| Abbreviation | Full Term | Context |
|--------------|-----------|---------|
| [Abbr] | [Full] | [Where used] |

---

*Sources: [list of URLs/documents used]*
*Generated: [date]*
```

---

## Verification

After generating, ask user:

```
I've extracted the following business processes:

**Flows Identified**: [count]
- [Flow 1 name]
- [Flow 2 name]

**Business Rules**: [count] rules documented
**Glossary Terms**: [count] terms defined

Please review:
1. Are all main flows captured?
2. Are the business rules accurate?
3. Any missing terminology?
```

---

## Notes

- Focus on WHAT happens, not HOW it's implemented
- Use Mermaid diagrams for complex flows
- Keep flows at business level, not technical level
- Document "why" behind business rules when known
- Mark uncertain information with [?] or [TODO: verify]
