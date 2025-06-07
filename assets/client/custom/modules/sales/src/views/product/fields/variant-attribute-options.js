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

define('sales:views/product/fields/variant-attribute-options', ['views/fields/base'], function (BaseFieldView) {

    /**
     * @extends module:views/fields/base
     */
    class ProductAttributesView extends BaseFieldView {

        listTemplateContent = `
            {{#each dataList}}
                <span class="label label-default">{{name}}</span>
            {{/each}}
        `

        detailTemplateContent = `
            {{#if isSet}}
                {{#unless isEmpty}}
                    {{#each dataList}}
                        <div class="multi-enum-label-container">
                            <span class="label label-default label-md">{{name}}</span>
                        </div>
                    {{/each}}
                {{else}}
                    <span class="none-value">{{translate 'None'}}</span>
                {{/unless}}
            {{else}}
                <span class="loading-value">...</span>
            {{/if}}
        `

        // noinspection JSCheckFunctionSignatures
        data() {
            return {
                isSet: this.model.has(this.idsAttribute),
                dataList: this.getDataList(),
                isEmpty: this.getDataList().length === 0,
            };
        }

        init() {
            super.init();
        }

        setup() {
            super.setup();

            this.idsAttribute = 'variantAttributeOptionsIds';
            this.namesAttribute = 'variantAttributeOptionsNames';
        }

        /**
         * @return {{id: string, name: string}[]}
         */
        getDataList() {
            /** @type {string[]} */
            const ids = this.model.get(this.idsAttribute) || [];
            const names = this.model.get(this.namesAttribute) || {};

            return ids.map(id => {
               return {
                   id: id,
                   name: names[id] ?? id,
               };
            });
        }
    }

    return ProductAttributesView;
});
