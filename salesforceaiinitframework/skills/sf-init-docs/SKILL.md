---
name: sf-init-docs
description: Analyze documentation patterns and generate docs.md. Documents code commenting conventions, README structure, and API documentation. Use when setting up AI context for documentation generation.
---

# Documentation Standards Initializer

## Purpose

Document documentation patterns including code comments, README structure, and API documentation.

## Output

Creates `docs.md` in platform-specific location.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/docs.md` | `alwaysApply: false` |
| **Claude Code** | `.claude/rules/docs.md` | No `paths` = always loaded |
| **Copilot** | `.github/instructions/docs.instructions.md` | No `applyTo` = always applies |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## Documentation Standards`) |

After generating, update INDEX.md to include this file.

---

## Status

**TODO**: This skill is a placeholder. Implementation pending.

---

## Planned Analysis Steps

### 1. Analyze Code Comments

```apex
// Look for patterns:
/**
 * @description Service for handling account operations
 * @author Developer Name
 * @date 2024-01-01
 */

/**
 * @description Process accounts with validation
 * @param accounts List of accounts to process
 * @return List of processed account IDs
 * @throws AccountServiceException if validation fails
 */
```

### 2. Check README Structure

```
Look for:
- README.md
- docs/ folder
- CONTRIBUTING.md
```

### 3. Document ApexDoc Conventions

- Class-level documentation
- Method-level documentation
- Parameter documentation

### 4. API Documentation

- OpenAPI/Swagger specs
- Postman collections
- API usage examples

---

## Output Template

```markdown
# Documentation Standards

## Code Comments

### Class Header
\`\`\`apex
/**
 * @description [Brief description of class purpose]
 * @author [Author name]
 * @date [Creation date]
 * @group [Functional group]
 */
\`\`\`

### Method Documentation
\`\`\`apex
/**
 * @description [What the method does]
 * @param paramName [Parameter description]
 * @return [Return value description]
 * @throws ExceptionType [When thrown]
 * @example
 * MyClass.myMethod('param');
 */
\`\`\`

## README Structure

1. Project Title & Description
2. Prerequisites
3. Installation
4. Usage
5. Testing
6. Deployment
7. Contributing

## API Documentation

[Document API documentation patterns]
```

---

## Verification

- [ ] Comment conventions extracted
- [ ] README template documented
- [ ] ApexDoc patterns identified
