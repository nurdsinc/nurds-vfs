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

define('advanced:views/workflow/condition-fields/subjects/link-parent',
['view', 'advanced:workflow-helper'], function (Dep, Helper) {

    return Dep.extend({

        templateContent: '<div class="field-container" style="display: inline-block">{{{field}}}</div>',

        data: function () {
            return {
                list: this.getMetadata()
                    .get(`entityDefs.${this.options.entityType}.fields.${this.options.field}.options`) || [],
                field: this.options.field,
                value: this.options.value,
                entityType: this.options.entityType,
                readOnly: this.options.readOnly,
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.field = this.options.field;
            this.entityType = this.options.entityType;
            this.conditionData = this.options.conditionData || {};

            const helper = new Helper(this.getMetadata());

            const entityType = helper.getComplexFieldEntityType(this.field, this.entityType);
            const field = helper.getComplexFieldFieldPart(this.field);

            this.realField = field;

            this.idName = this.realField + 'Id';
            this.nameName = this.realField + 'Name';
            this.typeName = this.realField + 'Type';

            this.wait(true);

            this.getModelFactory().create(entityType, model => {
                model.set(this.idName, this.conditionData.value);
                model.set(this.nameName, this.conditionData.valueName);
                model.set(this.typeName, this.conditionData.valueType);

                let foreignScopeList = this.getMetadata()
                    .get(['entityDefs', entityType, 'fields', field, 'entityList']) || [];

                if (!foreignScopeList.length) {
                    foreignScopeList = Object.keys(this.getMetadata().get(['scopes'])).filter(item => {
                        return !!this.getMetadata().get(['scopes', item, 'object']);
                    });

                    foreignScopeList.push('CampaignTrackingUrl');

                    foreignScopeList = foreignScopeList.sort((v1, v2) => {
                        return this.translate(v1, 'scopeNames').localeCompare(this.translate(v2, 'scopeNames'));
                    });
                }

                this.createView('field', 'views/fields/link-parent', {
                    el: this.options.el + ' .field-container',
                    mode: 'edit',
                    model: model,
                    readOnly: this.options.readOnly,
                    readOnlyDisabled: !this.options.readOnly,
                    inlineEditDisabled: this.options.readOnly,
                    defs: {
                        name: this.realField
                    },
                    foreignScopeList: foreignScopeList,
                }, view => {
                    if (!this.options.readOnly && view.readOnly) {
                        view.readOnlyLocked = false
                        view.readOnly = false;
                        view.setMode('edit');
                        view.reRender();
                    }

                    this.wait(false);
                });
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.$el.find('input.form-control').addClass('input-sm');
            this.$el.find('select').addClass('input-sm');
            this.$el.find('.btn').addClass('btn-sm');
            this.$el.find('.selectize-control').addClass('input-sm');
        },

        fetch: function () {
            const view = this.getView('field');
            const data = view.fetch();
            const fieldValueMap = {};

            fieldValueMap[this.idName] = data[this.idName];
            fieldValueMap[this.typeName] = data[this.typeName];

            return {
                value: data[this.idName],
                valueName: data[this.nameName],
                valueType: data[this.typeName],
                fieldValueMap: fieldValueMap
            };
        },
    });
});
