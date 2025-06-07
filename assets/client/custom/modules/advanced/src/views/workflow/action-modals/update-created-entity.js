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

define('advanced:views/workflow/action-modals/update-created-entity',
['advanced:views/workflow/action-modals/create-entity', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/update-created-entity',

        data: function () {
            return _.extend({
                target: this.actionData.target,
                scope: this.scope,
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            const model = new Model();
            model.name = 'Workflow';

            this.modelForParentEntityType = model;

            this.actionModel = model;

            let targetList = Object.keys(this.options.flowchartCreatedEntitiesData).map(item => {
                return 'created:' + item;
            });

            targetList = Espo.Utils.clone(targetList);
            targetList.unshift('');

            if (this.actionData.target) {
                model.set('target', this.actionData.target);
            }

            const translatedOptions = {};

            Object.keys(this.options.flowchartCreatedEntitiesData).forEach(aliasId => {
                const link = this.options.flowchartCreatedEntitiesData[aliasId].link;
                const entityType = this.options.flowchartCreatedEntitiesData[aliasId].entityType;
                const numberId = this.options.flowchartCreatedEntitiesData[aliasId].numberId;
                const text = this.options.flowchartCreatedEntitiesData[aliasId].text;

                let label = this.translate('Created', 'labels', 'Workflow') + ': ';

                if (link) {
                    label += this.translate(link, 'links', this.entityType) + ' - ';
                }

                label += this.translate(entityType, 'scopeNames');

                if (text) {
                    label += ' \'' + text + '\'';
                } else {
                    if (numberId) {
                        label += ' #' + numberId.toString();
                    }
                }

                translatedOptions['created:' + aliasId] = label;
            });

            this.createView('target', 'views/fields/enum', {
                name: 'target',
                mode: 'edit',
                model: model,
                selector: '.field[data-name="target"]',
                translatedOptions: translatedOptions,
                readOnly: this.readOnly,
                labelText: this.translate('Field'),
                params: {
                    options: targetList,
                    required: true,
                },
            });

            this.listenTo(model, 'change:target', () => {
                this.setTarget(this.actionModel.get('target'));
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
        },

        setupScope: function (callback) {
            if (this.actionData.target) {
                let scope = this.scope = null;

                const aliasId = this.actionData.target.substr(8);

                if (!this.options.flowchartCreatedEntitiesData[aliasId]) {
                    callback();
                    return;
                }

                scope = this.options.flowchartCreatedEntitiesData[aliasId].entityType;

                this.scope = scope;

                if (scope) {
                    this.wait(true);

                    this.getModelFactory().create(scope, model => {
                        this.model = model;

                        (this.actionData.fieldList || []).forEach(field => {
                            const attributes = (this.actionData.fields[field] || {}).attributes || {};

                            model.set(attributes, {silent: true});
                        });

                        callback();
                    });
                }
                else {
                    throw new Error;
                }
            }
            else {
                this.model = null;
                callback();
            }
        },

        setTarget: function (value) {
            this.actionData.target = value;

            this.actionData.fieldList.forEach(field => {
                this.$el.find('.field-row[data-field="' + field + '"]').remove();

                this.clearView('field-' + field);
            });

            this.actionData.fieldList = [];
            this.actionData.fields = {};

            this.handleLink();
        },

        handleLink: function () {
            const target = this.actionData.target;

            if (!target) {
                this.clearView('addField');
                this.clearView('formula');

                this.$formulaCell.addClass('hidden');

                return;
            }

            if (this.hasFormulaAvailable) {
                this.$formulaCell.removeClass('hidden');
            }

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
            });

            this.setupFormulaView();
        },

        setupFormulaView: function () {
            const model = new Model;

            if (this.hasFormulaAvailable) {
                model.set('formula', this.actionData.formula || null);

                this.createView('formula', 'views/fields/formula', {
                    name: 'formula',
                    model: model,
                    mode: this.readOnly ? 'detail' : 'edit',
                    height: 100,
                    el: this.getSelector() + ' .field[data-name="formula"]',
                    inlineEditDisabled: true,
                    targetEntityType: this.scope,
                }, view => {
                    view.render();
                });
            }
        },

        fetch: function () {
            let isValid = true;
            let isInvalid;

            isInvalid = this.getView('target').validate();

            (this.actionData.fieldList || []).forEach(field => {
                isValid = this.getView('field-' + field).fetch();

                this.actionData.fields[field] = this.getView('field-' + field).fieldData;
            });

            if (this.hasFormulaAvailable) {
                if (this.actionData.target) {
                    const formulaView = this.getView('formula');

                    if (formulaView) {
                        this.actionData.formula = formulaView.fetch().formula;
                    }
                }
            }

            if (isInvalid) {
                return false;
            }

            return isValid;
        },
    });
});
