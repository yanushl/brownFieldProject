# Secrets Management for Salesforce CI/CD

> Secure handling of credentials, API keys, and sensitive configuration.

## Secrets Inventory

### What Needs Protection

| Secret Type | Sensitivity | Rotation Frequency | Example |
|-------------|-------------|-------------------|---------|
| SFDX Auth URL | 🔴 High | On compromise | `force://PlatformCLI::5Aep...` |
| JWT Private Key | 🔴 High | 1-2 years (cert expiry) | `server.key` |
| Connected App Client ID | 🟡 Medium | Rarely | `3MVG9...` |
| Connected App Client Secret | 🔴 High | Quarterly | `ABC123...` |
| Salesforce Username | 🟢 Low | N/A | `ci@company.com` |
| Org Instance URL | 🟢 Low | N/A | `https://login.salesforce.com` |
| API Keys (external) | 🔴 High | Quarterly | Third-party integrations |

---

## Platform-Specific Secret Storage

### GitHub Actions

```yaml
# Access secrets in workflow
env:
  SF_AUTH_URL: ${{ secrets.SFDX_AUTH_URL }}
  SF_CLIENT_ID: ${{ secrets.SF_CLIENT_ID }}
  SF_JWT_KEY: ${{ secrets.SF_JWT_KEY_BASE64 }}
```

**Setting secrets:**
1. Repository → Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `SFDX_AUTH_URL`, Value: `force://...`

**Environment secrets (recommended):**
```yaml
jobs:
  deploy:
    environment: production  # Uses environment-specific secrets
    steps:
      - run: echo "${{ secrets.SF_AUTH_URL }}" > auth.txt
```

**Organization secrets:**
- Shared across repositories
- Settings → Secrets → Organization secrets
- Control access by repository visibility

### GitLab CI/CD

```yaml
# Access variables in .gitlab-ci.yml
script:
  - echo "$SFDX_AUTH_URL" > auth.txt
  - sf org login sfdx-url --sfdx-url-file auth.txt
```

**Setting variables:**
1. Settings → CI/CD → Variables
2. Add variable
3. ✅ Mask variable (hides in logs)
4. ✅ Protect variable (only on protected branches)

**File-type variables:**
```yaml
# For certificates/keys
variables:
  SF_JWT_KEY:
    value: $SF_JWT_KEY_FILE
    file: true  # Creates temp file
```

### Azure DevOps

```yaml
# azure-pipelines.yml
variables:
  - group: salesforce-secrets  # Variable group

steps:
  - script: |
      echo $(SFDX_AUTH_URL) > auth.txt
      sf org login sfdx-url --sfdx-url-file auth.txt
```

**Variable groups:**
1. Pipelines → Library → + Variable group
2. Add variables with 🔒 secret type
3. Link to Azure Key Vault (recommended)

**Key Vault integration:**
```yaml
variables:
  - group: salesforce-secrets
  
steps:
  - task: AzureKeyVault@2
    inputs:
      azureSubscription: 'MySubscription'
      KeyVaultName: 'my-keyvault'
      SecretsFilter: 'SF-*'
```

### Bitbucket Pipelines

```yaml
# bitbucket-pipelines.yml
script:
  - echo $SFDX_AUTH_URL > auth.txt
  - sf org login sfdx-url --sfdx-url-file auth.txt
```

**Setting variables:**
1. Repository settings → Pipelines → Repository variables
2. Add variable with "Secured" checkbox

**Deployment variables:**
- Settings → Pipelines → Deployments
- Environment-specific (Production, Staging)

---

## External Secrets Managers

### HashiCorp Vault

**Store secrets:**
```bash
vault kv put secret/salesforce/production \
  auth_url="force://..." \
  client_id="3MVG9..." \
  jwt_key="@server.key"
```

**Retrieve in CI:**
```yaml
# GitHub Actions with Vault
- name: Import Secrets
  uses: hashicorp/vault-action@v2
  with:
    url: https://vault.company.com
    token: ${{ secrets.VAULT_TOKEN }}
    secrets: |
      secret/data/salesforce/production auth_url | SFDX_AUTH_URL ;
      secret/data/salesforce/production jwt_key | SF_JWT_KEY
```

