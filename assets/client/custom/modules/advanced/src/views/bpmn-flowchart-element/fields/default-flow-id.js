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

define('advanced:views/bpmn-flowchart-element/fields/default-flow-id', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        data: function () {
            var data = Dep.prototype.data.call(this);
            data.isNotEmpty = true;

            return data;
        },

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            var flowchartDataList = this.model.dataHelper.getAllDataList();
            var id = this.model.get('id');

            this.translatedOptions = {};

            var flowIdList = [];

            flowchartDataList.forEach(function (item) {
                if (item.type !== 'flow') {
                    return;
                }

                if (item.startId === id && item.endId) {
                    var endItem = this.getElementData(item.endId);

                    if (!endItem) {
                        return;
                    }

                    flowIdList.push(item.id);

                    this.translatedOptions[item.id] = this.translate(endItem.type, 'elements', 'BpmnFlowchart') +
                        ': ' + (endItem.text || endItem.id);
                }
            }, this);

            this.translatedOptions[''] = this.translate('None');
            this.params.options = flowIdList;
            this.params.options.unshift('');
        },

        getValueForDisplay: function () {
            var value = Dep.prototype.getValueForDisplay.call(this);

            if (!value) {
                value = '';
            }

            return value;
        },

        getElementData: function (id) {
            return this.model.dataHelper.getElementData(id);
        },

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);

            if (data[this.name] === '') {
                data[this.name] = null;
            }

            return data;
        },
    });
});
