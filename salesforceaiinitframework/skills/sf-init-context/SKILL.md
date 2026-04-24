---
name: sf-init-context
description: Extract project context from external sources (Confluence, web docs) and generate project.md. Uses MCP connectors (Confluence, Playwright, Chrome DevTools) or WebFetch to retrieve content. Use when setting up AI context for a new Salesforce project or documenting project background.
---

# Project Context Initializer

## Purpose

Extract and document project background, goals, and stakeholders from external sources to provide AI agents with business context.

## Output

Creates `project.md` in platform-specific location.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/project.md` | `alwaysApply: true` |
| **Claude Code** | `.claude/rules/project.md` | No `paths` = always loaded |
| **Copilot** | `.github/instructions/project.instructions.md` | No `applyTo` = always applies |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Project Overview`) |

**Important**: If INDEX.md doesn't exist, create it first using the template below. Then update it to include this file.

### INDEX.md Template (create if missing)

```markdown
# Project Context Index

> Navigation for AI agents. Read this first.

| Topic | File | When to read |
|-------|------|--------------|
| Project overview | [project.md](project.md) | Before any task |
| Business processes | [business.md](business.md) | Understanding domain |
| Data model | [data-model.md](data-model.md) | Working with objects |
| Apex patterns | [apex.md](apex.md) | Writing Apex code |
| LWC patterns | [lwc.md](lwc.md) | Building components |
| Testing | [testing.md](testing.md) | Writing tests |
| DevOps | [devops.md](devops.md) | Deployment tasks |

## Reading Order

1. Start with `project.md` for context
2. Read `data-model.md` to understand objects
3. Read relevant guide for your task
```

---

## Input

User provides list of URLs/sources:

```
Sources:
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/123456/Project+Overview
- Google Docs: https://docs.google.com/document/d/xxx/edit
- SharePoint: https://company.sharepoint.com/sites/project/docs/requirements.docx
- Jira Epic: https://company.atlassian.net/browse/PROJ-123
```

---

## Retrieval Methods

### Method 1: Confluence MCP (Preferred)

```
Use MCP: confluence
Action: Get page content by URL
Extract: Title, body, child pages if needed
```

### Method 2: Chrome DevTools / Playwright MCP

For authenticated web pages:

```
Use MCP: chrome-devtools or playwright
Steps:
1. Navigate to URL
2. Wait for content load
3. Take snapshot or extract text
4. Parse relevant sections
```

### Method 3: WebFetch (Public Pages)

```
Use tool: WebFetch
URL: [provided URL]
Parse: Extract markdown content
```

### Method 4: Manual Input

If MCP not available:

```
"Please paste the content from [URL] or provide a summary of:
- Project name and purpose
- Key goals and objectives
- Main stakeholders"
```

---

## Workflow

```
1. User provides source URLs
   ↓
2. For each URL:
   ├── Detect source type (Confluence, Google Docs, Web)
   ├── Select retrieval method (MCP / WebFetch / Manual)
   └── Extract raw content
   ↓
3. Parse and structure content:
   ├── Project name
   ├── Problem statement
   ├── Goals & objectives
   ├── Key stakeholders
   ├── Constraints & assumptions
   └── Success criteria
   ↓
4. Generate PROJECT_OVERVIEW.md
   ↓
5. Ask user to verify/correct
```

---

## What to Extract

| Section | What to Look For | Example |
|---------|------------------|---------|
| **Project Name** | Title, header | "Customer Risk Screening (CRS)" |
| **Problem Statement** | Why this project exists | "Manual screening takes 2+ hours per case" |
| **Goals** | Measurable objectives | "Reduce screening time to <15 min" |
| **Stakeholders** | Who's involved | "Compliance team, Risk managers, IT" |
| **Users** | Who uses the system | "Compliance analysts, Case reviewers" |
| **Constraints** | Technical/business limits | "Must integrate with World-Check API" |
| **Timeline** | Key dates | "Go-live Q2 2026" |
| **Success Criteria** | How to measure success | "95% automation rate" |

---

## Output Template

```markdown
# Project Overview

## Project Name
[Name] - [One sentence description]

## Problem Statement
[What business problem does this solve? Why does this project exist?]

## Goals & Objectives
1. [Goal 1 - measurable]
2. [Goal 2 - measurable]
3. [Goal 3 - measurable]

## Key Stakeholders
| Role | Responsibility |
|------|----------------|
| Product Owner | [name/team] - [responsibility] |
| Technical Lead | [name/team] - [responsibility] |
| End Users | [team] - [how they use the system] |

## Target Users
- **Primary**: [User type] - [What they do]
- **Secondary**: [User type] - [What they do]

## Constraints & Assumptions

### Technical Constraints
- [constraint 1]
- [constraint 2]

### Business Constraints
- [constraint 1]
- [constraint 2]

### Assumptions
- [assumption 1]
- [assumption 2]

## Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Key Integrations
- [External system 1] - [Purpose]
- [External system 2] - [Purpose]

## Timeline (if known)
| Milestone | Date |
|-----------|------|
| [Phase 1] | [Date] |
| [Go-live] | [Date] |

---

*Sources: [list of URLs/documents used]*
*Generated: [date]*
```

---

## Verification

After generating, ask user:

```
I've extracted the following project context:

**Project**: [name]
**Problem**: [one sentence]
**Goals**: [count] goals identified
**Stakeholders**: [count] roles identified

Please review context/PROJECT_OVERVIEW.md and let me know:
1. Is the project description accurate?
2. Are there any missing stakeholders or goals?
3. Should I add any constraints or assumptions?
```

---

## Notes

- If sources are inaccessible, document as TODO with source URL
- Prefer structured extraction over raw copy-paste
- Keep PROJECT_OVERVIEW.md under 200 lines
- Update when new information becomes available
- Mark confidence level for inferred information
