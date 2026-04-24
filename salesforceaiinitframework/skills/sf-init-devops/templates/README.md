# CI/CD Pipeline Templates

Ready-to-use pipeline templates for Salesforce projects.

## Available Templates

| Template | Platform | File |
|----------|----------|------|
| GitHub Actions | GitHub | `github-actions.yml` |
| GitLab CI | GitLab | `gitlab-ci.yml` |
| Azure DevOps | Azure | `azure-pipelines.yml` |
| Bitbucket Pipelines | Bitbucket | `bitbucket-pipelines.yml` |

## Quick Start

### 1. Choose Your Platform

Copy the appropriate template to your repository:

```bash
# GitHub Actions
cp github-actions.yml .github/workflows/salesforce-cicd.yml

# GitLab CI
cp gitlab-ci.yml .gitlab-ci.yml

# Azure DevOps
cp azure-pipelines.yml azure-pipelines.yml

# Bitbucket
cp bitbucket-pipelines.yml bitbucket-pipelines.yml
```

### 2. Configure Secrets

Add these secrets to your CI/CD platform:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `SFDX_AUTH_URL` | Org auth URL | `sf org display --verbose --json \| jq -r '.result.sfdxAuthUrl'` |
| `SFDX_AUTH_URL_PROD` | Production auth URL | Same as above for production org |
| `SFDX_AUTH_URL_STAGING` | Staging auth URL | Same as above for staging sandbox |

### 3. Customize

Modify the template to match your:
- Branch naming (main/master, develop/dev)
- Test levels (RunLocalTests, RunAllTestsInOrg)
- Deployment environments
- Quality gate thresholds

## Features

All templates include:

- **Validation** - Check-only deployment on PRs
- **Testing** - Apex test execution with coverage
- **Code Scanning** - PMD/Salesforce Code Analyzer
- **Deployment** - Staged deployment (staging → production)
- **Delta Support** - Deploy only changed metadata (optional)

## Authentication Methods

### Auth URL (Recommended)

```bash
# Get auth URL from existing connection
sf org display --target-org myOrg --verbose --json | jq -r '.result.sfdxAuthUrl'

# Store in CI/CD secrets as SFDX_AUTH_URL
```

### JWT (Alternative)

For JWT authentication, you'll also need:
- `SFDX_CLIENT_ID` - Connected App Client ID
- `SFDX_JWT_KEY` - Private key (base64 encoded)
- `SFDX_USERNAME` - Salesforce username

## Troubleshooting

### Authentication Fails

1. Check auth URL format: `force://...`
2. Verify org is still connected: `sf org list`
3. Regenerate auth URL if expired

### Tests Timeout

1. Increase `--wait` value (default 30 minutes)
2. Consider running specific test classes instead of RunAllTests
3. Check for slow tests in org

### Deployment Fails

1. Check for validation errors in CI logs
2. Verify all dependencies are included
3. Run local validation first: `sf project deploy start --dry-run`
