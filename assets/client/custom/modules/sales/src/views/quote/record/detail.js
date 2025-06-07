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

define('sales:views/quote/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        stickButtonsFormBottomSelector: '.panel[data-name="items"]',

        setup: function () {
            Dep.prototype.setup.call(this);

            let printPdfAction = false;

            this.dropdownItemList.forEach(item => {
                if (item.name === 'printPdf') {
                    printPdfAction = true;
                }
            });

            if (!printPdfAction) {
                this.dropdownItemList.push({
                    name: 'printPdf',
                    label: 'Print to PDF',
                });
            }

            this.dropdownItemList.push({
                name: 'composeEmail',
                text: this.translate('Send in Email', 'labels', 'Quote'),
                groupIndex: 6,
            });

            this.setupInventoryWebSocket();

            this.listenTo(this.model, 'block-action-items', () => {
                this.disableActionItems();
            });

            this.listenTo(this.model, 'unblock-action-items', () => {
                this.enableActionItems();
            });
        },

        setupInventoryWebSocket: function () {
            if (!['SalesOrder', 'Quote'].includes(this.model.entityType)) {
                return;
            }

            if (
                !this.getHelper().webSocketManager ||
                this.isNew ||
                !this.getConfig('inventoryTransactionsEnabled') ||
                !this.getAcl().checkScope('Product')
            ) {
                return;
            }

            this.getHelper().webSocketManager.subscribe('inventoryQuantityUpdate', (c, response) => {
                if (this.updateWebSocketIsBlocked) {
                    return;
                }

                // noinspection JSUnresolvedReference
                const productIds = /** @type string[] */response.productIds;
                const itemList = /** @type {Array<{productId?: string}>}> */this.model.get('itemList') || [];

                const toProcess = itemList
                    .filter(item => item.productId)
                    .find(item => productIds.includes(item.productId)) !== undefined;

                if (!toProcess) {
                    return;
                }

                this.model.fetch({highlight: true});
            });

            this.once('remove', () => {
                this.getHelper().webSocketManager.unsubscribe('inventoryQuantityUpdate');
            });
        },

        actionPrintPdf: function () {
            this.createView('pdfTemplate', 'views/modals/select-template', {
                entityType: this.model.entityType,
            }, view => {
                view.render();

                this.listenToOnce(view, 'select', model => {
                    const url = '?entryPoint=pdf&entityType=' + this.model.entityType +
                        '&entityId=' + this.model.id + '&templateId=' + model.id;

                    window.open(url, '_blank');
                });
            });
        },

        actionComposeEmail: function () {
            this.createView('pdfTemplate', 'views/modals/select-template', {
                entityType: this.model.entityType,
            }, view => {
                view.render();

                this.listenToOnce(view, 'select', model => {
                    setTimeout(() => Espo.Ui.notify(' ... '), 0);

                    Espo.Ajax.postRequest(this.model.entityType + '/action/getAttributesForEmail', {
                        id: this.model.id,
                        templateId: model.id,
                    }).then(attributes => {
                        const viewName = this.getMetadata().get('clientDefs.Email.modalViews.compose') ||
                            'views/modals/compose-email';

                        this.createView('composeEmail', viewName, {
                            attributes: attributes,
                            keepAttachmentsOnSelectTemplate: true,
                            appendSignature: true,
                        }, view => {
                            view.render();

                            Espo.Ui.notify(false);
                        });
                    });
                });
            });
        },
    });
});
