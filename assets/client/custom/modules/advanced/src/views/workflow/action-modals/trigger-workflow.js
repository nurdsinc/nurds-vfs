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

define('advanced:views/workflow/action-modals/trigger-workflow',
['advanced:views/workflow/action-modals/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/trigger-workflow',

        data: function () {
            return _.extend({
            }, Dep.prototype.data.call(this));
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupTargetOptions();

            this.createView('executionTime', 'advanced:views/workflow/action-fields/execution-time', {
                selector: '.execution-time-container',
                executionData: this.actionData.execution || {},
                entityType: this.entityType,
            });

            const model = this.model2 = new Model();

            model.name = 'Workflow';

            model.set({
                workflowId: this.actionData.workflowId,
                workflowName: this.actionData.workflowName,
                target: this.actionData.target,
            });

            this.createView('target', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                selector: '.field[data-name="target"]',
                defs: {
                    name: 'target',
                    params: {
                        options: this.targetOptionList,
                        translatedOptions: this.targetTranslatedOptions
                    }
                },
                readOnly: this.readOnly,
            });

            this.createView('workflow', 'advanced:views/workflow/fields/workflow', {
                selector: '.field-workflow',
                model: model,
                mode: 'edit',
                foreignScope: 'Workflow',
                entityType: this.getTargetEntityType(),
                defs: {
                    name: 'workflow',
                    params: {
                        required: true,
                    },
                },
                labelText: this.translate('Workflow Rule', 'labels', 'Workflow'),
            });

            this.listenTo(this.model2, 'change:target', (m, v, o) => {
                if (!o.ui) {
                    return;
                }

                model.set('workflowId', null);
                model.set('workflowName', null);

                const view = this.getView('workflow');

                if (view) {
                    view.options.entityType = this.getTargetEntityType();
                }
            });
        },

        getTargetEntityType: function () {
            return this.getEntityTypeFromTarget(this.model2.get('target'));
        },

        setupTargetOptions: function () {
            const targetOptionList = [''];
            const translatedOptions = {};

            translatedOptions[''] = this.translate('Current', 'labels', 'Workflow') +
                ' (' + this.translate(this.entityType, 'scopeNames') + ')';

            if (this.options.flowchartCreatedEntitiesData) {
                Object.keys(this.options.flowchartCreatedEntitiesData).forEach(aliasId => {
                    targetOptionList.push('created:' + aliasId);
                    translatedOptions['created:' + aliasId] = this.translateCreatedEntityAlias(aliasId, true);
                });
            }

            const linkList = [];

            const linkDefs = this.getMetadata().get(['entityDefs', this.entityType, 'links']) || {};

            Object.keys(linkDefs).forEach(link => {
                const defs = /** @type {Record} */linkDefs[link] || {};
                const type = defs.type;

                if (
                    (defs.utility) ||
                    type !== 'belongsTo' &&
                    type !== 'belongsToParent' &&
                    type !== 'hasMany'
                ) {
                    return;
                }

                const item = 'link:' + link;

                targetOptionList.push(item);
                translatedOptions[item] = this.translateTargetItem(item, true);

                if (
                    type !== 'belongsTo' &&
                    type !== 'belongsToParent'
                ) {
                    return;
                }

                linkList.push(link);
            });

            linkList.forEach(link => {
                const entityType = linkDefs[link].entity;

                if (entityType) {
                    const subLinkDefs = this.getMetadata().get(['entityDefs', entityType, 'links']) || {};

                    Object.keys(subLinkDefs).forEach(subLink => {
                        const defs = /** @type {Record} */subLinkDefs[subLink] || {};
                        const type = defs.type;

                        if (
                            (defs.utility) ||
                            type !== 'belongsTo' &&
                            type !== 'belongsToParent' &&
                            type !== 'hasMany'
                        ) {
                            return;
                        }

                        const item = `link:${link}.${subLink}`;
                        targetOptionList.push(item);

                        translatedOptions[item] = this.translateTargetItem(item, true);
                    });
                }
            });

            this.targetOptionList = targetOptionList;
            this.targetTranslatedOptions = translatedOptions;
        },

        fetch: function () {
            const workflowView = this.getView('workflow');
            workflowView.fetchToModel();

            if (workflowView.validate()) {
                return;
            }

            const o = workflowView.fetch();
            this.actionData.workflowId = o.workflowId;
            this.actionData.workflowName = o.workflowName;

            this.actionData.target = (this.getView('target').fetch()).target || null;

            const executionData = this.getView('executionTime').fetch();

            // Important.
            this.actionData.execution = this.actionData.execution || {};

            this.actionData.execution.type = executionData.type;

            delete this.actionData.execution.field;
            delete this.actionData.execution.shiftDays;
            delete this.actionData.execution.shiftUnit;

            if (executionData.type !== 'immediately') {
                this.actionData.execution.field = executionData.field;
                this.actionData.execution.shiftDays = executionData.shiftValue;
                this.actionData.execution.shiftUnit = executionData.shiftUnit;
            }

            return true;
        },
    });
});
