---
description: LWC structure and conventions used in THIS project — extracted from actual components
globs: ["**/lwc/**/*.js", "**/lwc/**/*.html", "**/lwc/**/*.css"]
alwaysApply: false
---

# LWC Structure

> How Lightning Web Components are built in this project. Extracted from actual code — document what IS.

## Component Inventory

| Metric | Value |
|--------|-------|
| Total components | 17 |
| Components with Jest tests | 15 |
| Components without tests | `orderItemTile`, `createCase` |
| Accessibility tests | Multiple (`@sa11y/jest` — `expect(element).toBeAccessible()`) |
| Package | `force-app/main/default/lwc/` (flat, single package) |

### Component Distribution

| Type | Components |
|------|-----------|
| **Container / Smart** | `productTileList`, `orderBuilder`, `productCard` |
| **Presentational / Dumb** | `productTile`, `orderItemTile`, `productListItem`, `paginator`, `placeholder` |
| **Form / Input** | `createCase`, `productFilter` |
| **Detail / Record** | `heroDetails`, `accountMap`, `orderStatusPath`, `similarProducts` |
| **Community / Page** | `hero` |
| **Utility (no template)** | `ldsUtils` |
| **Shared Error UI** | `errorPanel` |

---

## File Structure (Observed)

### Standard Component
```
componentName/
├── componentName.js
├── componentName.html
├── componentName.css          (most, not all)
├── componentName.js-meta.xml
└── __tests__/
    ├── componentName.test.js
    └── data/
        ├── mockData.json      (JSON wire mock data)
        └── mockDataEmpty.json
```

### Utility Module (no template)
```
ldsUtils/
├── ldsUtils.js                (export functions only, no LightningElement)
├── ldsUtils.js-meta.xml
└── __tests__/
    └── ldsUtils.test.js
```

### Multiple-Template Component
```
errorPanel/
├── errorPanel.js              (uses render() to switch templates)
├── errorPanel.js-meta.xml
├── __tests__/
│   └── errorPanel.test.js
└── templates/
    ├── noDataIllustration.html
    └── inlineMessage.html
```

---

## Data Source Approach

| Pattern | Components | Notes |
|---------|-----------|-------|
| `@wire` Apex | `productTileList`, `orderBuilder`, `heroDetails`, `similarProducts` | Main server data approach |
| `@wire` LDS (`getRecord`) | `accountMap`, `orderStatusPath`, `similarProducts` | Standard record fields |
| `@wire` UI API (`getPicklistValues`, `getObjectInfo`) | `productFilter`, `orderStatusPath` | Picklist/schema data |
| LDS Imperative (`createRecord`, `updateRecord`, `deleteRecord`) | `orderBuilder` | DML operations |
| `refreshApex` | `orderBuilder` | After `createRecord` to re-sync wire data |
| `lightning-record-edit-form` | `createCase` | LDS form submission — no Apex needed |
| `lightning-record-view-form` | `productCard` | LDS record display with `handleRecordLoaded` |

### Wire Apex Example

```javascript
// productTileList.js — reactive wire with object parameters
@wire(getProducts, { filters: '$filters', pageNumber: '$pageNumber' })
products;

// orderBuilder.js — wire with wired result stored for refreshApex
@wire(getOrderItems, { orderId: '$recordId' })
wiredGetOrderItems(value) {
    this.wiredOrderItems = value;
    if (value.error) {
        this.error = value.error;
    } else if (value.data) {
        this.setOrderItems(value.data);
    }
}
```

> Note: `productTileList` uses the shorthand `products` wire property; `orderBuilder` uses the function form to store the result for `refreshApex`.

### Wire LDS (getRecord) Example

```javascript
// accountMap.js — getRecord with schema-imported field constants
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BILLING_CITY from '@salesforce/schema/Account.BillingCity';

const fields = [BILLING_CITY, BILLING_COUNTRY, BILLING_POSTAL_CODE, BILLING_STATE, BILLING_STREET];

@wire(getRecord, { recordId: '$recordId', fields })
wiredRecord({ error, data }) {
    if (data) {
        const street = getFieldValue(data, BILLING_STREET);
        // ...
    } else if (error) {
        this.error = error;
    }
}
```

### Imperative LDS (createRecord) with refreshApex

