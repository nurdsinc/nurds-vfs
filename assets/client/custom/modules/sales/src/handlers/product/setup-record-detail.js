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

define('sales:handlers/product/setup-record-detail', [], function () {

    class Handler {

        /**
         * @param {module:views/record/detail} view
         */
        constructor(view) {
            this.view = view;
        }

        process() {
            const model = this.view.model;

            if (!this.view.getConfig().get('priceBooksEnabled')) {
                this.view.hidePanel('prices', true);
            }

            if (!this.view.getConfig().get('inventoryTransactionsEnabled')) {
                this.view.hideField('inventoryNumberType', true);
                this.view.hideField('isInventory', true);
                this.view.hidePanel('inventoryAdjustmentItems', true);
            }

            if (
                !this.view.getConfig().get('inventoryTransactionsEnabled') ||
                model.isNew()
            ) {
                this.view.hideField('quantity', true);
                this.view.hideField('quantityReserved', true);
                this.view.hideField('quantitySoftReserved', true);
                this.view.hideField('quantityOnHand', true);
                this.view.hideField('quantityInTransit', true);
                this.view.hideField('quantityOnOrder', true);

                this.view.hidePanel('quantity', true);
            }
            else {
                if (!this.view.getConfig().get('warehousesEnabled')) {
                    this.view.hideField('quantityInTransit', true);
                }
            }

            if (
                !this.view.getConfig().get('inventoryTransactionsEnabled') ||
                !this.view.getConfig().get('warehousesEnabled') ||
                model.isNew() ||
                !this.view.getAcl().checkScope('Warehouse') ||
                this.view.getAcl().getScopeForbiddenFieldList('Product').includes('quantity')
            ) {
                this.view.hidePanel('warehousesQuantity', true);
            }

            const acl = this.view.getAcl();

            if (
                !acl.checkScope('Quote') &&
                !acl.checkScope('SalesOrder') &&
                !acl.checkScope('Invoice') &&
                !acl.checkScope('DeliveryOrder') &&
                !acl.checkScope('PurchaseOrder') &&
                !acl.checkScope('ReceiptOrder') &&
                !acl.checkScope('ReturnOrder') &&
                !acl.checkScope('TransferOrder') &&
                !acl.checkScope('InventoryAdjustment')
            ) {
                this.view.hidePanel('orderItems', true);
            }

            this.controlType();

            this.view.listenTo(model, 'change:type', () => this.controlType());
        }

        controlType() {
            const view = this.view;

            const type = view.model.get('type');

            if (type === 'Template') {
                view.showPanel('variants');
                view.showField('attributes');
                view.showPanel('template');
            } else {
                view.hidePanel('variants');
                view.hideField('attributes');
                view.hidePanel('template');
            }

            if (type === 'Variant') {
                view.showField('template');
                view.showField('variantAttributeOptions');

                const readOnlyFields = [
                    ...(view.getMetadata().get('scopes.Product.variantCoreSyncFieldList') || []),
                    ...(view.getMetadata().get('scopes.Product.variantSyncFieldList') || []),
                ];
                readOnlyFields.forEach(field => view.setFieldReadOnly(field, true));
            } else {
                view.hideField('template');
                view.hideField('variantAttributeOptions');
            }
        }
    }

    return Handler;
});
