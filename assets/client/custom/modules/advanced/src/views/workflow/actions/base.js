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

define('advanced:views/workflow/actions/base', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/actions/base',

        defaultActionData: {
            execution: {
                type: 'immediately',
                field: false,
                shiftDays: 0,
            }
        },

        data: function () {
            const fieldActionLabelMap = {};

            if (this.actionData.fields) {
                for (const [field, item] of Object.entries(this.actionData.fields)) {
                    if (item.actionType === 'add' || item.actionType === 'remove') {
                        let label;

                        if (item.actionType === 'remove') {
                            label = this.translate('Remove');
                        } else {
                            label = this.translate('Add');
                        }

                        fieldActionLabelMap[field] = this.translate(label);
                    }
                }
            }

            return {
                entityType: this.entityType,
                actionType: this.actionType,
                linkedEntityName: this.linkedEntityName || this.entityType,
                displayedLinkedEntityName: this.displayedLinkedEntityName || this.linkedEntityName || this.entityType,
                actionData: this.actionData,
                readOnly: this.readOnly,
                fieldActionLabelMap: fieldActionLabelMap,
            };
        },

        events: {
            'click [data-action="editAction"]': function () {
                this.edit();
            }
        },

        setup: function () {
            this.actionType = this.options.actionType;
            this.id = this.options.id;
            this.readOnly = this.options.readOnly;

            this.actionData = this.options.actionData || {};

            this.hasFormulaAvailable = !!this.getMetadata().get('app.formula.functionList');

            if (this.options.isNew) {
                const cloned = {};

                for (const i in this.defaultActionData) {
                    cloned[i] = Espo.Utils.clone(this.defaultActionData[i]);
                }

                if ('execution' in cloned) {
                    for (const i in cloned.execution) {
                        cloned.execution[i] = Espo.Utils.clone(cloned.execution[i]);
                    }
                }

                this.actionData = _.extend(cloned, this.actionData);
            }

            this.entityType = this.options.entityType;

            this.additionalSetup();
        },

        afterRender: function () {
            this.renderFields();

            this.$formulaField = this.$el.find('.field[data-name="formula"]');

            if (this.hasFormulaAvailable) {
                this.renderFormula();
            }
        },

        renderFormula: function () {
            this.clearView('formula');

            if (this.actionData.formula && this.actionData.formula !== '') {
                this.$formulaField.removeClass('hidden');

                const model = new Model;
                model.set('formula', this.actionData.formula);

                this.createView('formula', 'views/fields/formula', {
                    name: 'formula',
                    model: model,
                    mode: 'detail',
                    height: 100,
                    el: this.getSelector() + ' .field[data-name="formula"]',
                    inlineEditDisabled: true,
                    params: {
                        seeMoreDisabled: true,
                    },
                }, view => {
                    view.render();
                });

                return;
            }

            this.clearView('formula');
            this.$formulaField.addClass('hidden');
        },

        edit: function (isNew) {
            this.createView('edit', 'advanced:views/workflow/action-modals/' +
                Espo.Utils.camelCaseToHyphen(this.actionType), {
                actionData: this.actionData,
                actionType: this.actionType,
                entityType: this.entityType,
                flowchartCreatedEntitiesData: this.options.flowchartCreatedEntitiesData,
            }, view => {
                view.render();

                if (isNew) {
                    this.listenToOnce(view, 'cancel', () => {
                        setTimeout(() => {
                            this.getParentView().removeAction(this.id);
                        }, 200);
                    });
                }

                this.listenToOnce(view, 'apply', actionData => {
                    this.clearView('edit');
                    this.actionData = actionData;
                    this.trigger('change');
                    this.additionalSetup();
                    this.afterEdit();

                    setTimeout(() => {
                        this.reRender();
                    }, 200);
                });
            });
        },

        afterEdit: function () {},

        fetch: function () {
            this.actionData.type = this.type;
            this.actionData.id = this.options.actionId;

            return this.actionData;
        },

        renderFields: function () {
            if (this.actionData.fields) {
                const model = new Model();

                model.name = this.linkedEntityName || this.entityType;

                const defs = {fields: {}, links: {}};

                _.each(this.actionData.fields, (row, fieldName) => {
                    model.set(row.attributes);

                    defs.fields[fieldName] = this.getMetadata()
                        .get(`entityDefs.${model.name}.fields.${fieldName}`);

                    defs.links[fieldName] = this.getMetadata()
                        .get(`entityDefs.${model.name}.links.${fieldName}`);

                    model.setDefs(defs);

                    const metaFieldKey = `entityDefs.${model.name}.fields.${fieldName}`;
                    const fieldType = this.getMetadata().get(`${metaFieldKey}.type`);

                    switch (row.subjectType) {
                        case 'value':
                            const viewName =
                                this.getMetadata().get(`entityDefs.Workflow.fieldDefinitionsFieldViews.${fieldType}`) ||
                                this.getMetadata().get(`${metaFieldKey}.view`) ||
                                this.getFieldManager().getViewName(fieldType);

                            this.createView('subject-' + fieldName, viewName, {
                                selector: `.field-container[data-field="${fieldName}"]`,
                                model: model,
                                name: fieldName,
                                inlineEditDisabled: true,
                                readOnly: true,
                            }, view => {
                                setTimeout(() => {
                                    view.render();
                                }, 100);
                            });

                            break;

                        case 'field':
                        case 'today':
                            const type = this.getMetadata().get(`entityDefs.Workflow.fieldDefinitions.${fieldType}`) ||
                                'base';

                            this.createView('field-' + fieldName, 'advanced:views/workflow/field-definitions/' +
                                Espo.Utils.camelCaseToHyphen(type), {
                                selector: `.field-container[data-field="${fieldName}"]`,
                                fieldData: row,
                                model: this.model,
                                field: fieldName,
                                entityType: this.entityType,
                                scope: model.name,
                                type: type,
                                fieldType: fieldType,
                                isNew: false,
                                readOnly: true,
                            }, view => {
                                view.render();
                            });

                            break;
                    }
                })
            }
        },

        additionalSetup: function() {
            if (this.actionData.link) {
                this.linkedEntityName = this.actionData.link;
            }
        },

        translateCreatedEntityAlias: function (target, optionItem) {
            let aliasId = target;

            if (target.indexOf('created:') === 0) {
                aliasId = target.substr(8);
            }

            if (!this.options.flowchartCreatedEntitiesData[aliasId]) {
                return target;
            }

            const link = this.options.flowchartCreatedEntitiesData[aliasId].link;
            const entityType = this.options.flowchartCreatedEntitiesData[aliasId].entityType;
            const numberId = this.options.flowchartCreatedEntitiesData[aliasId].numberId;

            let label = this.translate('Created', 'labels', 'Workflow') + ': ';

            let raquo = '<span class="chevron-right"></span>';

            if (optionItem) {
                raquo = '-';
            }

            if (link) {
                label += this.translate(link, 'links', this.entityType) + ' ' + raquo + ' ';
            }

            label += this.translate(entityType, 'scopeNames');

            if (numberId) {
                label += ' #' + numberId.toString();
            }

            return label;
        },

        translateTargetItem: function (target, optionItem, targetEntityType) {
            if (target && target.indexOf('created:') === 0) {
                return this.translateCreatedEntityAlias(target, optionItem)
            }

            let raquo = ' <span class="chevron-right"></span> ';

            if (optionItem) {
                raquo = ' . ';
            }

            let entityType = targetEntityType || this.entityType;

            if (target && target.indexOf('link:') === 0) {
                const linkPath = target.substr(5);
                const linkList = linkPath.split('.');

                const labelList = [];

                linkList.forEach((link) => {
                    labelList.push(this.translate(link, 'links', entityType));

                    if (!entityType) {
                        return;
                    }

                    entityType = this.getMetadata().get(['entityDefs', entityType, 'links', link, 'entity']);
                });

                return this.translate('Related', 'labels', 'Workflow') + ': ' + labelList.join(raquo);
            }

            if (target === 'currentUser') {
                return this.getLanguage().translate('currentUser', 'emailAddressOptions', 'Workflow');
            }

            if (target === 'targetEntity' || !target) {
                return this.getLanguage().translate('targetEntity', 'emailAddressOptions', 'Workflow') +
                    ' (' + this.translate(entityType, 'scopeNames') + ')';
            }

            if (target === 'followers') {
                return this.getLanguage().translate('followers', 'emailAddressOptions', 'Workflow');
            }
        },
    });
});
