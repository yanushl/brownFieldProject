# Cross-Platform Compatibility

This framework generates context documentation that can be used with multiple AI coding tools.

## Supported Platforms

| Platform | Instructions Location | Format | Apply Logic |
|----------|----------------------|--------|-------------|
| **Cursor** | `.cursor/rules/*.md` | Markdown + YAML frontmatter | `globs` + `alwaysApply` |
| **Claude Code** | `.claude/rules/*.md` | Markdown + YAML frontmatter | `paths` (glob patterns) |
| **GitHub Copilot** | `.github/instructions/*.instructions.md` | Markdown + YAML frontmatter | `applyTo` (glob patterns) |
| **Windsurf** | `.windsurfrules` | Single concatenated file | Always applies |
| **VS Code + Continue** | `.continue/` | Plain markdown | Config-based |

---

## Platform Detection (Auto-detect)

Skills automatically detect which platforms to generate for by checking existing folders:

```
Detection Logic:

1. Check project structure:
   ├── .cursor/rules/       → Cursor detected
   ├── .claude/rules/       → Claude Code detected
   ├── .github/instructions/→ Copilot detected
   ├── .windsurfrules       → Windsurf detected
   └── .continue/           → Continue detected

2. Results:
   ├── Found ONE platform    → Generate for that platform
   ├── Found MULTIPLE        → Generate for all detected
   └── Found NONE            → Ask user, then generate
```

### Override with Flag

```
/sf-init-apex                      # Auto-detect
/sf-init-apex --platform cursor    # Force Cursor only
/sf-init-apex --platform all       # All platforms
```

### First-Time Setup Flow

When no platform is detected:

```
Agent: No AI tool configuration detected. Which platform(s) do you use?

       1. Cursor
       2. Claude Code  
       3. GitHub Copilot
       4. Windsurf
       5. All of the above

User: 1

Agent: ✅ Created .cursor/rules/
       Generating apex.md...
       Done!
```

---

## Platform-Specific Output Formats

### Cursor (globs + alwaysApply)

**Location:** `.cursor/rules/*.md`

```markdown
---
description: Apex development patterns for this project
globs: ["**/*.cls", "**/*.trigger"]
alwaysApply: false
---

# Apex Development Patterns

[content]
```

**Structure:**
```
.cursor/rules/
├── INDEX.md          (alwaysApply: true)
├── project.md        (alwaysApply: true)
├── apex.md           (globs: ["**/*.cls", "**/*.trigger"])
├── lwc.md            (globs: ["**/lwc/**/*.js", "**/lwc/**/*.html"])
└── ...
```

### Claude Code (paths)

**Location:** `.claude/rules/*.md`

Uses `paths` field in YAML frontmatter for path-specific rules:

```markdown
---
paths:
  - "**/*.cls"
  - "**/*.trigger"
---

# Apex Development Patterns

[content]
```

**Structure:**
```
.claude/
├── CLAUDE.md              # Main project instructions (always loaded)
└── rules/
    ├── project.md         # No paths = always loaded
    ├── apex.md            # paths: ["**/*.cls", "**/*.trigger"]
    ├── lwc.md             # paths: ["**/lwc/**/*.js", "**/lwc/**/*.html"]
    └── testing.md         # paths: ["**/*Test.cls", "**/*.test.js"]
```

Rules without `paths` field are loaded unconditionally.

### GitHub Copilot (applyTo)

**Location:** `.github/instructions/*.instructions.md`

Uses `applyTo` field in YAML frontmatter:

```markdown
---
applyTo: "**/*.cls,**/*.trigger"
---

# Apex Development Patterns

[content]
```

**Structure:**
```
.github/
├── copilot-instructions.md       # Repository-wide (always applies)
└── instructions/
    ├── apex.instructions.md      # applyTo: "**/*.cls,**/*.trigger"
    ├── lwc.instructions.md       # applyTo: "**/lwc/**/*.js,**/lwc/**/*.html"
    └── testing.instructions.md   # applyTo: "**/*Test.cls,**/*.test.js"
```

**Note:** File names MUST end with `.instructions.md`

### Windsurf (single concatenated file)

**Location:** `.windsurfrules`

All content in one file with section headers:

```markdown
# Project Instructions

## Project Overview
[content]

## Apex Patterns
[content]

## LWC Patterns
[content]
```

---

## Skill Metadata for Platform Output

Each skill defines its output metadata that gets transformed per platform:

```yaml
# In SKILL.md
output:
  id: apex
  description: Apex patterns for this project
  filePatterns: ["**/*.cls", "**/*.trigger"]
  alwaysApply: false
```

**Transformation by platform:**

| Platform | Uses `filePatterns` as | Uses `alwaysApply` |
|----------|------------------------|-------------------|
| Cursor | `globs: [...]` | `alwaysApply: bool` |
| Claude Code | `paths: [...]` | No paths = always |
| Copilot | `applyTo: "..."` (comma-separated) | No applyTo = always |
| Windsurf | N/A (single file) | N/A |

---

## Conversion Between Formats

### From Cursor to Plain Markdown

Strip frontmatter (everything between `---` markers):

```bash
sed '1{/^---$/!q;};1,/^---$/d' file.md > plain.md
```

### From Plain Markdown to Cursor Format

```bash
cat > .cursor/rules/apex.md << 'EOF'
---
description: Apex coding patterns
globs: ["**/*.cls", "**/*.trigger"]
alwaysApply: false
---

EOF
cat plain-apex.md >> .cursor/rules/apex.md
```

---

## INDEX.md for AI Navigation

Each platform's rules directory should have an INDEX.md file:

```markdown
# Project Context Index

> Navigation for AI agents. Read this first.

| Topic | File | When to read |
|-------|------|--------------|
| Project overview | [project.md](project.md) | Before any task |
| Data model | [data-model.md](data-model.md) | Working with objects |
| Apex patterns | [apex.md](apex.md) | Writing Apex code |
| LWC patterns | [lwc.md](lwc.md) | Building components |
| Testing | [testing.md](testing.md) | Writing tests |
| DevOps | [devops.md](devops.md) | Deployment tasks |
```

