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

define('advanced:views/bpmn-flowchart-element/fields/conditions',
['views/fields/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        detailTemplate: 'advanced:bpmn-flowchart-element/fields/conditions/detail',
        editTemplate: 'advanced:bpmn-flowchart-element/fields/conditions/detail',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.conditionsModel = new Model();

            this.conditionsModel.set({
                conditionsAll: this.model.get('conditionsAll') || [],
                conditionsAny: this.model.get('conditionsAny') || [],
                conditionsFormula: this.model.get('conditionsFormula') || null,
            });

            let isChangedDisabled = true;
            let flowchartCreatedEntitiesData = this.model.flowchartCreatedEntitiesData;

            if (this.model.elementType === 'eventStartConditional' && !this.model.isInSubProcess) {
                flowchartCreatedEntitiesData = null;
                isChangedDisabled = false;
            }

            this.createView('conditions', 'advanced:views/workflow/record/conditions', {
                entityType: this.model.targetEntityType,
                el: this.getSelector() + ' > .conditions-container',
                readOnly: this.mode !== 'edit',
                model: this.conditionsModel,
                flowchartCreatedEntitiesData: flowchartCreatedEntitiesData,
                isChangedDisabled: isChangedDisabled,
            });
        },

        fetch: function () {
            const conditionsData = this.getView('conditions').fetch();

            return {
                'conditionsAll': conditionsData.all,
                'conditionsAny': conditionsData.any,
                'conditionsFormula': conditionsData.formula,
            };
        },
    });
});
