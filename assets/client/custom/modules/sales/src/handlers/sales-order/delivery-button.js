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

define('sales:handlers/sales-order/delivery-button', [], function () {

    class Handler {

        /**
         * @param {module:views/detail} view
         */
        constructor(view) {
            /** @type {module:views/detail} */
            this.view = view;
        }

        // noinspection JSUnusedGlobalSymbols
        actionCreateDelivery() {
            if (
                this.view.getRecordView() &&
                this.view.getRecordView().getMode() === this.view.getRecordView().MODE_EDIT
            ) {
                const msg = this.view.getLanguage().translate('cannotCreateDeliveryInEditMode', 'messages', 'SalesOrder');

                const dialog = Espo.Ui.dialog({
                    backdrop: true,
                    className: 'dialog-confirm',
                    body: this.view.getHelper().escapeString(msg),
                });

                dialog.show();

                return;
            }

            Espo.Ui.notify(' ... ');

            this.view
                .createView('dialog', 'sales:views/sales-order/modals/create-delivery', {
                    model: this.view.model,
                })
                .then(view => {
                    view.render();

                    Espo.Ui.notify(false);

                    this.view.listenToOnce(view, 'done', () => {
                        this.view.model.fetch();
                        this.view.model.trigger('update-all');
                    });
                });
        }

        hide() {
            this.view.hideHeaderActionItem('createDelivery');
        }

        show() {
            this.view.showHeaderActionItem('createDelivery');
        }

        init() {
            const model = this.view.model;

            if (
                //!this.view.getConfig().get('deliveryOrdersEnabled') ||
                !this.view.getAcl().check(model, 'edit') ||
                !this.view.getAcl().checkScope('DeliveryOrder', 'create') ||
                !this.isSupported()
            ) {
                this.hide();

                return;
            }

            const canceledStatusList = this.view.getMetadata().get('scopes.SalesOrder.canceledStatusList') || [];
            const doneStatusList = this.view.getMetadata().get('scopes.SalesOrder.doneStatusList') || [];

            const control = () => {
                const status = model.get('status');

                if (
                    doneStatusList.includes(status) &&
                    !model.get('hasInventoryItems')
                ) {
                    this.hide();

                    return;
                }

                if (
                    !model.has('isDeliveryCreated') ||
                    model.get('isDeliveryCreated') ||
                    canceledStatusList.includes(status)
                ) {
                    this.hide();

                    return;
                }

                this.show();
            };

            control();
            this.view.listenTo(this.view.model, 'sync', () => control());
        }

        isSupported() {
            const version = this.view.getConfig().get('version');

            if (!version) {
                return true;
            }

            const [major] = version.split('.');

            if (parseInt(major) < 8) {
                return false;
            }

            return true;
        }
    }

    return Handler;
});
