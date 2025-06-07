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

define('sales:views/quote/record/item', ['views/base'], function (Dep) {

    return Dep.extend({

        template: 'sales:quote/record/item',

        data: function () {
            const hideTaxRate = this.options.noTax && this.mode === 'detail';
            const hideInventoryNumber = this.options.noInventoryNumber &&
                (this.mode === 'detail' || !this.inventoryTransactionsEnabled);

            let listLayout = this.listLayout.filter(item => {
                if (item.name === 'taxRate' && hideTaxRate) {
                    return false;
                }

                if (item.name === 'inventoryNumber' && hideInventoryNumber) {
                    return false;
                }

                return true;
            });

            listLayout = Espo.Utils.cloneDeep(listLayout);

            listLayout.forEach(item => {
                if (~this.readOnlyFieldList.indexOf(item.name)) {
                    item.isReadOnly = true;
                }
            });

            return {
                id: this.model.id,
                mode: this.mode,
                hideTaxRate: hideTaxRate,
                showRowActions: this.options.showRowActions,
                listLayout: listLayout,
                hasDescription: this.hasDescription,
            };
        },

        setup: function () {
            this.events['click [data-action="selectProduct"]'] = this.actionSelectProduct;

            this.mode = this.options.mode;
            this.parentModel = this.options.parentModel;
            this.calculationHandler = this.options.calculationHandler;

            this.priceBooksEnabled = this.getConfig().get('priceBooksEnabled') || false;
            this.inventoryTransactionsEnabled = this.getConfig().get('inventoryTransactionsEnabled') || false;

            this.hasDescription = this.mode === 'detail' || !this.isAdjustment() && !this.isTransfer();

            this.hasInventoryNumberTypeField = !!this.getMetadata()
                .get(['entityDefs', this.model.entityType, 'fields', 'inventoryNumberType']);

            this.copyFieldList = this.getMetadata()
                .get(['entityDefs', this.model.entityType, 'fields', 'product', 'copyFieldList']) || [];

            if (this.options.showRowActions) {
                this.createView('rowActions', 'views/record/row-actions/view-and-edit', {
                    model: this.model,
                    acl: {
                        edit: this.options.aclEdit,
                        read: true,
                    }
                });
            }

            this.listLayout = this.options.listLayout;

            this.fieldList = [];
            this.readOnlyFieldList = [];

            this.fieldViewNameMap = {
                name: 'sales:views/quote-item/fields/name',
            };

            this.listLayout.forEach(item => {
                const name = item.name;
                const options = {};

                if (this.mode === 'detail') {
                    if (item.link) {
                        options.mode = 'listLink';
                    }
                }

                if (!this.inventoryTransactionsEnabled && name === 'inventoryNumber') {
                    options.mode = 'list';
                }

                if (name === 'taxRate') {
                    if (this.mode === 'detail') {
                        if (this.options.noTax) {
                            return;
                        }

                        options.mode = 'list';
                    }
                }

                const type = this.model.getFieldType(name) || 'base';

                let customView = null;

                if (type === 'currency') {
                    customView = 'sales:views/quote-item/fields/currency-amount-only';
                    options.hideCurrency = true;
                }

                if (
                    this.model.getFieldParam(name, 'readOnly') &&
                    !this.model.getFieldParam(name, 'itemNotReadOnly')
                ) {
                    this.readOnlyFieldList.push(name);

                    options.mode = 'detail';
                }

                let view = item.view ||
                    this.fieldViewNameMap[item.name] ||
                    customView ||
                    this.model.getFieldParam(name, 'view');

                if (!view) {
                    view = this.getFieldManager().getViewName(type);
                }

                this.createField(name, view, options);
            });

            const mode = this.mode === 'edit' ? 'edit' : 'list';

            if (this.hasDescription) {
                this.createField('description', 'views/fields/text', {mode: mode}, {rowsMin: 1});
            }

            this.on('ready', () => {
                const listPriceView = this.getFieldView('listPrice');

                if (listPriceView) {
                    this.listenTo(listPriceView, 'change', () => {
                        if (!this.model.get('unitPrice') && this.model.get('unitPrice') !== 0) {
                            this.model.set('unitPrice', this.model.get('listPrice'));
                        }
                    });
                }

                this.calculationHandler.listenedItemFieldList.forEach(field => {
                    const view = this.getFieldView(field);

                    if (!view) {
                        return;
                    }

                    this.listenTo(view, 'change', () => {
                        this.calculateAmount(field);
                    });
                });

                const quantityView = this.getFieldView('quantity');

                if (/*this.toFetchPrices() && */quantityView && quantityView.addHandler) {
                    quantityView.addHandler('input', 'input', () => {
                        this.parentModel.trigger('block-action-items');
                    });

                    quantityView.addHandler('blur', 'input', () => {
                        this.parentModel.trigger('unblock-action-items');
                    });
                }

                if (
                    this.inventoryTransactionsEnabled &&
                    this.getFieldView('inventoryNumber')
                ) {
                    this.controlInventoryNumber();
                    this.listenTo(this.model, 'change:inventoryNumberType', () => this.controlInventoryNumber());

                    this.listenTo(this.model, 'change:productId', (m, v, o) => {
                        setTimeout(() => {
                            this.model.set({
                                inventoryNumberId: null,
                                inventoryNumberName: null,
                            });
                        }, 1);
                    });
                }
            });

            this.listenTo(this.model, 'change:quantity', (m, v, o) => {
                if (!o.ui) {
                    return;
                }

                if (!this.toFetchPrices() && this.model.get('productType') !== 'Variant') {
                    return;
                }

                if (!this.model.get('productId')) {
                    return;
                }

                if (v < 0) {
                    return;
                }

                this.fetchPriceForQuantity();
            });
        },

        controlInventoryNumber: function () {
            const inventoryNumberType = this.model.get('inventoryNumberType');

            const fieldView = this.getFieldView('inventoryNumber');

            if (!inventoryNumberType) {
                fieldView.setMode('list').then(() => {
                    fieldView.reRender();
                });

                return;
            }

            fieldView.setMode(this.mode).then(() => {
                fieldView.reRender();
            });
        },

        getFieldView: function (name) {
            return this.getView(name + 'Field');
        },

        createField: function (name, view, options, params) {
            const o = {
                model: this.model,
                defs: {
                    name: name,
                    params: params || {}
                },
                mode: this.mode,
                el: this.options.el + ' .field[data-name="item-' + name + '"]',
                inlineEditDisabled: true,
                readOnlyDisabled: true,
                calculationHandler: this.options.calculationHandler,
                parentModel: this.parentModel,
            };

            if (options) {
                for (const i in options) {
                    o[i] = options[i];
                }
            }

            this.createView(name + 'Field', view, o, view => {
                this.listenTo(view, 'change', () => {
                    setTimeout(() => {
                        this.trigger('change');
                    }, 50);
                });
            });

            this.fieldList.push(name);
        },

        calculateAmount: function (field) {
            const currency = this.parentModel.get('amountCurrency');

            this.calculationHandler.boundCurrencyItemFieldList.forEach(item => {
                this.model.set(item + 'Currency', currency);
            });

            this.calculationHandler.calculateItem(this.model, field);
        },

        fetch: function () {
            this.fieldList.forEach(field => {
                const view = this.getFieldView(field);

                if (!view || !view.isRendered() || !view.isEditMode()) {
                    return;
                }

                const attributes = view.fetch();

                this.model.set(attributes, {silent: true});
            });

            const data = {
                id: this.model.id,
                quantity: this.model.get('quantity'),
                productId: this.model.get('productId') || null,
                productName: this.model.get('productName') || null,
                name: this.model.get('name'),
            };

            if (this.hasDescription) {
                data.description = this.model.get('description');
            }

            if (this.model.hasField('amount')) {
                data.amount = this.model.get('amount');
                data.amountCurrency = this.model.get('amountCurrency');
            }

            for (const attribute in this.model.attributes) {
                if (attribute in data) {
                    continue;
                }

                data[attribute] = this.model.attributes[attribute];
            }

            if ('taxRate' in data && data.taxRate === null) {
                data.taxRate = 0;
            }

            return data;
        },

        isPurchase: function () {
            return this.model.entityType === 'PurchaseOrderItem';
        },

        actionSelectProduct: function () {
            const viewName = this.getMetadata().get('clientDefs.Product.modalViews.select') ||
                'views/modals/select-records-with-categories';

            const primaryFilterName = !this.isPurchase() ? 'available' : null;

            const layoutName = this.inventoryTransactionsEnabled ?
                'listForAddInventory' :
                'listForAdd';

            Espo.Ui.notify(' ... ');

            const selectAttributeList = this.calculationHandler.getSelectProductAttributeList(this.parentModel);

            this.createView('dialog', viewName, {
                scope: 'Product',
                createButton: false,
                primaryFilterName: primaryFilterName,
                filters: this.getProductsFilters(),
                mandatorySelectAttributeList: selectAttributeList,
                layoutName: layoutName,
            }, view => {
                view.render();

                Espo.Ui.notify(false);

                this.listenToOnce(view, 'select', model => {
                    const where = view.collection.where;

                    view.close();

                    if (model.get('type') !== 'Template') {
                        this.selectProduct(model);

                        return;
                    }

                    this.createView('dialogVariant', 'sales:views/product/modals/select-variant', {
                        model: model,
                        where: where,
                        mandatorySelectAttributeList: selectAttributeList,
                    }).then(view => {
                        view.render();

                        Espo.Ui.notify(false);

                        this.listenToOnce(view, 'select', model => {
                            this.selectProduct(model);
                        });
                    });
                });
            });
        },

        isDelivery: function () {
            return this.parentModel.entityType === 'DeliveryOrder';
        },

        isReceipt: function () {
            return this.parentModel.entityType === 'ReceiptOrder';
        },

        isTransfer: function () {
            return this.parentModel.entityType === 'TransferOrder';
        },

        isAdjustment: function () {
            return this.parentModel.entityType === 'InventoryAdjustment';
        },

        toFetchPrices: function () {
            if (
                !this.isPurchase() &&
                !this.isDelivery() &&
                !this.isReceipt() &&
                !this.isAdjustment() &&
                !this.isTransfer() &&
                this.priceBooksEnabled &&
                (
                    this.parentModel.get('priceBookId') ||
                    this.getConfig().get('defaultPriceBookId')
                )
            ) {
                return true;
            }

            if (this.isPurchase() && this.parentModel.get('supplierId')) {
                return true;
            }

            return false;
        },

        /**
         * @param {module:model} product
         */
        selectProduct: function (product) {
            // @todo Move to helper class.

            this.copyFieldList.forEach(field => {
                const attributes = {};

                this.getFieldManager()
                    .getEntityTypeFieldAttributeList('Product', field)
                    .forEach(attribute => {
                        attributes[attribute] = product.get(attribute);
                    });

                this.model.set(attributes);
            });

            this.model.set('allowFractionalQuantity', product.get('allowFractionalQuantity'));
            this.model.set('productType', product.get('type'));

            if (this.hasInventoryNumberTypeField) {
                this.model.set('isInventory', product.get('isInventory'));
                this.model.set('inventoryNumberType', product.get('inventoryNumberType'));
            }

            const prepare = () => {
                if (!this.toFetchPrices() && product.get('type') !== 'Variant') {
                    return Promise.resolve();
                }

                return new Promise(resolve => {
                    const url = this.isPurchase() ?
                        'ProductPrice/getPurchasePrice' :
                        'ProductPrice/getSalesPrice';

                    Espo.Ajax.postRequest(url, {
                        priceBookId: this.parentModel.get('priceBookId'),
                        supplierId: this.parentModel.get('supplierId'),
                        accountId: this.parentModel.get('accountId'),
                        orderId: this.parentModel.id,
                        orderType: this.parentModel.entityType,
                        items: [{
                            productId: product.id,
                            quantity: 1.0,
                        }],
                        currency: this.parentModel.get('amountCurrency'),
                    }).then(([resultItem]) => {
                        if (this.isPurchase()) {
                            product.set({
                                costPrice: resultItem.unitPrice,
                                costPriceCurrency: resultItem.unitPriceCurrency,
                            });

                            resolve();

                            return;
                        }

                        product.set({
                            unitPrice: resultItem.unitPrice,
                            unitPriceCurrency: resultItem.unitPriceCurrency,
                            listPrice: resultItem.listPrice,
                            listPriceCurrency: resultItem.listPriceCurrency,
                        });

                        resolve();
                    });
                });
            };

            Espo.Ui.notify(' ... ');

            prepare().then(() => {
                this.options.calculationHandler.selectProduct(this.model, product);

                Espo.Ui.notify(false);

                this.model.trigger('after-product-select');
            });
        },

        fetchPriceForQuantity: function () {
            const quantity = this.model.get('quantity') !== null ?
                this.model.get('quantity') : null;

            const url = this.isPurchase() ?
                'ProductPrice/getPurchasePrice' :
                'ProductPrice/getSalesPrice';

            this.parentModel.trigger('block-action-items');

            Espo.Ui.notify(' ... ');

            Espo.Ajax.postRequest(url, {
                priceBookId: this.parentModel.get('priceBookId'),
                supplierId: this.parentModel.get('supplierId'),
                accountId: this.parentModel.get('accountId'),
                orderId: this.parentModel.id,
                orderType: this.parentModel.entityType,
                items: [{
                    productId: this.model.get('productId'),
                    quantity: quantity,
                }],
                currency: this.parentModel.get('amountCurrency'),
            }).then(([resultItem]) => {
                Espo.Ui.notify(false);

                this.parentModel.trigger('unblock-action-items');

                const currentUnitPrice = this.model.get('unitPrice') || 0.0;

                if (
                    resultItem.unitPrice === null ||
                    resultItem.unitPrice === currentUnitPrice
                ) {
                    return;
                }

                let message = this.translate('applyNewPriceConfirmation', 'messages', 'Quote');

                if (this.getHelper().numberUtil) {
                    message += '\n\n' +
                        this.getHelper().numberUtil.formatFloat(currentUnitPrice, 2) +
                        ' → ' +
                        this.getHelper().numberUtil.formatFloat(resultItem.unitPrice, 2);
                }

                this.confirm({
                    message: message,
                    confirmText: this.translate('Apply'),
                    cancelText: this.translate('Cancel'),
                    backdrop: 'static',
                }).then(() => {
                    this.model.set({unitPrice: resultItem.unitPrice}, {highlight: true});

                    this.calculateAmount('unitPrice');

                    this.trigger('change');
                });
            }).catch(() => {
                this.parentModel.trigger('block-action-items');
            });
        },

        getProductsFilters: function () {
            const parentModel = this.parentModel;

            if (!parentModel) {
                return null;
            }

            if (parentModel.entityType === 'TransferOrder') {
                const fromWarehouseId = parentModel.get('fromWarehouseId');
                const fromWarehouseName = parentModel.get('fromWarehouseName');

                if (!fromWarehouseId) {
                    return null;
                }

                const nameHash = {};
                nameHash[fromWarehouseId] = fromWarehouseName;

                return {
                    warehousesOnHand: {
                        type: 'arrayAnyOf',
                        attribute: 'warehousesOnHandIds',
                        value: [fromWarehouseId],
                        data: {
                            type: 'anyOf',
                            nameHash: nameHash,
                        },
                    },
                };
            }

            if (!this.isPurchase()) {
                return null;
            }

            if (!parentModel.hasField('supplier')) {
                return null;
            }

            const supplierId = parentModel.get('supplierId');

            if (!supplierId) {
                return null;
            }

            const nameHash = {};
            nameHash[supplierId] = parentModel.get('supplierName');

            return {
                suppliers: {
                    attribute: 'id',
                    type: 'supplierLinkedWith',
                    value: [supplierId],
                    data: {
                        type: 'anyOf',
                        nameHash: nameHash,
                    },
                }
            };
        },

        validate: function () {
            let isInvalid = false;

            this.fieldList.forEach(field => {
                const view = this.getFieldView(field);

                if (!view) {
                    return;
                }

                if (!view.isEditMode()) {
                    return;
                }

                if (view.validate()) {
                    isInvalid = true;
                }
            });

            return isInvalid;
        },
    });
});
