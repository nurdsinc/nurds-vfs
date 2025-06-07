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

define('sales:handlers/info', [], function () {

    class Handler {

        /**
         * @param {module:views/list} view
         */
        constructor(view) {
            /** @type {module:views/list} */
            this.view = view;
        }

        process() {
            if (!this.view.getUser().isAdmin()) {
                return;
            }

            const config = this.view.getConfig();
            const entityType = this.view.entityType;

            if (entityType === 'PriceBook') {
                if (config.get('priceBooksEnabled')) {
                    return;
                }

                this.initInfo('PriceBooks');

                return;
            }

            if (entityType === 'Warehouse' || entityType === 'TransferOrder') {
                if (config.get('warehousesEnabled')) {
                    return;
                }

                this.initInfo('Warehouses');

                return;
            }

            if (
                entityType === 'InventoryTransaction' ||
                entityType === 'InventoryAdjustment' ||
                entityType === 'InventoryNumber'
            ) {
                if (config.get('inventoryTransactionsEnabled')) {
                    return;
                }

                this.initInfo('InventoryTransactions');
            }
        }

        initInfo(type) {
            this.view.once('after:render', () => {
                /** @type HTMLElement */
                const element = this.view.element || this.view.$el.get(0);

                const text = this.view.getHelper()
                    .transformMarkdownText(this.view.translate(type, 'featureEnableInfo')).toString();

                const div = document.createElement('DIV');
                div.classList.add('well', 'margin-top', 'margin-top-2x', 'text-info', 'text-center');
                div.innerHTML = text;

                element.appendChild(div);
            });
        }
    }

    return Handler;
});
