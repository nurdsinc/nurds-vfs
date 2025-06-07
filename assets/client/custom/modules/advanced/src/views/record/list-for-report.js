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
 * License ID: 666d14eca4fd54205a89f2a8f2b55ea2
 ************************************************************************************/

define('advanced:views/record/list-for-report', ['views/record/list'], function (Dep) {

    return Dep.extend({

        forcedCheckAllResultMassActionList: ['export'],
        checkAllResultMassActionList: ['export'],

        export: function () {
            let data = {};

            let fieldList = null;

            if (this.options.listLayout) {
                fieldList = [];

                this.options.listLayout.forEach(item => {
                    fieldList.push(item.name);
                });
            }

            if (!this.allResultIsChecked) {
                data.ids = this.checkedList;
            }

            data.id = this.options.reportId;

            if ('runtimeWhere' in this.options) {
                data.where = this.options.runtimeWhere;
            }

            if ('groupValue' in this.options) {
                data.groupValue = this.options.groupValue;
            }

            if ('groupIndex' in this.options) {
                data.groupIndex = this.options.groupIndex;
            }

            if (this.options.groupValue2 !== undefined) {
                data.groupValue2 = this.options.groupValue2;
            }

            data.sortBy = this.collection.sortBy;
            data.asc = this.collection.asc;

            data.orderBy = this.collection.orderBy;
            data.order = this.collection.order;

            let url = 'Report/action/exportList';

            Dep.prototype.export.call(this, data, url, fieldList);
        },
    });
});
