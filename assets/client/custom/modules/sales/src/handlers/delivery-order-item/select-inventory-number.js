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

define('sales:handlers/delivery-order-item/select-inventory-number', [], function () {

    const cache = {};

    class Handler {

        getFilters(model) {
            const productId = model.get('productId');

            let warehouseId, warehouseName;

            if (model.parentModel) {
                const parentModel = model.parentModel;

                warehouseId = parentModel.get('warehouseId') || parentModel.get('fromWarehouseId');
                warehouseName = parentModel.get('warehouseName') || parentModel.get('fromWarehouseName')
            }

            if (!productId) {
                return Promise.resolve({});
            }

            const advanced = {
                product: {
                    type: 'equals',
                    attribute: 'productId',
                    value: productId,
                    data: {
                        type: 'is',
                        idValue: productId,
                        nameValue: model.get('productName'),
                    },
                },
            };

            if (warehouseId) {
                const nameHash = {};
                nameHash[warehouseId] = warehouseName;

                advanced.warehousesOnHand = {
                    type: 'arrayAnyOf',
                    attribute: 'warehousesOnHandIds',
                    value: [warehouseId],
                    data: {
                        type: 'anyOf',
                        nameHash: nameHash,
                    },
                };
            }

            const attributes = {
                primary: 'onHand',
                advanced: advanced,
            };

            if (model.entityType === 'InventoryAdjustmentItem') {
                return Promise.resolve(attributes);
            }

            return this.getProductAttributes(productId)
                .then(productAttributes => {
                    const strategy = productAttributes.removalStrategy;

                    let orderBy = 'orderFifo';

                    if (strategy === 'FEFO') {
                        orderBy = 'orderFefo';
                    }
                    else if (strategy === 'LIFO') {
                        orderBy = 'orderLifo';
                    }

                    attributes.orderBy = orderBy;

                    return attributes;
                });
        }

        /**
         * @param {string} id
         * @return {Promise<Record>}
         */
        getProductAttributes(id) {
            if (id in cache) {
                return Promise.resolve(cache[id]);
            }

            return Espo.Ajax.getRequest(`Product/${id}`)
                .then(/** Record */productAttributes => {
                    cache[id] = productAttributes;

                    return productAttributes;
                })
                .catch(() => {});
        }
    }

    return Handler;
});
