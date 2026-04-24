# Authentication Patterns for CI/CD

> How to securely authenticate Salesforce CLI in CI/CD pipelines.

## Authentication Methods Comparison

| Method | Security | Setup Complexity | Rotation | Best For |
|--------|----------|------------------|----------|----------|
| **SFDX Auth URL** | Medium | Low | Manual | Quick setup, sandboxes |
| **JWT Bearer Flow** | High | Medium | Certificate (1-2 years) | Production CI/CD |
| **OAuth Client Credentials** | High | Medium | Client secret | Server-to-server |
| **Device Flow** | Medium | Low | Per-session | Interactive/local |

---

## Method 1: SFDX Auth URL (Quick Setup)

### How It Works

The Auth URL contains encrypted credentials that can be used to re-authenticate without user interaction.

### Generate Auth URL

```bash
# First, authenticate interactively
sf org login web --alias MyOrg

# Then export the auth URL
sf org display --target-org MyOrg --verbose --json | jq -r '.result.sfdxAuthUrl'

# Output looks like:
# force://PlatformCLI::5Aep861...@myorg.my.salesforce.com
```

### Use in CI/CD

```yaml
# GitHub Actions
- name: Authenticate
  run: |
    echo "${{ secrets.SFDX_AUTH_URL }}" > auth.txt
    sf org login sfdx-url --sfdx-url-file auth.txt --alias target-org
    rm auth.txt  # Clean up
```

### Security Considerations

| Aspect | Rating | Notes |
|--------|--------|-------|
| Token exposure | ⚠️ Medium | Auth URL is sensitive, treat as password |
| Rotation | ⚠️ Manual | Must regenerate if compromised |
| Revocation | ✅ Easy | Revoke via Setup > Connected Apps |
| Audit trail | ✅ Good | Login tracked in org |

### When to Use

- ✅ Development sandboxes
- ✅ Quick POC setups
- ⚠️ Production (acceptable but JWT preferred)
- ❌ Multi-org enterprise deployments

---

## Method 2: JWT Bearer Flow (Recommended for Production)

### How It Works

Uses a Connected App with a digital certificate. The private key signs a JWT token that Salesforce validates against the certificate.

### Step 1: Generate Certificate

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate (valid for 365 days)
openssl req -new -x509 -sha256 -key server.key -out server.crt -days 365 \
  -subj "/CN=CI-CD-Certificate/O=MyCompany/C=US"

# For CI/CD, base64 encode the key
base64 -i server.key -o server.key.b64
```

### Step 2: Create Connected App

1. **Setup → App Manager → New Connected App**

2. **Basic Information:**
   - Connected App Name: `CI-CD Integration`
   - API Name: `CI_CD_Integration`
   - Contact Email: `devops@company.com`

3. **API (Enable OAuth Settings):**
   - ✅ Enable OAuth Settings
   - Callback URL: `http://localhost:1717/OauthRedirect`
   - ✅ Use digital signatures
   - Upload `server.crt`
   - Selected OAuth Scopes:
     - `api` (Access your basic information)
     - `refresh_token, offline_access`
     - `web` (Access and manage your data)

4. **Save and wait 2-10 minutes for propagation**

### Step 3: Authorize the Connected App

```bash
# Pre-authorize for specific user (one-time setup)
sf org login jwt \
  --client-id <CONNECTED_APP_CONSUMER_KEY> \
  --jwt-key-file server.key \
  --username admin@mycompany.com \
  --instance-url https://login.salesforce.com \
  --alias prod-org
```

**Or via Setup:**
1. Setup → Connected Apps → Manage Connected Apps
2. Click on your app → Edit Policies
3. Permitted Users: "Admin approved users are pre-authorized"
4. Add Permission Set or Profile for the CI user

### Step 4: Use in CI/CD

```yaml
# GitHub Actions
env:
  SF_CLIENT_ID: ${{ secrets.SF_CLIENT_ID }}
  SF_USERNAME: ${{ secrets.SF_USERNAME }}
  SF_INSTANCE_URL: https://login.salesforce.com

steps:
  - name: Authenticate via JWT
    run: |
      echo "${{ secrets.SF_JWT_KEY_BASE64 }}" | base64 -d > server.key
      sf org login jwt \
        --client-id $SF_CLIENT_ID \
        --jwt-key-file server.key \
        --username $SF_USERNAME \
        --instance-url $SF_INSTANCE_URL \
        --alias target-org
      rm server.key  # Clean up
```

### Security Considerations

| Aspect | Rating | Notes |
|--------|--------|-------|
| Token exposure | ✅ High | Private key never leaves your control |
| Rotation | ✅ Planned | Certificate expiry forces rotation |
| Revocation | ✅ Easy | Disable Connected App |
| Audit trail | ✅ Good | Login tracked in org |
| IP Restrictions | ✅ Supported | Can restrict by IP range |

### When to Use

- ✅ Production deployments
- ✅ Enterprise CI/CD
- ✅ Multi-org deployments
- ✅ Sensitive data orgs

---

## Method 3: OAuth 2.0 Client Credentials Flow

### How It Works

Server-to-server authentication without user context. The Connected App acts as its own identity.

### Setup

1. Create Connected App (similar to JWT)
2. Enable "Client Credentials Flow"
3. Assign a "Run As" user
4. Configure execution user's permissions

### Use in CI/CD

