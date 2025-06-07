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

define('sales:views/quote-item/fields/name', ['views/fields/varchar'], function (Dep) {

    return Dep.extend({

        detailTemplate: 'sales:quote-item/fields/name/detail',
        listTemplate: 'sales:quote-item/fields/name/detail',
        listLinkTemplate: 'sales:quote-item/fields/name/list-link',
        editTemplate: 'sales:quote-item/fields/name/edit',

        targetBlank: false,

        data: function () {
            const data = Dep.prototype.data.call(this);

            const actualQuantity = this.getActualInventoryQuantity();
            const availableQuantity = this.getInventoryQuantity();

            const notEnough = actualQuantity - this.model.get('quantity') < 0;
            const notEnoughAvailable = availableQuantity - this.model.get('quantity') < 0;

            let style = 'success';
            let message = 'enoughQuantity';

            if (notEnough) {
                style = 'danger';
                message = 'notEnoughQuantity';
            }
            else if (notEnoughAvailable) {
                style = 'warning';
                message = 'softNotEnoughQuantity';
            }

            data.productSelectDisabled = this.isNotProduct();
            data.isProduct = !!this.model.get('productId');
            data.productId = this.model.get('productId');
            data.hasSelectProduct = this.hasSelectProduct;
            data.hasInventoryQuantity = actualQuantity !== null;
            data.notEnough = notEnough;
            data.warning = notEnoughAvailable || notEnough;
            data.style = style;
            data.targetBlank = this.targetBlank;
            data.message = message;

            return data;
        },

        afterRenderDetail: function () {
            if (this.getInventoryQuantity() !== null) {
                this.addPopover();
            }
        },

        addPopover: function () {
            const inventoryQuantity = this.getInventoryQuantity();
            const onHandQuantity = this.getInventoryOnHandQuantity();
            const totalQuantity = this.getInventoryTotalQuantity();
            const inventoryNumberQuantity = this.getInventoryNumberQuantity();

            const $el = this.$el.find('a.inventory-info');

            let availabilityQuantity = inventoryQuantity;

            if (inventoryNumberQuantity !== null) {
                availabilityQuantity = inventoryNumberQuantity;
            }
            else if (onHandQuantity !== null) {
                availabilityQuantity = onHandQuantity;
            }

            const lackingAvailableQuantity = this.model.get('quantity') - inventoryQuantity;
            const lackingQuantity = this.model.get('quantity') - availabilityQuantity;

            const items = [];

            if (lackingQuantity > 0) {
                items.push([
                    this.translate('lackingQuantityInfo', 'texts', 'Quote'),
                    lackingQuantity.toString()
                ]);
            }

            let quantityLabel = 'availableQuantityInfo';
            let totalLabel = 'totalAvailableQuantityInfo';

            if (this.isReserved()) {
                quantityLabel = 'onHandQuantityInfo';
                totalLabel = 'totalOnHandQuantityInfo';
            }

            if (inventoryNumberQuantity !== null) {
                let label = 'onHandInventoryNumberInfo';

                if (this.model.get('inventoryNumberType') === 'Batch') {
                    label = 'onHandBatchInfo'
                }
                else if (this.model.get('inventoryNumberType') === 'Serial') {
                    label = 'onHandSerialInfo'
                }

                items.push([
                    this.translate(label, 'texts', 'Quote'),
                    this.getHelper().numberUtil.formatFloat(inventoryNumberQuantity)
                ]);
            }

            if (!this.isReserved() && onHandQuantity !== null) {
                items.push([
                    this.translate('onHandQuantityInfo', 'texts', 'Quote'),
                    this.getHelper().numberUtil.formatFloat(onHandQuantity)
                ]);
            }

            items.push([
                this.translate(quantityLabel, 'texts', 'Quote'),
                inventoryQuantity.toString()
            ]);

            if (totalQuantity !== null) {
                items.push([
                    this.translate(totalLabel, 'texts', 'Quote'),
                    this.getHelper().numberUtil.formatFloat(totalQuantity)
                ]);
            }

            const contentHtml =
                '<div>' +
                items.map(pair => {
                    const left = this.getHelper().escapeString(pair[0]);
                    const right = this.getHelper().escapeString(pair[1]);

                    return `<div class="clearfix">
                            <div class="pull-left">${left} &nbsp;</div>
                            <div class="pull-right">${right}</div>
                            </div>`;
                }).join('') +
                '</div>';

            if ($el.length) {
                Espo.Ui.popover($el[0], {content: contentHtml}, this);
            }
        },

        isReserved: function () {
            if (!this.parentModel) {
                return false;
            }

            const entityType = this.parentModel.entityType;

            if (!['DeliveryOrder', 'TransferOrder'].includes(entityType)) {
                return false;
            }

            return (this.getMetadata().get(`scopes.${entityType}.reserveStatusList`) || [])
                .includes(this.parentModel.get('status'));
        },

        getInventoryData: function () {
            if (this.isNotProduct()) {
                return {};
            }

            if (!this.parentModel) {
                return {};
            }

            if (!this.parentModel.hasField('inventoryData')) {
                return {};
            }

            const data = this.parentModel.get('inventoryData') || {};
            const id = this.model.id;

            return data[id] || {};
        },

        getActualInventoryQuantity: function () {
            const quantity = this.getInventoryNumberQuantity();

            if (quantity !== null) {
                return quantity;
            }

            const onHand = this.getInventoryOnHandQuantity();

            if (onHand !== null) {
                return onHand;
            }

            return this.getInventoryQuantity();
        },

        /**
         * @return {number|null}
         */
        getInventoryQuantity: function () {
            const data = this.getInventoryData();

            if (!('quantity' in data)) {
                return null;
            }

            return data.quantity;
        },

        /**
         * @return {number|null}
         */
        getInventoryOnHandQuantity: function () {
            const data = this.getInventoryData();

            if (!('onHandQuantity' in data)) {
                return null;
            }

            return data.onHandQuantity;
        },

        /**
         * @return {number|null}
         */
        getInventoryTotalQuantity: function () {
            const data = this.getInventoryData();

            if (!('totalQuantity' in data)) {
                return null;
            }

            return data.totalQuantity;
        },

        /**
         * @return {number|null}
         */
        getInventoryNumberQuantity: function () {
            const data = this.getInventoryData();

            if (!('inventoryNumberQuantity' in data)) {
                return null;
            }

            return data.inventoryNumberQuantity;
        },

        isNotProduct: function () {
            return (!this.model.get('productId') && this.model.get('name') && this.model.get('name') !== '');
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.parentModel = this.options.parentModel;

            this.hasSelectProduct = this.getAcl().checkScope('Product');

            this.events['auxclick a[href]:not([role="button"])'] = e => this.onAuxclick(e);

            this.on('change', () => {
                this.handleSelectProductVisibility();
            });

            this.listenTo(this.model, 'after-product-select', () => {
                this.handleSelectProductVisibility();
                this.handleNameAvailability();

                this.trigger('change');
            });

            /*if (
                this.parentModel &&
                this.parentModel.entityType === 'DeliveryOrder'
            ) {
                this.listenTo(this.parentModel, 'change:warehouseId', () => {
                    this.reRender();
                });
            }*/
        },

        onAuxclick: function (e) {
            let isCombination = e.button === 1 && (e.ctrlKey || e.metaKey);

            if (!isCombination) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            this.quickView();
        },

        quickView: function () {
            Espo.loader.requirePromise('helpers/record-modal')
                .then(RecordModal => {
                    const helper = new RecordModal(this.getMetadata(), this.getAcl());

                    const id = this.model.get('productId');

                    if (!id) {
                        return;
                    }

                    helper.showDetail(this, {
                        id: id,
                        scope: 'Product',
                    });
                });
        },

        handleSelectProductVisibility: function () {
            if (this.isNotProduct()) {
                this.$el.find('[data-action="selectProduct"]')
                    .addClass('disabled')
                    .attr('disabled', 'disabled');

                return;
            }

            this.$el.find('[data-action="selectProduct"]')
                .removeClass('disabled')
                .removeAttr('disabled');
        },

        handleNameAvailability: function () {
            if (this.model.get('productId')) {
                this.$element.attr('readonly', true);
            }
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.handleSelectProductVisibility();
        },
    });
});