```javascript
// orderBuilder.js — create, then refresh wire
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

handleDrop(event) {
    const fields = { /* ... */ };
    createRecord({ apiName: ORDER_ITEM_OBJECT.objectApiName, fields })
        .then(() => {
            return refreshApex(this.wiredOrderItems);
        })
        .catch((e) => {
            this.dispatchEvent(new ShowToastEvent({ title: 'Error creating order',
                message: reduceErrors(e).join(', '), variant: 'error' }));
        });
}
```

---

## Communication Patterns

| Pattern | Usage |
|---------|-------|
| `@api` properties | Parent → Child data passing |
| Custom Events | Child → Parent action notification |
| LMS (Lightning Message Service) | Cross-tree component communication |
| Named Slots | `hero` passes button text to `heroDetails` via `slot="button"` |

### @api Properties Convention

- All public props use `@api` without `@track`
- `@api recordId` — page context injection (standard Salesforce pattern)
- Default values on `@api`: `@api friendlyMessage = 'Error retrieving data'`, `@api searchBarIsVisible = false`
- Setter pattern used when derived state needs updating on prop change:

```javascript
// productTile.js — @api setter to extract display fields from object
_product;
@api
get product() {
    return this._product;
}
set product(value) {
    this._product = value;
    this.pictureUrl = value.Picture_URL__c;
    this.name = value.Name;
    this.msrp = value.MSRP__c;
}
```

### Custom Event Naming & Shape

All custom events use **lowercase** names:

| Event Name | Dispatched By | Detail Shape | Bubbles/Composed |
|-----------|---------------|--------------|-----------------|
| `selected` | `productTile` | `product.Id` (string) | default (false/false) |
| `orderitemchange` | `orderItemTile` | `{ Id, ...formFields }` (merged object) | default |
| `orderitemdelete` | `orderItemTile` | `{ id: orderItem.Id }` | default |
| `previous` | `paginator` | none | default |
| `next` | `paginator` | none | default |
| `refresh` | `createCase` | none | default |

```javascript
// orderItemTile.js — event with merged object detail
const event = new CustomEvent('orderitemchange', {
    detail: Object.assign({}, { Id: this.orderItem.Id }, this.form)
});
this.dispatchEvent(event);

// paginator.js — simple event with no detail
this.dispatchEvent(new CustomEvent('previous'));
```

### LMS (Lightning Message Service) Pattern

Two message channels used: `ProductsFiltered__c` and `ProductSelected__c`

```javascript
// productFilter.js — publisher
import { publish, MessageContext } from 'lightning/messageService';
import PRODUCTS_FILTERED_MESSAGE from '@salesforce/messageChannel/ProductsFiltered__c';

@wire(MessageContext) messageContext;

publish(this.messageContext, PRODUCTS_FILTERED_MESSAGE, { filters: this.filters });
```

```javascript
// productTileList.js — subscriber (in connectedCallback)
import { subscribe, MessageContext } from 'lightning/messageService';
import PRODUCTS_FILTERED_MESSAGE from '@salesforce/messageChannel/ProductsFiltered__c';

connectedCallback() {
    this.productFilterSubscription = subscribe(
        this.messageContext,
        PRODUCTS_FILTERED_MESSAGE,
        (message) => this.handleFilterChange(message)
    );
}
```

### LMS Architecture

```
productFilter ──(ProductsFiltered__c)──► productTileList
productTileList ──(ProductSelected__c)──► productCard
```

---

## Template Patterns

### Conditional Rendering — Modern `lwc:if` / `lwc:else`

**All components use `lwc:if` (modern syntax) — NOT the deprecated `if:true`.**

```html
<!-- productTileList.html — lwc:if + lwc:else -->
<template lwc:if={products.data}>
    <template lwc:if={products.data.records.length}>
        <!-- records exist -->
    </template>
    <template lwc:else>
        <c-placeholder message="There are no products matching..."></c-placeholder>
    </template>
</template>
<template lwc:if={products.error}>
    <c-error-panel errors={products.error}></c-error-panel>
</template>
```

### Iteration — `for:each` (Legacy but Valid LWC syntax)

**`for:each` with `for:item` is used — always with `key={item.Id}`.**

