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

define('advanced:views/workflow/condition-fields/shift-days', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/condition-fields/shift-days',

        data: function () {
            return {
                shiftDaysOperator: this.shiftDaysOperator,
                value: this.value,
                readOnly: this.readOnly,
            };
        },

        setup: function () {
            this.value = this.options.value;
            this.readOnly = this.options.readOnly;

            const value = this.value;

            if (this.value < 0) {
                this.shiftDaysOperator = 'minus';
                this.value = (-1) * this.value;
            } else {
                this.shiftDaysOperator = 'plus';
            }

            if (this.readOnly) {
                return;
            }

            this.formModel = new Model();
            this.formModel.name = 'Dummy';

            this.formModel.set({
                operator: value < 0 ? 'minus' : 'plus',
                value: value < 0 ? ((-1) * value) : value,
            });

            this.createView('operatorField', 'views/fields/enum', {
                name: 'operator',
                selector: '[data-field="operator"]',
                model: this.formModel,
                mode: 'edit',
                params: {
                    options: [
                        'plus',
                        'minus',
                    ],
                },
                translatedOptions: {
                    plus: '+',
                    minus: '-',
                },
            });

            this.createView('valueField', 'views/fields/int', {
                name: 'value',
                selector: '[data-field="value"]',
                model: this.formModel,
                mode: 'edit',
                min: 0.0,
            });
        },

        fetch: function () {
            let value = this.formModel.attributes.value;

            if (this.formModel.attributes.operator === 'minus') {
                value *= -1;
            }

            return {
                value: value,
                unit: 'days',
            };
        },

        afterRender: function () {
            this.$el.find('.selectize-control').addClass('input-sm').addClass('radius-left');
            this.$el.find('input.main-element').addClass('input-sm');
            this.$el.find('.input-group-addon')
                .addClass('input-sm')
                .css({
                    userSelect: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                });
        },
    });
});
