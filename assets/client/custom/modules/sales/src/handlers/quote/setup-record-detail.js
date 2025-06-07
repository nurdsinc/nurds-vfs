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

define('sales:handlers/quote/setup-record-detail', [], function () {

    class Handler {

        /**
         * @param {module:views/record/detail} view
         */
        constructor(view) {
            this.view = view;
        }

        process() {
            if (!this.view.getConfig().get('priceBooksEnabled')) {
                this.view.hideField('priceBook', true);
            }

            /*if (!this.view.getConfig().get('deliveryOrdersEnabled')) {
                this.view.hidePanel('deliveryOrders', true);
                this.view.hideField('isDeliveryCreated', true);
            }*/

            /*if (!this.view.getConfig().get('receiptOrdersEnabled')) {
                this.view.hidePanel('receiptOrders', true);
                this.view.hideField('isReceiptFullyCreated', true);
            }*/

            if (!this.view.getConfig().get('warehousesEnabled')) {
                this.view.hideField('warehouse', true);
            }

            const model = this.view.model;

            if (this.view.getConfig().get('warehousesEnabled')) {
                if (
                    model.entityType === 'DeliveryOrder' ||
                    model.entityType === 'ReceiptOrder' ||
                    model.entityType === 'InventoryAdjustment'
                ) {
                    this.view.setFieldRequired('warehouse');

                    if (!model.isNew()) {
                        this.view.setFieldReadOnly('warehouse', true);
                    }
                }
            }

            if (model.entityType === 'TransferOrder') {
                if (!model.isNew()) {
                    this.view.setFieldReadOnly('fromWarehouse', true);
                    this.view.setFieldReadOnly('toWarehouse', true);
                }
            }

            if (this.view.entityType === 'SalesOrder') {
                this.view.listenTo(model, 'after:unrelate:deliveryOrders', () => {
                    model.fetch();
                });
            }

            if (
                this.view.entityType === 'PurchaseOrder' ||
                this.view.entityType === 'ReturnOrder'
            ) {
                this.view.listenTo(model, 'after:unrelate:receiptOrders', () => {
                    model.fetch();
                });

                if (model.isNew()) {
                    this.view.hideField('isReceiptFullyCreated', true);
                }
            }

            if (model.entityType === 'ReceiptOrder') {
                if (!this.view.getConfig().get('inventoryTransactionsEnabled')) {
                    this.view.hideField('receivedItems', true);
                    this.view.hidePanel('receivedItems', true);
                }
            }

            let wasLocked = false;
            const lockedMap = {};

            const lockableFields = /** @type {string[]} */
                this.view.getMetadata().get(`scopes.${model.entityType}.lockableFieldList`) || [];

            const controlLocked = () => {
                const isLocked = model.attributes.isLocked;

                if (!isLocked && !wasLocked) {
                    return;
                }

                if (isLocked) {
                    wasLocked = true;
                }

                lockableFields
                    .filter(field => !['itemList', 'status'].includes(field))
                    .forEach(field => {
                        if (isLocked) {
                            if (
                                this.view.recordHelper &&
                                this.view.recordHelper.getFieldStateParam(field, 'readOnly')
                            ) {
                                return;
                            }

                            lockedMap[field] = true;

                            this.view.setFieldReadOnly(field);

                            return;
                        }

                        if (!lockedMap[field]) {
                            return;
                        }

                        delete lockedMap[field];

                        this.view.setFieldNotReadOnly(field);
                    });
            }

            controlLocked();
            this.view.listenTo(model, 'change:isLocked', () => controlLocked());
        }
    }

    return Handler;
});
