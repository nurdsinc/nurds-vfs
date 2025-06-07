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

define('advanced:views/workflow/field-definitions/base', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/field-definitions/base',

        defaultFieldData: {
            subjectType: 'value',
            attributes: {},
        },

        subjectTypeList: [
            'value',
            'field',
        ],

        data: function () {
            return {
                subjectTypeList: this.subjectTypeList,
                subjectTypeValue: this.fieldData.subjectType,
                readOnly: this.readOnly,
                hasActionType: !!this.actionTypeList,
            };
        },

        setup: function () {
            this.scope = this.options.scope;
            this.entityType = this.options.entityType;
            this.field = this.options.field;
            this.readOnly = this.options.readOnly;

            this.fieldType = this.model.getFieldType(this.field) || 'base';

            this.fieldData = this.options.fieldData || {};

            this.actionTypeList = /** @type {string[]|null} */
                this.getMetadata().get(`entityDefs.Workflow.fieldTypeActions.${this.fieldType}`);

            if (this.options.isNew) {
                const cloned = {};

                for (const i in this.defaultFieldData) {
                    cloned[i] = Espo.Utils.clone(this.defaultFieldData[i]);
                }

                this.fieldData = _.extend(cloned, this.fieldData);

                if (this.actionTypeList) {
                    this.fieldData.actionType = this.actionTypeList[0];
                }
            }

            if (this.readOnly) {
                return;
            }

            this.formModel = new Model();
            this.formModel.name = 'Dummy';

            this.formModel.set({subjectType: this.fieldData.subjectType});

            if (this.actionTypeList) {
                this.formModel.set({actionType: this.fieldData.actionType});
            }

            this.createView('subjectTypeField', 'views/fields/enum', {
                name: 'subjectType',
                selector: '[data-field="subjectType"]',
                model: this.formModel,
                mode: 'edit',
                params: {
                    options: this.subjectTypeList,
                },
                translatedOptions: this.getSubjectTranslatedOptions(),
            });

            if (this.actionTypeList) {
                this.createView('actionTypeField', 'views/fields/enum', {
                    name: 'actionType',
                    selector: '[data-field="actionType"]',
                    model: this.formModel,
                    mode: 'edit',
                    params: {
                        options: this.actionTypeList,
                    },
                    translatedOptions: {
                        add: this.translate('Add'),
                        remove: this.translate('Remove'),
                        update: this.translate('Update'),
                    },
                });
            }

            this.listenTo(this.formModel, 'change:subjectType', () => {
                this.fieldData.subjectType = this.formModel.attributes.subjectType;

                this.handleSubjectType();
            });
        },

        getSubjectTranslatedOptions: function () {
            return this.subjectTypeList.reduce((p, it) => {
                return {
                    ...p,
                    [it]: Espo.Utils.upperCaseFirst(this.getLanguage().translateOption(it, 'subjectType', 'Workflow')),
                };
            }, {});
        },

        afterRender: function () {
            this.handleSubjectType();
        },

        handleSubjectType: function () {
            const subjectType = this.fieldData.subjectType;

            if (subjectType === 'field') {
                this.createView('subject', 'advanced:views/workflow/action-fields/subjects/field', {
                    selector: '.subject',
                    model: this.model,
                    entityType: this.entityType,
                    scope: this.scope,
                    field: this.field,
                    value: this.fieldData.field,
                    readOnly: this.readOnly
                }, view => {
                    view.render();
                });
            }

            if (subjectType === 'value') {
                const viewName = this.getFieldViewName();

                this.createView('subject', viewName, {
                    selector: '.subject',
                    model: this.model,
                    name: this.field,
                    mode: 'edit',
                    readOnly: this.readOnly,
                    readOnlyDisabled: true
                }, view => {
                    view.render();
                });
            }
        },

        /**
         * @return {string}
         */
        getFieldViewName: function () {
            return this.getMetadata().get(`entityDefs.Workflow.fieldDefinitionsFieldViews.${this.fieldType}`) ||
                this.model.getFieldParam(this.field, 'view') ||
                this.getFieldManager().getViewName(this.fieldType);
        },

        fetch: function () {
            this.fieldData.attributes = {};

            if (this.actionTypeList) {
                this.fieldData.actionType = this.formModel.attributes.actionType;
            }

            if (this.fieldData.subjectType === 'value') {
                this.getView('subject').fetchToModel();

                if (this.getView('subject').validate()) {
                    return false;
                }

                this.fieldData.attributes = this.getView('subject').fetch();

                return true;
            }

            if (this.fieldData.subjectType === 'field') {
                this.fieldData.field = this.getView('subject').fetchValue();
            }

            return true;
        },
    });
});
