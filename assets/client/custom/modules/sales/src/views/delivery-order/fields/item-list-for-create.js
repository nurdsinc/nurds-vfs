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

define('sales:views/delivery-order/fields/item-list-for-create', ['sales:views/quote/fields/item-list'], function (Dep) {

    return Dep.extend({

        customItemView: 'sales:views/delivery-order/record/item-for-create',

        data: function () {
            return {
                ...Dep.prototype.data.call(this),
                showAddProducts: false,
                showApplyPriceBook: false,
                hasMenu: false,
            };
        },

        addItem: function () {
            const itemList = this.options.salesOrderModel.get('itemList') || [];

            const dataItemList = [];

            itemList.forEach(item => {
                const productId = item.productId;

                if (!productId) {
                    return;
                }

                if (dataItemList.find(item => item.id === productId) !== undefined) {
                    return;
                }

                dataItemList.push({
                    id: productId,
                    name: item.productName,
                    inventoryNumberType: item.inventoryNumberType,
                });
            });

            this.createView('dialog', 'sales:views/delivery-order/modals/add-item', {dataItemList: dataItemList})
                .then(view => {
                    view.render();

                    this.listenToOnce(view, 'add', ids => {
                        this.clearView('dialog');

                        const itemList = Espo.Utils.cloneDeep(this.fetchItemList());

                        ids.forEach(id => {
                            const originalItem = (dataItemList.find(item => item.id === id) || {});
                            const name = originalItem.name;

                            const itemData = this.getEmptyItem();

                            itemData.productId = id;
                            itemData.productName = name;
                            itemData.name = name;
                            itemData.quantity = 0;
                            itemData.inventoryNumberType = originalItem.inventoryNumberType;

                            itemList.push(itemData);
                        });

                        this.model.set('itemList', itemList, {ui: true});

                        this.reRenderNoFlicker();
                    });
                });
        },
    });
});
