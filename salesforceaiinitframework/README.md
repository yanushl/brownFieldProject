# Salesforce AI Init Framework

> Context Engineering Framework for AI-Enabled Salesforce Development

A collection of **analysis skills** that create a "snapshot" of your Salesforce project. Each skill examines existing code, patterns, and conventions — then documents what it finds. This enables AI agents to write code consistent with YOUR project's style.

## Core Philosophy

**Analysis, not prescription.** We document what IS, not what SHOULD BE.

| What We Do | What We Don't Do |
|------------|------------------|
| Create a "snapshot" of how code IS written | Prescribe how code SHOULD be written |
| Extract patterns FROM the project | Impose universal best practices |
| Document existing conventions | Add generic templates |
| Enable AI to follow project's style | Teach AI "correct" Salesforce |

## Why This Framework?

### The Problem

AI agents (Claude, GPT, Copilot, Cursor) can write Salesforce code, but they lack understanding of:
- **Your project's specific patterns** - trigger framework, service layer architecture
- **Naming conventions** - how your team names classes, methods, variables
- **Business context** - what the project does, who the stakeholders are
- **Data model** - custom objects, relationships, field meanings
- **DevOps practices** - how code gets deployed, what CI/CD is used

Without this context, AI generates generic code that doesn't match your project standards.

### The Solution

This framework provides **analysis skills** that examine your project and generate context documentation. These documents become part of AI agent context, resulting in:

- Code that follows **your team's existing patterns**
- **Naming conventions** extracted from actual code
- Understanding of **business domain** and data model
- Awareness of **deployment processes** and quality gates

## Stakeholders

| Role | Benefit |
|------|---------|
| **Team Lead / Architect** | Define and enforce coding standards across AI-assisted development |
| **Developers** | Get AI to generate code matching project patterns out of the box |
| **New Team Members** | Faster onboarding with documented patterns and conventions |
| **DevOps Engineers** | Document CI/CD pipelines and deployment processes |
| **Business Analysts** | Capture business context in a format AI can use |

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Salesforce Project                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │  Apex   │  │   LWC   │  │  Flows  │  │ Documentation   │ │
└───────┼────────────┼────────────┼────────────────┼──────────┘
        │            │            │                │
        ▼            ▼            ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                   sf-init-* Skills                          │
│         Analyze existing code, extract patterns,            │
│         document what IS (not what SHOULD BE)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Platform Rules Directory                       │
│     (.cursor/rules/ | .claude/rules/ | .github/instructions)│
│                                                             │
│   INDEX.md ─────► Navigation for AI agents                  │
│   project.md ───► Project background, stakeholders          │
│   data-model.md ► Objects, fields, relationships            │
│   apex.md ──────► Apex structure and conventions            │
│   lwc.md ───────► LWC patterns and structure                │
│   testing.md ───► Test patterns and mocking                 │
│   devops.md ────► CI/CD, deployment process                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent Context                         │
│  Cursor / Claude / Copilot now understand YOUR project      │
└─────────────────────────────────────────────────────────────┘
```

## Available Skills

Each skill has a **README.md** with usage examples and prompts. Click the skill name for details.

### Meta-Skill

| Skill | What It Does | Output | Status |
|-------|--------------|--------|--------|
| **[sf-init-all](skills/sf-init-all/)** | Runs all skills in sequence | Complete rules directory | ✅ Ready |

### Individual Skills

| Skill | What It Analyzes | Output | Status |
|-------|------------------|--------|--------|
| **[sf-init-context](skills/sf-init-context/)** | Project background, goals, stakeholders | `project.md` | ✅ Ready |
| **[sf-init-business](skills/sf-init-business/)** | Business processes, workflows, glossary | `business.md` | ✅ Ready |
| **[sf-init-data-model](skills/sf-init-data-model/)** | Objects, fields, relationships, ERD | `data-model.md` | ✅ Ready |
| **[sf-init-architecture](skills/sf-init-architecture/)** | Trigger framework, service layers, Flows | `architecture.md` | ✅ Ready |
| **[sf-init-apex](skills/sf-init-apex/)** | Apex class types, naming, patterns | `apex.md` | ✅ Ready |
| **[sf-init-lwc](skills/sf-init-lwc/)** | Components, data sources, events, styling | `lwc.md` | ✅ Ready |
| **[sf-init-testing](skills/sf-init-testing/)** | Test patterns, mocking, assertions | `testing.md` | ✅ Ready |
| **[sf-init-devops](skills/sf-init-devops/)** | CI/CD, environments, deployment | `devops.md` | ✅ Ready |
| **[sf-init-integrations](skills/sf-init-integrations/)** | Named Credentials, callouts, Platform Events | `integrations.md` | ✅ Ready |
| **[sf-init-security](skills/sf-init-security/)** | FLS, sharing, CRUD, permissions | `security.md` | ✅ Ready |
| [sf-init-docs](skills/sf-init-docs/) | Documentation standards | `docs.md` | 🔲 Planned |

## Target Platform Configuration

**Important:** Before generating context, specify which AI tool your team uses. Different tools require different output formats.

### Supported Platforms

| Platform | Output Location | Format | Notes |
|----------|----------------|--------|-------|
| **Cursor** | `.cursor/rules/` | Markdown + YAML frontmatter | `globs` + `alwaysApply` |
| **Claude Code** | `.claude/rules/` | Markdown + YAML frontmatter | `paths` for file matching |
| **GitHub Copilot** | `.github/instructions/` | Markdown + YAML frontmatter | `applyTo` for file matching |
| **Windsurf** | `.windsurfrules` | Plain markdown | Single concatenated file |
| **VS Code + Continue** | `.continue/` | Plain markdown | Config-based |

### How to Specify Platform

When invoking a skill, tell the AI which platform to target:

```
User: /sf-init-apex for Cursor

