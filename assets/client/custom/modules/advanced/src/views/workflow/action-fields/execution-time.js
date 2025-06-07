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

define('advanced:views/workflow/action-fields/execution-time', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-fields/execution-time',

        data: function () {
            return {
                type: this.executionData.type,
                field: this.executionData.field,
                shiftDays: this.executionData.shiftDays,
                shiftUnit: this.executionData.shiftUnit,
                readOnly: this.readOnly,
            };
        },

        setup: function () {
            this.executionData = this.options.executionData || {};
            this.readOnly = this.options.readOnly || false;

            this.formModel = new Model();
            this.formModel.name = 'Dummy';

            this.formModel.set({
                type: this.executionData.type || 'immediately',
            });

            if (!this.readOnly) {
                this.createView('typeField', 'views/fields/enum', {
                    model: this.formModel,
                    selector: '[data-field="type"]',
                    name: 'type',
                    mode: 'edit',
                    params: {
                        options: [
                            'immediately',
                            'later',
                        ],
                    },
                    translatedOptions: {
                        immediately: this.translate('immediately', 'labels', 'Workflow'),
                        later: this.translate('later', 'labels', 'Workflow'),
                    },
                });

                this.listenTo(this.formModel, 'change:type', () => this.handleType());
            }

            this.createFieldView();
            this.createShiftDaysView();
        },

        afterRender: function () {
            this.handleType();
        },

        reRender: function () {
            this.createFieldView();
            this.createShiftDaysView();

            return Dep.prototype.reRender.call(this);
        },

        handleType: function () {
            const type = this.readOnly ?
                this.executionData.type :
                this.formModel.attributes.type;

            if (type !== 'later') {
                this.$el.find('.field-container').addClass('hidden');
                this.$el.find('.shift-days-container').addClass('hidden');

                return;
            }

            this.$el.find('.field-container').removeClass('hidden');
            this.$el.find('.shift-days-container').removeClass('hidden');
        },

        createFieldView: function () {
            this.createView('field', 'advanced:views/workflow/action-fields/date-field', {
                selector: '.field-container',
                value: this.executionData.field,
                entityType: this.options.entityType,
                readOnly: this.readOnly,
            });
        },

        createShiftDaysView: function () {
            this.createView('shiftDays', 'advanced:views/workflow/action-fields/shift-days', {
                selector: '.shift-days-container',
                value: this.executionData.shiftDays || 0,
                unitValue: this.executionData.shiftUnit || 'days',
                readOnly: this.readOnly,
            });
        },

        fetch: function () {
            const shiftData = this.getView('shiftDays').fetch();

            return {
                field: this.getView('field').fetchValue(),
                type: this.formModel.attributes.type,
                shiftValue: shiftData.value,
                shiftUnit: shiftData.unit,
            };
        },
    });
});
