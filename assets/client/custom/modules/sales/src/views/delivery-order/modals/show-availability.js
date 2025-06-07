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

define('sales:views/delivery-order/modals/show-availability', ['views/modal'], function (ModalView) {

    class ShowAvailabilityModalView extends ModalView {

        backdrop = true

        // language=Handlebars
        templateContent = `
            <div class="panel panel-default center-block" style="width: 90%">
                <table class="table table-bordered table-bordered-inside radius">
                    <tr>
                        <th style="width: 42%" class="text-muted">
                            {{translate 'Product' category='scopeNames'}}
                        </th>
                        <th style="width: 30%" class="text-muted">
                            {{#if hasWarehouses}}
                                {{translate 'Warehouse' category='scopeNames'}}
                            {{/if}}
                        </th>
                        <th class="text-muted">
                            {{translate 'quantity' category='fields' scope='Product'}}
                        </th>
                        <th class="text-muted">
                            {{translate 'quantityOnHand' category='fields' scope='Product'}}
                        </th>
                    </tr>
                    {{#each dataList}}
                        <tr class="{{#if ../hasWarehouses}}accented{{/if}}">
                            <td>
                                <a href="#Product/view/{{id}}" target="_blank">{{name}}</a>
                            </td>
                            <td></td>
                            {{#if ../hasWarehouses}}
                                <td></td>
                                <td></td>
                            {{else}}
                                <td
                                    style="text-align: right;"
                                    class="{{#if notAvailable}}text-danger{{/if}}"
                                >
                                    {{quantityString}}
                                </td>
                                <td
                                    style="text-align: right;"
                                    class=""
                                >
                                    {{quantityOnHandString}}
                                </td>
                            {{/if}}
                        </tr>
                        {{#each warehouses}}
                            <tr>
                                <td></td>
                                <td>
                                    <a href="#Warehouse/view/{{id}}" target="_blank">{{name}}</a>
                                </td>
                                <td style="text-align: right">
                                    {{quantityString}}
                                </td>
                                <td style="text-align: right">
                                    {{quantityOnHandString}}
                                </td>
                            </tr>
                        {{/each}}
                        {{#if ../hasWarehouses}}
                            <tr>
                                <td class="text-muted">{{translate 'Total' scope='DeliveryOrder'}}</td>
                                <td></td>
                                <td
                                    style="text-align: right;"
                                    class="text-bold {{#if notAvailable}}text-danger{{else}}text-muted{{/if}}"
                                >
                                    {{quantityString}}
                                </td>
                                <td
                                style="text-align: right;"
                                    class="text-bold text-muted"
                                >
                                    {{quantityOnHandString}}
                                </td>
                            </tr>
                        {{/if}}
                    {{/each}}
                </table>
            </div>
        `

        data() {
            return {
                dataList: this.dataList,
                hasWarehouses: this.getConfig().get('warehousesEnabled'),
            };
        }

        setup() {
            this.headerText = this.translate('Availability', 'labels', 'DeliveryOrder');

            this.dataList = this.prepareDataList(this.options.inventoryData);
        }

        /**
         * @param {
         *     {
         *         quantity: number,
         *         quantityOnHand: number,
         *         warehouses: {
         *             quantity: number,
         *             quantityOnHand: number,
         *         }[],
         *     }[]
         * } dataList
         * @return {*}
         */
        prepareDataList(dataList) {
            dataList = Espo.Utils.cloneDeep(dataList);

            dataList.forEach(item => {
                item.quantityString = this.getHelper().numberUtil.formatFloat(item.quantity);
                item.quantityOnHandString = this.getHelper().numberUtil.formatFloat(item.quantityOnHand);
                item.notAvailable = item.quantity <= 0;

                item.warehouses = item.warehouses.filter(item => item.quantity > 0);

                item.warehouses.forEach(item => {
                    item.quantityString = this.getHelper().numberUtil.formatFloat(item.quantity);
                    item.quantityOnHandString = this.getHelper().numberUtil.formatFloat(item.quantityOnHand);
                });
            });

            return dataList;
        }
    }

    return ShowAvailabilityModalView;
});