User: /sf-init-apex for GitHub Copilot

User: /sf-init-apex for all platforms
```

### Format Differences

**Cursor** requires YAML frontmatter for rules to appear in Settings:

```markdown
---
description: Apex coding patterns and naming conventions
globs: ["**/*.cls", "**/*.trigger"]
alwaysApply: false
---

# Apex Development Patterns
[content]
```

**Other platforms** use plain markdown (no frontmatter):

```markdown
# Apex Development Patterns
[content]
```

### Multi-Platform Teams

If your team uses multiple tools, generate for all platforms:

```
User: /sf-init-apex output to all platforms
```

This creates:
- `.cursor/rules/apex.md` (with frontmatter)
- `.github/copilot-instructions.md` (appended)
- `AGENTS.md` (universal, in project root)

See [docs/CROSS_PLATFORM.md](docs/CROSS_PLATFORM.md) for detailed configuration.

---

## Installation

### Option 1: Copy Skills to Your Project

```bash
# Clone the framework
git clone https://github.com/YourOrg/SalesforceAIInitFramework.git

# Copy skills to your Salesforce project (universal path)
cp -r SalesforceAIInitFramework/skills/* /path/to/your/project/.claude/skills/
```

> **Universal path:** `.claude/skills/` is read by Cursor, GitHub Copilot, and Claude Code.

### Option 2: Reference as Submodule

```bash
cd your-salesforce-project
git submodule add https://github.com/YourOrg/SalesforceAIInitFramework.git .ai-framework
```

## Quick Start

### 1. Install Skills

Copy the `skills/` folder to your project's `.claude/skills/` directory.

### 2. Initialize Context

In Cursor or your AI tool, invoke a skill:

```
/sf-init-apex
```

The skill will analyze your codebase and generate context documentation in platform-specific location.

### 3. Provide Additional Context (Optional)

Skills can use multiple sources:
- **Local code analysis** - scans your `force-app/` directory
- **MCP connectors** - pulls from Confluence, Jira, Salesforce org
- **Web documentation** - fetches from URLs you provide
- **Manual input** - you can supplement with additional details

## Usage Examples

### Basic Usage

```
Use skill: sf-init-apex
```

The skill analyzes your codebase and generates `apex.md` with patterns extracted from YOUR code.

### With Context

```
Use skill: sf-init-context

Sources:
- https://company.atlassian.net/wiki/spaces/PROJECT/pages/123/Overview
- https://docs.google.com/document/d/xxx/edit
```

### Focused Analysis

```
Use skill: sf-init-lwc
Focus: Analyze only data fetching patterns
```

**See each skill's README for detailed prompts and examples:**
- [sf-init-apex/README.md](skills/sf-init-apex/README.md) — Apex analysis prompts
- [sf-init-lwc/README.md](skills/sf-init-lwc/README.md) — LWC analysis prompts
- [sf-init-context/README.md](skills/sf-init-context/README.md) — Context extraction prompts

## Tips for Best Results

### Don't Be Afraid to Help the AI

The skills are designed to work iteratively. You can:

1. **Provide URLs** - Documentation, Confluence pages, Jira epics
2. **Correct mistakes** - "Actually, we use a different pattern for triggers"
3. **Add details** - "Also include our naming convention for test classes"
4. **Request specific focus** - "Focus on the KYC_Screening_Case__c object"

### Use MCP Connectors

If available, skills can use MCP servers for richer context:

| MCP Server | Use Case |
|------------|----------|
| `salesforce` | Query org metadata, describe objects |
| `chrome-devtools` | Navigate authenticated documentation |
| `confluence` | Pull from Confluence pages |

### Iterate and Refine

Generated documents are starting points. Review and:
- Add project-specific details
- Correct any misinterpretations
- Expand sections that need more depth

## Output Structure

Skills generate documentation in platform-specific locations using a **flat structure**:

**Cursor:** `.cursor/rules/`  
**Claude Code:** `.claude/rules/`  
**Copilot:** `.github/instructions/`  
**Windsurf:** `.windsurfrules` (single file)

```
[platform-rules-dir]/
├── INDEX.md          # Navigation for AI agents (read first)
├── project.md        # sf-init-context output
├── business.md       # sf-init-business output
├── data-model.md     # sf-init-data-model output
├── architecture.md   # sf-init-architecture output
├── apex.md           # sf-init-apex output
├── lwc.md            # sf-init-lwc output
├── testing.md        # sf-init-testing output
└── devops.md         # sf-init-devops output
```

### INDEX.md

Central navigation file created by `sf-init-context`. Helps AI agents find relevant context:

```markdown
| Topic | File | When to read |
|-------|------|--------------|
| Project overview | project.md | Before any task |
| Data model | data-model.md | Working with objects |
| Apex patterns | apex.md | Writing Apex code |
```

See [examples/rules/INDEX.md](examples/rules/INDEX.md) for sample.

## Artifacts

Ready-to-copy files that are NOT generated by skills. Just copy and customize.

| Artifact | Purpose | Copy to |
|----------|---------|---------|
| [artifacts/local-deploy.md](artifacts/local-deploy.md) | sf CLI deployment commands | Platform-specific rules directory |

See [artifacts/README.md](artifacts/README.md) for details.

## Project Structure

```
SalesforceAIInitFramework/
├── README.md                   # This file
├── PHASES.md                   # Project roadmap
├── DEVELOPMENT_CONTEXT.md      # Development context for AI
├── docs/
│   └── CROSS_PLATFORM.md       # Multi-platform configuration
├── skills/                     # All sf-init-* skills
│   ├── sf-init-apex/
│   │   ├── README.md           # Usage examples and prompts
│   │   ├── SKILL.md            # Skill definition
│   │   └── references/         # Analysis checklists
│   ├── sf-init-context/
│   ├── sf-init-lwc/
│   ├── sf-init-devops/
│   │   └── templates/          # CI/CD pipeline templates
│   └── ...
├── artifacts/                  # Ready-to-copy files (not skill outputs)
│   └── local-deploy.md         # Deployment commands for local dev
├── examples/                   # Sample generated output
│   └── rules/
└── vendor/                     # Reference repositories (git-ignored)
    └── sf-skills/              # Inspiration source
```

## Integration with AI Tools

### Cursor

Rules in `.cursor/rules/` with YAML frontmatter (`globs`, `alwaysApply`).

### Claude Code

Rules in `.claude/rules/` with YAML frontmatter (`paths`).

### GitHub Copilot

Instructions in `.github/instructions/*.instructions.md` with YAML frontmatter (`applyTo`).

### Windsurf

Single `.windsurfrules` file with all sections concatenated.

### Other Tools

The generated documentation can be included in any AI tool's context or system prompt. See [docs/CROSS_PLATFORM.md](docs/CROSS_PLATFORM.md).