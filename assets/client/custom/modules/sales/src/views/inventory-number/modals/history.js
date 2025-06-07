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

define('sales:views/inventory-number/modals/history', ['views/modal'], function (Dep) {

    return class extends Dep {

        // language=Handlebars
        templateContent = `
            {{#if dataList.length}}
                <div class="panel">
                    <table class="table table-bordered">
                        <thead>
                        <tr style="user-select: none;">
                            <th></th>
                            <th style="width: 25%"></th>
                            {{#if warehousesEnabled}}
                                <th style="width: 25%">
                                    {{translate 'Warehouse' catehory='scopeNames'}}
                                </th>
                            {{/if}}
                            <th style="width: 14%"></th>
                            <th style="width: 14%; text-align: right">{{translate 'quantity' category='fields' scope='QuoteItem'}}</th>
                        </tr>
                        </thead>
                        <tbody>
                            {{#each dataList}}
                                <tr>
                                    <td>
                                        <a href="#{{orderType}}/view/{{orderId}}">{{orderName}}</a>
                                    </td>
                                    <td>
                                        {{translate orderType category='scopeNames'}}
                                    </td>
                                    {{#if ../warehousesEnabled}}
                                        <td>
                                            {{#if warehouseId}}
                                                <a href="#Warehouse/view/{{warehouseId}}">{{warehouseName}}</a>
                                            {{/if}}
                                        </td>
                                    {{/if}}
                                    <td>
                                        {{date}}
                                    </td>
                                    <td style="text-align: right">
                                        {{quantity}}
                                    </td>
                                </tr>
                            {{/each}}
                        </tbody>
                    </table>
                </div>
            {{else}}
                {{translate 'No Data'}}
            {{/if}}
        `

        backdrop = true

        data() {
            return {
                dataList: this.getDataList(),
                warehousesEnabled: this.getConfig().get('warehousesEnabled'),
            };
        }

        getDataList() {
            return this.dataList.map(item => {
                item = Espo.Utils.clone(item);


                if (item.quantity !== null) {
                    const quantity = item.quantity;

                    item.quantity = this.getHelper().numberUtil.formatFloat(quantity);

                    if (quantity > 0) {
                        item.quantity = '+' + item.quantity;
                    }
                }

                item.date = this.getHelper().dateTime.toDisplayDate(item.date);

                return item;
            });
        }

        setup() {
            this.headerText = this.translate('Inventory History', 'labels', 'InventoryNumber') +
                ' · ' + this.model.get('name');

            this.wait(
                Espo.Ajax.getRequest(`InventoryNumber/${this.model.id}/history`).then(data => {
                    this.dataList = data.list;
                })
            );
        }
    }
});
