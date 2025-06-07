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

define('sales:views/delivery-order/availability', ['view'], function (View) {

    class AvailabilityView extends View {

        // language=Handlebars
        templateContent = `
            {{#if isSet}}
                <span
                    class="label label-{{style}} label-md"
                >{{translateOption status scope='DeliveryOrder' field='inventoryStatus'}}</span>
                &nbsp;
            {{/if}}
        `

        data() {
            const isAvailable = this.isAvailable();
            const isOnHand = this.isAvailable(true);

            let status = 'Available';
            let style = 'success';

            if (!isAvailable) {
                status = 'Not Available';
                style = 'danger';

                if (isOnHand) {
                    status = 'On Hand';
                    style = 'warning';
                }
            }

            return {
                isSet: isAvailable !== null,
                status: status,
                style: style,
            };
        }

        setup() {
            this.listenTo(this.collection, 'change', () => this.reRender());

            /** @type {{
             *     id: string,
             *     quantity: number,
             *     quantityOnHand: number,
             *     warehouses: {
             *         id: string,
             *         quantity: number,
             *         quantityOnHand: number,
             *     }[],
             * }[]} */
            this.inventoryData = this.options.inventoryData || [];
        }

        isAvailable(isOnHand = false) {
            if (!this.getConfig().get('warehousesEnabled')) {
                return this.isAvailableNoWarehouses(isOnHand);
            }

            let noWarehouse = false;

            this.collection.forEach(model => {
                if (!model.get('warehouseId')) {
                    noWarehouse = true;
                }
            });

            if (noWarehouse) {
                return null;
            }

            /** @type {Object.<string, Object.<string, number>>} */
            const map = {};

            this.collection.forEach(model => {
                const warehouseId = model.get('warehouseId');

                if (!(warehouseId in map)) {
                    map[warehouseId] = {};
                }

                const wMap = map[warehouseId];

                const items = (model.get('itemList') || []).filter(item => item.productId);

                items.forEach(item => {
                    const productId = item.productId;
                    const quantity = item.quantity || 0.0;

                    if (!(productId in wMap)) {
                        wMap[productId] = 0.0;
                    }

                    wMap[productId] += quantity;
                });
            });

            let isAvailable = true;

            this.inventoryData.forEach(({id, warehouses}) => {
                const productId = id;

                warehouses.forEach(({id, quantity, quantityOnHand}) => {
                    const warehouseId = id;

                    if (!(warehouseId in map)) {
                        return;
                    }

                    const wMap = map[warehouseId];

                    if (!(productId in wMap)) {
                        return;
                    }

                    const quantityActual = isOnHand ?
                        quantityOnHand :
                        quantity;

                    if (wMap[productId] > quantityActual) {
                        isAvailable = false;
                    }
                });
            });

            return isAvailable;
        }

        isAvailableNoWarehouses(isOnHand) {
            // @todo Test.

            /** @type {Object.<string, number>} */
            const map = {};

            this.collection.forEach(model => {
                const items = (model.get('itemList') || []).filter(item => item.productId);

                items.forEach(item => {
                    const productId = item.productId;
                    const quantity = item.quantity || 0.0;

                    if (!(productId in map)) {
                        map[productId] = 0.0;
                    }

                    map[productId] += quantity;
                });
            });

            let isAvailable = true;

            this.inventoryData.forEach(({id, quantity, quantityOnHand}) => {
                const productId = id;

                if (!(productId in map)) {
                    return;
                }

                const quantityActual = isOnHand ?
                    quantityOnHand :
                    quantity;

                if (map[productId] > quantityActual) {
                    isAvailable = false;
                }
            });

            return isAvailable;
        }
    }

    return AvailabilityView;
});
