# LWC Template Patterns Detection

> Patterns and anti-patterns to detect in LWC templates during analysis.
> Based on common LWC-specific syntax rules that differ from other frameworks.

---

## Template Syntax to Detect

### Conditional Rendering

| Modern (preferred) | Deprecated |
|--------------------|------------|
| `lwc:if={condition}` | `if:true={condition}` |
| `lwc:elseif={other}` | `if:false={condition}` |
| `lwc:else` | — |

**Analysis:** Which style is used? Consistent?

---

### Iteration

**Correct pattern:**
```html
<template for:each={items} for:item="item">
    <div key={item.id}>{item.name}</div>
</template>
```

**What to detect:**
- Is `key` always present?
- What's used as key? (id, index, composite)
- Nested iterations?

---

### Data Binding

**What to detect:**

| Pattern | Example | Document |
|---------|---------|----------|
| Property binding | `value={propertyName}` | Standard usage |
| Getter binding | `class={computedClass}` | For computed values |
| Event binding | `onchange={handleChange}` | Event naming |

---

## Anti-Patterns to Detect

These patterns indicate potential issues. Document IF found (neutral tone).

### 1. Expressions in Templates

LWC does NOT support inline expressions. Detect:

```html
<!-- These don't work in LWC -->
{price * quantity}
{firstName + ' ' + lastName}
{items.length}
{isActive ? 'Yes' : 'No'}
```

**Detection:** Search for `{.*[\+\-\*\/\?].*}` patterns in HTML.

### 2. Method Calls in Templates

```html
<!-- These don't work -->
{name.toUpperCase()}
{formatDate(createdDate)}
{items.filter(x => x.active)}
```

**Detection:** Search for `{.*\(.*\).*}` patterns in HTML.

### 3. Comparisons in Conditionals

```html
<!-- These don't work -->
<template if:true={count > 5}>
<template lwc:if={status === 'active'}>
```

**Detection:** Search for `if:true={.*[><=!].*}` or `lwc:if={.*[><=!].*}`.

### 4. Logical Operators in Templates

```html
<!-- These don't work -->
<template if:true={isAdmin && hasPermission}>
<template lwc:if={!isLoading}>
```

**Detection:** Search for `if.*={.*[&|!].*}` patterns.

### 5. Inline Event Arguments

```html
<!-- These don't work -->
<button onclick={handleClick(item.id)}>
<button onclick={() => this.handleDelete(record)}>
```

**Detection:** Search for `on\w+={.*\(.*\)}` patterns.

### 6. Missing Keys in Iteration

```html
<!-- Anti-pattern -->
<template for:each={items} for:item="item">
    <div>{item.name}</div>  <!-- Missing key! -->
</template>
```

**Detection:** Find `for:each` without corresponding `key=`.

### 7. Index as Key

```html
<!-- Problematic -->
<template for:each={items} for:item="item" for:index="index">
    <div key={index}>{item.name}</div>
</template>
```

**Detection:** Find `for:index` used in same element as `key=`.

---

## Correct Patterns to Detect

### Dynamic Classes (Getter Pattern)

```javascript
// JS
get containerClass() {
    return this.isActive ? 'active' : 'inactive';
}
```

```html
<!-- HTML -->
<div class={containerClass}>
```

**Detection:** Getters returning strings used for class attributes.

### Dynamic Styles

```javascript
// Correct approach
get dynamicStyle() {
    return `color: ${this.textColor};`;
}
```

**Detection:** Style attributes using property references.

### Event Handlers with data-* Attributes

```html
<button data-id={item.id} onclick={handleClick}>
```

```javascript
handleClick(event) {
    const itemId = event.currentTarget.dataset.id;
}
```

**Detection:** `data-*` attributes used for passing context to handlers.

---

## Analysis Summary Format

```markdown
### Template Patterns (Observed)

| Aspect | Finding |
|--------|---------|
| Conditional syntax | Modern (`lwc:if`) / Mixed / Deprecated (`if:true`) |
| Iteration keys | Unique IDs / Index-based / Missing |
| Dynamic classes | Getter pattern / Direct property |
| Event handling | data-* attributes / inline (problematic) |

**Anti-patterns detected:**
- [X] Expressions in templates found in 3 components
- [ ] No method calls in templates
- [X] Missing keys in `searchResults.html`
```
