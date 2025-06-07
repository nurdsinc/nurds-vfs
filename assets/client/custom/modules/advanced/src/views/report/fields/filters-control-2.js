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

define('advanced:views/report/fields/filters-control-2', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        editTemplate: 'advanced:report/fields/filters-control-2/edit',
        detailTemplate: 'advanced:report/fields/filters-control-2/detail',

        setup: function () {
            var entityType = this.model.get('entityType');
            var dataList = this.model.get('filtersDataList') || [];

            // for backward compatibility
            if (!dataList.length) {
                var filterList = this.model.get('filters') || [];
                var filtersData = this.model.get('filtersData') || {};

                filterList.forEach(function (item) {
                    if (!(item in filtersData)) {
                        return;
                    }

                    var data = {};

                    data.id = Math.random().toString(16).slice(2);
                    data.name = item;

                    data.params = filtersData[item];
                    dataList.push(data);
                }, this);
            }

            this.createView('node', 'advanced:views/report/filters/node', {
                el: this.getSelector() + ' > .node-row > .node',
                scope: entityType,
                dataList: dataList
            });
        },

        afterRender: function () {},

        fetch: function () {
            return {
                filtersDataList: this.getView('node').fetch(),
                filtersData: null,
                filters: null
            };
        },
    });
});
