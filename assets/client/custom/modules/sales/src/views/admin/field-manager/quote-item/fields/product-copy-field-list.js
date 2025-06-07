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

define('sales:views/admin/field-manager/quote-item/fields/product-copy-field-list',
['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            const ignoreFieldList = [
                'name',
                'listPrice',
                'listPriceCurrency',
                'listPriceConverted',
                'unitPrice',
                'unitPriceCurrency',
                'unitPriceConverted',
                'createdAt',
                'modifiedAt',
                'createdBy',
                'modifiedBy',
            ];

            const itemFieldList = Object.keys(
                this.getMetadata().get(['entityDefs', this.model.scope, 'fields']) || []);

            this.params.options = Object.keys(this.getMetadata().get(['entityDefs', 'Product', 'fields']) || [])
                .filter(item => {
                    if (~ignoreFieldList.indexOf(item)) {
                        return;
                    }

                    if (!~itemFieldList.indexOf(item)) {
                        return;
                    }

                    return true;
                });

            this.translatedOptions = {};

            this.params.options.forEach(item => {
                this.translatedOptions[item] = this.translate(item, 'fields', 'Product');
            });
        },
    });
});
