---
name: sf-init-devops
description: Analyze DevOps patterns from CI/CD configs, deployment scripts, and project structure. Generates devops.md documenting pipelines, branching strategy, environment management, authentication patterns, and secrets management. Supports GitHub Actions, GitLab CI, Azure DevOps, and third-party tools (Gearset, Copado).
---

# DevOps Patterns Initializer

## Purpose

Analyze and document DevOps practices to provide AI agents with understanding of:
- CI/CD pipeline structure and stages
- Branching and release strategies
- Environment management (sandboxes, scratch orgs)
- Deployment processes and commands
- **Authentication patterns (JWT, Auth URL, Connected Apps)**
- **Secrets management and rotation**
- Quality gates and automation
- Tool integrations

## Output

Creates `devops.md` in platform-specific location.

After generating, update INDEX.md to include this file.

### Platform Output

| Platform | Location | Frontmatter |
|----------|----------|-------------|
| **Cursor** | `.cursor/rules/devops.md` | `globs: [".github/**", ".gitlab-ci.yml", "**/pipelines/**", "azure-pipelines.yml"]`<br>`alwaysApply: false` |
| **Claude Code** | `.claude/rules/devops.md` | `paths: [".github/**", ".gitlab-ci.yml", "**/pipelines/**"]` |
| **Copilot** | `.github/instructions/devops.instructions.md` | `applyTo: ".github/**,.gitlab-ci.yml,**/pipelines/**"` |
| **Windsurf** | Append to `.windsurfrules` | N/A (section header: `## DevOps`) |

## References (What to Look For)

| Reference | Use for |
|-----------|---------|
| [AUTH_PATTERNS.md](references/AUTH_PATTERNS.md) | Authentication methods for CI/CD |
| [SECRETS_MANAGEMENT.md](references/SECRETS_MANAGEMENT.md) | Secure credential handling |

---

## Input Sources

### Option 1: Pipeline Configuration Files

Analyze existing CI/CD configurations:

```
.github/workflows/*.yml     # GitHub Actions
.gitlab-ci.yml              # GitLab CI
Jenkinsfile                 # Jenkins
azure-pipelines.yml         # Azure DevOps
bitbucket-pipelines.yml     # Bitbucket Pipelines
```

### Option 2: Project Configuration

```
sfdx-project.json           # Package structure, namespaces
package.json                # npm scripts
scripts/                    # Custom deployment scripts
config/                     # Scratch org definitions
```

### Option 3: External Documentation (MCP/WebFetch)

User provides URLs to DevOps documentation:

```
Sources:
- Confluence: https://company.atlassian.net/wiki/spaces/PROJECT/pages/123/DevOps
- Gearset: https://app.gearset.com/pipelines/xxx
- Copado: https://copado.com/...
```

---

## What to Analyze

### Pipeline Configuration

| Element | Source | Priority |
|---------|--------|----------|
| **Workflow files** | `.github/workflows/*.yml` | High |
| **Stages/Jobs** | Pipeline YAML | High |
| **Triggers** | on: push/pull_request/schedule | High |
| **Environment variables** | env: sections | Medium |
| **Secrets usage** | ${{ secrets.* }} | High |
| **sf CLI commands** | script sections | High |
| **Authentication method** | login commands | High |

### Project Structure

| Element | Source | Priority |
|---------|--------|----------|
| **Package directories** | `sfdx-project.json` | High |
| **Namespace** | `sfdx-project.json` | Medium |
| **API Version** | `sfdx-project.json` | Medium |
| **Package dependencies** | `sfdx-project.json` | Medium |
| **npm scripts** | `package.json` | Medium |
| **Custom scripts** | `scripts/` folder | Medium |

### Environment Configuration

| Element | Source | Priority |
|---------|--------|----------|
| **Default org** | `.sf/config.json` | High |
| **Scratch org def** | `config/project-scratch-def.json` | Medium |
| **Connected orgs** | `sf org list` output | Low |

---

## Workflow

