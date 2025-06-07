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

define('advanced:views/workflow/actions/start-bpmn-process', ['advanced:views/workflow/actions/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/actions/start-bpmn-process',

        type: 'startBpmnProcess',

        defaultActionData: {},

        data: function () {
            const data = Dep.prototype.data.call(this);
            data.targetTranslated = this.getTargetTranslated();

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            const model = this.model2 = new Model();

            model.name = 'BpmnFlowchart';
            model.set({
                flowchartId: this.actionData.flowchartId,
                flowchartName: this.actionData.flowchartName,
                elementId: this.actionData.elementId,
                target: this.actionData.target,
                startElementIdList: this.actionData.startElementIdList,
                startElementNames: this.actionData.startElementNames,
            });

            this.createView('flowchart', 'views/fields/link', {
                selector: '.field[data-name="flowchart"]',
                model: model,
                foreignScope: 'BpmnFlowchart',
                name: 'flowchart',
                mode: 'detail',
                readOnly: true,
            });

            this.createView('elementId', 'advanced:views/workflow/fields/process-start-element-id', {
                selector:  '.field[data-name="elementId"]',
                model: model,
                readOnly: true,
                mode: 'detail',
                name: 'elementId',
                options: this.actionData.startElementIdList || [],
                translatedOptions: this.actionData.startElementNames || {},
            });
        },

        afterEdit: function () {
            this.model2.set({
                flowchartId: this.actionData.flowchartId,
                flowchartName: this.actionData.flowchartName,
                elementId: this.actionData.elementId,
                target: this.actionData.target,
                startElementIdList: this.actionData.startElementIdList,
                startElementNames: this.actionData.startElementNames,
            });
        },

        getTargetTranslated: function () {
            return this.translateTargetItem(this.actionData.target);
        },
    });
});
