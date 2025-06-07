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

define('advanced:views/report/modals/edit-columns', ['views/modal', 'model'], function (Dep) {

    return Dep.extend({

        // language=Handlebars
        templateContent: `
            <div class="panel panel-default no-side-margin">
                <div class="panel-body panel-body-form">
                    {{#each itemList}}
                        <div class="margin-bottom" data-key="{{key}}">{{{var key ../this}}}</div>
                        <hr>
                    {{/each}}
                    <div class="button-container margin-top-2x">
                        <div
                            class="btn btn-default btn-icon"
                            title="{{translate 'Add'}}"
                            data-action="add"
                        ><span class="fas fa-plus"></span></div>
                    </div>
                </div>
            </div>
        `,

        data: function () {
            return {
                itemList: this.getItemList(),
            };
        },

        setup: function () {
            this.addActionHandler('add', () => this.addItem());

            this.buttonList = [
                {
                    name: 'apply',
                    label: 'Apply',
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: dialog => dialog.close(),
                },
            ];

            this.entityType = /** @type {string} */this.options.entityType;

            /** @type {string[]} */
            this.expressions = Espo.Utils.clone(this.options.expressions || [])
                .map(it => it.replace(/\t/g, '\r\n'));
            /** @type {(string|null)[]} */
            this.labels = Espo.Utils.clone(this.options.labels || []);
            /** @type {(string|null)[]} */
            this.types = Espo.Utils.clone(this.options.types || []);
            /** @type {(number|null)[]} */
            this.decimals = Espo.Utils.clone(this.options.decimals || [])

            this.headerHtml = this.translate('columns', 'fields', 'Report');

            this.wait(
                this.createItemViews()
            );
        },

        /**
         * @return {{
         *     key: string,
         *     number: number,
         *     expression: string,
         *     label: string|null,
         *     type: string|null,
         *     decimalPlaces: number|null,
         * }[]}
         */
        getItemList: function () {
            return this.expressions.map((expression, i) => {
                return {
                    key: i.toString(),
                    number: i + 1,
                    expression: expression,
                    label: this.labels[i] || null,
                    type: this.types[i] || null,
                    decimalPlaces: this.decimals[i],
                };
            });
        },

        /**
         * @return {Promise}
         */
        createItemViews: function () {
            const promises = this.getItemList().map((item, i) => this.createItemView(i));

            return Promise.all(promises);
        },

        /**
         * @param {number }i
         * @return {Promise<module:view>}
         */
        createItemView(i) {
            const item = this.getItemList()[i];

            if (!item) {
                throw new Error(`No item ${i}.`);
            }

            return this.createView(item.key, 'advanced:views/report/fields/columns/item', {
                selector: `[data-key=${item.key}]`,
                expression: item.expression,
                label: item.label,
                type: item.type,
                decimalPlaces: item.decimalPlaces,
                entityType: this.entityType,
                number: item.number,
                onChange: (expression, label, type, decimals) => {
                    this.expressions[i] = expression;
                    this.labels[i] = label;
                    this.types[i] = type;
                    this.decimals[i] = decimals;
                },
            });
        },

        actionApply: function () {
            let isValid = true;

            this.getItemList().forEach(item => {
                if (this.getView(item.key).validate()) {
                    isValid = false;
                }
            });

            if (!isValid) {
                return;
            }

            const expressions = [];
            const labels = [];
            const types = [];
            const decimals = [];

            this.expressions.forEach((expr, i) => {
                if (expr === null) {
                    return;
                }

                expr = expr.replace(/(?:\r\n|\r|\n)/g, '\t');

                if (expr === '') {
                    return;
                }

                const label = this.labels[i] || null;
                const type = this.types[i] || null;
                const decimalPlaces = this.decimals[i];

                expressions.push(expr);
                labels.push(label);
                types.push(type);
                decimals.push(decimalPlaces);
            })

            this.trigger('apply', expressions, labels, types, decimals);
            this.remove();
        },

        addItem: function () {
            this.expressions.push(null);
            this.labels.push(null);
            this.types.push(null);
            this.decimals.push(null);

            this.createItemView(this.expressions.length - 1)
                .then(() => this.reRender());
        },
    });
});
