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

define('sales:views/sales-order/modals/create-delivery', ['views/modal'], function (ModalView) {

    /**
     * @extends module:views/modal
     */
    class CreateDeliveryModal extends ModalView {

        // language=Handlebars
        templateContent = `
            <div class="button-container clearfix">
                <div class="validity-container pull-left">{{{validity}}}</div>
                <div class="availability-container pull-right">{{{availability}}}</div>
            </div>
            {{#each collection.models}}
                <div class="item-container record">
                    {{#if @index}}
                        <hr>
                        <div class="button-container clearfix">
                            <button
                                class="pull-right btn btn-default btn-icon"
                                title="{{translate 'Remove'}}"
                                data-action="removeDelivery"
                                data-id="{{cid}}"
                            ><span class="fas fa-times"></span></button>
                        </div>
                    {{/if}}
                    <div class="item-record-container" data-id="{{cid}}">{{{lookup ../this cid}}}</div>
                </div>
            {{/each}}
            <div class="button-container">
                <button
                    class="btn btn-default"
                    data-action="addDelivery"
                ><span class="fas fa-plus"></span> {{translate 'Add Delivery' scope='SalesOrder'}}</button>
            </div>
        `

        data() {
            return {
                collection: this.collection,
            };
        }

        setup() {
            this.addHandler('click', '[data-action="addDelivery"]', () => this.actionAddDelivery());
            this.addHandler('click', '[data-action="removeDelivery"]', (e, target) => {
                const id = target.getAttribute('data-id');

                this.actionRemoveDelivery(id);
            });

            this.headerText = this.translate('Create Delivery', 'labels', 'SalesOrder');

            this.buttonList = [
                {
                    name: 'create',
                    label: 'Create',
                    style: 'danger',
                    disabled: true,
                    onClick: () => this.actionCreate(),
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: () => this.close(),
                },
            ];

            this.setupProductIds();
            this.setupStatusList();

            if (this.isInventoryTransactionsEnabled() && this.productIds.length) {
                this.buttonList.push({
                    name: 'showAvailability',
                    text: this.translate('Show Availability', 'labels', 'DeliveryOrder'),
                    position: 'right',
                    onClick: () => this.actionShowAvailability(),
                });
            }

            this.wait(
                Promise
                    .all([
                        this.setupLayout(),
                        this.setupAttributes(),
                        this.setupInventoryData(),
                    ])
                    .then(() => this.setupCollection())
                    .then(() => this.createItemViews())
                    .then(() => this.setupValidity())
                    .then(() => this.setupAvailability())
                    .then(() => this.controlCreateButton())
            );
        }

        isInventoryTransactionsEnabled() {
            return !!this.getConfig().get('inventoryTransactionsEnabled');
        }

        setupInventoryData() {
            if (!this.isInventoryTransactionsEnabled()) {
                return Promise.resolve();
            }

            if (this.productIds.length === 0) {
                return Promise.resolve();
            }

            const fetch = () => {
                return Espo.Ajax
                    .getRequest('DeliveryOrder/action/getInventoryDataForProducts', {
                        ids: this.productIds.join(','),
                        excludeId: this.model.id,
                        excludeType: this.model.entityType,
                    })
                    .then(inventoryData => {
                        this.inventoryData = inventoryData;
                    });
            }

            this.listenTo(this.model, 'sync', () => {
                fetch().then(() => {
                    this.getView('availability').reRender();
                });
            });

            return fetch();
        }

        setupAttributes() {
            return Espo.Ajax
                .getRequest('DeliveryOrder/action/getAttributesFromSalesOrder', {salesOrderId: this.model.id})
                .then(attributes => {
                    this.attributes = attributes;
                });
        }

        setupLayout() {
            return new Promise(resolve => {
                this.getHelper().layoutManager.get('DeliveryOrder', 'detailCreateFromSalesOrder', layout => {
                    this.detailLayout = Espo.Utils.cloneDeep(layout);

                    this.detailLayout.push({
                        rows: [
                            [
                                {
                                    name: 'itemList',
                                    view: 'sales:views/delivery-order/fields/item-list-for-create',
                                    noLabel: true,
                                    options: {
                                        salesOrderModel: this.model,
                                    },
                                }
                            ]
                        ],
                    });

                    resolve();
                });
            });
        }

        setupAvailability() {
            return this.createView('availability', 'sales:views/delivery-order/availability', {
                productIds: this.productIds,
                collection: this.collection,
                selector: '.availability-container',
                inventoryData: this.inventoryData,
            });
        }

        setupValidity() {
            this.listenTo(this.model, 'change', () => this.controlCreateButton());
            this.listenTo(this.collection, 'change', () => this.controlCreateButton());

            return this.createView('validity', 'sales:views/delivery-order/validity', {
                model: this.model,
                collection: this.collection,
                selector: '.validity-container',
            });
        }

        setupCollection() {
            return new Promise(resolve => {
                this.getCollectionFactory().create('DeliveryOrder')
                    .then(collection => {
                        this.collection = collection;

                        this.prepareModel().then(model => {
                            // @todo
                            const itemList = Espo.Utils.cloneDeep(this.model.get('itemList'));

                            model.set({
                                amount: this.model.get('shippingCost'),
                                amountCurrency: this.model.get('amountCurrency'),
                                shippingCost: this.model.get('shippingCost'),
                                shippingCostCurrency: this.model.get('shippingCostCurrency'),
                                itemList: itemList,
                            });

                            this.collection.add(model);

                            resolve();
                        });
                    });
            });
        }

        createItemViews() {
            this.collection.forEach(model => {
                this.createItemView(model);
            });
        }

        createItemView(model) {
            return this.createView(model.cid, 'sales:views/delivery-order/record/create', {
                model: model,
                selector: `.item-record-container[data-id="${model.cid}"]`,
                detailLayout: this.detailLayout,
            }).then(/** module:views/record/edit */view => {
                view.setFieldOptionList('status', this.statusList);
            });
        }

        /**
         * @return {Object.<string, number>}
         */
        getQuantityMap() {
            const map = {};

            this.collection.forEach(model => {
                (model.get('itemList') || []).forEach(item => {
                    const productId = item.productId;
                    const quantity = item.quantity;

                    if (!productId || !quantity) {
                        return;
                    }

                    if (!(productId in map)) {
                        map[productId] = 0.0;
                    }

                    map[productId] += quantity;
                });
            });

            return map;
        }

        getLeftItems() {
            if (!this.collection.length) {
                return [];
            }

            const newItemList = [];
            const map = this.getQuantityMap();
            const itemList = Espo.Utils.cloneDeep(this.model.get('itemList') || []);

            itemList.forEach(item => {
                const productId = item.productId;
                const quantity = item.quantity;

                if (!productId || !quantity) {
                    return;
                }

                const existingItem = newItemList.find(item => item.productId === productId);

                if (existingItem !== undefined) {
                    existingItem.quantity += quantity;

                    return;
                }

                newItemList.push(item);
            });

            newItemList.forEach(item => {
                item.quantity = item.quantity - (map[item.productId] || 0.0);
            });

            return newItemList.filter(item => item.quantity > 0);
        }

        prepareModel() {
            return this.getModelFactory().create('DeliveryOrder')
                .then(model => {
                    model.populateDefaults();

                    model.set(
                        Espo.Utils.cloneDeep(this.attributes)
                    );

                    model.set({
                        shippingCostCurrency: this.model.get('shippingCostCurrency'),
                        itemList: this.getLeftItems(),
                        assignedUserId: this.model.get('assignedUserId'),
                        assignedUserName: this.model.get('assignedUserName'),
                    });

                    return model;
                });
        }

        actionCreate() {
            let isValid = true;

            this.collection.forEach(model => {
                /** @type {module:views/record/edit} */
                const view = this.getView(model.cid);

                if (view.validate()) {
                    isValid = false;
                }
            })

            if (!isValid) {
                return;
            }

            Espo.Ui.notify(' ... ');

            this.disableButton('create');

            Espo.Ajax
                .postRequest('DeliveryOrder/action/createForSalesOrder', {
                    salesOrderId: this.model.id,
                    dataList: this.collection.models.map(model => model.attributes),
                })
                .then(/** {list: Object[]} */response => {
                    if (response.list.length) {
                        let msg = this.translate('Created')  + '\n' +
                            response.list
                                .map(item => {
                                    const url = '#DeliveryOrder/view/' + item.id;
                                    const name = item.name;

                                    return `[${name}](${url})`;
                                })
                                .join('\n');

                        let dontClose = false;

                        if (
                            response.list.find(item => item.inventoryStatus === 'Not Available')
                        ) {
                            msg += '\n\n' + this.translate('notAvailableInventory', 'messages', 'DeliveryOrder');
                            dontClose = true;
                        }

                        const timeout = !dontClose ? 4000: undefined;

                        Espo.Ui.notify(msg, 'success', timeout, {
                            suppress: true,
                            closeButton: dontClose,
                        });
                    }

                    this.trigger('done');
                    this.close();
                })
                .catch(() => {
                    this.enableButton('create');
                });
        }

        actionAddDelivery() {
            this.prepareModel().then(model => {
                this.collection.add(model);

                this.createItemView(model)
                    .then(() => this.reRender());
            });
        }

        actionRemoveDelivery(id) {
            this.collection.remove(id);

            this.clearView(id);
            this.reRender();
        }

        getValidityView() {
            return this.getView('validity');
        }

        controlCreateButton() {
            if (!this.getValidityView()) {
                return;
            }

            this.getValidityView().getValidityData().isValid ?
                this.enableButton('create') :
                this.disableButton('create')
        }

        actionShowAvailability() {
            this.createView('dialog', 'sales:views/delivery-order/modals/show-availability', {
                inventoryData: this.inventoryData,
            }).then(view => {
                view.render();
            });
        }

        setupProductIds() {
            const items = this.model.get('itemList') || [];

            this.productIds =
                [...new Set(
                    items
                        .filter(item => item.productId)
                        .filter(item => item.isInventory)
                        .map(item => item.productId)
                )];
        }

        setupStatusList() {
            this.statusList = [
                ...this.getMetadata().get('scopes.DeliveryOrder.softReserveStatusList'),
                ...this.getMetadata().get('scopes.DeliveryOrder.reserveStatusList'),
            ];
        }
    }

    return CreateDeliveryModal;
});
