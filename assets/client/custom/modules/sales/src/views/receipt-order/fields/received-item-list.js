/***********************************************************************************
 * The contents of this file are subject to the Extension License Agreement
 * ("Agreement") which can be viewed at
 * https://www.espocrm.com/extension-license-agreement/.
 * By copying, installing downloading, or using this file, You have unconditionally
 * agreed to the terms and conditions of the Agreement, and You may not use this
 * file except in compliance with the Agreement. Under the terms of the Agreement,
 * You shall not license, sublicense, sell, resell, rent, lease, lend, distribute,
 * redistribute, market, publish, commercialize, or otherwise transfer rights or
 * usage to the software or any modified version or derivative work of the software
 * created by or for you.
 *
 * Copyright (C) 2015-2024 Letrium Ltd.
 *
 * License ID: 799ba07927a6a02c6a0ae59de64ec1ec
 ************************************************************************************/

define('sales:views/receipt-order/fields/received-item-list', ['views/fields/base'], function (Dep) {
/** @module modules/sales/views/receipt-order/fields/received-item-list */

    /**
     * @typedef {Object} module:modules/sales/views/receipt-order/fields/received-item-list~item
     * @property {string} id
     * @property {string|null} inventoryNumberId
     * @property {string|null} inventoryNumberName
     * @property {string} inventoryNumberType
     * @property {string|null} productId
     * @property {string|null} productName
     * @property {number|null} quantity
     */

    /**
     * @typedef {function} module:modules/sales/views/receipt-order/fields/received-item-list~updateItem
     * @param {string} id
     * @param {module:modules/sales/views/receipt-order/fields/received-item-list~item} item
     */

    /**
     * @typedef {function} module:modules/sales/views/receipt-order/fields/received-item-list~addItem
     * @param {string} productId
     */

    /**
     * @typedef {function} module:modules/sales/views/receipt-order/fields/received-item-list~removeItem
     * @param {string} id
     */

    return class extends Dep {

        // noinspection JSUnusedGlobalSymbols
        detailTemplateContent = `
            {{#if isEmpty}}
                <div class="form-group none-value">{{translate 'None'}}</div>
            {{/if}}
            <div
                class="item-list-container list no-side-margin margin-bottom{{#if isEmpty}} hidden{{/if}}"
            >{{{items}}}</div>
        `

        // noinspection JSUnusedGlobalSymbols
        editTemplateContent = `
            {{#if isEmpty}}
                <div class="form-group none-value">{{translate 'None'}}</div>
            {{/if}}
            <div
                class="item-list-container list no-side-margin margin-bottom{{#if isEmpty}} hidden{{/if}}"
            >{{{items}}}</div>
        `

        validations = ['valid']

        serialNumberAutoAddedMaxCount = 20

        data() {
            return {
                isEmpty: this.items.length === 0,
            };
        }

        setup() {
            /** @type {module:modules/sales/views/receipt-order/fields/received-item-list~item[]} */
            this.items = this.getItems();

            this.listenTo(this.model, 'change', (m, o) => {
                if (
                    !this.model.hasChanged('itemList') &&
                    !this.model.hasChanged(this.name)
                ) {
                    return;
                }

                if (o.ui && this.model.hasChanged(this.name)) {
                    return;
                }

                this.whenReady()
                    .then(() => this.update());
            });
        }

        update() {
            this.items = this.getItems();

            return this.prepare()
                .then(() => this.reRender());
        }

        prepare() {
            const updateItem = (id, item) => {
                this.updateItemSilent(id, item);
            };

            const addItem = (productId) => {
                this.addItem(productId);
            };

            const removeItem = (id) => {
                this.removeItem(id);
            };

            return this.createView('items', 'sales:views/receipt-order/record/received-items', {
                selector: '.item-list-container',
                mode: this.mode,
                items: this.items,
                updateItem: updateItem,
                addItem: addItem,
                removeItem: removeItem,
                parentModel: this.model,
            });
        }

        /**
         * @param {string} productId
         */
        addItem(productId) {
            const orderItem = this.getActualOrderItems().find(item => item.productId === productId);

            if (!orderItem) {
                return;
            }

            const productName = orderItem.productName;

            /** @type {module:modules/sales/views/receipt-order/fields/received-item-list~item} */
            const item = {
                id: this.generateId(),
                productId: productId,
                productName: productName,
                inventoryNumberId: null,
                inventoryNumberName: null,
                inventoryNumberType: orderItem.inventoryNumberType,
                quantity: 0.0,
            };

            let index = this.items
                .slice()
                .reverse()
                .findIndex(item => item.productId === productId);

            index = this.items.length - index - 1;

            this.items.splice(index + 1, 0, item);

            this.trigger('change');

            this.update();
        }

        /**
         * @param {string} id
         */
        removeItem(id) {
            const index = this.items.findIndex(item => item.id === id);

            if (index === -1) {
                return;
            }

            this.items.splice(index, 1);

            this.trigger('change');

            this.update();
        }

        /**
         * @param {string} id
         * @param {module:modules/sales/views/receipt-order/fields/received-item-list~item} item
         */
        updateItemSilent(id, item) {
            const foundItem = this.items.find(item => item.id === id);

            if (!foundItem) {
                return;
            }

            for (const attribute in item) {
                foundItem[attribute] = item[attribute];
            }

            this.trigger('change');
        }

        /**
         * @return {module:modules/sales/views/receipt-order/fields/received-item-list~item[]}
         */
        getItems() {
            const items = this.getItemsFromModel() || [];

            this.removeNotActualItems(items);
            this.addMissingItems(items);

            return items;
        }

        /**
         * @return {{
         *     quantityReceived: number|null,
         *     productId: string|null,
         *     productName: string|null,
         *     inventoryNumberType: string,
         * }[]}
         */
        getActualOrderItems() {
            /** @type {{
             *     quantityReceived: number|null,
             *     productId: string|null,
             *     productName: string|null,
             *     inventoryNumberType: string|null,
             * }[]} */
            let orderItems = this.model.get('itemList') || [];

            orderItems = orderItems
                .filter(item => item.productId)
                .filter(item => item.inventoryNumberType)
                .filter(item => item.quantityReceived);

            return orderItems;
        }

        /**
         * @param {module:modules/sales/views/receipt-order/fields/received-item-list~item[]} items
         */
        addMissingItems(items) {
            const add = (orderItem, quantity) => {
                items.push({
                    id: this.generateId(),
                    productId: orderItem.productId,
                    productName: orderItem.productName,
                    quantity: quantity,
                    inventoryNumberId: null,
                    inventoryNumberName: null,
                    inventoryNumberType: orderItem.inventoryNumberType,
                });
            };

            this.getActualOrderItems().forEach(orderItem => {
                if (items.find(item => item.productId === orderItem.productId)) {
                    return;
                }

                if (orderItem.inventoryNumberType === 'Serial') {
                    for (let i = 0; i < orderItem.quantityReceived; i++) {
                        if (i > this.serialNumberAutoAddedMaxCount) {
                            return;
                        }

                        add(orderItem, 1);
                    }

                    return;
                }

                add(orderItem, orderItem.quantityReceived);
            });
        }

        /**
         * @param {module:modules/sales/views/receipt-order/fields/received-item-list~item[]} items
         */
        removeNotActualItems(items) {
            const orderItems = this.getActualOrderItems();

            const quantityMap1 = {};
            const quantityMap2 = {};

            orderItems.forEach(item => {
                if (item.inventoryNumberType !== 'Serial') {
                    return;
                }

                quantityMap1[item.productId] = quantityMap1[item.productId] || 0.0;
                quantityMap1[item.productId] += item.quantityReceived;
            });

            const indexes = [];

            items.forEach((item, i) => {
                if (
                    !orderItems.find(orderItem => orderItem.productId === item.productId)
                ) {
                    indexes.unshift(i);

                    return;
                }

                if (item.inventoryNumberType !== 'Serial') {
                    return;
                }

                quantityMap2[item.productId] = quantityMap2[item.productId] || 0.0;
                quantityMap2[item.productId] ++;

                if (quantityMap2[item.productId] > quantityMap1[item.productId]) {
                    indexes.unshift(i);
                }
            });

            indexes.forEach(i => items.splice(i, 1));
        }

        generateId() {
            return Math.random().toString(36).slice(2, 12);
        }

        /**
         * @return {module:modules/sales/views/receipt-order/fields/received-item-list~item[]|null}
         */
        getItemsFromModel() {
            if (!this.model.has(this.name)) {
                return null;
            }

            const list = [];

            (this.model.get(this.name) || []).forEach(item => {
                list.push({
                    id: item.id || this.generateId(),
                    inventoryNumberId: item.inventoryNumberId,
                    inventoryNumberName: item.inventoryNumberName,
                    inventoryNumberType: item.inventoryNumberType,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                })
            });

            return list;
        }

        // noinspection JSUnusedGlobalSymbols
        validateValid() {
            return this.getItemsView().validate();
        }

        getItemsView() {
            return this.getView('items');
        }

        fetch() {
            return {
                receivedItemList: Espo.Utils.cloneDeep(this.items),
            };
        }
    }
});