### AWS Secrets Manager

**Store secrets:**
```bash
aws secretsmanager create-secret \
  --name salesforce/production \
  --secret-string '{"auth_url":"force://...","client_id":"3MVG9..."}'
```

**Retrieve in CI:**
```yaml
# GitHub Actions with AWS
- name: Configure AWS
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Get Secrets
  run: |
    SECRET=$(aws secretsmanager get-secret-value --secret-id salesforce/production --query SecretString --output text)
    echo "SFDX_AUTH_URL=$(echo $SECRET | jq -r '.auth_url')" >> $GITHUB_ENV
```

### Google Cloud Secret Manager

**Store secrets:**
```bash
echo -n "force://..." | gcloud secrets create sfdx-auth-url --data-file=-
```

**Retrieve in CI:**
```yaml
- name: Get Secret
  run: |
    SFDX_AUTH_URL=$(gcloud secrets versions access latest --secret="sfdx-auth-url")
    echo "::add-mask::$SFDX_AUTH_URL"
    echo "SFDX_AUTH_URL=$SFDX_AUTH_URL" >> $GITHUB_ENV
```

---

## Environment-Specific Secrets Strategy

### Recommended Structure

```
Secrets/
├── salesforce/
│   ├── development/
│   │   ├── auth_url
│   │   ├── client_id
│   │   └── username
│   ├── qa/
│   │   ├── auth_url
│   │   ├── client_id
│   │   └── username
│   ├── uat/
│   │   └── ...
│   └── production/
│       ├── auth_url
│       ├── client_id
│       ├── jwt_key
│       └── username
```

### CI/CD Environment Selection

```yaml
# GitHub Actions
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 
                     github.ref == 'refs/heads/develop' && 'qa' || 
                     'development' }}
    steps:
      - name: Deploy
        run: |
          # Secrets automatically scoped to environment
          echo "${{ secrets.SFDX_AUTH_URL }}" > auth.txt
```

```yaml
# GitLab CI
deploy_qa:
  environment:
    name: qa
  script:
    - echo "$SFDX_AUTH_URL" > auth.txt  # qa-specific secret
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

deploy_prod:
  environment:
    name: production
  script:
    - echo "$SFDX_AUTH_URL" > auth.txt  # production-specific secret
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

---

## Secrets Rotation Procedures

### SFDX Auth URL Rotation

**Frequency:** On compromise or user password change

```bash
# 1. Re-authenticate to get new auth URL
sf org login web --alias MyOrg

# 2. Export new auth URL
NEW_AUTH_URL=$(sf org display --target-org MyOrg --verbose --json | jq -r '.result.sfdxAuthUrl')

# 3. Update CI/CD secret
# (via UI or CLI depending on platform)

# 4. Verify deployment works
# 5. Document rotation date
```

### JWT Certificate Rotation

**Frequency:** Before expiry (usually 1-2 years), or on compromise

```bash
# 1. Generate new certificate (keep same key for smoother transition)
openssl req -new -x509 -sha256 -key server.key -out server_new.crt -days 730

# 2. Update Connected App with new certificate
# Setup → App Manager → Your App → Edit → Upload new certificate

# 3. Test authentication
sf org login jwt --client-id $CLIENT_ID --jwt-key-file server.key --username $USERNAME

# 4. Update CI/CD if certificate is stored separately

# 5. Remove old certificate from Connected App after validation
```

### Connected App Client Secret Rotation

**Frequency:** Quarterly or on compromise

```bash
# 1. Generate new client secret
# Setup → App Manager → Your App → Manage Consumer Details → Generate New Secret

# 2. Update CI/CD secrets IMMEDIATELY

# 3. Old secret invalidated upon new generation
# Note: This is disruptive - plan accordingly
```

### Rotation Checklist

```markdown
## Secret Rotation Checklist

### Pre-Rotation
- [ ] Schedule maintenance window (if production)
- [ ] Notify team members
- [ ] Backup current secrets (secure location)
- [ ] Prepare new credentials

