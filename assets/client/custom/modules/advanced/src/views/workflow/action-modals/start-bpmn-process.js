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

define('advanced:views/workflow/action-modals/start-bpmn-process',
['advanced:views/workflow/action-modals/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/start-bpmn-process',

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupTargetOptions();

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

            this.createView('target', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                selector: ' .field[data-name="target"]',
                defs: {
                    name: 'target',
                    params: {
                        options: this.targetOptionList,
                        translatedOptions: this.targetTranslatedOptions,
                    }
                },
                readOnly: this.readOnly,
            });

            this.createView('flowchart', 'advanced:views/workflow/fields/flowchart', {
                selector: '.field[data-name="flowchart"]',
                model: model,
                mode: 'edit',
                foreignScope: 'BpmnFlowchart',
                entityType: this.getTargetEntityType(),
                defs: {
                    name: 'flowchart',
                    params: {
                        required: true,
                    }
                },
                targetEntityType: this.getTargetEntityType(),
                labelText: this.translate('BpmnFlowchart', 'scopeNames'),
            });

            this.listenTo(model, 'change:target', () => {
                model.trigger('change-target-entity-type', this.getTargetEntityType());
            });

            this.createView('elementId', 'advanced:views/workflow/fields/process-start-element-id', {
                selector: '.field[data-name="elementId"]',
                model: model,
                mode: 'edit',
                defs: {
                    name: 'elementId',
                    params: {
                        required: true,
                        options: this.actionData.startElementIdList || [],
                    }
                },
                translatedOptions: this.actionData.startElementNames || {},
            });

            this.listenTo(model, 'change:target', (m, v, o) => {
                if (!o.ui) {
                    return;
                }

                model.set('flowchartId', null);
                model.set('flowchartName', null);
                model.set('elementId', null);
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
                Object.keys(this.options.flowchartCreatedEntitiesData).forEach((aliasId) => {
                    // var entityType = this.options.flowchartCreatedEntitiesData[aliasId].entityType;

                    targetOptionList.push('created:' + aliasId);
                    translatedOptions['created:' + aliasId] = this.translateCreatedEntityAlias(aliasId, true);
                },);
            }

            const linkList = [];

            const linkDefs = this.getMetadata().get(['entityDefs', this.entityType, 'links']) || {};

            Object.keys(linkDefs).forEach(link => {
                const type = linkDefs[link].type;

                if (type !== 'belongsTo' && type !== 'belongsToParent') {
                    return;
                }

                const foreignEntityType = linkDefs[link].entity;

                if (type !== 'belongsToParent') {
                    if (!foreignEntityType) {
                        return;
                    }

                    if (!this.getMetadata().get(['scopes', foreignEntityType, 'object'])) {
                        return;
                    }
                }

                const item = `link:${link}`;

                targetOptionList.push(item);

                translatedOptions[item] = this.translateTargetItem(item, true);

                linkList.push(link);
            });

            linkList.forEach(link => {
                const entityType = linkDefs[link].entity;

                if (entityType) {
                    const subLinkDefs = this.getMetadata().get(['entityDefs', entityType, 'links']) || {};

                    Object.keys(subLinkDefs).forEach(subLink => {
                        const type = subLinkDefs[subLink].type;

                        if (type !== 'belongsTo' && type !== 'belongsToParent') {
                            return;
                        }

                        const foreignEntityType = subLinkDefs[subLink].entity;

                        if (type !== 'belongsToParent') {
                            if (!foreignEntityType) {
                                return;
                            }

                            if (!this.getMetadata().get(['scopes', foreignEntityType, 'object'])) {
                                return;
                            }
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
            const flowchartView = this.getView('flowchart');

            flowchartView.fetchToModel();

            if (flowchartView.validate()) {
                return;
            }

            const elementIdView = this.getView('elementId');

            elementIdView.fetchToModel();

            if (elementIdView.validate()) {
                return;
            }

            const o = flowchartView.fetch();

            this.actionData.flowchartName = o.flowchartName;
            this.actionData.flowchartId = o.flowchartId;

            this.actionData.target = (this.getView('target').fetch()).target || null;

            this.actionData.startElementIdList = this.model2.get('startElementIdList') || [];
            this.actionData.startElementNames = this.model2.get('startElementNames') || {};

            this.actionData.elementId = (this.getView('elementId').fetch()).elementId || null;

            return true;
        },
    });
});
