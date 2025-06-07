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

define('advanced:views/workflow/condition-fields/subjects/enum-input',
['view', 'advanced:workflow-helper'], function (Dep, Helper) {

    return Dep.extend({

        template: 'advanced:workflow/condition-fields/subjects/enum-input',

        data: function () {
            return {
                readOnly: this.options.readOnly
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.field = this.options.field;
            this.entityType = this.options.entityType;
            this.conditionData = this.options.conditionData || {};

            this.wait(true);

            const helper = new Helper(this.getMetadata());

            const entityType = helper.getComplexFieldEntityType(this.field, this.entityType);
            const field = helper.getComplexFieldFieldPart(this.field);

            this.realField = field;

            this.getModelFactory().create(entityType, (model) => {
                model.set(this.realField, this.conditionData.value);

                const viewName = this.getMetadata().get(`entityDefs.${entityType}.fields.${field}.view`) ||
                    'views/fields/enum';

                this.createView('field', viewName, {
                    el: this.options.el + ' .field-container',
                    mode: 'edit',
                    model: model,
                    readOnly: this.options.readOnly,
                    defs: {
                        name: this.realField
                    }
                }, (view) => {
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

            this.$el.find('select').addClass('input-sm');
            this.$el.find('.selectize-control').addClass('input-sm');
        },

        fetch: function () {
            const view = this.getView('field');
            const data = view.fetch();

            return {
                value: data[this.realField],
            };
        },
    });
});
