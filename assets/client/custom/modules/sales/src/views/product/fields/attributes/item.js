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
 * License ID: 799ba07927a6a02c6a0ae59de64ec1ec
 ************************************************************************************/

define('sales:views/product/fields/attributes/item',
['view', 'model'], function (View, Model) {
/** @module modules/sales/views/product/fields/attributes/item */

    return class extends View {

        // language=Handlebars
        templateContent = `
            <div
                class="name pull-left"
                style="width: calc(40% - 50px)"
            ><span class="{{#if isEdit}}field-row-text-item{{/if}}">{{name}}</span></div>
            {{#if isEdit}}
            <div class="pull-right" style="width: 50px">
                <a
                    role="button"
                    data-id="{{id}}"
                    data-action="remove"
                    title="{{translate 'Remove'}}"
                    class="pull-right field-row-text-item"
                ><span class="fas fa-times"></span></a>
            </div>
            {{/if}}
            <div
                class="options pull-right"
                style="width: 60%"
            >{{{field}}}</div>
        `

        data() {
            return {
                id: this.item.id,
                name: this.item.name,
                isEdit: this.mode === 'edit',
            };
        }

        setup() {
            /** @type {module:modules/sales/views/product/fields/attributes~item} */
            this.item = this.options.item;
            /** @type {string} */
            this.mode = this.options.mode;
            /** @type {module:modules/sales/views/product/fields/attributes~updateOptions} */
            const updateOptions = this.options.updateOptions;

            /** @type {module:modules/sales/views/product/fields/attributes~option[]} */
            const options = this.options.options || this.item.options;

            const currentOptions = (this.item.options || []).map(item => item.id);

            this.model = new Model();
            this.model.setDefs({
                fields: {
                    options: {
                        type: 'multiEnum',
                        options: options.map(item => item.id),
                    },
                }
            });

            this.model.set('options', currentOptions);

            const names = options
                .reduce((map, item) => {
                    return {...map, [item.id]: item.name ?? item.id};
                }, {});

            this.createView('field', 'views/fields/multi-enum', {
                selector: '.options',
                model: this.model,
                mode: this.mode,
                name: 'options',
                inlineEditDisabled: true,
                translatedOptions: names,
                params: {
                    displayAsLabel: true
                },
            });

            this.model.on('change:options', (m, /** string[] */value) => {
                updateOptions(
                    this.item.id,
                    value.map(id => {
                        return {
                            id: id,
                            name: names[id],
                        };
                    })
                );
            });
        }

        getFieldView() {
            return this.getView('field');
        }

        /**
         * @param {module:modules/sales/views/product/fields/attributes~option[]} options
         */
        setOptions(options) {
            const translations = options.reduce((map, item) => {
                return {...map, [item.id]: item.name};
            }, {});

            const ids = options.map(item => item.id);

            this.getMultiEnumView().setTranslatedOptions(translations);
            this.getMultiEnumView().setOptionList(ids);
        }

        /**
         * @return {module:views/fields/array}
         */
        getMultiEnumView() {
            return this.getView('field');
        }
    };
});
