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

define('sales:views/invoice/modals/e-invoice',
['views/modal', 'views/record/edit-for-modal', 'model', 'views/fields/enum'],
(ModalView, EditRecordView, Model, EnumFieldView) => {

    class EInvoiceModalView extends ModalView {

        templateContent = `<div class="record no-side-margin">{{{record}}}</div>`

        setup() {
            this.headerText = this.translate('E-Invoice', 'labels', 'Invoice');

            this.addButton({
                name: 'export',
                style: 'primary',
                text: this.translate('Export', 'labels'),
                onClick: () => this.actionExport(),
            });

            this.addButton({
                name: 'validate',
                text: this.translate('Validate', 'labels', 'Invoice'),
                onClick: () => this.actionValidate(),
            });

            this.addButton({
                name: 'close',
                label: 'Close',
                onClick: () => this.actionClose(),
            });

            this.formModel = new Model();
            this.formModel.set('format', this.getConfig().get('eInvoiceFormat'));

            this.recordView = new EditRecordView({
                model: this.formModel,
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    view: new EnumFieldView({
                                        name: 'format',
                                        labelText: this.translate('format', 'eInvoiceFields', 'Invoice'),
                                        params: {
                                            options: [
                                                '',
                                                ...this.getMetadata().get('app.eInvoice.formatList'),
                                            ],
                                            translation: 'Invoice.options.eInvoiceFormats',
                                            required: true,
                                        },
                                    }),
                                },
                                false
                            ]
                        ],
                    }
                ],
            });

            // noinspection JSUnresolvedReference
            this.assignView('record', this.recordView, '.record');
        }

        disableExportButtons() {
            this.disableButton('exportUbl');
            this.disableButton('validate');
        }

        enableExportButtons() {
            this.enableButton('exportUbl');
            this.enableButton('validate');
        }

        actionExport() {
            if (this.recordView.validate()) {
                return;
            }

            this.disableExportButtons();
            Espo.Ui.notify(' ... ');

            Espo.Ajax
                .postRequest(`Invoice/${this.model.id}/exportEInvoice`, {
                    format: this.formModel.attributes.format,
                })
                .then(/** Record */data => {
                    this.enableExportButtons();
                    Espo.Ui.notify(false);

                    window.location = `${this.getBasePath()}?entryPoint=download&id=${data.id}`;
                })
                .catch(() => {
                    this.enableExportButtons();
                });
        }

        actionValidate() {
            if (this.recordView.validate()) {
                return;
            }

            this.disableExportButtons();
            Espo.Ui.notify(' ... ');

            Espo.Ajax
                .postRequest(`Invoice/${this.model.id}/validateEInvoice`, {
                    format: this.formModel.attributes.format,
                })
                .then(() => {
                    this.enableExportButtons();
                    Espo.Ui.notify(false);

                    const message = this.translate('invoiceIsValid', 'messages', 'Invoice');

                    Espo.Ui.success(message);
                })
                .catch(() => {
                    this.enableExportButtons();
                });
        }
    }

    return EInvoiceModalView;
});
