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

define('sales:handlers/product-price/mass-update-price', [], () => {

    class Handler {

        /**
         * @param {module:views/record/list} view
         */
        constructor(view) {
            /** @type {module:views/record/list} */
            this.view = view;
        }

        init() {
            if (this.view.getAcl().getPermissionLevel('massUpdate') !== 'yes') {
                this.view.massActionRemove('updatePrice');
            }
        }

        /**
         * @param {{
         *     entityType: string,
         *     params: Record | {ids?: string[]},
         * }} data
         */
        process(data) {
            this.view.createView('dialog', 'sales:views/product-price/modals/mass-update-price', {
                entityType: data.entityType,
                params: data.params,
                onDone: () => onDone(),
            }).then(view => {
                view.render();
            });

            const onDone = () => {
                const collection = this.view.collection;

                collection.fetch()
                    .then(() => {
                        if (!data.params.ids) {
                            this.view.selectAllResult();

                            return;
                        }

                        data.params.ids.forEach(id => this.view.checkRecord(id));
                    });
            };
        }
    }

    return Handler;
});
