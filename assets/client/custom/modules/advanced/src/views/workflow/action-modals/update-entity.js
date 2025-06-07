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

define('advanced:views/workflow/action-modals/update-entity',
[
    'advanced:views/workflow/action-modals/base',
    'advanced:views/workflow/action-modals/create-entity',
    'model'
],
function (Dep, CreateEntity, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/update-entity',

        data: function () {
            return _.extend({
                scope: this.scope,
            }, Dep.prototype.data.call(this));
        },

        events: {
            'click [data-action="removeField"]': function (e) {
                const $target = $(e.currentTarget);
                const field = $target.data('field');

                this.clearView('field-' + field);

                delete this.actionData.fields[field];

                const index = this.actionData.fieldList.indexOf(field);
                this.actionData.fieldList.splice(index, 1);

                $target.parent().remove();
            },
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.$fieldDefinitions = this.$el.find('.field-definitions');

            this.$formulaCell = this.$el.find('.cell[data-name="formula"]');

            (this.actionData.fieldList || []).forEach(function (field) {
                this.addField(field, this.actionData.fields[field]);
            }, this);

            if (this.hasFormulaAvailable) {
                this.$formulaCell.removeClass('hidden');
            } else {
                this.$formulaCell.addClass('hidden');
            }

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

        setupScope: function (callback) {
            const scope = this.entityType;
            this.scope = scope;

            this.getModelFactory().create(scope, model => {
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

        addField: function (field, fieldData, isNew) {
            const fieldType = this.getMetadata().get(`entityDefs.${this.scope}.fields.${field}.type`) || 'base';
            const type = this.getMetadata().get('entityDefs.Workflow.fieldDefinitions.' + fieldType) || 'base';

            fieldData = fieldData || false;

            const escapedField = this.getHelper().escapeString(field);

            const fieldNameHtml = '<label>' + this.translate(escapedField, 'fields', this.scope) + '</label>';

            const removeLinkHtml = '<a role="button" tabindex="0" class="pull-right" ' +
                'data-action="removeField" data-field="' + escapedField + '"><span class="fas fa-times"></span></a>';

            const html = '<div class="margin clearfix field-row" ' +
                'data-field="' + escapedField + '" style="margin-left: 20px;">' + removeLinkHtml + fieldNameHtml +
                '<div class="field-container field" data-field="' + escapedField + '"></div></div>';

            this.$fieldDefinitions.append($(html));

            this.createView('field-' + field, 'advanced:views/workflow/field-definitions/' +
                Espo.Utils.camelCaseToHyphen(type), {
                el: this.options.el + ' .field-container[data-field="' + field + '"]',
                fieldData: fieldData,
                model: this.model,
                field: field,
                entityType: this.entityType,
                scope: this.scope,
                type: type,
                fieldType: fieldType,
                isNew: isNew
            }, view => {
                view.render();
            });
        },

        getFieldList: function () {
            return CreateEntity.prototype.getFieldList.call(this);
        },

        fetch: function () {
            let isValid = true;

            (this.actionData.fieldList || []).forEach(field => {
                isValid = this.getView('field-' + field).fetch();

                this.actionData.fields[field] = this.getView('field-' + field).fieldData;
            });

            if (this.hasFormulaAvailable) {
                var formulaView = this.getView('formula');

                if (formulaView) {
                    this.actionData.formula = formulaView.fetch().formula;
                }
            }

            return isValid;
        },
    });
});
