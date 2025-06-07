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

define('sales:views/quote/record/item-list', ['views/base', 'collection'], function (Dep, Collection) {

    // noinspection JSUnusedGlobalSymbols
    return Dep.extend({

        template: 'sales:quote/record/item-list',

        itemView: 'sales:views/quote/record/item',

        events: {
            'click .action': function (e) {
                const $el = $(e.currentTarget);
                const action = $el.data('action');
                const method = 'action' + Espo.Utils.upperCaseFirst(action);

                if (typeof this[method] == 'function') {
                    const data = $el.data();

                    this[method](data, e);

                    e.preventDefault();
                }
            },
        },

        data: function () {
            const hideTaxRate = this.noTax && this.mode === 'detail';
            const hideInventoryNumber = this.noInventoryNumber &&
                (this.mode === 'detail' || !this.inventoryTransactionsEnabled);

            const listLayout = this.listLayout.filter(item => {
                if (item.name === 'taxRate' && hideTaxRate) {
                    return false;
                }

                if (item.name === 'inventoryNumber' && hideInventoryNumber) {
                    return false;
                }

                return true;
            });

            return {
                itemDataList: this.itemDataList,
                mode: this.mode,
                hideTaxRate: hideTaxRate,
                showRowActions: this.showRowActions,
                listLayout: listLayout,
                itemEntityType: this.itemEntityType,
            };
        },

        setup: function () {
            this.itemView = this.options.itemView ||
                this.getMetadata().get(['clientDefs', this.itemEntityType, 'recordViews', 'item']) ||
                this.itemView;

            this.mode = this.options.mode;
            this.calculationHandler = this.options.calculationHandler;
            this.itemDataList = [];

            const itemList = this.model.get('itemList') || [];

            this.itemEntityType = this.model.entityType + 'Item';

            this.collection = new Collection();
            this.collection.name = this.collection.entityType = this.itemEntityType;
            this.collection.total = itemList.length;

            this.inventoryTransactionsEnabled = this.getConfig().get('inventoryTransactionsEnabled') || false;

            // @todo Revise.
            // Caused issue with delivery items quantity change.
            /*this.listenTo(this.collection, 'change', m => {
                itemList.forEach((item, i) => {
                    if (item.id === m.id) {
                        itemList[i] = m.getClonedAttributes();
                    }
                });
            });*/

            this.noTax = true;
            this.noInventoryNumber = true;

            itemList.forEach(item => {
                if (item.taxRate) {
                    this.noTax = false;
                }

                if (item.inventoryNumberId) {
                    this.noInventoryNumber = false;
                }
            });

            this.showRowActions = this.mode === 'detail' && this.getAcl().checkModel(this.model, 'read');

            // @todo
            this.aclEdit = this.getAcl().checkModel(this.model, 'edit');

            this.wait(true);

            this.getHelper().layoutManager.get(this.itemEntityType, 'listItem', listLayout => {
                this.listLayout = Espo.Utils.cloneDeep(listLayout);

                this.listLayout.forEach(item => {
                    item.key = item.name + 'Field';

                    if (item.name === 'quantity') {
                        item.customLabel = this.translate('qty', 'fields', this.itemEntityType);
                    }

                    if (item.name === 'quantityReceived') {
                        item.customLabel = this.translate('qtyReceived', 'fields', this.itemEntityType);
                    }

                    if (item.name === 'newQuantityOnHand') {
                        item.customLabel = this.translate('newQtyOnHand', 'fields', this.itemEntityType);
                    }
                });

                if (!this.inventoryTransactionsEnabled) {
                    this.listLayout = this.listLayout.filter(item => item.name !== 'inventoryNumber');
                }

                this.getModelFactory().create(this.itemEntityType, modelSeed => {
                    itemList.forEach((item, i) => {
                        const model = modelSeed.clone();

                        model.name = model.entityType = this.itemEntityType;
                        model.parentModel = this.model;

                        const id = item.id || 'cid' + i;

                        this.itemDataList.push({
                            num: i,
                            key: 'item-' + i,
                            id: id,
                        });

                        model.set(
                            Espo.Utils.cloneDeep(item)
                        );

                        this.collection.push(model);

                        const viewName = this.itemView;

                        this.createView('item-' + i, viewName, {
                            el: this.options.el + ' .item-container[data-id="' + id + '"]',
                            model: model,
                            parentModel: this.model,
                            mode: this.mode,
                            noTax: this.noTax,
                            noInventoryNumber: this.noInventoryNumber,
                            showRowActions: this.showRowActions,
                            aclEdit: this.aclEdit,
                            itemEntityType: this.itemEntityType,
                            listLayout: this.listLayout,
                            calculationHandler: this.calculationHandler,
                        }, view => {
                            this.listenTo(view, 'change', () => {
                                this.trigger('change');
                            });
                        });
                    });

                    this.wait(false);
                });
            });
        },

        actionQuickEdit: function (data) {
            data = data || {};

            const id = data.id;

            if (!id) {
                return;
            }

            let model = null;

            if (this.collection) {
                model = this.collection.get(id);
            }

            if (!data.scope && !model) {
                return;
            }

            const scope = this.collection.entityType;

            const viewName = this.getMetadata().get('clientDefs.' + scope + '.modalViews.edit') ||
                'views/modals/edit';

            Espo.Ui.notify(' ... ');

            this.createView('modal', viewName, {
                scope: scope,
                id: id,
                model: model,
                fullFormDisabled: data.noFullForm,
                returnUrl: '#' + this.model.entityType + '/view/' + this.model.id,
                returnDispatchParams: {
                    controller: this.model.entityType,
                    action: 'view',
                    options: {
                        id: this.model.id,
                        isReturn: true,
                    },
                },
            }, view => {
                view.once('after:render', () => {
                    Espo.Ui.notify(false);
                });

                view.render();

                this.listenToOnce(view, 'remove', () => {
                    this.clearView('modal');
                });

                this.listenToOnce(view, 'after:save', (m) => {
                    const model = this.collection.get(m.id);

                    if (model) {
                        model.set(m.getClonedAttributes());
                    }

                    this.trigger('after:save', m);
                });
            });
        },

        actionQuickView: function (data) {
            data = data || {};

            const id = data.id;

            if (!id) {
                return;
            }

            let model = null;

            if (this.collection) {
                model = this.collection.get(id);
            }

            const scope = this.itemEntityType;

            const viewName = this.getMetadata().get('clientDefs.' + scope + '.modalViews.detail') ||
                'views/modals/detail';

            Espo.Ui.notify(' ... ');

            this.createView('modal', viewName, {
                scope: scope,
                model: model,
                id: id,
            }, view => {
                this.listenToOnce(view, 'after:render', () => {
                    Espo.Ui.notify(false);
                });

                view.render();

                this.listenToOnce(view, 'remove', () => {
                    this.clearView('modal');
                });

                this.listenToOnce(view, 'after:edit-cancel', () => {
                    this.actionQuickView({
                        id: view.model.id,
                        scope: view.model.entityType,
                    });
                });

                this.listenToOnce(view, 'after:save', (m) => {
                    const model = this.collection.get(m.id);

                    if (model) {
                        model.set(m.getClonedAttributes());
                    }

                    this.trigger('after:save', m);
                });
            });
        },

        fetch: function () {
            const itemList = [];

            this.itemDataList.forEach(item => {
                const data = this.getView(item.key).fetch();

                data.id = data.id || item.id;
                itemList.push(data);
            });

            return {
                itemList: itemList,
            };
        },

        validate: function () {
            let isInvalid = false;

            this.itemDataList.forEach(item => {
                const view = this.getView(item.key);

                const itemIsInvalid = view.validate();

                if (itemIsInvalid) {
                    isInvalid = true;
                }
            });

            return isInvalid;
        },
    });
});
