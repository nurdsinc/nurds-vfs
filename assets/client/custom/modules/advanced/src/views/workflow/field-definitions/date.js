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

define('advanced:views/workflow/field-definitions/date',
['advanced:views/workflow/field-definitions/base'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/field-definitions/date',

        defaultFieldData: {
            subjectType: 'today',
            shiftDays: 0,
            attributes: {},
        },

        subjectTypeList: [
            'today',
            'field',
        ],

        setup: function () {
            Dep.prototype.setup.call(this);

            this.createView('shiftDays', 'advanced:views/workflow/action-fields/shift-days', {
                selector: '.shift-days',
                value: this.fieldData.shiftDays,
                unitValue: this.fieldData.shiftUnit,
                readOnly: this.readOnly,
                isDate: this.fieldType === 'date',
            });
        },

        getSubjectTranslatedOptions: function () {
            const obj = Dep.prototype.getSubjectTranslatedOptions.call(this);

            if (this.fieldType === 'date') {
                obj.today = this.translate('today', 'labels', 'Workflow');

                return;
            }

            obj.today = this.translate('now', 'labels', 'Workflow');

            return obj;
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
                    readOnly: this.readOnly,
                }, view => {
                    view.render();
                });

                this.$el.find('.subject').removeClass('hidden');

                return;
            }

            this.$el.find('.subject').addClass('hidden');

            if (subjectType === 'today') {
                this.clearView('subject');
            }
        },

        fetch: function () {
            const shiftData = this.getView('shiftDays').fetch();

            this.fieldData.shiftDays = shiftData.value;
            this.fieldData.shiftUnit = shiftData.unit;

            if (this.fieldData.subjectType === 'field') {
                this.fieldData.field = this.getView('subject').fetchValue();
            }

            return true;
        },
    });
});
