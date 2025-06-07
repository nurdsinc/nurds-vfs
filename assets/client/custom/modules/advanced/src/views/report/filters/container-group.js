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

define('advanced:views/report/filters/container-group', ['view'], function (Dep) {

    return Dep.extend({

        template: 'advanced:report/filters/container-group',

        events: {
            'click > a[data-action="removeGroup"]': function () {
                this.trigger('remove-item');
            }
        },

        data: function () {
            var showGroupTypeLabel = true;

            if (this.type === 'and' || this.type === 'or') {
                showGroupTypeLabel = false;
            }

            return {
                type: this.type,
                noOffset: this.options.level > 3,
                showGroupTypeLabel: showGroupTypeLabel
            };
        },

        setup: function () {
            this.filterData = this.options.filterData;
            this.scope = this.options.scope;
            this.type = this.filterData.type;

            this.createView('node', 'advanced:views/report/filters/node', {
                el: this.getSelector() + ' > .node',
                scope: this.scope,
                dataList: this.filterData.params.value || [],
                level: this.options.level,
                filterData: this.filterData,
                isHaving: this.options.isHaving,
            });
        },

        fetch: function () {
            return {
                id: this.filterData.id,
                type: this.filterData.type,
                params: {
                    type: this.filterData.type,
                    value: this.getView('node').fetch(),
                },
            };
        },
    });
});