```html
<!-- orderBuilder.html — for:each with record Id as key -->
<template for:each={orderItems} for:item="orderItem">
    <c-order-item-tile
        key={orderItem.Id}
        order-item={orderItem}
        onorderitemchange={handleOrderItemChange}
        onorderitemdelete={handleOrderItemDelete}
    ></c-order-item-tile>
</template>
```

### Dynamic CSS Classes via Getters

```javascript
// orderStatusPath.js — CSS class computed in JS, bound to template
get cssClasses() {
    return this.getPathItemCssClasses(isCurrent, isCompleted);
}

getPathItemCssClasses(isCurrent, isCompleted) {
    let cssClasses = 'slds-path__item';
    if (isCurrent) cssClasses += ' slds-is-current slds-is-active';
    // ...
    return cssClasses;
}
```

```html
<li key={pathItem.value} class={pathItem.cssClasses}>
```

### `data-*` Attributes for Field Name Mapping

```html
<!-- orderItemTile.html — data-field-name used to dynamically map input to field -->
<lightning-input
    onchange={handleFormChange}
    data-field-name="Qty_S__c"
    label="Small"
    type="number"
></lightning-input>
```

```javascript
// orderItemTile.js
handleFormChange(evt) {
    const field = evt.target.dataset.fieldName;
    this.form[field] = parseInt(evt.detail.value.trim(), 10);
}
```

### Named Slots

```html
<!-- hero.html — passes button label into heroDetails via slot -->
<c-hero-details class={heroDetailsPositionClass} title={title}>
    <span slot="button">{buttonText}</span>
</c-hero-details>
```

### Multiple Templates via `render()`

```javascript
// errorPanel.js — render() method selects template
import noDataIllustration from './templates/noDataIllustration.html';
import inlineMessage from './templates/inlineMessage.html';

render() {
    if (this.type === 'inlineMessage') return inlineMessage;
    return noDataIllustration;
}
```

---

## State Management

| Pattern | Usage |
|---------|-------|
| `@track` | **Not used** — all class fields are reactive by default |
| Getters | **Heavily used** — derived boolean states and computed values |
| Optimistic updates | `orderBuilder` — local state first, rollback on server error |
| Reactive wire params | `'$filters'`, `'$pageNumber'`, `'$recordId'` — `$` prefix triggers re-fetch |

### Getter Pattern (Observed Throughout)

```javascript
// paginator.js — multiple derived getters
get currentPageNumber() {
    return this.totalItemCount === 0 ? 0 : this.pageNumber;
}
get isNotFirstPage() {
    return this.pageNumber !== 1;
}
get isNotLastPage() {
    return this.pageNumber !== this.totalPages;
}
get totalPages() {
    return Math.ceil(this.totalItemCount / this.pageSize);
}
```

### Optimistic Update + Rollback Pattern

```javascript
// orderBuilder.js — optimistic update with rollback
handleOrderItemChange(evt) {
    const previousOrderItems = this.orderItems;
    // Apply optimistically on client
    const orderItems = this.orderItems.map((orderItem) => {
        if (orderItem.Id === orderItemChanges.Id) {
            return Object.assign({}, orderItem, orderItemChanges);
        }
        return orderItem;
    });
    this.setOrderItems(orderItems);

    // Persist to server
    updateRecord({ fields: orderItemChanges })
        .catch((e) => {
            this.setOrderItems(previousOrderItems); // Rollback
            this.dispatchEvent(new ShowToastEvent({ /* error toast */ }));
        });
}
```

---

## Lifecycle Hooks Usage

| Hook | Component | Purpose |
|------|-----------|---------|
| `connectedCallback` | `productTileList` | Subscribe to `ProductsFiltered__c` LMS |
| `connectedCallback` | `productCard` | Subscribe to `ProductSelected__c` LMS |
| `connectedCallback` | `orderStatusPath` | Check EMP API availability + subscribe to `Manufacturing_Event__e` |
| `disconnectedCallback` | `orderStatusPath` | Unsubscribe from Platform Event channel |
| `renderedCallback` | `hero` | Direct DOM manipulation for overlay opacity |

