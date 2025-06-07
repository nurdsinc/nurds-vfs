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

define('advanced:views/report/fields/columns/item', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        // language=Handlebars
        templateContent: `
            <div class="row">
                <div class="cell form-group col-md-10">
                    <label class="control-label">#{{number}}</label>
                    <div class="field" data-name="expression">{{{expression}}}</div>
                </div>

            </div>
            <div class="row">
                <div class="cell form-group col-md-3">
                    <label class="control-label">{{translate 'Label' scope='Report'}}</label>
                    <div class="field" data-name="label">{{{label}}}</div>
                </div>
                <div class="cell form-group col-md-3">
                    <label class="control-label">{{translate 'Type' scope='Report'}}</label>
                    <div class="field" data-name="type">{{{type}}}</div>
                </div>
                <div class="cell form-group col-md-3">
                    <label class="control-label">{{translate 'Decimal Places' scope='Report'}}</label>
                    <div class="field" data-name="decimalPlaces">{{{decimalPlaces}}}</div>
                </div>
            </div>
        `,

        data: function () {
            return {
                number: this.options.number,
            };
        },

        setup: function () {
            const entityType = /** @type {string} */this.options.entityType;
            const onChange = /** @type {function(string|null, string|null, string|null, number|null): void} */
                this.options.onChange;

            const model = new Model();

            model.set({
                expression: this.options.expression || null,
                label: this.options.label || null,
                type: this.options.type || null,
                decimalPlaces: this.options.decimalPlaces,
            });

            this.listenTo(model, 'change', () => {
                let expression = model.attributes.expression;

                if (expression !== null) {
                    expression = expression.trim();
                }

                onChange(
                    expression,
                    model.attributes.label,
                    model.attributes.type,
                    model.attributes.decimalPlaces
                );
            });

            this.createView('expression', 'views/fields/complex-expression', {
                model: model,
                name: 'expression',
                selector: ' [data-name="expression"]',
                mode: 'edit',
                height: 50,
                targetEntityType: entityType,
            });

            this.createView('label', 'views/fields/varchar', {
                model: model,
                name: 'label',
                selector: ' [data-name="label"]',
                mode: 'edit',
                maxLength: 64,
            });

            this.createView('type', 'views/fields/enum', {
                model: model,
                name: 'type',
                selector: ' [data-name="type"]',
                mode: 'edit',
                params: {
                    options: [
                        '',
                        'Summary',
                    ],
                    translation: 'Report.options.columnType',
                },
            });

            this.createView('decimalPlaces', 'views/fields/int', {
                model: model,
                name: 'decimalPlaces',
                selector: ' [data-name="decimalPlaces"]',
                mode: 'edit',
                params: {
                    min: 0,
                    max: 8,
                },
                labelText: this.translate('Decimal Places', 'labels', 'Report'),
            });
        },

        validate: function () {
            const expressionView = /** @type {import('views/fields/complex-expression').default} */
                this.getView('expression');

            const decimalPlacesView = /** @type {import('views/fields/int').default} */
                this.getView('decimalPlaces');

            return expressionView.validate() || decimalPlacesView.validate();
        },
    });
});
