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

define('advanced:views/bpmn-process/fields/start-element-id', 'views/fields/enum', function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.model.has('startElementIdList')) {
                this.conrolElementIdList();
            }

            this.listenTo(this.model, 'change:startElementIdList', function () {
                this.conrolElementIdList();
            }, this);
        },

        conrolElementIdList: function () {
            var flowchartElementsDataHash = this.model.get('flowchartElementsDataHash') || {};

            var startElementIdList = this.model.get('startElementIdList') || [];
            this.translatedOptions = {};
            startElementIdList.forEach(function (id) {
                if (!(id in flowchartElementsDataHash)) return;
                this.translatedOptions[id] = flowchartElementsDataHash[id].text || id;

                var label = flowchartElementsDataHash[id].text || id;

                label = this.translate(flowchartElementsDataHash[id].type, 'elements', 'BpmnFlowchart') + ': ' + label;

                this.translatedOptions[id] = label;
            }, this);
        },

    });
});
