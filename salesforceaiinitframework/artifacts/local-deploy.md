---
description: Deployment commands for local Salesforce development
globs: ["**/*.cls", "**/*.trigger", "**/lwc/**/*.js", "**/lwc/**/*.html", "**/*.flow-meta.xml"]
alwaysApply: false
---

# Local Deploy Commands

> Quick reference for deploying changes during local development.

## Deploy Single Component

| Type | Command |
|------|---------|
| Apex Class | `sf project deploy start -m ApexClass:MyClassName` |
| Apex Trigger | `sf project deploy start -m ApexTrigger:MyTriggerName` |
| LWC Component | `sf project deploy start -d force-app/main/default/lwc/myComponent` |
| Flow | `sf project deploy start -m Flow:My_Flow_API_Name` |
| Permission Set | `sf project deploy start -m PermissionSet:My_Permission_Set` |
| Custom Object | `sf project deploy start -m CustomObject:My_Object__c` |
| Custom Field | `sf project deploy start -m CustomField:Object__c.Field__c` |

## Deploy Directory

```bash
# All Apex classes
sf project deploy start -d force-app/main/default/classes

# Specific LWC component
sf project deploy start -d force-app/main/default/lwc/myComponent

# Multiple paths
sf project deploy start -d force-app/main/default/classes -d force-app/main/default/triggers
```

## Deploy with Tests

```bash
# Run specific test
sf project deploy start -m ApexClass:MyClass --test-level RunSpecifiedTests --tests MyClassTest

# Run all local tests
sf project deploy start -d force-app/main/default/classes --test-level RunLocalTests
```

## Validation Only (Dry Run)

```bash
# Validate without deploying
sf project deploy start -m ApexClass:MyClass --dry-run
```

## Default Org

```bash
# Check current default org
sf config get target-org

# Set default org
sf config set target-org myOrgAlias

# List all connected orgs
sf org list
```

---

**Tip:** Replace `myOrgAlias` with your actual org alias, or set a default org to skip `-o` flag.
