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

define('advanced:views/workflow/condition-fields/subject-type', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/condition-fields/subject-type',

        list: [
            'value',
            'field',
        ],

        data: function () {
            return {
                value: this.options.value,
                list: this.list,
                readOnly: this.options.readOnly
            };
        },

        setup: function () {
            this.readOnly = this.options.readOnly;

            this.formModel = new Model();
            this.formModel.name = 'Dummy';

            if (this.readOnly) {
                return;
            }
            this.formModel.set({
                value: this.options.value || this.list[0],
            });

            this.createView('valueField', 'views/fields/enum', {
                selector: '[data-field="value"]',
                name: 'value',
                model: this.formModel,
                mode: 'edit',
                params: {
                    options: this.list,
                    translation: 'Workflow.options.subjectType',
                },
            });

            this.listenTo(this.formModel, 'change:value', () => {
                this.trigger('change', this.formModel.attributes.value);
            });
        },

        afterRender: function () {
            this.$el.find('.selectize-control').addClass('input-sm');
        },

        fetchValue: function () {
            return this.formModel.attributes.value;
        },
    });
});