```javascript
// orderStatusPath.js — connectedCallback + disconnectedCallback for EMP API
async connectedCallback() {
    const isEmpApiEnabled = await isEmpEnabled();
    if (!isEmpApiEnabled) {
        this.reportError('The EMP API is not enabled.');
        return;
    }
    this.subscription = await subscribe(
        MANUFACTURING_EVENT_CHANNEL,
        -1,
        (event) => { this.handleManufacturingEvent(event); }
    );
}

disconnectedCallback() {
    if (this.subscription) {
        unsubscribe(this.subscription);
    }
}
```

```javascript
// hero.js — renderedCallback for DOM manipulation (avoid when possible)
renderedCallback() {
    const overlay = this.template.querySelector('div');
    if (overlay) {
        overlay.style.opacity = parseInt(this.opacity, 10) / 10;
    }
}
```

---

## Styling Approach

| Aspect | Finding |
|--------|---------|
| Primary | **SLDS** — `slds-*` classes everywhere |
| Custom CSS | Component-scoped files for layout/sizing tweaks |
| CSS variables | Not observed in sampled files |
| `:host` selectors | Not observed |

### CSS Example (component-scoped custom styles)

```css
/* productTile.css */
.content {
    padding: 8px;
    background-color: #ffffff;
    border-radius: 0.25rem;
}
img.product {
    height: 120px;
    max-width: initial;
    pointer-events: none;
}
.title {
    font-weight: bold;
    text-transform: uppercase;
}
```

Common SLDS utility classes observed:
- Layout: `slds-card`, `slds-grid`, `slds-var-p-around_x-small`, `slds-var-m-around_x-small`
- Alignment: `slds-align_absolute-center`
- Text: `slds-text-heading_small`, `slds-text-heading_medium`, `slds-text-color_error`
- Path: `slds-path`, `slds-path__item`, `slds-is-current`, `slds-is-active`, `slds-is-complete`

---

## Error Handling

| Pattern | Usage |
|---------|-------|
| `c-error-panel` | Shared component for displaying wire errors (`orderBuilder`, `productTileList`, `orderStatusPath`) |
| `ShowToastEvent` | User feedback for DML successes and failures (`orderBuilder`, `createCase`) |
| `reduceErrors` | Utility from `c/ldsUtils` — normalizes LDS/Apex/JS errors to `string[]` |
| `try-catch` async | `orderStatusPath` for EMP API calls |
| Wire `.error` check | All components with wire adapters check both `.data` and `.error` branches |

### Toast Pattern

```javascript
// orderBuilder.js — error toast after failed DML
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';

.catch((e) => {
    this.dispatchEvent(
        new ShowToastEvent({
            title: 'Error creating order',
            message: reduceErrors(e).join(', '),
            variant: 'error'
        })
    );
});

// createCase.js — success toast
handleCaseCreated() {
    this.dispatchEvent(new ShowToastEvent({
        title: 'Case Created!',
        message: 'You have successfully created a Case',
        variant: 'success'
    }));
}
```

### `reduceErrors` Utility (`c/ldsUtils`)

```javascript
// ldsUtils.js — handles all LDS/Apex/network error shapes
export function reduceErrors(errors) {
    if (!Array.isArray(errors)) errors = [errors];
    return errors
        .filter((error) => !!error)
        .map((error) => {
            if (typeof error === 'string') return error;
            if (Array.isArray(error.body)) return error.body.map((e) => e.message);
            else if (error.body && typeof error.body.message === 'string') return error.body.message;
            else if (typeof error.message === 'string') return error.message;
            return error.statusText;
        })
        .reduce((prev, curr) => prev.concat(curr), [])
        .filter((message) => !!message);
}
```

---

## Testing Approach

| Aspect | Finding |
|--------|---------|
| Framework | Jest + `@salesforce/sfdx-lwc-jest` |
| Test files | 15 test files (14 component tests + 1 accessibility test) |
| JSON mock data | `__tests__/data/*.json` files for wire adapter responses |
| Wire mocking | `createApexTestWireAdapter` from `@salesforce/sfdx-lwc-jest` |
| DOM cleanup | `afterEach` with `document.body.removeChild` loop |
| Async handling | Local `flushPromises()` helper or `Promise.resolve().then(...)` |
| Accessibility | `expect(element).toBeAccessible()` via `@sa11y/jest` |

### Test Structure

