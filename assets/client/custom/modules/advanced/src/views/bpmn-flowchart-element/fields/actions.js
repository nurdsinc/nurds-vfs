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

define('advanced:views/bpmn-flowchart-element/fields/actions', ['views/fields/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        detailTemplate: 'advanced:bpmn-flowchart-element/fields/actions/detail',
        editTemplate: 'advanced:bpmn-flowchart-element/fields/actions/detail',

        setup: function () {
            Dep.prototype.setup.call(this);

            var model = new Model;
            model.set('entityType', this.model.targetEntityType);

            var actionList = this.model.get('actionList') || [];
            model.set('actions', actionList);

            var actionTypeList = Espo.Utils.clone(
                this.getMetadata().get(['clientDefs', 'BpmnFlowchart', 'elements', 'task', 'fields', 'actions', 'actionTypeList'])
            );

            this.createView('actions', 'advanced:views/workflow/record/actions', {
                entityType: this.model.targetEntityType,
                el: this.getSelector() + ' > .actions-container',
                readOnly: this.mode !== 'edit',
                model: model,
                actionTypeList: actionTypeList,
                flowchartElementId: this.model.id,
                flowchartCreatedEntitiesData: this.model.flowchartCreatedEntitiesData,
            });
        },

        events: {

        },

        data: function () {
            var data = {};
            data.isEditMode = this.mode === 'edit';

            return data;
        },

        fetch: function () {
            var actionList = this.getView('actions').fetch();

            return {
                actionList: actionList
            };
        },
    });
});
