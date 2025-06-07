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

define('advanced:views/bpmn-flowchart/record/edit', 'views/record/edit', function (Dep) {

    return Dep.extend({

        saveAndContinueEditingAction: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            var dataEntityTypeMap = {};

            if (!this.model.isNew()) {
                this.setFieldReadOnly('targetType');
            } else {
                this.controlFlowchartField();
                this.listenTo(this.model, 'change:targetType', function (model) {
                    var previousEntityType = model.previous('targetType');
                    var targetType = model.get('targetType');
                    dataEntityTypeMap[previousEntityType] = this.model.get('data');
                    var data = dataEntityTypeMap[targetType] || {
                        list: []
                    };
                    this.controlFlowchartField();
                    this.model.set('data', data);
                }, this);
            }
        },

        controlFlowchartField: function () {
            var targetType = this.model.get('targetType');
            if (targetType) {
                this.showField('flowchart');
            } else {
                this.hideField('flowchart');
            }
        },

    });
});