```javascript
// orderBuilder.test.js — complete test structure
import { createElement } from '@lwc/engine-dom';
import OrderBuilder from 'c/orderBuilder';
import getOrderItems from '@salesforce/apex/OrderController.getOrderItems';

const mockGetOrderItems = require('./data/getOrderItems.json');

// 1. Mock the wire adapter
jest.mock(
    '@salesforce/apex/OrderController.getOrderItems',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return { default: createApexTestWireAdapter(jest.fn()) };
    },
    { virtual: true }
);

describe('c-order-builder', () => {
    // 2. DOM cleanup after each test
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // 3. flushPromises helper
    async function flushPromises() {
        return Promise.resolve();
    }

    it('displays the correct number of tiles', async () => {
        // 4. Create + mount component
        const element = createElement('c-order-builder', { is: OrderBuilder });
        element.recordId = '0031700000pHcf8AAC';
        document.body.appendChild(element);

        // 5. Emit wire data
        getOrderItems.emit(mockGetOrderItems);
        await flushPromises();

        // 6. Assert DOM
        const tiles = element.shadowRoot.querySelectorAll('c-order-item-tile');
        expect(tiles.length).toBe(mockGetOrderItems.length);
    });

    // 7. Accessibility test
    it('is accessible when orders returned', async () => {
        const element = createElement('c-order-builder', { is: OrderBuilder });
        document.body.appendChild(element);
        getOrderItems.emit(mockGetOrderItems);
        await flushPromises();
        await expect(element).toBeAccessible();
    });
});
```

---

## meta.xml Patterns

**API Version:** `65.0` on all components

**Common targets:**

```xml
<!-- productTileList.js-meta.xml — multi-target with configurable @api properties -->
<LightningComponentBundle>
    <apiVersion>65.0</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>Product Tile List</masterLabel>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
        <target>lightning__HomePage</target>
        <target>lightningCommunity__Page</target>
        <target>lightningCommunity__Default</target>
    </targets>
    <targetConfigs>
        <targetConfig targets="lightning__RecordPage">
            <property name="searchBarIsVisible" type="Boolean" label="Search bar visible" />
            <property name="tilesAreDraggable" type="Boolean" label="Product tiles are draggable" />
            <objects><object>Order__c</object></objects>
        </targetConfig>
    </targetConfigs>
</LightningComponentBundle>
```

**Apex-backed picklist in App Builder (`hero.js-meta.xml`):**

```xml
<property
    name="heroDetailsPosition"
    type="String"
    label="Hero Text Block Position"
    datasource="apex://HeroDetailsPositionCustomPicklist"
/>
```

**Target summary:**

| Target | Components |
|--------|-----------|
| `lightning__RecordPage` | `orderStatusPath`, `productTileList` |
| `lightning__AppPage` + `HomePage` | `productTileList` |
| `lightningCommunity__Default` | `hero`, `productTileList` |
| Not exposed (`isExposed: false`) | utility/helper components |

---

## Key Notes for New Components in This Project

1. **Use `lwc:if` / `lwc:else`** — never the deprecated `if:true`
2. **Use `for:each` + `for:item` with `key={item.Id}`** — existing iteration pattern
3. **No `@track`** — class fields are reactive by default; just assign new values
4. **Getters for derived state** — avoid storing computed values as tracked fields
5. **Import schema fields** with `@salesforce/schema/Object__c.Field__c` for referential integrity (see `accountMap.js`, `productCard.js`)
6. **Always handle both `.data` and `.error` branches** of wire adapters
7. **Use `c-error-panel`** for displaying wire errors — don't reinvent the wheel
8. **Use `reduceErrors` from `c/ldsUtils`** when formatting error messages for toasts
9. **LMS for cross-tree communication** — never drill @api props across unrelated trees
10. **Test with JSON mock data files** in `__tests__/data/` + `createApexTestWireAdapter`
11. **Add `afterEach` DOM cleanup** in every test file
12. **Add accessibility test** with `expect(element).toBeAccessible()` for exposed components
13. **Community components** need `lightningCommunity__Default` target in meta.xml
14. **API version 65.0** on all new components

---

*Analyzed from: 17 components, 15 test files*  
*Generated: 2026-04-24*  
*Source: `force-app/main/default/lwc/**`*
