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

define('sales:quote-calculation-handler', [], function () {

    const QuoteCalculationHandler = function (config, fieldManager, metadata, hasListPrice) {
        this.config = config;
        /** @type {module:field-manager} */
        this.fieldManager = fieldManager;
        /** @type {module:metadata} */
        this.metadata = metadata;
        this.hasListPrice = hasListPrice;

        this.inventoryTransactionsEnabled = this.config.get('inventoryTransactionsEnabled') || false;
    }

    _.extend(QuoteCalculationHandler.prototype, {

        productListPriceField: 'listPrice',
        productUnitPriceField: 'unitPrice',

        boundCurrencyFieldList: [
            'shippingCost',
            'taxAmount',
            'discountAmount',
            'amount',
            'preDiscountedAmount',
            'grandTotalAmount'
        ],

        boundCurrencyItemFieldList: [
            'listPrice',
            'unitPrice',
            'amount',
        ],

        listenedAttributeList: [
            'taxRate',
            'shippingCost',
        ],

        listenedItemFieldList: [
            'name',
            'quantity',
            'unitPrice',
            'listPrice',
            'discount',
        ],

        setAmountValueToObject: function (model, field, value, o) {
            o[field] = model.getFieldParam(field, 'decimal') ?
                value.toString() :
                value;
        },

        round: function (value) {
            const roundMultiplier = Math.pow(10, this.config.get('currencyDecimalPlaces'));

            return Math.round(value * roundMultiplier) / roundMultiplier;
        },

        calculate: function (model) {
            /**
             * @type {
             *      {
             *         listPrice?: number,
             *         unitPrice: number,
             *         quantity: number,
             *         amount: number,
             *         taxRate?: number,
             *      }[]
             * }
             */
            const itemList = model.get('itemList') || [];
            const currency = model.get('amountCurrency');

            const attributes = {};

            let amount = 0;

            itemList.forEach(item => {
                amount += item.amount || 0;
                amount = this.round(amount);
            });

            let preDiscountedAmount = 0;

            itemList.forEach(item => {
                const itemPrice = this.hasListPrice ?
                    (item.listPrice || 0) :
                    (item.unitPrice || 0);

                const itemQuantity = item.quantity || 0;

                preDiscountedAmount += this.round(itemPrice * itemQuantity);
                preDiscountedAmount = this.round(preDiscountedAmount);
            });

            let taxAmount = 0;

            itemList.forEach(item => {
                const itemAmount = item.amount || 0;
                const itemTaxRate = item.taxRate || 0;

                taxAmount += this.round(itemAmount * (itemTaxRate / 100.0));
                taxAmount = this.round(taxAmount);
            });

            const discountAmount = this.round(preDiscountedAmount - amount);
            const shippingCost = model.get('shippingCost') || 0;
            const grandTotalAmount = this.round(amount + taxAmount + shippingCost);

            this.setAmountValueToObject(model, 'amount', amount, attributes);
            this.setAmountValueToObject(model, 'preDiscountedAmount', preDiscountedAmount, attributes);
            this.setAmountValueToObject(model, 'taxAmount', taxAmount, attributes);
            this.setAmountValueToObject(model, 'discountAmount', discountAmount, attributes);
            this.setAmountValueToObject(model, 'grandTotalAmount', grandTotalAmount, attributes);

            attributes.preDiscountedAmountCurrency = currency;
            attributes.taxAmountCurrency = currency;
            attributes.discountAmountCurrency = currency;
            attributes.grandTotalAmountCurrency = currency;

            model.set(attributes);
        },

        calculateItem: function (model, field) {
            const attributes = {};

            const quantity = model.get('quantity');
            const listPrice = this.hasListPrice ?
                model.get('listPrice') :
                model.get('unitPrice');

            let unitPrice;
            let discount;

            if (field === 'discount') {
                discount = parseFloat(model.get('discount') || 0);

                unitPrice = this.round(listPrice - listPrice * (discount / 100));

                this.setAmountValueToObject(model, 'unitPrice', unitPrice, attributes);
            }
            else {
                unitPrice = parseFloat(model.get('unitPrice'));

                discount = 0;

                if (listPrice) {
                    discount = ((listPrice - unitPrice) / listPrice) * 100;
                }

                discount = this.round(discount);

                this.setAmountValueToObject(model, 'discount', discount, attributes);
            }

            const amount = !isNaN(unitPrice) ?
                this.round(quantity * unitPrice) :
                null;

            this.setAmountValueToObject(model, 'amount', amount, attributes);

            model.set(attributes);
        },

        selectProduct: function (model, product) {
            let sourcePrice;
            let sourceCurrency;
            let value;

            const targetCurrency = model.get('unitPriceCurrency');
            const rates = this.config.get('currencyRates') || {};

            sourcePrice = product.get(this.productUnitPriceField) || 0;
            sourceCurrency = product.get(this.productUnitPriceField + 'Currency');

            value = sourcePrice;
            value = value * (rates[sourceCurrency] || 1.0);
            value = value / (rates[targetCurrency] || 1.0);

            const unitTargetPrice = this.round(value);

            sourcePrice = product.get(this.productListPriceField) || 0;
            sourceCurrency = product.get(this.productListPriceField + 'Currency');

            value = sourcePrice;
            value = value * (rates[sourceCurrency] || 1.0);
            value = value / (rates[targetCurrency] || 1.0);

            const listTargetPrice = this.round(value);

            let discount = listTargetPrice ?
                ((listTargetPrice - unitTargetPrice) / listTargetPrice) * 100 :
                0;

            discount = this.round(discount);

            const attributes = {
                productId: product.id,
                productName: product.get('name'),
                name: product.get('name'),
                unitPriceCurrency: targetCurrency,
                unitWeight: product.get('weight') || null,
            };

            if (product.get('isTaxFree')) {
                attributes.taxRate = 0;
            }

            if (this.hasListPrice) {
                attributes.discount = discount;
                attributes.listPriceCurrency = targetCurrency;

                this.setAmountValueToObject(product, 'listPrice', listTargetPrice, attributes);
            }

            this.setAmountValueToObject(product, 'unitPrice', unitTargetPrice, attributes);

            model.set(attributes);
        },

        getSelectProductAttributeList: function (model) {
            const copyFieldList = this.metadata
                .get(['entityDefs', model.entityType + 'Item', 'fields', 'product', 'copyFieldList']) || [];

            const attributeList = [
                'name',
                'unitPrice',
                'unitPriceCurrency',
                'listPrice',
                'listPriceCurrency',
                'costPrice',
                'costPriceCurrency',
                'weight',
                'isTaxFree',
                'inventoryNumberType',
                'isInventory',
                'allowFractionalQuantity',
            ];

            copyFieldList.forEach(field => {
                this.fieldManager.getEntityTypeFieldAttributeList('Product', field)
                    .forEach(attribute => attributeList.push(attribute));
            });

            const isPurchase = model.entityType === 'PurchaseOrder';

            if (isPurchase && model.get('supplierId')) {
                attributeList.push('unitPriceSupplier_' + model.get('supplierId'));
            }

            if (!isPurchase && model.get('priceBookId')) {
                attributeList.push('unitPricePriceBook_' + model.get('priceBookId'));
            }

            if (this.inventoryTransactionsEnabled && model.id) {
                attributeList.push('quantity_' + model.entityType + '_' + model.id);
            }

            return attributeList;
        },
    });

    QuoteCalculationHandler.extend = Backbone.Router.extend;

    return QuoteCalculationHandler;
});
