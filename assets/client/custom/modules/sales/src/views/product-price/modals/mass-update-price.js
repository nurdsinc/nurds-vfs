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

define('sales:views/product-price/modals/mass-update-price',
['views/modal', 'views/record/edit-for-modal', 'model'], (ModalView, EditView, Model) => {

    /**
     * @extends {import('views/modal').default}
     */
    class Handler extends ModalView {

        // language=Handlebars
        templateContent = `
            <div class="record no-side-margin">{{{record}}}</div>
        `

        setup() {
            this.entityType = this.options.entityType;
            this.params = this.options.params;
            this.onDone = /** @type {function} */this.options.onDone;

            this.headerText = this.translate('updatePrice', 'massActions', 'ProductPrice');

            this.buttonList = [
                {
                    name: 'process',
                    label: 'Process',
                    onClick: () => this.process(),
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: () => this.close(),
                },
            ];

            this.model = new Model();
            this.model.setDefs({
                fields: this.getFieldDefs(),
            });
            this.model.populateDefaults();

            this.editView = new EditView({
                model: this.model,
                detailLayout: this.getDetailLayout(),
            });

            // noinspection JSUnresolvedReference
            this.assignView('record', this.editView, '.record');
        }

        process() {
            if (this.editView.validate()) {
                return;
            }

            const actionData = {...this.model.attributes};

            this.disableButton('process');
            Espo.Ui.notify(' ... ');

            Espo.Ajax
                .postRequest('MassAction', {
                    entityType: this.entityType,
                    action: 'updatePrice',
                    params: this.params,
                    data: actionData,
                })
                .then(/** {count: number} */result => {
                    const msg = this.translate('priceMassUpdated', 'messages', 'ProductPrice')
                        .replace('{count}', result.count.toString());

                    this.close();
                    Espo.Ui.notify(msg, 'success', 0, {suppress: true, closeButton: true});

                    this.onDone();
                })
                .catch(() => {
                    this.enableButton('process')
                });
        }

        getFieldDefs() {
            const defs = {
                percentage: {
                    type: 'base',
                    view: 'sales:views/price-rule/fields/percentage',
                },
                discount: {
                    type: 'float',
                },
                roundingMethod: {
                    type: 'enum',
                    options: [
                        'Half Up',
                        'Up',
                        'Down'
                    ],
                    default: 'Half Up',
                },
                roundingFactor: {
                    type: 'float',
                    required: true,
                    min: 0.001,
                    default: 0.01,
                },
                surcharge: {
                    type: 'float',
                },
            };

            if (this.entityType === 'Product') {
                defs.targetField = {
                    type: 'enum',
                    required: true,
                    options: [
                        'costPrice',
                        'listPrice',
                        'unitPrice',
                    ],
                    translation: 'Product.fields',
                };
            }

            return defs;
        }

        getDetailLayout() {
            const layout = [
                {
                    rows: [
                        [
                            {
                                name: 'percentage',
                                labelText: this.translate('percentage', 'fields', 'PriceRule'),
                            },
                            false
                        ],
                        [
                            {
                                name: 'roundingMethod',
                                labelText: this.translate('roundingMethod', 'fields', 'PriceRule'),
                            },
                            {
                                name: 'roundingFactor',
                                labelText: this.translate('roundingFactor', 'fields', 'PriceRule'),
                            }
                        ],
                        [
                            {
                                name: 'surcharge',
                                labelText: this.translate('surcharge', 'fields', 'PriceRule'),
                            },
                            false
                        ],
                    ]
                }
            ];

            if (this.entityType === 'Product') {
                layout[0].rows.unshift([
                    {
                        name: 'targetField',
                        labelText: this.translate('Field', 'labels'),
                    },
                    false
                ])
            }

            return layout;
        }
    }

    return Handler;
});
