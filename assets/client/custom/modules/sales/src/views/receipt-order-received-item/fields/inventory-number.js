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

define('sales:views/receipt-order-received-item/fields/inventory-number', ['views/fields/link'], function (Dep) {

    return class extends Dep {

        autocompleteOnEmpty = true
        createButton = true

        setup() {
            super.setup();

            this.panelDefs = {
                selectHandler: 'sales:handlers/receipt-order-received-item/select-inventory-number',
                selectLayout: 'listForProduct',
                createHandler: 'sales:handlers/receipt-order-received-item/create-inventory-number',
            };
        }

        getCreateAttributes() {
            /** @type {module:model} */
            const parentModel = this.options.parentModel;

            const orderItem = (parentModel.get('itemList') || [])
                .find(item => item.productId === this.model.get('productId'));

            const attributes = {
                productId: this.model.get('productId'),
                productName: this.model.get('productName'),
            }

            if (orderItem) {
                attributes.type = orderItem.inventoryNumberType;
            }

            return attributes;
        }

        validateRequired() {
            const parentModel = this.options.parentModel;

            const statusList = [
                ...(this.getMetadata().get(`scopes.ReceiptOrder.doneStatusList`) || []),
            ];

            if (!statusList.includes(parentModel.get('status'))) {
                return super.validateRequired();
            }

            if (this.model.get(this.name + 'Id') !== null) {
                return false;
            }

            const msg = this.translate('fieldIsRequired', 'messages')
                .replace('{field}', this.getLabelText());

            this.showValidationMessage(msg);

            return true;
        }
    }
});
