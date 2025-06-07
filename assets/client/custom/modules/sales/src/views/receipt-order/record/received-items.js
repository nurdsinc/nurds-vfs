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

define('sales:views/receipt-order/record/received-items', ['view'], function (Dep) {

    return class extends Dep {

        // language=Handlebars
        templateContent = `
            <table class="table less-padding">
                <thead>
                    <tr>
                        {{#if isEdit}}
                            <th style="width: 54px"></th>
                        {{/if}}
                        <th>
                            {{translate 'product' category='fields' scope='ReceiptOrderItem'}}
                        </th>
                        <th style="width: 40%">
                            {{translate 'inventoryNumber' category='fields' scope='DeliveryOrderItem'}}
                        </th>
                        <th style="width: 10%">
                            {{translate 'qtyReceived' category='fields' scope='ReceiptOrderItem'}}
                        </th>
                        {{#if isEdit}}
                        <th style="width: 54px"></th>
                        {{/if}}
                    </tr>
                </thead>
                <tbody>
                {{#each items}}
                    <tr
                        class="item-container"
                        data-id="{{id}}"
                    >{{{var id ../this}}}</tr>
                {{/each}}
                </tbody>
            </table>
        `

        data() {
            return {
                items: this.items,
                isEdit: this.mode === 'edit',
            };
        }

        setup() {
            /** @type {module:modules/sales/views/receipt-order/fields/received-item-list~item[]} */
            this.items = this.options.items;
            /** @type {'detail'|'edit'} */
            this.mode = this.options.mode;
            /** @type {module:model} */
            this.parentModel = this.options.parentModel;

            if (!this.getConfig().get('inventoryTransactionsEnabled')) {
                return;
            }

            this.wait(
                this.createItemViews()
            );
        }

        createItemViews() {
            return Promise.all(
                this.items.map((item, i) => {
                    return this.createItemView(item, i);
                })
            );
        }

        /**
         * @param {module:modules/sales/views/receipt-order/fields/received-item-list~item} item
         * @param {number} i
         * @return {Promise}
         */
        createItemView(item, i) {
            return this.createView(item.id, 'sales:views/receipt-order/record/received-item', {
                selector: `.item-container[data-id="${item.id}"]`,
                item: item,
                index: i,
                mode: this.mode,
                updateItem: this.options.updateItem,
                addItem: this.options.addItem,
                removeItem: this.options.removeItem,
                parentModel: this.options.parentModel,
                isFirst: !this.items
                    .slice(0, i)
                    .find(itemItem => itemItem.productId === item.productId),
            });
        }

        validate() {
            if (this.validateQuantity()) {
                return true;
            }

            let isInvalid = false;

            this.items.forEach(item => {
                const view = this.getView(item.id);

                if (view.validate()) {
                    isInvalid = true;
                }
            });

            return isInvalid;
        }

        validateQuantity() {
            const map1 = {};
            const map2 = {};
            const idMap = {};

            (this.parentModel.get('itemList') || [])
                .forEach(/** {productId: ?string, quantityReceived: ?float, inventoryNumberType: ?string} */item => {
                    if (!item.productId || !item.inventoryNumberType) {
                        return;
                    }

                    if (map1[item.productId] === undefined) {
                        map1[item.productId] = 0.0;
                    }

                    map1[item.productId] += (item.quantityReceived || 0.0);
                });

            (this.parentModel.get('receivedItemList') || [])
                .forEach(/** {productId: string, quantity: ?float, id: string} */item => {
                    if (map2[item.productId] === undefined) {
                        map2[item.productId] = 0.0;
                    }

                    idMap[item.productId] = item.id;

                    map2[item.productId] += (item.quantity || 0.0);
                });

            for (const productId in map1) {
                const quantity1 = map1[productId];
                const quantity2 = map2[productId] || 0.0;

                if (quantity1 !== quantity2) {
                    const id = idMap[productId];

                    if (id) {
                        this.parentModel.trigger('invalid-received-quantity', id);
                    }

                    console.warn(`Received quantity mismatch for product ${productId}.`);

                    return true;
                }
            }

            return false;
        }
    }
});
