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

define('sales:views/product/record/panels/warehouses-quantity',
['views/record/panels/bottom', 'collection'], function (Dep, Collection) {

    return class extends Dep {

        // language=Handlebars
        templateContent = `
            <div class="list-container">{{{record}}}</div>
        `

        setup() {
            super.setup();

            if (!this.recordHelper.getPanelStateParam(this.panelName, 'hiddenLocked')) {
                this.setupRecord();
            }
        }

        setupRecord() {
            this.setupRecordParams();

            this.collection = new Collection([], {
                url: this.url,
                entityType: 'Warehouse',
                defs: this.getMetadata().get('entityDefs.Warehouse'),
            });

            this.createView('record', 'views/record/list', {
                collection: this.collection,
                selector: '.list-container',
                rowActionsDisabled: true,
                massActionsDisabled: true,
                listLayout: this.listLayout,
            });

            this.once('after:render', () => this.collection.fetch());

            this.listenTo(this.model, 'sync', (m, o) => {
                if (!o.highlight) {
                    return;
                }

                this.collection.fetch();
            });
        }

        actionRefresh() {
            if (!this.collection) {
                return;
            }

            this.collection.fetch();
        }

        setupRecordParams() {
            this.url = `Product/${this.model.id}/warehousesQuantity`;

            this.listLayout = [
                {
                    name: 'name',
                    customLabel: this.translate('name', 'fields'),
                    notSortable: true,
                    link: true,
                },
                {
                    name: 'quantity',
                    customLabel: this.translate('quantity', 'fields', 'Product'),
                    notSortable: true,
                    width: 18,
                    view: 'views/fields/int',
                },
                {
                    name: 'quantityOnHand',
                    customLabel: this.translate('quantityOnHand', 'fields', 'Product'),
                    notSortable: true,
                    width: 18,
                    view: 'views/fields/int',
                },
                {
                    name: 'quantityReserved',
                    customLabel: this.translate('quantityReserved', 'fields', 'Product'),
                    notSortable: true,
                    width: 18,
                    view: 'views/fields/int',
                },
                {
                    name: 'quantitySoftReserved',
                    customLabel: this.translate('quantitySoftReserved', 'fields', 'Product'),
                    notSortable: true,
                    width: 18,
                    view: 'views/fields/int',
                },
            ];
        }
    }
});
