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

define('sales:views/product/modals/view-price', ['views/modal', 'model'], function (ModalView, Model) {

    /**
     * @extends module:views/modal
     */
    class ViewPriceModalView extends ModalView {

        backdrop = true

        // language=Handlebars
        templateContent = `
            <div class="record no-side-margin">{{{record}}}</div>
        `

        setup() {
            this.headerText = this.translate('View Price', 'labels', 'Product') + ' · ' + this.model.get('name');

            const allowFractionalQuantity = this.model.attributes.allowFractionalQuantity;

            this.formModel = new Model();
            this.formModel.setDefs({
                fields: {
                    account: {
                        type: 'link',
                        entity: 'Account',
                    },
                    priceBook: {
                        type: 'link',
                        entity: 'PriceBook',
                    },
                    quantity: {
                        type: allowFractionalQuantity ? 'float' : 'int',
                    },
                    price: {
                        type: 'currency',
                        readOnly: true,
                    },
                    totalPrice: {
                        type: 'currency',
                        readOnly: true,
                    },
                    currency: {
                        type: 'enum',
                        options: this.getConfig().get('currencyList'),
                    },
                }
            });

            this.formModel.set({
                accountId: null,
                priceBook: null,
                quantity: allowFractionalQuantity ? 1.0: 1,
                currency: this.getConfig().get('defaultCurrency'),
            });

            this.createView('record', 'views/record/edit-for-modal', {
                model: this.formModel,
                selector: '.record',
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    name: 'account',
                                    labelText: this.translate('Account', 'scopeNames'),
                                },
                                {
                                    name: 'priceBook',
                                    labelText: this.translate('PriceBook', 'scopeNames'),
                                }
                            ],
                            [
                                {
                                    name: 'quantity',
                                    labelText: this.translate('Quantity', 'labels', 'Product'),
                                },
                                {
                                    name: 'currency',
                                    labelText: this.translate('currency', 'fields', 'Quote'),
                                },
                            ],
                            [
                                {
                                    name: 'price',
                                    labelText: this.translate('unitPrice', 'fields', 'Product'),
                                },
                                {
                                    name: 'totalPrice',
                                    labelText: this.translate('amount', 'fields', 'Quote'),
                                },
                            ],
                        ],
                    },
                ],
            }).then(/** import('views/record/edit').default */view => {
                !this.getAcl().checkScope('Account') ? view.hideField('account') : null;
                !this.getAcl().checkScope('PriceBook') ? view.hideField('priceBook') : null;

                this.controlTotalPriceField();
                this.listenTo(this.formModel, 'change', () => this.controlTotalPriceField());
            });

            this.listenTo(this.formModel, 'change', (m, o) => {
                if (!o.ui) {
                    return;
                }

                this.loadPrice();
            });
        }

        afterRender() {
            this.loadPrice();

            const element = /** @type {Element} */this.element;

            if (element) {
                element.querySelector('.field[data-name="price"]').classList.add('text-large');
            }
        }

        /**
         * @return {import('views/record/edit').default}
         */
        getRecordView() {
            return this.getView('record');
        }

        loadPrice() {
            if (this.getRecordView().validate()) {
                return;
            }

            Espo.Ui.notify(' ... ');

            Espo.Ajax
                .postRequest('ProductPrice/getSalesPrice', {
                    priceBookId: this.formModel.attributes.priceBookId,
                    accountId: this.formModel.attributes.accountId,
                    items: [{
                        productId: this.model.id,
                        quantity: this.formModel.attributes.quantity,
                    }],
                    currency: this.formModel.attributes.currency,
                    applyAccountPriceBook: true,
                })
                .then(([/** Record */resultItem]) => {
                    Espo.Ui.notify(false);

                    this.formModel.set({
                        price: resultItem.unitPrice,
                        priceCurrency: resultItem.unitPriceCurrency,
                        totalPrice: resultItem.unitPrice * (this.formModel.attributes.quantity || 1.0),
                        totalPriceCurrency: resultItem.unitPriceCurrency,
                    });
                });
        }

        controlTotalPriceField() {
            const quantity = this.formModel.attributes.quantity;

            if (quantity === null || quantity === 1.0) {
                this.getRecordView().hideField('totalPrice');

                return;
            }

            this.getRecordView().showField('totalPrice');
        }
    }

    return ViewPriceModalView;
});
