import { createElement } from '@lwc/engine-dom';
import ProductTile from 'c/productTile';

describe('c-product-tile', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('dragging sets product as dataTransfer data', () => {
        const element = createElement('c-product-tile', {
            is: ProductTile
        });
        // Emulate a DragEvent, jsdom does not implement this class yet
        const dragstartEvent = new CustomEvent('dragstart');
        dragstartEvent.dataTransfer = {
            setData: jest.fn()
        };
        const product = {
            Id: 1,
            Picture_URL__c: 'https://salesforce.com',
            Name: 'Foo',
            MSRP__c: 1000
        };
        element.product = product;
        document.body.appendChild(element);

        const div = element.shadowRoot.querySelector('div');
        div.dispatchEvent(dragstartEvent);

        expect(dragstartEvent.dataTransfer.setData).toHaveBeenCalledWith(
            'product',
            JSON.stringify(product)
        );
    });

    it('clicking fires selected event', () => {
        const listener = jest.fn();
        const element = createElement('c-product-tile', {
            is: ProductTile
        });
        element.addEventListener('selected', listener);
        element.product = {
            Id: 1,
            Picture_URL__c: 'https://salesforce.com',
            Name: 'Foo',
            MSRP__c: 1000
        };
        document.body.appendChild(element);

        const anchor = element.shadowRoot.querySelector('a');
        anchor.click();

        expect(listener).toHaveBeenCalled();
    });

    it('is accessible', () => {
        const element = createElement('c-product-tile', {
            is: ProductTile
        });

        element.product = {
            Id: 1,
            Picture_URL__c: 'https://salesforce.com',
            Name: 'Foo',
            MSRP__c: 1000
        };
        document.body.appendChild(element);

        return Promise.resolve().then(() => expect(element).toBeAccessible());
    });

    it('displays year when product has Year__c set', () => {
        const element = createElement('c-product-tile', {
            is: ProductTile
        });
        element.product = {
            Id: 1,
            Picture_URL__c: 'https://salesforce.com',
            Name: 'Foo',
            MSRP__c: 1000,
            Year__c: '2024'
        };
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const paragraphs = element.shadowRoot.querySelectorAll('p');
            const yearParagraph = Array.from(paragraphs).find((p) =>
                p.textContent.includes('Year: 2024')
            );
            expect(yearParagraph).not.toBeNull();
        });
    });

    it('does not display year element when product has no Year__c', () => {
        const element = createElement('c-product-tile', {
            is: ProductTile
        });
        element.product = {
            Id: 1,
            Picture_URL__c: 'https://salesforce.com',
            Name: 'Foo',
            MSRP__c: 1000
        };
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const paragraphs = element.shadowRoot.querySelectorAll('p');
            const yearParagraph = Array.from(paragraphs).find((p) =>
                p.textContent.includes('Year:')
            );
            expect(yearParagraph).toBeUndefined();
        });
    });
});
