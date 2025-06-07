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

define('sales:views/price-rule/fields/target', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        listTemplateContent: `
            {{valueTranslated}}
        `,

        getAttributeList: function () {
            return [
                'target',
                'conditionId',
                'productCategoryId',
            ];
        },

        data: function () {
            const data = Dep.prototype.data.call(this);

            if (this.isListMode()) {
                const value = this.model.get(this.name);

                if (value === 'All') {
                    data.valueTranslated = this.getLanguage().translateOption('All', 'target', 'PriceRule');
                }
                else if (value === 'Product Category') {
                    data.valueTranslated = this.translate('category', 'fields', 'Product') + ' · ' +
                        this.model.get('productCategoryName');
                }
                else if (value === 'Conditional') {
                    data.valueTranslated = this.model.get('conditionName') || this.model.get('conditionId');
                }
            }

            return data;
        },
    });
});