```bash
sf org login client-credentials \
  --client-id <CONSUMER_KEY> \
  --client-secret <CONSUMER_SECRET> \
  --instance-url https://login.salesforce.com \
  --alias target-org
```

### Security Considerations

- Client secret must be stored securely
- No user password required
- Actions attributed to "Run As" user

### When to Use

- ✅ Background jobs
- ✅ Integration services
- ⚠️ CI/CD (JWT often preferred)

---

## CI/CD Integration User Strategy

### Dedicated Integration User

**Why:** Separate CI/CD actions from individual developers for:
- Clear audit trail
- Consistent permissions
- No dependency on individual accounts
- Easier offboarding

### Setup Steps

1. **Create User:**
   ```
   Username: ci-deploy@mycompany.com.sandbox
   Profile: Minimum Access - Salesforce (or System Administrator for full access)
   License: Salesforce (or Salesforce Integration for limited use)
   ```

2. **Create Permission Set for CI:**
   ```
   Name: CI_CD_Deployment
   Permissions:
   - Modify All Data (for deployments)
   - Manage Users (if deploying permission sets)
   - Author Apex
   - Modify Metadata Through Metadata API Functions
   - API Enabled
   - View All Data
   ```

3. **Assign Permission Set:**
   ```bash
   sf org assign permset --name CI_CD_Deployment --target-org prod
   ```

### User License Considerations

| License | Cost | Use Case |
|---------|------|----------|
| Salesforce | Full | Full deployment capabilities |
| Salesforce Integration | Lower | API-only access, limited UI |
| Platform | Lower | Custom apps only |

---

## Connected App Best Practices

### IP Restrictions

```
Setup → Connected Apps → Your App → Edit Policies
→ IP Relaxation: Enforce IP restrictions
→ Add IP ranges for CI/CD runners
```

| CI/CD Platform | IP Ranges |
|----------------|-----------|
| GitHub Actions | [GitHub Meta API](https://api.github.com/meta) |
| GitLab.com | [GitLab IP ranges](https://docs.gitlab.com/ee/user/gitlab_com/) |
| Azure DevOps | [Azure DevOps IPs](https://docs.microsoft.com/en-us/azure/devops/organizations/security/allow-list-ip-url) |

### Session Policies

```
Setup → Session Settings
- Lock sessions to IP address: Consider for production
- Session timeout: Set appropriate duration
```

### Monitoring

```
Setup → Connected Apps OAuth Usage
- Monitor active tokens
- Review usage patterns
- Identify anomalies
```

---

## Certificate Rotation Procedure

### Before Expiry (30+ days)

1. **Generate new certificate:**
   ```bash
   openssl req -new -x509 -sha256 -key server.key -out server_new.crt -days 730
   ```

2. **Update Connected App:**
   - Upload new certificate
   - Keep old certificate active during transition

3. **Update CI/CD secrets:**
   - No key change needed if reusing private key
   - Update `SF_JWT_CERT` if stored

4. **Test in non-production first**

5. **Remove old certificate after validation**

### Emergency Rotation (Compromised)

1. **Immediately revoke Connected App:**
   ```
   Setup → App Manager → Your App → Disable
   ```

2. **Generate new key AND certificate:**
   ```bash
   openssl genrsa -out server_new.key 2048
   openssl req -new -x509 -sha256 -key server_new.key -out server_new.crt -days 730
   ```

3. **Create new Connected App** (or update existing)

4. **Update ALL CI/CD secrets**

5. **Re-authorize users**

6. **Audit logs for unauthorized access**

---

## Multi-Environment Authentication

### Separate Connected Apps per Environment

```
CI_CD_Integration_Dev     → Developer sandboxes
CI_CD_Integration_QA      → QA sandbox
CI_CD_Integration_UAT     → UAT sandbox
CI_CD_Integration_Prod    → Production
```

### Single Connected App, Multiple Users

```yaml
# GitHub Actions with environment-specific secrets
jobs:
  deploy:
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'sandbox' }}
    env:
      SF_USERNAME: ${{ secrets.SF_USERNAME }}  # Environment-specific
      SF_CLIENT_ID: ${{ secrets.SF_CLIENT_ID }}  # Can be shared
```

### Benefits of Separation

| Aspect | Single App | Multiple Apps |
|--------|------------|---------------|
| Management | Simpler | More complex |
| Security isolation | Lower | Higher |
| IP restrictions | Same for all | Per-environment |
| Audit | Combined | Separated |

---

## Troubleshooting

### "Invalid JWT token"

```bash
# Check certificate matches Connected App
openssl x509 -in server.crt -noout -fingerprint

# Verify key/cert pair
openssl x509 -noout -modulus -in server.crt | openssl md5
openssl rsa -noout -modulus -in server.key | openssl md5
# Must match!
```

### "user hasn't approved this consumer"

```bash
# Pre-authorize the user
sf org login jwt --client-id ... --jwt-key-file ... --username ... --set-default-dev-hub
```

Or authorize via Setup → Connected Apps → Manage.

### "expired access/refresh token"

- JWT tokens are short-lived by design
- Re-authenticate at the start of each CI run
- Check certificate expiry

### "INVALID_LOGIN: Invalid username, password, security token"

- For Auth URL: regenerate the auth URL
- For JWT: verify username format (user@domain.com for production, user@domain.com.sandboxname for sandbox)
