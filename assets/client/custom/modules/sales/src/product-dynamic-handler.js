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

define('sales:product-dynamic-handler', ['dynamic-handler'], function (Dep) {

    return Dep.extend({

        onChange: function (model, o) {
            if (!o.ui) {
                return;
            }

            this.calculatePrice();
        },

        calculatePrice: function () {
            const pricingType = this.model.get('pricingType');
            const pricingFactor = this.model.get('pricingFactor') || 0.0;

            const roundMultiplier = Math.pow(10, this.recordView.getConfig().get('currencyDecimalPlaces'));
            const defaultCurrency = this.recordView.getConfig().get('defaultCurrency');

            let value;
            let listCurrency;
            let costCurrency;

            const rates = this.recordView.getConfig().get('currencyRates') || {};

            switch (pricingType) {
                case 'Same as List':
                    this.model.set('unitPrice', this.model.get('listPrice'));
                    this.model.set('unitPriceCurrency', this.model.get('listPriceCurrency'));

                    break;

                case 'Discount from List':
                    const currency = this.model.get('listPriceCurrency');
                    value = this.model.get('listPrice');

                    if (value === null) {
                        this.model.set({
                            'unitPrice': null,
                            'unitPriceCurrency': null
                        });

                        return;
                    }

                    value = value - value * pricingFactor / 100.0;

                    this.model.set({
                        'unitPrice': value,
                        'unitPriceCurrency': currency
                    });

                    break;

                case 'Markup over Cost':
                    listCurrency = this.model.get('listPriceCurrency') || defaultCurrency;
                    costCurrency = this.model.get('costPriceCurrency') || defaultCurrency;

                    value = this.model.get('costPrice');

                    if (value === null) {
                        this.model.set({
                            'unitPrice': null,
                            'unitPriceCurrency': null
                        });

                        return;
                    }

                    value = pricingFactor / 100.0 * value + value;

                    value = value * (rates[costCurrency] || 1.0);
                    value = value / (rates[listCurrency] || 1.0);

                    value = Math.round(value * roundMultiplier) / roundMultiplier;

                    this.model.set({
                        'unitPrice': value,
                        'unitPriceCurrency': listCurrency
                    });

                    break;

                case 'Profit Margin':
                    listCurrency = this.model.get('listPriceCurrency') || defaultCurrency;
                    costCurrency = this.model.get('costPriceCurrency') || defaultCurrency;

                    value = this.model.get('costPrice');

                    if (value === null) {
                        this.model.set({
                            'unitPrice': null,
                            'unitPriceCurrency': null
                        });

                        return;
                    }

                    value = value / (1 - pricingFactor / 100.0);

                    value = value * (rates[costCurrency] || 1.0);
                    value = value / (rates[listCurrency] || 1.0);

                    value = Math.round(value * roundMultiplier) / roundMultiplier;

                    this.model.set({
                        'unitPrice': value,
                        'unitPriceCurrency': listCurrency
                    });

                    break;
            }
        },
    });
});
