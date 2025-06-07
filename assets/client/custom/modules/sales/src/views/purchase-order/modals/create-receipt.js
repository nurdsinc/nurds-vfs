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

define('sales:views/purchase-order/modals/create-receipt', ['views/modal'], function (ModalView) {

    /**
     * @extends module:views/modal
     */
    class CreateReceiptModal extends ModalView {

        // language=Handlebars
        templateContent = `
            <div class="item-container record">
                <div class="record-container">{{{record}}}</div>
            </div>
        `

        data() {
            return {
                collection: this.collection,
            };
        }

        setup() {
            this.headerText = this.translate('Create Receipt', 'labels', 'PurchaseOrder');

            this.buttonList = [
                {
                    name: 'create',
                    label: 'Create',
                    style: 'danger',
                    onClick: () => this.actionCreate(),
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: () => this.close(),
                }
            ];

            this.wait(
                Promise
                    .all([
                        this.setupLayout(),
                        this.setupAttributes(),
                    ])
                    .then(() => this.setupModel())
                    .then(() => this.createRecordView())
            );
        }

        setupAttributes() {
            const linkAttribute = Espo.Utils.lowerCaseFirst(this.model.entityType) + 'Id';
            const url = this.model.entityType === 'ReturnOrder' ?
               'ReceiptOrder/action/getAttributesFromReturnOrder' :
               'ReceiptOrder/action/getAttributesFromPurchaseOrder';

            return Espo.Ajax
                .getRequest(url, {[linkAttribute]: this.model.id})
                .then(attributes => {
                    this.attributes = attributes;
                });
        }

        setupLayout() {
            return new Promise(resolve => {
                this.getHelper().layoutManager.get('ReceiptOrder', 'detailCreateFromPurchaseOrder', layout => {
                    this.detailLayout = Espo.Utils.cloneDeep(layout);

                    this.detailLayout.push({
                        rows: [
                            [
                                {
                                    name: 'itemList',
                                    noLabel: true,
                                }
                            ]
                        ],
                    });

                    resolve();
                });
            });
        }

        createRecordView() {
            return this.createView('record', 'views/record/edit-for-modal', {
                model: this.receiptModel,
                selector: `.record-container`,
                detailLayout: this.detailLayout,
            });
        }

        setupModel() {
            return this.getModelFactory().create('ReceiptOrder')
                .then(model => {
                    model.populateDefaults();

                    model.set(
                        Espo.Utils.cloneDeep(this.attributes)
                    );

                    model.set({
                        assignedUserId: this.model.get('assignedUserId'),
                        assignedUserName: this.model.get('assignedUserName'),
                    });

                    model.set(this.attributes);

                    this.receiptModel = model;
                });
        }

        /**
         *
         * @return {module:views/record/edit}
         */
        getRecordView() {
            return this.getView('record');
        }

        actionCreate() {
            if (this.getRecordView().validate()) {
                return;
            }

            Espo.Ui.notify(' ... ');

            this.disableButton('create');

            this.receiptModel
                .save()
                .then(response => {
                    const url = '#ReceiptOrder/view/' + response.id;
                    const name = response.name;

                    const msg = this.translate('Created')  + '\n' + `[${name}](${url})`;

                    Espo.Ui.notify(msg, 'success', 4000, {suppress: true});

                    this.trigger('done');
                    this.close();
                })
                .catch(() => {
                    this.enableButton('create');
                });
        }
    }

    return CreateReceiptModal;
});
