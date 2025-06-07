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

define('sales:views/sales-order/fields/is-delivery-created', ['views/fields/bool'], function (Dep) {

    return Dep.extend({

        getAttributeList: function () {
            return [
                ...Dep.prototype.getAttributeList.call(this),
                'status',
            ];
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'change:status', (m, v, o) => {
                // The default change handler does not handle status change.
                if (!o.ui && !o.skipReRender) {
                    return;
                }

                this.reRender();
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.controlLabel();
        },

        controlLabel: function () {
            if (this.mode !== this.MODE_DETAIL && this.mode !== this.MODE_LIST) {
                return;
            }

            /*if (!this.getConfig().get('deliveryOrdersEnabled')) {
                return;
            }*/

            if (this.model.get('isDeliveryCreated')) {
                return;
            }

            if (!this.model.get('hasInventoryItems')) {
                return;
            }

            const statusList = this.getMetadata().get('scopes.SalesOrder.deliveryRequiredStatusList') || [];
            const status = this.model.get('status');

            if (!statusList.includes(status)) {
                return;
            }

            const labelEl = document.createElement('span');
            labelEl.classList.add('label', 'label-md', 'label-warning');
            labelEl.textContent = this.translate('Not Created', 'labels', 'SalesOrder');

            /** @type Element */
            const element = this.element || this.$el.get(0);

            element.innerHTML = '';
            element.appendChild(labelEl);
        }
    });
});
