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

define('advanced:views/workflow/field-definitions/fields/duration', ['views/fields/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        // language=Handlebars
        detailTemplateContent: `
            <span data-name="value">{{{valueField}}}</span>
            <span data-name="unit">{{{unitField}}}</span>
        `,

        editTemplateContent: `
            <div class="row">
                <div data-name="value" class="col-sm-6">{{{valueField}}}</div>
                <div data-name="unit" class="col-sm-6">{{{unitField}}}</div>
            </div>
        `,

        setup: function () {
            this.subModel = new Model();
            this.subModel.setDefs({
                fields: {
                    unit: {
                        type: 'enum',
                        options: [
                            'm',
                            'h',
                            'd',
                        ],
                        translation: 'Global.options.durationUnits',
                    },
                    value: {
                        type: 'int',
                        min: 0,
                    },
                }
            });

            this.syncModels();

            this.listenTo(this.model, 'change:duration', (m, v, o) => {
                if (o.ui) {
                    return;
                }

                this.syncModels();
            });

            this.listenTo(this.subModel, 'change', (m, o) => {
                if (!o.ui) {
                    return;
                }

                this.trigger('change');
            });
        },

        prepare: function () {
            const p1 = this.createView('unitField', 'views/fields/enum', {
                name: 'unit',
                model: this.subModel,
                mode: this.mode,
                selector: '[data-name="unit"]',
                readOnly: this.mode === 'detail',
            });

            const p2 = this.createView('valueField', 'views/fields/int', {
                name: 'value',
                model: this.subModel,
                mode: this.mode,
                selector: '[data-name="value"]',
                readOnly: this.mode === 'detail',
            });

            return Promise.all([p1, p2]);
        },

        syncModels: function () {
            let value = this.model.attributes.duration || 0;

            let unit;

            if (value % (3600 * 24) === 0) {
                unit = 'd';
                value = Math.floor(value / (3600 * 24));
            } else if ((value % 3600) === 0) {
                unit = 'h';
                value = Math.floor(value / 3600);
            } else {
                unit = 'm';
                value = Math.floor(value / 60);
            }

            this.subModel.set({
                value: value,
                unit: unit,
            });
        },

        fetch: function () {
            let value = this.subModel.attributes.value;

            if (!value) {
                value = 0;
            }

            const unit = this.subModel.attributes.unit;

            if (unit === 'd') {
                value *= 3600 * 24;
            } else if (unit === 'h') {
                value *= 3600;
            } else {
                value *= 60;
            }

            return {
                [this.name]: value,
            };
        },
    });
});
