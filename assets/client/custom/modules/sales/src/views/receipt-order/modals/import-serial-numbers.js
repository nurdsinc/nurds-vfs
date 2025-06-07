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

define('sales:views/receipt-order/modals/import-serial-numbers',
['views/modal', 'model', 'view-record-helper'] , function (Dep, Model, ViewRecordHelper) {

    return class extends Dep {

        templateContent = `
            <div class="no-side-margin record-container">{{{record}}}</div>
        `

        setup() {
            this.headerText = this.translate('Import Serial Numbers', 'labels', 'ReceiptOrder');

            this.buttonList = [
                {
                    name: 'run',
                    label: 'Run Import',
                    onClick: () => this.run(),
                    disabled: true,
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                },
            ]

            /** @type {{productId: string, productName: string}[]} */
            this.itemList = this.model.get('itemList')
                .filter(item => item.inventoryNumberType === 'Serial');

            this.formModel = new Model();
            this.formModel.setDefs({
                fields: {
                    productId: {
                        type: 'enum',
                        options: this.getProductIds(),
                    },
                    delimiter: {
                        type: 'enum',
                        options: [
                            ',',
                            ';',
                            '\\t',
                            '|',
                        ],
                    },
                    textQualifier: {
                        type: 'enum',
                        options: ['"', '\''],
                    },
                    headerRow: {
                        type: 'bool',
                    },
                    columnNumber: {
                        type: 'enumInt',
                        required: true,
                        options: [
                            1
                        ]
                    },
                    previewItems: {
                        type: 'multiEnum',
                        readOnly: true,
                        displayAsList: true,
                    },
                }
            });

            this.formModel.set({
                delimiter: ',',
                textQualifier: '"',
                headerRow: true,
                productId: this.getProductIds()[0],
                columnNumber: 1,
            });

            this.recordHelper = new ViewRecordHelper();
            this.recordHelper.setFieldStateParam('previewItems', 'hidden', true);

            this.createView('record', 'views/record/edit-for-modal', {
                model: this.formModel,
                selector: '.record-container',
                recordHelper: this.recordHelper,
                detailLayout: this.getDetailLayout(),
                previewItems: [],
            });

            this.listenTo(this.formModel, 'change:content', () => {
                if (this.formModel.get('content')) {
                    this.enableButton('run');
                    this.getRecordView().showField('previewItems');

                    return;
                }

                this.disableButton('run');
                this.getRecordView().hideField('previewItems');
            });

            this.listenTo(this.formModel, 'change', () => {
                const isChanged =
                    this.formModel.hasChanged('content') ||
                    this.formModel.hasChanged('delimiter') ||
                    this.formModel.hasChanged('textQualifier') ||
                    this.formModel.hasChanged('columnNumber') ||
                    this.formModel.hasChanged('headerRow');

                if (!isChanged) {
                    return;
                }

                this.update();
            });

        }

        /**
         * @return {module:views/record/edit}
         */
        getRecordView() {
            return this.getView('record');
        }

        getDetailLayout() {
            return [
                {
                    rows: [
                        [
                            {
                                name: 'productId',
                                options: {
                                    translatedOptions: this.getProductNames(),
                                },
                                labelText: this.translate('product', 'fields', 'ReceiptOrderItem'),
                            },
                            {
                                name: 'content',
                                labelText: this.translate('CSV File', 'labels', 'ReceiptOrder'),
                                view: 'sales:views/receipt-order/fields/csv',
                            },
                        ],
                        [
                            {
                                name: 'delimiter',
                                labelText: this.translate('fieldDelimiter', 'fields', 'ReceiptOrder'),
                            },
                            {
                                name: 'textQualifier',
                                labelText: this.translate('textQualifier', 'fields', 'ReceiptOrder'),
                            },
                        ],
                        [
                            {
                                name: 'headerRow',
                                labelText: this.translate('headerRow', 'fields', 'ReceiptOrder'),
                            },
                            {
                                name: 'columnNumber',
                                labelText: this.translate('columnNumber', 'fields', 'ReceiptOrder'),
                            },
                        ],
                        [
                            {
                                name: 'previewItems',
                                labelText: this.translate('preview', 'fields', 'ReceiptOrder'),
                            },
                            false
                        ]
                    ]
                }
            ];
        }

        /**
         * @return {string[]}
         */
        getProductIds() {
            const list = this.itemList.map(item => item.productId);

            return [...new Set(list)];
        }

        getProductNames() {
            const map = {};

            this.getProductIds().forEach(id => {
                const item = this.itemList.find(item => item.productId === id);

                map[id] = item ? item.productName : id;
            });

            return map;
        }

        run() {
            this.disableButton('run');

            Espo.Ajax
                .postRequest(`ReceiptOrder/${this.model.id}/importSerialNumbers`, {
                    items: this.formModel.get('items'),
                    productId: this.formModel.get('productId'),
                })
                .then(() => {
                    this.model.fetch();

                    Espo.Ui.success('Done');
                    this.close();
                })
                .catch(() => {
                    this.enableButton('run');
                });
        }

        update() {
            const content = this.formModel.get('content');
            const columnIndex = this.formModel.get('columnNumber') - 1;
            const headerRow = this.formModel.get('headerRow');

            if (!content) {
                this.formModel.set({
                    previewItems: [],
                    columnNumber: 1,
                });

                this.getRecordView().resetFieldOptionList('columnNumber');

                return;
            }

            const parsed = this.csvToArray(
                content,
                this.formModel.get('delimiter'),
                this.formModel.get('textQualifier'),
            );

            if (!parsed.length) {
                this.formModel.set({
                    previewItems: [],
                    columnNumber: 1,
                });

                this.getRecordView().resetFieldOptionList('columnNumber');

                return;
            }

            const numbers = [];
            parsed[0].forEach((item, i) => numbers.push(i + 1));
            this.getRecordView().setFieldOptionList('columnNumber', numbers);

            const items = [];

            let i = 0;

            if (headerRow) {
                i++;
            }

            while (i < parsed.length) {
                items.push(parsed[i][columnIndex]);

                i++;
            }

            if (items.length && items[items.length - 1] === '') {
                items.pop();
            }

            this.formModel.set('previewItems', items.slice(0, 10));
            this.formModel.set('items', items);
        }

        csvToArray(input, delimiter, qualifier) {
            delimiter = (delimiter || ',');
            qualifier = (qualifier || '\"');

            delimiter = delimiter.replace(/\\t/, '\t');

            let objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + delimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                    "(?:" + qualifier + "([^"+qualifier+"]*(?:" + qualifier + "" + qualifier+
                    "[^" + qualifier + "]*)*)" + qualifier+"|" +

                    // Standard fields.
                    "([^" + qualifier + "\\" + delimiter + "\\r\\n]*))"
                ),
                'gi'
            );

            const arrData = [[]];
            let arrMatches = null;

            while (arrMatches = objPattern.exec(input)) {
                let strMatchedDelimiter = arrMatches[1];
                let strMatchedValue;

                if (
                    strMatchedDelimiter.length &&
                    (strMatchedDelimiter !== delimiter)
                ) {
                    arrData.push([]);
                }

                if (arrMatches[2]) {
                    strMatchedValue = arrMatches[2].replace(new RegExp( "\"\"", "g" ),  "\"");
                } else {
                    strMatchedValue = arrMatches[3];
                }

                arrData[arrData.length - 1].push(strMatchedValue);
            }

            return arrData;
        }
    }
});
