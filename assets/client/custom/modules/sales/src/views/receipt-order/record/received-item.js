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

define('sales:views/receipt-order/record/received-item', ['view', 'model'],
function (Dep, Model) {

    return class extends Dep {

        // language=Handlebars
        templateContent = `
            {{#if isEdit}}
            <th style="width: 54px">
                {{#if isFirst}}
                    <button
                        class="btn btn-link"
                        data-action="addItem"
                        title="{{translate 'Add'}}"
                    ><span class="fas fa-plus"></span></button>
                {{/if}}
            </th>
            {{/if}}
            <td style="overflow: visible;">
                <div class="field{{#if isEdit}} detail-field-container{{/if}}" data-name="product">{{{productField}}}</div>
            </td>
            <td style="overflow: visible;">
                <div class="field" data-name="inventoryNumber">{{{inventoryNumberField}}}</div>
            </td>
            <td style="overflow: visible;">
                <div class="field" data-name="quantity">{{{quantityField}}}</div>
            </td>
            {{#if isEdit}}
            <td>
                {{#unless isFirst}}
                    <button
                        class="btn btn-link"
                        data-action="removeItem"
                        title="{{translate 'Remove'}}"
                    ><span class="fas fa-times"></span></button>
                {{/unless}}
            </td>
            {{/if}}
        `

        data() {
            return {
                isEdit: this.mode === 'edit',
                isFirst: this.isFirst,
            }
        }

        setup() {
            /** @type {module:modules/sales/views/receipt-order/fields/received-item-list~item} */
            this.item = this.options.item;
            /** @type {number} */
            this.index = this.options.index;
            /** @type {'detail'|'edit'} */
            this.mode = this.options.mode;
            /** @type {module:modules/sales/views/receipt-order/fields/received-item-list~updateItem} */
            this.updateItem = this.options.updateItem;
            /** @type {module:modules/sales/views/receipt-order/fields/received-item-list~addItem} */
            this.addItem = this.options.addItem;
            /** @type {module:modules/sales/views/receipt-order/fields/received-item-list~removeItem} */
            this.removeItem = this.options.removeItem;
            /** @type {bool} */
            this.isFirst = this.options.isFirst;
            this.parentModel = this.options.parentModel;

            this.addHandler('click', '[data-action="addItem"]', () => {
                this.addItem(this.item.productId);
            });

            this.addHandler('click', '[data-action="removeItem"]', () => {
                this.removeItem(this.item.id);
            });

            /** @type {module:model} */
            this.model = new Model();
            this.model.setDefs({
                fields: {
                    product: {
                        type: 'link',
                        entity: 'Product',
                        readOnly: true,
                    },
                    inventoryNumber: {
                        type: 'link',
                        entity: 'InventoryNumber',
                        required: true,
                    },
                    quantity: {
                        type: 'float',
                        min: 0.0,
                        required: true,
                    },
                }
            });

            this.model.parentModel = this.parentModel;

            this.model.set(
                Espo.Utils.cloneDeep(this.item)
            );

            // @todo Open link in new tab.
            this.createView('productField', 'views/fields/link', {
                name: 'product',
                model: this.model,
                selector: '.field[data-name="product"]',
            });

            this.createView('inventoryNumberField', 'sales:views/receipt-order-received-item/fields/inventory-number', {
                name: 'inventoryNumber',
                model: this.model,
                selector: '.field[data-name="inventoryNumber"]',
                mode: this.mode,
                parentModel: this.options.parentModel,
                labelText: this.translate('inventoryNumber', 'fields', 'DeliveryOrderItem'),
            });

            this.createView('quantityField', 'views/fields/float', {
                name: 'quantity',
                model: this.model,
                selector: '.field[data-name="quantity"]',
                mode: this.mode,
                labelText: this.translate('quantityReceived', 'fields', 'ReceiptOrderItem'),
            });

            this.listenTo(this.model, 'change', (m, o) => {
                if (!o.ui) {
                    return;
                }

                const item = {...this.item};

                item.quantity = this.model.get('quantity');
                item.inventoryNumberId = this.model.get('inventoryNumberId');
                item.inventoryNumberName = this.model.get('inventoryNumberName');

                this.updateItem(item.id, item);
            });

            this.fieldList = [
                'inventoryNumber',
                'quantity',
            ];

            this.listenTo(this.parentModel, 'invalid-received-quantity', id => {
                if (id !== this.model.id) {
                    return;
                }

                const msg = this.translate('receivedQuantityMismatch', 'messages', 'ReceiptOrder');

                this.getView('quantityField').showValidationMessage(msg);
            })
        }

        validate() {
            let isInvalid = false;

            this.fieldList.forEach(field => {
                const view = this.getView(field + 'Field');

                if (view.validate()) {
                    isInvalid = true;
                }

                view.validate();
            });

            return isInvalid;
        }
    }
});