### Rotation
- [ ] Generate new credentials
- [ ] Update secrets in CI/CD platform
- [ ] Update secrets in external manager (if used)
- [ ] Test deployment in non-production

### Post-Rotation
- [ ] Verify production deployment
- [ ] Revoke old credentials (if applicable)
- [ ] Update rotation log
- [ ] Schedule next rotation
```

---

## Security Best Practices

### Do's ✅

```yaml
# ✅ Use environment-specific secrets
environment: production

# ✅ Mask secrets in logs
run: |
  echo "::add-mask::$SFDX_AUTH_URL"

# ✅ Clean up credential files
run: |
  echo "${{ secrets.SF_JWT_KEY }}" > server.key
  sf org login jwt --jwt-key-file server.key ...
  rm server.key  # Always clean up!

# ✅ Use short-lived credentials
# JWT tokens expire quickly by design

# ✅ Limit secret access
# Use environments to restrict who can deploy to production
```

### Don'ts ❌

```yaml
# ❌ Never echo secrets
run: echo ${{ secrets.SFDX_AUTH_URL }}  # Exposes in logs!

# ❌ Never commit secrets
# Even in "test" files
echo "force://PlatformCLI::5Aep..." > .env  # Don't commit!

# ❌ Never use secrets in PR from forks
# Forks don't have access to secrets for security

# ❌ Never share secrets across unrelated projects
# Use separate credentials per project

# ❌ Don't store secrets in pipeline YAML
env:
  SECRET: "hardcoded-value"  # Never do this!
```

### .gitignore for Salesforce Projects

```gitignore
# Credentials
*.key
*.pem
*.crt
auth.txt
sfdx-auth-url.txt

# Environment files
.env
.env.local
.env.*.local

# Salesforce local config
.sf/
.sfdx/

# IDE settings that might contain org info
.vscode/launch.json
```

---

## Audit and Compliance

### Logging Secret Access

```yaml
# Log who deployed (without exposing secrets)
- name: Log Deployment
  run: |
    echo "Deployment by: ${{ github.actor }}"
    echo "Environment: ${{ github.environment }}"
    echo "Commit: ${{ github.sha }}"
    echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### Salesforce Login History

```
Setup → Login History
- Monitor CI user logins
- Check for unusual patterns
- Alert on failures
```

### Connected App Usage

```
Setup → Connected Apps OAuth Usage
- Track token issuance
- Monitor active sessions
- Identify anomalies
```

### Compliance Checklist

```markdown
## Monthly Security Review

### Secret Hygiene
- [ ] No secrets in code repository
- [ ] All secrets rotated within policy period
- [ ] Unused secrets removed
- [ ] Secret access reviewed

### Access Control
- [ ] CI user permissions reviewed
- [ ] Connected App policies current
- [ ] IP restrictions in place (if required)
- [ ] Environment protection rules active

### Monitoring
- [ ] Login history reviewed
- [ ] Failed deployments investigated
- [ ] Anomalous activity addressed
```

---

## Emergency Response

### Suspected Credential Leak

```bash
# 1. IMMEDIATELY disable the Connected App
# Setup → App Manager → Your App → Edit → Deactivate

# 2. Rotate ALL secrets for affected org
# - New JWT certificate
# - New Auth URL
# - New Client Secret (if applicable)

# 3. Review audit logs
# Setup → Login History
# Setup → Setup Audit Trail

# 4. Update CI/CD with new credentials

# 5. Document incident
# - What was exposed
# - How it was exposed
# - What was accessed
# - Remediation steps
```

### Recovery Playbook

```markdown
## Credential Leak Response

### Immediate (0-15 minutes)
1. Disable Connected App
2. Revoke active sessions
3. Alert security team

### Short-term (15-60 minutes)
1. Generate new credentials
2. Update CI/CD secrets
3. Re-enable with new credentials
4. Verify deployments work

### Follow-up (24-48 hours)
1. Complete audit log review
2. Incident report
3. Process improvement
4. Team communication
```
