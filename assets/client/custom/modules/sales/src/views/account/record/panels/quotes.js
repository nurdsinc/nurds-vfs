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

define('sales:views/account/record/panels/quotes', ['views/record/panels/relationship'], function (Dep) {

    return Dep.extend({

        copyAttributeList: [
            'billingAddressStreet',
            'billingAddressCountry',
            'billingAddressPostalCode',
            'billingAddressCity',
            'billingAddressState',
            'shippingAddressStreet',
            'shippingAddressCountry',
            'shippingAddressPostalCode',
            'shippingAddressCity',
            'shippingAddressState',
            'priceBookId',
            'priceBookName',
        ],

        // @todo User handler.
        actionCreateRelatedQuote: function () {
            const entityType = this.model.getLinkParam(this.link, 'entity');

            Espo.Ui.notify(' ... ');

            const viewName = this.getMetadata().get(`clientDefs.${entityType}.modalViews.edit`) ||
                'views/modals/edit';

            const attributes = {};

            this.copyAttributeList.forEach(item => {
                if (this.model.get(item)) {
                    attributes[item] = this.model.get(item);
                }
            });

            this.createView('quickCreate', viewName, {
                scope: entityType,
                relate: {
                    model: this.model,
                    link: 'account',
                },
                attributes: attributes,
            }, view => {
                view.render();

                Espo.Ui.notify(false);

                this.listenToOnce(view, 'after:save', () => {
                    this.collection.fetch();
                });
            });
        },
    });
});
