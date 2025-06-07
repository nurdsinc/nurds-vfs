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

define('sales:views/delivery-order/validity', ['view'], function (View) {

    class ValidityView extends View {

        // language=Handlebars
        templateContent = `
            {{#if isValid}}
                &nbsp;
            {{else}}
                <span class="label label-danger label-md">{{translate 'Invalid' scope='DeliveryOrder'}}</span>
                <a
                    role="button"
                    data-role="info"
                    class="text-muted"
                ><span class="fas fa-info-circle"></span></a>
                &nbsp;
            {{/if}}
        `

        data() {
            const data = this.getValidityData();

            return {
                isValid: data.isValid,
            };
        }

        setup() {
            this.listenTo(this.model, 'change', () => this.reRender());
            this.listenTo(this.collection, 'change', () => this.reRender());
        }

        afterRender() {
            const infoEl = this.element.querySelector('[data-role="info"]');

            const productList = this.getValidityData().productList;

            const infoText =
                '<ul>' +
                this.composeInfoTextList(productList)
                    .map(item => '<li>' + item + '</li>').join('') +
                '</ul>';

            Espo.Ui.popover(infoEl, {
                content: infoText,
            }, this);
        }

        getValidityData() {
            const map = {};

            const productList = [];

            (this.model.get('itemList') || []).forEach(item => {
                const productId = item.productId;
                const productName = item.productName;
                const quantity = item.quantity;

                if (!productId || !quantity) {
                    return;
                }

                if (!(productId in map)) {
                    map[productId] = 0.0;

                    productList.push({
                        id: productId,
                        name: productName,
                    });
                }

                map[productId] += quantity;
            });

            productList.forEach(item => {
                item.quantity = map[item.id];
            });

            const actualMap = {};

            this.collection.forEach(model => {
                const itemList = model.get('itemList') || [];

                itemList.forEach(item => {
                    const productId = item.productId;
                    const quantity = item.quantity;

                    if (!productId || !quantity) {
                        return;
                    }

                    if (!(productId in actualMap)) {
                        actualMap[productId] = 0.0;
                    }

                    actualMap[productId] += quantity;
                });
            });

            let isInvalid = false;

            productList.forEach(item => {
                item.actualQuantity = actualMap[item.id] || 0.0;
                item.diffQuantity = item.actualQuantity - item.quantity;

                if (item.diffQuantity !== 0.0) {
                    isInvalid = true;
                }
            });

            return {
                isValid: !isInvalid,
                productList: productList,
            };
        }

        /**
         * @param {{name: string, diffQuantity: number}[]} productList
         */
        composeInfoTextList(productList) {
            const textList = [];

            productList
                .filter(item => item.diffQuantity)
                .forEach(item => {
                    let text = item.name + ' – ';

                    const diffAbs = Math.abs(item.diffQuantity);

                    const msg = item.diffQuantity > 0 ?
                        this.translate('itemTooMany', 'texts', 'DeliveryOrder') :
                        this.translate('itemTooFew', 'texts', 'DeliveryOrder');

                    text += msg.replace('{number}', this.getHelper().numberUtil.formatFloat(diffAbs));

                    text = this.getHelper().escapeString(text);

                    textList.push(text);
                });

            return textList;
        }
    }

    return ValidityView;
});
