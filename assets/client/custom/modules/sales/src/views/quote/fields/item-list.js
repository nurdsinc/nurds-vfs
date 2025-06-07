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

define('sales:views/quote/fields/item-list', ['views/fields/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        detailTemplate: 'sales:quote/fields/item-list/detail',
        listTemplate: 'sales:quote/fields/item-list/detail',
        editTemplate: 'sales:quote/fields/item-list/edit',

        readOnlyTotalFieldList: ['amount'],
        handlerClass: 'sales:quote-calculation-handler',
        itemListView: 'sales:views/quote/record/item-list',

        validations: ['valid'],

        customItemView: null,

        events: {
            'click [data-action="removeItem"]': function (e) {
                const id = $(e.currentTarget).attr('data-id');

                this.removeItem(id);
            },
            'click [data-action="addItem"]': function () {
                this.addItem();
            },
            'keydown': function (e) {
                if (!Espo.Utils.getKeyFromKeyEvent) {
                    return;
                }

                if (this.mode !== this.MODE_EDIT) {
                    return;
                }

                if (this._preventShortcutSave) {
                    return;
                }

                const key = Espo.Utils.getKeyFromKeyEvent(e);

                const keyList = [
                    'Control+Enter',
                    'Control+Alt+Enter',
                    'Control+KeyS',
                ];

                if (!keyList.includes(key)) {
                    return;
                }

                e.stopPropagation();
                e.preventDefault();

                let $target = $(e.target);

                /** @type {?string} */
                let fieldName = $target.closest('.field').attr('data-name') || null;

                // Invoke fetching.
                $target.trigger('change');

                if (fieldName && fieldName.startsWith('total-')) {
                    fieldName = fieldName.substring(6);

                    setTimeout(() => {
                        const view = this.getView(fieldName + 'Field');

                        if (!view) {
                            return;
                        }

                        const name = $target.attr('data-name');

                        $target = view.$el.find(`[data-name="${name}"]`);

                        view.$el.find(`[data-name="${name}"]`).focus();
                    }, 10)
                }

                this._preventShortcutSave = true;
                setTimeout(() => this._preventShortcutSave = false, 100);

                setTimeout(() => {
                    // Native event not captured by browsers.
                    const newEvent = jQuery.Event('keydown', {
                        code: e.code,
                        shiftKey: e.shiftKey,
                        altKey: e.altKey,
                        metaKey: e.metaKey,
                        ctrlKey: e.ctrlKey,
                        keyCode: e.keyCode,
                        which: e.which,
                        location: e.location,
                        repeat: e.repeat,
                        isComposing: e.isComposing,
                        charCode: e.charCode,
                    });

                    $target.trigger(newEvent);
                }, 50);
            },
            'click [data-action="addProducts"]': function () {
                this.actionAddProducts();
            },
            'click [data-action="applyPriceBook"]': function () {
                this.actionApplyPriceBook();
            },
        },

        data: function () {
            const totalLayout = Espo.Utils.cloneDeep(this.totalLayout);

            totalLayout.forEach((item, i) => {
                item.key = item.name + 'Field';
                item.isFirst = i === 0;
            });

            const itemList = (this.model.get('itemList') || []);

            const showAddProducts = this.productHasAccess && !this.isAdjustment();

            const showApplyPriceBook =
                this.priceBooksEnabled &&
                this.priceBookHasAccess &&
                !this.isPurchase() &&
                !this.isDelivery() &&
                !this.isReceipt() &&
                !this.isAdjustment() &&
                !this.isTransfer() &&
                itemList.length > 0;

            const hasCurrency = !!this.getFieldView('currency');
            const showFields = itemList.length > 0;

            return {
                isLoading: !this.model.isNew() && !this.model.has('itemList'),
                showFields: showFields,
                isEmpty: itemList.length === 0,
                mode: this.mode,
                scope: this.model.entityType,
                showAddProducts: showAddProducts,
                showApplyPriceBook: showApplyPriceBook,
                hasMenu: showAddProducts || showApplyPriceBook,
                hasCurrency: hasCurrency,
                totalLayout: totalLayout,
                hasTotals: (totalLayout.length || hasCurrency),
            };
        },

        getAttributeList: function () {
            const list = ['itemList'];

            if (this.model.hasField('inventoryData')) {
                list.push('inventoryData');
            }

            return list;
        },

        setMode: function (mode) {
            Dep.prototype.setMode.call(this, mode);

            if (this.isRendered()) {
                if (this.getFieldView('currency')) {
                    this.getFieldView('currency').setMode(mode);
                }

                this.totalLayout.forEach(item => {
                    const field = item.name;
                    const fieldView = this.getFieldView(field);

                    if (!fieldView) {
                        return;
                    }

                    if (field === 'amount') {
                        return;
                    }

                    if (fieldView.readOnlyLocked || this.model.getFieldParam(field, 'readOnly')) {
                        return;
                    }

                    fieldView.setMode(mode);
                });
            }

            return Promise.resolve();
        },

        generateId: function () {
            return Math.random().toString(36).slice(2, 12);
        },

        loadItemListLayout() {
            return new Promise(resolve => {
                this.getHelper().layoutManager
                    .get(this.model.entityType + 'Item', 'listItem', /** {name: string}[] */itemListLayout => {
                        this.hasListPrice = !!itemListLayout.find(item => item.name === 'listPrice');

                        resolve();
                    });
            });
        },

        loadTotalLayout() {
            return new Promise(resolve => {
                this.getHelper().layoutManager.get(this.model.entityType, 'detailBottomTotal', totalLayout => {
                    this.totalLayout = totalLayout;

                    resolve();
                });
            });
        },

        loadCalculationHandler: function () {
            const calculationHandlerClass =
                this.getMetadata().get(['clientDefs', this.model.entityType, 'calculationHandler']) ||
                this.handlerClass;

            return new Promise(resolve => {
                Espo.loader.require(calculationHandlerClass, CalculationHandler => {
                    this.calculationHandler = new CalculationHandler(
                        this.getConfig(),
                        this.getHelper().fieldManager,
                        this.getHelper().metadata,
                        this.hasListPrice
                    );

                    resolve();
                });
            });
        },

        setup: function () {
            const itemList = this.model.get('itemList') || [];
            this.lastNumber = itemList.length;

            this.currencyList = this.getConfig().get('currencyList') || [];

            this.productHasAccess = this.getAcl().checkScope('Product');
            this.priceBookHasAccess = this.getAcl().checkScope('PriceBook');
            this.priceBooksEnabled = this.getConfig().get('priceBooksEnabled') || false;
            this.inventoryTransactionsEnabled = this.getConfig().get('inventoryTransactionsEnabled') || false;
            this.hasAmountCurrency = !(this.isReceipt() || this.isAdjustment());

            this.copyFieldList = this.getMetadata()
                .get(['entityDefs', this.model.entityType + 'Item', 'fields', 'product', 'copyFieldList']) || [];

            this.itemListView =
                this.getMetadata().get(['clientDefs', this.model.entityType, 'recordViews', 'itemList']) ||
                this.itemListView;

            this.hasInventoryNumberTypeField = !!this.getMetadata()
                .get(['entityDefs', this.model.entityType + 'Item', 'fields', 'inventoryNumberType']);

            this.wait(true);

            Promise.all([this.loadItemListLayout(), this.loadTotalLayout()])
                .then(() => this.loadCalculationHandler())
                .then(() => {
                    this.setupCurrencyModel();
                    this.setupChangeHandlers();
                    this.createTotalFieldViews();
                    this.setupCurrencyFieldView();

                    this.wait(false);
                });

            this.on('invalid', () => {
                if (!this.element) {
                    return;
                }

                this.element.parentNode.classList.remove('has-error');
            });

            this.on('mode-changed', () => {
                // Prevents issue that validation popover not destroyed,
                // as their target elements are removed from DOM.
                this.clearView('itemList');
            });

            this.listenTo(this.model, 'block-action-items', () => {
                this.$el.parent().find('.inline-save-link').css('pointer-events', 'none');
                this.$el.parent().find('.inline-cancel-link').css('pointer-events', 'none');
            });

            this.listenTo(this.model, 'unblock-action-items', () => {
                this.$el.parent().find('.inline-save-link').css('pointer-events', '');
                this.$el.parent().find('.inline-cancel-link').css('pointer-events', '');
            });
        },

        setupCurrencyModel: function () {
            this.currencyModel = new Model();

            const currency = this.model.get('amountCurrency') ||
                this.model.get('shippingCostCurrency') ||
                this.getPreferences().get('defaultCurrency') ||
                this.getConfig().get('defaultCurrency');

            this.currencyModel.set('currency', currency);
        },

        /** @private */
        onChangeAmountCurrency: function () {
            const currency = this.model.get('amountCurrency');
            const itemList = Espo.Utils.cloneDeep(this.model.get('itemList') || []);

            const boundFieldList = this.calculationHandler.boundCurrencyItemFieldList;

            boundFieldList.forEach(field => {
                itemList.forEach(item => {
                    item[field + 'Currency'] = currency;
                });
            });

            boundFieldList.forEach(field => {
                this.model.set(field + 'Currency', currency);
            });

            this.model.set('itemList', itemList, {ui: true});

            this.reRenderNoFlicker();
        },

        setupChangeHandlers: function () {
            this.listenTo(this.model, 'change:amountCurrency', (model, v, o) => {
                if (o.ui) {
                    this.onChangeAmountCurrency();

                    return;
                }

                if (o.auxCurrency) {
                    setTimeout(() => this.onChangeAmountCurrency(), 1);
                }
            });

            this.listenTo(this.model, 'change:taxRate', (model, v, o) => {
                if (!o.ui) {
                    return;
                }

                const taxRate = this.model.get('taxRate') || 0;
                const itemList = Espo.Utils.cloneDeep(this.model.get('itemList') || []);

                itemList.forEach(item => {
                    item.taxRate = taxRate;
                });

                this.model.set('itemList', itemList);
            });

            this.calculationHandler.listenedAttributeList.forEach(attribute => {
                this.listenTo(this.model, 'change:' + attribute, (model, v, o) => {
                    if (!o.ui) {
                        return;
                    }

                    this.calculateAmount();
                });
            });

            this.listenTo(this.model, 'change:amountCurrency', () => {
                this.currencyModel.set('currency', this.model.get('amountCurrency'), {preventLoop: true});
            });

            this.listenTo(this.currencyModel, 'change:currency', (model, v, o) => {
                if (o && o.preventLoop) {
                    return;
                }

                this.model.set('amountCurrency', model.get('currency'), {auxCurrency: true});
            });
        },

        createTotalFieldViews: function () {
            this.fieldList = [];

            this.totalLayout.forEach(item => {
                const name = item.name;
                const options = {};
                const type = this.model.getFieldType(name) || 'base';

                if (
                    this.model.getFieldParam(name, 'readOnly') ||
                    ~this.readOnlyTotalFieldList.indexOf(name)
                ) {
                    options.mode = 'detail';
                }

                if (~this.getAcl().getScopeForbiddenFieldList(this.model.entityType, 'edit').indexOf(name)) {
                    options.mode = 'detail';
                    options.readOnlyLocked = true;
                }

                let customView = null;

                if (type === 'currency') {
                    customView = 'sales:views/quote/fields/currency-amount-only';
                }

                let view = item.view || customView || this.model.getFieldParam(name, 'view');

                if (!view) {
                    view = this.getFieldManager().getViewName(type);
                }

                this.createField(name, view, options);
            });
        },

        setupCurrencyFieldView: function () {
            if (!this.hasAmountCurrency) {
                return;
            }

            if (this.currencyList.length <= 1) {
                return;
            }

            this.createView('currencyField', 'views/fields/enum', {
                el: this.options.el + ' .field[data-name="total-currency"]',
                model: this.currencyModel,
                mode: this.mode,
                inlineEditDisabled: true,
                defs: {
                    name: 'currency',
                    params: {
                        options: this.currencyList,
                    },
                },
            });
        },

        createField: function (name, view, options, params) {
            const o = {
                model: this.model,
                defs: {
                    name: name,
                    params: params || {},
                },
                mode: this.mode,
                el: this.options.el + ' .field[data-name="total-' + name + '"]',
                inlineEditDisabled: true,
            };

            if (options) {
                for (const i in options) {
                    o[i] = options[i];
                }
            }

            this.createView(name + 'Field', view, o);

            this.fieldList.push(name);
        },

        handleCurrencyField: function () {
            const recordView = this.getParentView().getParentView().getParentView();

            const itemList = this.model.get('itemList') || [];

            if (itemList.length) {
                this.showAdditionalFields();

                if (recordView.setFieldReadOnly) {
                    recordView.setFieldReadOnly('amount');
                }
            } else {
                if (recordView.setFieldNotReadOnly) {
                    recordView.setFieldNotReadOnly('amount');
                }

                this.hideAdditionalFields();
            }
        },

        showAdditionalFields: function () {
            this.$el.find('.currency-row').removeClass('hidden');
            this.$el.find('.totals-row').removeClass('hidden');
        },

        hideAdditionalFields: function () {
            this.$el.find('.currency-row').addClass('hidden');
            this.$el.find('.totals-row').addClass('hidden');
        },

        afterRender: function () {
            // @todo
            this.$container = this.$el.find('.container');

            this.handleCurrencyField();

            if (this.model.isNew()) {
                const itemList = this.model.get('itemList') || [];

                itemList.forEach(item => {
                    if (!item.id) {
                        item.id = 'cid' + this.generateId();
                    }
                });

                if (itemList.length) {
                    this.calculateAmount();
                }
            }

            this.createView('itemList', this.itemListView, {
                el: this.options.el + ' .item-list-container',
                model: this.model,
                mode: this.mode,
                calculationHandler: this.calculationHandler,
                notToRender: true,
                itemView: this.customItemView,
            }, view => {
                setTimeout(() => {
                    view.render()
                        .then(() => {
                            if (this.mode !== this.MODE_EDIT) {
                                return;
                            }

                            this.$el.find('.item-list-internal-container').sortable({
                                handle: '.drag-icon',
                                axis: 'y',
                                stop: () => {
                                    const idList = [];

                                    this.$el.find('.item-list-internal-container')
                                        .children()
                                            .each((i, el) => {
                                            idList.push($(el).attr('data-id'));
                                        });

                                    this.reOrder(idList);
                                },
                                start: (e, ui) => {
                                    ui.placeholder.height(ui.helper.outerHeight());
                                },
                            });
                        })
                }, 0);

                this.listenTo(view, 'change', () => {
                    this.trigger('change');
                    this.calculateAmount();
                });
            });
        },

        getFieldView: function (name) {
            return this.getView(name + 'Field');
        },

        fetchItemList: function () {
            const view = this.getItemListView();

            if (!view) {
                return undefined;
            }

            return (view.fetch() || {}).itemList || [];
        },

        getItemListView: function () {
            return this.getView('itemList');
        },

        fetch: function () {
            const data = {};

            if (this.hasAmountCurrency) {
                data.amountCurrency = this.getFieldView('currency') ?
                    this.getFieldView('currency').fetch().currency :
                    this.currencyModel.get('currency');
            }

            data.itemList = this.fetchItemList();

            if (data.itemList === undefined) {
                return {};
            }

            return data;
        },

        getEmptyItem: function () {
            let currency = this.model.get('amountCurrency');

            if (!currency && this.getFieldView('currency')) {
                currency = this.getFieldView('currency').fetch().currency;
            }

            if (!currency) {
                currency = this.getConfig().get('defaultCurrency');
            }

            let quantity = 1;

            if (this.model.entityType === 'InventoryAdjustment') {
                quantity = null;
            }

            const id = 'cid' + this.generateId();

            const item = {
                id: id,
                quantity: quantity,
                amount: null,
                amountCurrency: currency,
                unitPriceCurrency: currency,
                listPriceCurrency: currency,
                isTaxable: true,
                taxRate: this.model.get('taxRate') || 0,
                description: null,
                name: null,
            };

            if (this.isAdjustment()) {
                item.quantity = null;
                item.newQuantityOnHand = null;
                delete item.isTaxable;
                delete item.amount;
                delete item.taxRate;
            }

            return item;
        },

        /**
         * @return {Promise}
         */
        reRenderNoFlicker: function () {
            const height = this.$el.height();
            const listHeight = this.$el.find('.item-list-container').height();

            this.$el.css({minHeight: height + 'px'});

            return this.reRender().then(() => {
                const $list = this.$el.find('.item-list-container');

                $list.css({minHeight: listHeight + 'px'});

                setTimeout(() => {
                    this.$el.css({minHeight: ''});

                    $list.css({minHeight: ''});
                }, 50);
            });
        },

        toFetchPrices: function () {
            if (
                this.isDelivery() ||
                this.isReceipt() ||
                this.isTransfer()
            ) {
                return false;
            }

            if (
                !this.isPurchase() &&
                this.priceBooksEnabled &&
                (
                    this.model.get('priceBookId') ||
                    this.getConfig().get('defaultPriceBookId')
                )
            ) {
                return true;
            }

            if (this.isPurchase() && this.model.get('supplierId')) {
                return true;
            }

            return false;
        },

        addItem: function () {
            if (this.isAdjustment()) {
                this.actionAddProducts();

                return;
            }

            const data = this.getEmptyItem();
            const itemList = Espo.Utils.clone(this.fetchItemList());

            itemList.push(data);

            this.model.set('itemList', itemList, {ui: true});

            this.reRenderNoFlicker();
        },

        removeItem: function (id) {
            const itemList = Espo.Utils.clone(this.fetchItemList());

            let index = -1;

            itemList.forEach((item, i) => {
                if (item.id === id) {
                    index = i;
                }
            });

            if (~index) {
                itemList.splice(index, 1);
            }

            this.model.set('itemList', itemList, {ui: true});

            this.reRenderNoFlicker();
            this.calculateAmount();
        },

        calculateAmount: function () {
            this.calculationHandler.calculate(this.model);
        },

        reOrder: function (idList) {
            const orderedItemList = [];
            const itemList = this.model.get('itemList') || [];

            idList.forEach(id => {
                itemList.forEach(item => {
                    if (item.id === id) {
                        orderedItemList.push(item);
                    }
                });
            });

            this.model.set('itemList', orderedItemList, {ui: true});

            this.reRenderNoFlicker();
        },

        getProductsFilters: function () {
            if (this.model.entityType === 'TransferOrder') {
                const fromWarehouseId = this.model.get('fromWarehouseId');
                const fromWarehouseName = this.model.get('fromWarehouseName');

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

            if (!this.model.hasField('supplier')) {
                return null;
            }

            const supplierId = this.model.get('supplierId');

            if (!supplierId) {
                return null;
            }

            const nameHash = {};
            nameHash[supplierId] = this.model.get('supplierName');

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
            }
        },

        isPurchase: function () {
            return this.model.entityType === 'PurchaseOrder';
        },

        isDelivery: function () {
            return this.model.entityType === 'DeliveryOrder';
        },

        isReceipt: function () {
            return this.model.entityType === 'ReceiptOrder';
        },

        isTransfer: function () {
            return this.model.entityType === 'TransferOrder';
        },

        isAdjustment: function () {
            return this.model.entityType === 'InventoryAdjustment';
        },

        actionAddProducts: function () {
            const view = this.getMetadata().get('clientDefs.Product.modalViews.select') ||
                'views/modals/select-records-with-categories';

            let primaryFilterName = !this.isPurchase() ? 'available' : null;

            if (this.isAdjustment()) {
                primaryFilterName = 'inventory';
            }

            const layoutName = this.inventoryTransactionsEnabled ?
                'listForAddInventory' :
                'listForAdd';

            Espo.Ui.notify(' ... ');

            const selectAttributeList = this.calculationHandler.getSelectProductAttributeList(this.model);

            this.createView('dialog', view, {
                scope: 'Product',
                multiple: true,
                createButton: false,
                primaryFilterName: primaryFilterName,
                filters: this.getProductsFilters(),
                mandatorySelectAttributeList: selectAttributeList,
                layoutName: layoutName,
            }).then(view => {
                view.render();

                Espo.Ui.notify(false);

                this.listenToOnce(view, 'select', models => {
                    const where = view.collection.where;

                    const regularModels = [];
                    const templateModels = [];

                    models.forEach(model => {
                        model.get('type') === 'Template' ?
                            templateModels.push(model) :
                            regularModels.push(model);
                    });

                    if (!templateModels.length) {
                        this.addProducts(models);

                        return;
                    }

                    Espo.Ui.notify(' ... ');

                    this.createView('dialogVariants', 'sales:views/product/modals/select-variants', {
                        models: templateModels,
                        where: where,
                        mandatorySelectAttributeList: selectAttributeList,
                    }).then(view => {
                        view.render();

                        Espo.Ui.notify(false);

                        this.listenToOnce(view, 'select', models => {
                            this.addProducts([...regularModels, ...models]);
                        });
                    });
                });
            });
        },

        /**
         * @param {Model[]} products
         */
        addProducts: function (products) {
            const itemList = Espo.Utils.clone(this.fetchItemList());

            /** @type {[Model, Model][]} */
            const itemProductPairs = [];

            products.forEach(product => {
                const itemModel = new Model();

                itemModel.set(this.getEmptyItem());

                // @todo Move to helper class.

                this.copyFieldList.forEach(field => {
                    this.getFieldManager()
                        .getEntityTypeFieldAttributeList('Product', field)
                        .forEach(attribute => {
                            itemModel.set(attribute, product.get(attribute));
                        });
                });

                itemModel.set('allowFractionalQuantity', product.get('allowFractionalQuantity'));
                itemModel.set('productType', product.get('type'));

                if (this.hasInventoryNumberTypeField) {
                    itemModel.set('isInventory', product.get('isInventory'));
                    itemModel.set('inventoryNumberType', product.get('inventoryNumberType'));
                }

                itemProductPairs.push([itemModel, product]);
            });

            const prepare = () => {
                const hasVariant = products.find(product => product.get('type') === 'Variant') !== undefined;

                if (!this.toFetchPrices() && !hasVariant) {
                    return Promise.resolve();
                }

                const pairs = products.map(product => {
                    return {
                        productId: product.id,
                        quantity: 1.0,
                    };
                });

                return new Promise(resolve => {
                    const url = this.isPurchase() ?
                        'ProductPrice/getPurchasePrice' :
                        'ProductPrice/getSalesPrice';

                    const currency = this.model.get('amountCurrency');

                    Espo.Ajax.postRequest(url, {
                        priceBookId: this.model.get('priceBookId'),
                        supplierId: this.model.get('supplierId'),
                        accountId: this.model.get('accountId'),
                        orderId: this.model.id,
                        orderType: this.model.entityType,
                        items: pairs,
                        currency: currency,
                    }).then(results => {
                        results.forEach((resultItem, i) => {
                            const product = itemProductPairs[i][1];

                            if (this.isPurchase()) {
                                product.set({
                                    costPrice: resultItem.unitPrice,
                                    costPriceCurrency: resultItem.unitPriceCurrency,
                                });

                                return;
                            }

                            product.set({
                                unitPrice: resultItem.unitPrice,
                                unitPriceCurrency: resultItem.unitPriceCurrency,
                                listPrice: resultItem.listPrice,
                                listPriceCurrency: resultItem.listPriceCurrency,
                            });
                        });

                        resolve();
                    });
                });
            };

            Espo.Ui.notify(' ... ');

            prepare().then(() => {
                Espo.Ui.notify(false);

                itemProductPairs.forEach(([itemModel, product]) => {
                    this.calculationHandler.selectProduct(itemModel, product);
                    this.calculationHandler.calculateItem(itemModel);

                    itemList.push(itemModel.attributes);
                });

                this.model.set('itemList', itemList, {ui: true});

                this.reRenderNoFlicker();
            });
        },

        actionApplyPriceBook: function () {
            const view = this.getMetadata().get('clientDefs.PriceBook.modalViews.select') ||
                'views/modals/select-records';

            Espo.Ui.notify(' ... ');

            this.createView('dialog', view, {
                scope: 'PriceBook',
                createButton: false,
            }).then(view => {
                view.render();

                Espo.Ui.notify(false);

                this.listenToOnce(view, 'select', model => {
                    this.applyPriceBook(model);
                });
            });
        },

        /**
         * @param {module:model} priceBook
         */
        applyPriceBook: function (priceBook) {
            const currency = this.model.get('amountCurrency');
            const inputItems = /** @type {{productId: string|null, id: string, quantity: number|null}[]} */
                Espo.Utils.cloneDeep(this.model.get('itemList') || []);

            const items = inputItems
                .filter(item => item.productId)
                .map(item => {
                    return {
                        id: item.id,
                        productId: item.productId,
                        quantity: item.quantity,
                    };
                });

            Espo.Ui.notify(' ... ');

            Espo.Ajax.postRequest('ProductPrice/getSalesPrice', {
                priceBookId: priceBook.id,
                accountId: this.model.get('accountId'),
                orderId: this.model.id,
                orderType: this.model.entityType,
                items: items,
                currency: currency,
            }).then(/** {unitPrice: number|null, listPrice: number|null}[] */results => {
                /** @type {Object.<string, {unitPrice: number, listPrice: number}>} */
                const newItemMap = {};

                items.forEach((item, i) => {
                    const resultItem = results[i];

                    newItemMap[item.id] = {
                        unitPrice: resultItem.unitPrice,
                        listPrice: resultItem.listPrice,
                    };
                });

                inputItems.forEach(item => {
                    if (!newItemMap[item.id]) {
                        return;
                    }

                    const itemModel = new Model();

                    itemModel.set(item);

                    itemModel.set({
                        unitPrice: newItemMap[item.id].unitPrice,
                        listPrice: newItemMap[item.id].listPrice,
                    });

                    this.calculationHandler.calculateItem(itemModel);

                    for (const name in itemModel.attributes) {
                        item[name] = itemModel.attributes[name];
                    }
                });

                this.model.set('itemList', inputItems, {ui: true});

                Espo.Ui.success(this.translate('Done'));

                this.reRenderNoFlicker()
                    .then(() => {
                        this.calculateAmount();
                    });
            });
        },

        validateValid: function () {
            const view = this.getView('itemList');

            if (!view) {
                return false;
            }

            return view.validate();
        },
    });
});
