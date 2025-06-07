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

define('sales:views/purchase-order/fields/warehouse', ['views/fields/link'], function (Dep) {

    // @todo Use handler.
    return Dep.extend({

        forceSelectAllAttributes: true,

        select: function (model) {
            Dep.prototype.select.call(this, model);

            this.model.set('shippingAddressStreet', model.get('addressStreet'));
            this.model.set('shippingAddressCity', model.get('addressCity'));
            this.model.set('shippingAddressState', model.get('addressState'));
            this.model.set('shippingAddressPostalCode', model.get('addressPostalCode'));
            this.model.set('shippingAddressCountry', model.get('addressCountry'));
        },

        clearLink: function () {
            Dep.prototype.clearLink.call(this);

            this.model.set('shippingAddressStreet', null);
            this.model.set('shippingAddressCity', null);
            this.model.set('shippingAddressState', null);
            this.model.set('shippingAddressPostalCode', null);
            this.model.set('shippingAddressCountry', null);
        },
    });
});
