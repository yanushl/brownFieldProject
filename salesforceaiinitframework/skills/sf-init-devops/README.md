# sf-init-devops

> Analyze DevOps patterns from CI/CD configs, deployment scripts, and project structure.

## What It Analyzes

- CI/CD pipeline configuration and stages
- Branching strategy (GitFlow, Trunk-based)
- Environment management (sandboxes, scratch orgs)
- Deployment commands and processes
- Quality gates and automation
- **Authentication methods** (JWT Bearer Flow, SFDX Auth URL, OAuth)
- **Secrets management** (platform-specific, external managers)
- Credentials management
- Third-party tools (Gearset, Copado, etc.)

## References

This skill includes deep-dive reference guides:

| Reference | Description |
|-----------|-------------|
| [AUTH_PATTERNS.md](references/AUTH_PATTERNS.md) | Authentication methods for CI/CD (JWT, Auth URL, OAuth) |
| [SECRETS_MANAGEMENT.md](references/SECRETS_MANAGEMENT.md) | Secure credential storage and rotation |

## Output

- **Creates:** `devops.md` (platform-specific location)
- **Updates:** `INDEX.md` with devops.md reference

See [CROSS_PLATFORM.md](../../docs/CROSS_PLATFORM.md) for platform-specific paths.

## How to Run

### Basic Usage

```
Use skill: sf-init-devops
```

### With Focus

```
Use skill: sf-init-devops
Focus: Analyze only CI/CD pipeline and deployment commands
```

### From Documentation

```
Use skill: sf-init-devops

Sources:
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/123/DevOps
- Gearset: https://app.gearset.com/pipelines/xxx
```

## Example Prompts

| Goal | Prompt |
|------|--------|
| Full analysis | `Analyze DevOps setup using sf-init-devops` |
| CI/CD only | `Document our GitHub Actions pipeline` |
| Branching | `Extract branching strategy from CI config` |
| Environments | `Document sandbox and scratch org setup` |
| Commands | `List all sf CLI commands used in deployment` |
| Authentication | `Document CI/CD authentication method and Connected App setup` |
| Secrets | `Analyze how credentials are stored and rotated` |
| Generate pipeline | `No CI/CD found - generate recommended GitHub Actions template` |

## Prerequisites

| Source | Required |
|--------|----------|
| GitHub Actions | `.github/workflows/*.yml` |
| GitLab CI | `.gitlab-ci.yml` |
| Azure DevOps | `azure-pipelines.yml` |
| Jenkins | `Jenkinsfile` |
| Bitbucket | `bitbucket-pipelines.yml` |
| Project config | `sfdx-project.json`, `package.json` |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `sf-init-architecture` | Understand project structure |
| `sf-init-testing` | Test execution in CI |

## CI/CD Platforms Supported

| Platform | Config File |
|----------|-------------|
| GitHub Actions | `.github/workflows/*.yml` |
| GitLab CI | `.gitlab-ci.yml` |
| Azure DevOps | `azure-pipelines.yml` |
| Jenkins | `Jenkinsfile` |
| Bitbucket | `bitbucket-pipelines.yml` |

## What It Extracts

### Pipeline Elements

| Element | What's Documented |
|---------|------------------|
| Stages | validate, test, deploy |
| Triggers | push, PR, schedule |
| Commands | sf CLI commands used |
| Quality gates | coverage, PMD, security |

### Branching Models

| Model | When Used |
|-------|-----------|
| GitFlow | Enterprise, multiple environments |
| Trunk-based | Small teams, fast iteration |
| Environment branches | Per-environment deployment |

### Environment Types

| Type | Purpose |
|------|---------|
| Production | Live org |
| Full Sandbox | UAT, performance |
| Partial Sandbox | QA, training |
| Developer Sandbox | Development |
| Scratch Org | Feature development |

## Templates

If no CI/CD configuration exists, the skill can generate templates:

- [GitHub Actions](templates/github-actions.yml)
- [GitLab CI](templates/gitlab-ci.yml)
- [Azure DevOps](templates/azure-pipelines.yml)
- [Bitbucket](templates/bitbucket-pipelines.yml)

## Output Features

- Pipeline stage documentation
- Branching strategy diagram
- Environment matrix
- Deployment command reference
- Quality gate requirements
- **Authentication method analysis** (JWT vs Auth URL vs OAuth)
- **Secrets management documentation** (storage, rotation, access)
- Credentials management guide

## Notes

- Document ACTUAL pipeline configuration
- Include third-party tools if used (Gearset, Copado)
- **Always document authentication method** (prefer JWT Bearer Flow for CI/CD)
- **Document secrets storage location** (platform secrets, external vault)
- Note authentication method (JWT vs Auth URL)
- Document delta deployment if used
- Include scratch org definition if present
- **Include certificate expiry dates and rotation schedule**
