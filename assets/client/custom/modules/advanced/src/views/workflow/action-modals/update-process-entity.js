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

define('advanced:views/workflow/action-modals/update-process-entity',
['advanced:views/workflow/action-modals/update-entity'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/update-entity',

        ignoreFieldList: [
            'endedAt',
            'status',
            'targetType',
            'target',
            'flowchartData',
            'flowchart',
            'flowchartElementsDataHash',
            'flowchartVisualization',
            'createdEntitiesData',
            'variables',
            'modifiedAt',
            'endedAt',
            'createdBy',
            'modifiedBy',
            'createdAt',
            'workflowId',
            'startElementId',
            'rootProcess',
            'parentProcessFlowNode',
            'parentProcess',
        ],

        setupScope: function (callback) {
            this.scope = 'BpmnProcess';

            this.getModelFactory().create(this.scope, (model) => {
                this.model = model;

                (this.actionData.fieldList || []).forEach(field => {
                    const attributes = (this.actionData.fields[field] || {}).attributes || {};

                    model.set(attributes, {silent: true});
                });

                callback();
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.hasFormulaAvailable = !!this.getMetadata().get('app.formula.functionList');

            this.wait(true);

            this.setupScope(() => {
                this.createView('addField', 'advanced:views/workflow/action-fields/add-field', {
                    selector: '.add-field-container',
                    scope: this.scope,
                    fieldList: this.getFieldList(),
                    addedFieldList: this.actionData.fieldList,
                    onAdd: field => {
                        if (this.actionData.fieldList.includes(field)) {
                            return;
                        }

                        this.actionData.fieldList.push(field);
                        this.actionData.fields[field] = {};

                        this.addField(field, false, true);
                    },
                }, view => {
                    view.render();
                });

                this.wait(false);
            });
        },

        getFieldList: function () {
            const fieldDefs = this.getMetadata().get('entityDefs.' + this.scope + '.fields') || {};

            return Object.keys(fieldDefs)
                .filter(field => {
                    if (fieldDefs[field].disabled) {
                        return false;
                    }

                    if (~this.ignoreFieldList.indexOf(field)) {
                        return;
                    }

                    return true;
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'fields', this.scope)
                        .localeCompare(this.translate(v2, 'fields', this.scope));
                });
        },
    });
});