```
1. Detect CI/CD platform:
   ├── .github/workflows/ → GitHub Actions
   ├── .gitlab-ci.yml → GitLab CI
   ├── Jenkinsfile → Jenkins
   ├── azure-pipelines.yml → Azure DevOps
   └── None → Ask user / document recommendations
   ↓
2. Parse pipeline configuration:
   ├── Extract stages/jobs
   ├── Identify triggers
   ├── List sf CLI commands used
   └── Note quality gates
   ↓
3. Analyze project structure:
   ├── Parse sfdx-project.json
   ├── Check package.json scripts
   └── Scan scripts/ folder
   ↓
4. Determine branching strategy:
   ├── Check branch triggers in CI
   ├── Look for GitFlow patterns
   └── Note protected branches
   ↓
5. Document environment strategy:
   ├── List connected orgs
   ├── Check scratch org definitions
   └── Identify sandbox types
   ↓
6. Analyze authentication patterns:
   ├── Detect auth method (JWT, Auth URL, Client Credentials)
   ├── Identify Connected App usage
   ├── Check for CI/CD user setup
   └── Document secrets used
   ↓
7. Document secrets management:
   ├── List required secrets
   ├── Note rotation requirements
   ├── Check for secure handling patterns
   └── Document cleanup procedures
   ↓
8. Generate DEVOPS.md
   ↓
9. Verify with user
```

---

## Authentication Analysis

### Detect Authentication Method

Search pipeline files for authentication patterns:

| Pattern | Search For | Method |
|---------|------------|--------|
| Auth URL | `sf org login sfdx-url`, `sfdx-url-file` | SFDX Auth URL |
| JWT | `sf org login jwt`, `--jwt-key-file`, `--client-id` | JWT Bearer Flow |
| Client Credentials | `sf org login client-credentials` | OAuth Client Credentials |
| Web Login | `sf org login web` | Interactive (not for CI) |

### Document Authentication Setup

For each environment, identify:

```markdown
| Environment | Auth Method | Secrets Required | CI User |
|-------------|-------------|------------------|---------|
| Production | JWT | SF_CLIENT_ID, SF_JWT_KEY, SF_USERNAME | ci-deploy@company.com |
| UAT | Auth URL | SFDX_AUTH_URL_UAT | ci-deploy@company.com.uat |
| Dev | Auth URL | SFDX_AUTH_URL_DEV | - |
```

### Connected App Analysis

If JWT is used, document:
- Connected App name
- Certificate expiry date (if known)
- IP restrictions
- Permitted users/profiles

### CI/CD User Setup

Document the integration user pattern:
- Username convention
- Permission set(s) assigned
- License type
- Profile

---

## Secrets Analysis

### Identify Secrets in Use

Search pipeline files for secret references:

```yaml
# GitHub Actions
${{ secrets.SFDX_AUTH_URL }}
${{ secrets.SF_CLIENT_ID }}
${{ secrets.SF_JWT_KEY }}

# GitLab CI
$SFDX_AUTH_URL
$SF_CLIENT_ID

# Azure DevOps
$(SFDX_AUTH_URL)
```

### Document Secret Requirements

| Secret | Purpose | Sensitivity | Rotation |
|--------|---------|-------------|----------|
| `SFDX_AUTH_URL` | Org authentication | 🔴 High | On compromise |
| `SF_CLIENT_ID` | Connected App ID | 🟡 Medium | Rarely |
| `SF_JWT_KEY` | JWT private key | 🔴 High | 1-2 years |
| `SF_USERNAME` | CI user email | 🟢 Low | N/A |

### Check Secure Handling

Look for good practices:
- ✅ Secrets not echoed to logs
- ✅ Key files cleaned up after use (`rm server.key`)
- ✅ Environment-specific secrets
- ✅ Masked in output (`::add-mask::`)

Flag bad practices:
- ❌ Hardcoded credentials
- ❌ Secrets in repository
- ❌ Credentials in error messages

---

## CI/CD Platforms Reference

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Salesforce CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # For delta detection
      
      - name: Install Salesforce CLI
        run: npm install -g @salesforce/cli
      
      - name: Authenticate to Org
        run: |
          echo "${{ secrets.SFDX_AUTH_URL }}" > auth.txt
          sf org login sfdx-url --sfdx-url-file auth.txt --alias target-org
      
      - name: Run Apex Tests
        run: sf apex run test --target-org target-org --test-level RunLocalTests --wait 30
      
      - name: Deploy (Validation Only)
        if: github.event_name == 'pull_request'
        run: sf project deploy start --target-org target-org --dry-run --wait 30
      
      - name: Deploy to Org
        if: github.ref == 'refs/heads/main'
        run: sf project deploy start --target-org target-org --wait 30
```

### GitLab CI

```yaml
# .gitlab-ci.yml
image: salesforce/cli:latest

stages:
  - validate
  - test
  - deploy

variables:
  SF_TARGET_ORG: "production"

.authenticate: &authenticate
  before_script:
    - echo "$SFDX_AUTH_URL" > auth.txt
    - sf org login sfdx-url --sfdx-url-file auth.txt --alias $SF_TARGET_ORG

validate:
  stage: validate
  <<: *authenticate
  script:
    - sf project deploy start --target-org $SF_TARGET_ORG --dry-run
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

