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

define('sales:views/invoice/modals/send-in-email',
['views/modal', 'views/record/edit-for-modal', 'model', 'views/fields/enum'],
(ModalView, EditRecordView, Model, EnumFieldView) => {

    class SendInEmailModalView extends ModalView {

        templateContent = `<div class="record no-side-margin">{{{record}}}</div>`

        setup() {
            this.headerText = this.translate('Send in Email', 'labels', 'Quote');

            this.addButton({
                name: 'apply',
                style: 'primary',
                text: this.translate('Apply', 'labels'),
                onClick: () => this.actionApply(),
            });

            this.addButton({
                name: 'cancel',
                label: 'Cancel',
                onClick: () => this.actionClose(),
            });

            this.formModel = new Model();
            this.formModel.set('format', this.getConfig().get('eInvoiceFormat'));

            /** @type {import('collection').default} */
            this.templateCollection = undefined;

            this.wait(
                this.getCollectionFactory().create('Template')
                    .then(collection => {
                        this.templateCollection = collection;

                        collection.where = [{
                            attribute: 'entityType',
                            type: 'equals',
                            value: 'Invoice',
                        }];

                        return collection.fetch();
                    })
                    .then(() => this.setupRecordView())
            );
        }

        setupRecordView() {
            this.recordView = new EditRecordView({
                model: this.formModel,
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    view: new EnumFieldView({
                                        name: 'templateId',
                                        labelText: this.translate('Template', 'scopeNames', 'Global'),
                                        params: {
                                            options: [
                                                '',
                                                ...this.templateCollection.models.map(it => it.id),
                                            ],
                                            translatedOptions: this.templateCollection.models.reduce((p, it) => {
                                                return {
                                                    ...p,
                                                    [it.id]: it.attributes.name,
                                                }
                                            }, {}),
                                            required: true,
                                        },
                                    }),
                                },
                                {
                                    view: new EnumFieldView({
                                        name: 'format',
                                        labelText: this.translate('eInvoiceFormat', 'eInvoiceFields', 'Invoice'),
                                        params: {
                                            options: [
                                                '',
                                                ...this.getMetadata().get('app.eInvoice.formatList'),
                                            ],
                                            translation: 'Invoice.options.eInvoiceFormats',
                                        },
                                    }),
                                }
                            ]
                        ],
                    }
                ],
            });

            // noinspection JSUnresolvedReference
            this.assignView('record', this.recordView, '.record');
        }

        disableModalButtons() {
            this.disableButton('apply');
        }

        enableModalButtons() {
            this.enableButton('apply');
        }

        actionApply() {
            if (this.recordView.validate()) {
                return;
            }

            this.disableModalButtons();
            Espo.Ui.notify(' ... ');

            Espo.Ajax
                .postRequest('Invoice/action/getAttributesForEmail', {
                    id: this.model.id,
                    templateId: this.formModel.attributes.templateId,
                    format: this.formModel.attributes.format,
                })
                .then(attributes => {
                    this.trigger('apply', attributes);

                    this.close();
                })
                .catch(() => {
                    this.enableModalButtons();
                });
        }
    }

    return SendInEmailModalView;
});
