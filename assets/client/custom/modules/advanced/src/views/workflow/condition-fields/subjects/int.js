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

define('advanced:views/workflow/condition-fields/subjects/int', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        templateContent: '<span data-field="value">{{{valueField}}}</span>',

        setup: function () {
            this.readOnly = this.options.readOnly;
            this.field = this.options.field;
            this.entityType = this.options.entityType;
            this.conditionData = this.options.conditionData || {};

            const model = this.formModel = new Model();
            model.name = 'Dummy';

            model.set({
                value: this.conditionData.value,
            });

            this.createView('valueField', 'views/fields/int', {
                selector: '[data-field="value"]',
                mode: this.readOnly ? 'detail' : 'edit',
                model: model,
                name: 'value',
            });
        },

        afterRender: function () {
            this.$el.find('input').addClass('input-sm');
        },

        fetch: function () {
            return {
                value: this.formModel.attributes.value,
            };
        },
    });
});