test:
  stage: test
  <<: *authenticate
  script:
    - sf apex run test --target-org $SF_TARGET_ORG --test-level RunLocalTests

deploy:
  stage: deploy
  <<: *authenticate
  script:
    - sf project deploy start --target-org $SF_TARGET_ORG
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

### Azure DevOps

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Validate
    jobs:
      - job: ValidateDeployment
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '18.x'
          
          - script: npm install -g @salesforce/cli
            displayName: 'Install Salesforce CLI'
          
          - script: |
              echo $(SFDX_AUTH_URL) > auth.txt
              sf org login sfdx-url --sfdx-url-file auth.txt --alias target-org
            displayName: 'Authenticate'
          
          - script: sf project deploy start --target-org target-org --dry-run
            displayName: 'Validate Deployment'

  - stage: Deploy
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployToProduction
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - script: sf project deploy start --target-org target-org
                  displayName: 'Deploy to Production'
```

---

## Branching Strategies

### GitFlow (Recommended for Enterprise)

```
main (production)
  └── develop (integration)
        ├── feature/JIRA-123-description
        ├── feature/JIRA-456-description
        └── release/1.2.0
              └── hotfix/critical-fix
```

| Branch | Purpose | Deploys To | Protected |
|--------|---------|------------|-----------|
| `main` | Production-ready code | Production | Yes |
| `develop` | Integration branch | Full Sandbox | Yes |
| `feature/*` | Feature development | Dev Sandbox / Scratch | No |
| `release/*` | Release preparation | UAT Sandbox | Yes |
| `hotfix/*` | Production fixes | Production | No |

### Trunk-Based (Recommended for Small Teams)

```
main (single source of truth)
  └── short-lived feature branches (< 2 days)
```

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | All changes | All environments |
| `feature/*` | Short-lived work | Scratch orgs only |

### Environment Branches

```
production → Production org
staging → Full/Partial Sandbox
develop → Developer Sandbox
```

---

## Environment Management

### Sandbox Types

| Type | Data | Storage | Use Case | Refresh |
|------|------|---------|----------|---------|
| **Full** | Full copy | Same as prod | UAT, Performance | 29 days |
| **Partial** | Template-based | 5 GB | QA, Training | 5 days |
| **Developer** | No data | 200 MB | Development | 1 day |
| **Developer Pro** | No data | 1 GB | Development | 1 day |

### Scratch Org Strategy

```json
// config/project-scratch-def.json
{
  "orgName": "CRS Development",
  "edition": "Developer",
  "features": ["EnableSetPasswordInApi"],
  "settings": {
    "lightningExperienceSettings": {
      "enableS1DesktopEnabled": true
    },
    "securitySettings": {
      "passwordPolicies": {
        "enableSetPasswordInApi": true
      }
    }
  }
}
```

**Scratch Org Workflow:**
1. Create from definition: `sf org create scratch -f config/project-scratch-def.json -a my-scratch`
2. Push source: `sf project deploy start --target-org my-scratch`
3. Assign permission set: `sf org assign permset --name MyPermSet`
4. Import test data: `sf data import tree -p data/sample-data-plan.json`
5. Open org: `sf org open --target-org my-scratch`

---

## Deployment Commands Reference

### Validation (Check-only)

```bash
# Validate deployment without making changes
sf project deploy start --target-org $ORG --dry-run --wait 30

# Validate with specific test level
sf project deploy start --target-org $ORG --dry-run --test-level RunLocalTests
```

### Full Deployment

```bash
# Deploy all metadata
sf project deploy start --target-org $ORG --wait 30

# Deploy specific metadata types
sf project deploy start --target-org $ORG --metadata ApexClass --metadata ApexTrigger

# Deploy specific directory
sf project deploy start --target-org $ORG --source-dir force-app/main/default/classes
```

### Delta Deployment (salesforce-git-delta)

```bash
# Install sfdx-git-delta
sf plugins install sfdx-git-delta

# Generate delta package
sf sgd source delta --from origin/main --to HEAD --output delta

# Deploy only changed files
sf project deploy start --target-org $ORG --manifest delta/package/package.xml
```

### Quick Deploy (after validation)

```bash
# Get job ID from validation
sf project deploy start --target-org $ORG --dry-run --json > validation.json

# Quick deploy using job ID
sf project deploy quick --job-id <jobId> --target-org $ORG
```

### Test Execution

```bash
# Run all local tests
sf apex run test --target-org $ORG --test-level RunLocalTests --wait 30

# Run specific test class
sf apex run test --target-org $ORG --class-names MyTestClass

# Run with code coverage
sf apex run test --target-org $ORG --test-level RunLocalTests --code-coverage
```

---

## Quality Gates

### Code Analysis (Salesforce Code Analyzer)

```bash
# Install Code Analyzer
sf plugins install @salesforce/sfdx-scanner

# Run PMD analysis
sf scanner run --target "force-app" --format table

# Run with specific rules
sf scanner run --target "force-app" --pmdconfig pmd-ruleset.xml

# Generate HTML report
sf scanner run --target "force-app" --format html --outfile report.html
```

### Required Quality Checks

| Check | Tool | Threshold |
|-------|------|-----------|
| Code Coverage | Apex Tests | >= 75% |
| Static Analysis | PMD / Code Analyzer | No Critical/High |
| LWC Tests | Jest | All passing |
| Security | Code Analyzer | No vulnerabilities |

---

## Third-Party Tools

### Gearset

**Features:**
- Metadata comparison and deployment
- CI/CD pipelines with visual builder
- Automated backups
- Data deployment
- CPQ deployments

**Integration:** Connect via OAuth, configure pipelines in web UI

### Copado

**Features:**
- Release orchestration
- Compliance and governance
- User story management
- Environment management
- Quality gates

**Integration:** Install managed package, configure pipelines

### AutoRABIT

**Features:**
- Metadata-aware deployments
- Delta deployments
- Parallel build automation
- Backup and recovery
- Static code analysis

**Integration:** Configure via web UI, integrates with Git

### Provar

**Features:**
- Test automation
- Regression testing
- Data-driven testing
- CI/CD integration

**Use Case:** Automated UI and API testing in pipelines

---

## Credentials Management

> See [AUTH_PATTERNS.md](references/AUTH_PATTERNS.md) for detailed authentication setup.
> See [SECRETS_MANAGEMENT.md](references/SECRETS_MANAGEMENT.md) for secure credential handling.

### Authentication Methods

| Method | Security | Setup | Best For |
|--------|----------|-------|----------|
| **SFDX Auth URL** | Medium | Easy | Sandboxes, quick setup |
| **JWT Bearer Flow** | High | Medium | Production CI/CD |
| **Client Credentials** | High | Medium | Server-to-server |

### JWT Authentication (Recommended for Production)

```yaml
# GitHub Actions - JWT Flow
- name: Authenticate (JWT)
  run: |
    echo "${{ secrets.SF_JWT_KEY_BASE64 }}" | base64 -d > server.key
    sf org login jwt \
      --client-id ${{ secrets.SF_CLIENT_ID }} \
      --jwt-key-file server.key \
      --username ${{ secrets.SF_USERNAME }} \
      --instance-url https://login.salesforce.com \
      --alias target-org
    rm server.key  # Always clean up!
```

**Required secrets for JWT:**
| Secret | Purpose | Example |
|--------|---------|---------|
| `SF_CLIENT_ID` | Connected App Consumer Key | `3MVG9...` |
| `SF_JWT_KEY_BASE64` | Base64-encoded private key | `LS0tLS1...` |
| `SF_USERNAME` | CI user email | `ci-deploy@company.com` |

### SFDX Auth URL (Quick Setup)

```yaml
# GitHub Actions - Auth URL
- name: Authenticate (Auth URL)
  run: |
    echo "${{ secrets.SFDX_AUTH_URL }}" > auth.txt
    sf org login sfdx-url --sfdx-url-file auth.txt --alias target-org
    rm auth.txt  # Clean up
```

**Generate Auth URL:**
```bash
sf org display --target-org myOrg --verbose --json | jq -r '.result.sfdxAuthUrl'
```

### CI/CD Integration User

**Recommended setup:**
```
Username: ci-deploy@company.com (or ci-deploy@company.com.sandboxname)
Profile:  Minimum Access - Salesforce
License:  Salesforce or Salesforce Integration

Permission Set: CI_CD_Deployment
- Modify All Data
- Modify Metadata Through Metadata API Functions
- API Enabled
- Author Apex
```

### Connected App Setup (for JWT)

1. **Setup → App Manager → New Connected App**
2. Enable OAuth Settings
3. Enable "Use digital signatures"
4. Upload certificate (`server.crt`)
5. OAuth Scopes: `api`, `refresh_token`, `web`
6. **Manage → Edit Policies → Permitted Users: Admin approved users**
7. Add CI user's Permission Set or Profile

### Secrets Rotation Schedule

| Secret | Rotation | Triggered By |
|--------|----------|--------------|
| JWT Certificate | 1-2 years | Certificate expiry |
| Client Secret | Quarterly | Security policy |
| Auth URL | On compromise | Password change, security event |

---

## Output Template

```markdown
# DevOps Patterns

## Overview

| Metric | Value |
|--------|-------|
| CI/CD Platform | [GitHub Actions/GitLab/etc] |
| Branching Model | [GitFlow/Trunk-based] |
| Deployment Method | [Metadata API/Unlocked Packages] |
| Authentication | [JWT/Auth URL/Client Credentials] |
| Environments | [count] |

---

## CI/CD Pipeline

### Platform: [Platform Name]

### Workflow Files
- `[filename]` - [purpose]

### Pipeline Stages

| Stage | Purpose | Trigger |
|-------|---------|---------|
| Validate | Check-only deployment | PR to main |
| Test | Run Apex tests | All pushes |
| Deploy | Deploy to org | Merge to main |

### Key Commands
\`\`\`bash
[list of sf commands used]
\`\`\`

---

## Branching Strategy

### Model: [Model Name]

[Diagram or description]

### Branch Protection Rules
- `main`: Require PR, require tests passing
- `develop`: Require PR

---

## Environment Management

### Environments

| Environment | Type | Purpose | Branch |
|-------------|------|---------|--------|
| Production | Production | Live | main |
| UAT | Full Sandbox | Testing | release/* |
| QA | Partial Sandbox | QA | develop |
| Dev | Developer Sandbox | Development | feature/* |

### Scratch Org Configuration
[scratch org def details]

---

## Deployment Process

### Standard Deployment Flow
1. Developer creates feature branch
2. Push changes to feature branch
3. Create PR to develop
4. CI validates deployment
5. Tests run automatically
6. Merge triggers deployment

### Commands Reference
[key commands]

---

## Quality Gates

### Required Checks
- [ ] Code coverage >= 75%
- [ ] No PMD critical violations
- [ ] All tests passing
- [ ] Security scan clean

### Tools
- [list of tools used]

---

## Authentication

### Method: [JWT Bearer Flow / SFDX Auth URL / etc.]

### Connected App
| Setting | Value |
|---------|-------|
| Name | [CI_CD_Integration] |
| Certificate Expiry | [date] |
| IP Restrictions | [Yes/No] |
| Permitted Users | [Admin approved] |

### CI/CD User
| Setting | Value |
|---------|-------|
| Username | [ci-deploy@company.com] |
| Profile | [Minimum Access] |
| Permission Set | [CI_CD_Deployment] |
| License | [Salesforce] |

---

## Secrets Management

### Required Secrets

| Secret | Purpose | Rotation |
|--------|---------|----------|
| `SF_CLIENT_ID` | Connected App ID | Rarely |
| `SF_JWT_KEY_BASE64` | JWT private key | 1-2 years |
| `SF_USERNAME` | CI user email | N/A |

### Security Practices
- [ ] Secrets not echoed to logs
- [ ] Key files cleaned up after use
- [ ] Environment-specific secrets used
- [ ] Rotation schedule documented

---

*Generated: [date]*
*Source: [pipeline files analyzed]*
```

---

## Prompts for Missing Information

If no CI/CD configuration found:

```
No CI/CD configuration detected in the project. To document DevOps patterns:

1. Do you have CI/CD set up externally (Gearset, Copado)?
2. Would you like me to generate recommended pipeline templates?
3. What is your current deployment process?

Please provide:
- CI/CD tool in use, OR
- Current manual process description, OR
- Indicate if you need recommendations
```

If authentication method unclear:

```
I found CI/CD pipeline configuration but couldn't determine the authentication method.

Please clarify:
1. How does CI/CD authenticate to Salesforce? (JWT, Auth URL, other)
2. Is there a dedicated CI/CD user?
3. Is there a Connected App set up for CI/CD?
```

---

## Verification Checklist

- [ ] CI/CD platform identified
- [ ] Pipeline stages documented
- [ ] Branching strategy described
- [ ] Environment strategy documented
- [ ] Deployment commands listed
- [ ] Quality gates identified
- [ ] **Authentication method documented**
- [ ] **Secrets inventory created**
- [ ] **CI/CD user documented**
- [ ] **Rotation schedule noted**

---

## Tips

- **Delta deployments** significantly reduce deployment time
- **Quick Deploy** reuses validation for faster production deployments
- **JWT authentication** is more secure than Auth URL for CI/CD
- **Scratch orgs** are ideal for isolated feature development
- **Code Analyzer** catches issues before they reach production
- Always run tests in CI - don't rely on local testing alone
- **Rotate certificates before expiry** — set calendar reminders
- **Use environment-specific secrets** — don't share credentials across environments
- **Document the CI user setup** — makes onboarding and audits easier
- **Clean up credential files** — always `rm server.key` after authentication
