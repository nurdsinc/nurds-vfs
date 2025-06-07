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

define('sales:views/product/fields/attributes', ['views/fields/base'], function (BaseFieldView) {
/** @module modules/sales/views/product/fields/attributes */

    /**
     * @typedef {Object} module:modules/sales/views/product/fields/attributes~item
     * @property {string} id
     * @property {string} name
     * @property {module:modules/sales/views/product/fields/attributes~option[]} options
     */

    /**
     * @typedef {Object} module:modules/sales/views/product/fields/attributes~option
     * @property {string} id
     * @property {string} name
     */

    /**
     * @typedef {function} module:modules/sales/views/product/fields/attributes~updateOptions
     * @param {string} id
     * @param {{id: string, name: string}[]} options
     */

    /**
     * @typedef {function} module:modules/sales/views/product/fields/attributes~add
     * @param {module:modules/sales/views/product/fields/attributes~item} item
     */

    /**
     * @typedef {function} module:modules/sales/views/product/fields/attributes~remove
     * @param {string} id
     */

    /**
     * @extends module:views/fields/base
     */
    class ProductAttributesView extends BaseFieldView {

        detailTemplateContent = `
            {{#if isSet}}
                {{#unless isEmpty}}
                    <div class="list-group" style="margin-bottom: 0">
                        {{#each ids}}
                            <div class="list-group-item clearfix" data-id="{{this}}">{{{var ./this ../this}}}</div>
                        {{/each}}
                    </div>
                {{else}}
                    <span class="none-value">{{translate 'None'}}</span>
                {{/unless}}
            {{else}}
                <span class="loading-value">...</span>
            {{/if}}
        `

        editTemplateContent = `
            <div class="list-group">
                {{~#each dataList~}}
                    <div class="list-group-item clearfix" data-id="{{id}}">{{{var id ../this}}}</div>
                {{~/each~}}
            </div>
            <div>
                <button
                    type="button"
                    class="btn btn-default"
                    data-action="add"
                    title="{{translate 'Add'}}"
                ><span class="fas fa-plus"></span></button>
            </div>
        `

        validations = [
            'required',
            'valid',
        ]

        // noinspection JSCheckFunctionSignatures
        data() {
            return {
                isSet: this.model.has('attributes'),
                ids: this.getDataList().map(item => item.id),
                dataList: this.getDataList(),
                isEmpty: this.getDataList().length === 0,
            };
        }

        setup() {
            super.setup();

            if (!this.getAcl().checkScope('ProductAttribute')) {
                this.setReadOnly(true);
            }

            this.addActionHandler('add', () => this.actionAddItem());
            this.addActionHandler('remove', (e, element) => this.removeItem(element.dataset.id));

            /** @type {Object.<string, module:modules/sales/views/product/fields/attributes~option[]>}*/
            this.optionsMap = {};
        }

        afterRenderEdit() {
            const ids = this.getDataList().map(item => item.id);

            this.loadOptionsMap(ids);
        }

        /**
         * @param {string[]} ids
         * @return {Promise}
         */
        loadOptionsMap(ids) {
            if (ids.length === 0) {
                return Promise.resolve({});
            }

            return new Promise(resolve => {
                Espo.Ajax.getRequest('ProductAttribute/options', {ids: ids})
                    .then(/** Object.<string, module:modules/sales/views/product/fields/attributes~option[]> */map => {
                        for (const id in map) {
                            this.optionsMap[id] = map[id];

                            const view = this.getItemView(id);

                            if (!view) {
                                continue;
                            }

                            view.setOptions(map[id]);
                        }

                        resolve(map);
                    });
            });
        }

        /**
         * @param {string} id
         * @return {module:modules/sales/views/product/fields/attributes/item}
         */
        getItemView(id) {
            return this.getView(id);
        }

        prepare() {
            return Promise.all(
                this.getDataList().map(item => {
                    const id = item.id;

                    return this.createView(id, 'sales:views/product/fields/attributes/item', {
                        selector: `[data-id="${id}"]`,
                        item: item,
                        mode: this.mode,
                        updateOptions: (id, options) => {
                            this.updateItemOptions(id, options);
                        },
                        options: this.optionsMap[id],
                    });
                })
            );
        }

        /**
         * @return {module:modules/sales/views/product/fields/attributes~item[]}
         */
        getDataList() {
            return Espo.Utils.cloneDeep(this.model.get('attributes') || []);
        }

        /**
         * @param {string} id
         * @param {module:modules/sales/views/product/fields/attributes~option[]} options
         */
        updateItemOptions(id, options) {
            const dataList = this.getDataList();

            const index = dataList.findIndex(item => id === item.id);

            if (index === undefined) {
                return;
            }

            dataList[index].options = Espo.Utils.cloneDeep(options);

            this.model.set('attributes', dataList, {ui: true});
        }

        /**
         * @param {string} id
         */
        removeItem(id) {
            const dataList = this.getDataList();

            const index = dataList.findIndex(item => item.id === id);

            if (index === undefined) {
                return;
            }

            dataList.splice(index, 1);

            this.model.set('attributes', dataList);
        }

        /**
         * @param {module:modules/sales/views/product/fields/attributes~item} item
         */
        add(item) {
            const dataList = this.getDataList();

            if (dataList.find(it => it.id === item.id)) {
                return;
            }

            dataList.push({
                id: item.id,
                name: item.name,
                options: [],
            });

            this.model.set('attributes', dataList, {ui: true});
        }

        actionAddItem() {
            Espo.Ui.notify(' ... ');

            this.createView('dialog', 'views/modals/select-records', {
                scope: 'ProductAttribute',
                entityType: 'ProductAttribute', // for possible support in future
                multiple: true,
                createButton: false,
            }).then(view => {
                view.render();

                Espo.Ui.notify(false);

                this.listenToOnce(view, 'select', /** module:model[] */models => {
                    const ids = models.map(model => model.id);

                    /** @type {module:modules/sales/views/product/fields/attributes~item[]} */
                    const items = models.map(model => {
                        return {
                            id: model.id,
                            name: model.get('name'),
                            options: [],
                        };
                    });

                    this.loadOptionsMap(ids)
                        .then(() => {
                            items.forEach(item => this.add(item));

                            this.prepare()
                                .then(() => this.reRender());
                        });
                });
            });
        }

        validateRequired() {
            if (this.model.get('type') !== 'Template') {
                return false;
            }

            if (this.getDataList().length) {
                return false;
            }

            if (!this.element) {
                return false;
            }

            const msg = this.translate('attributesRequired', 'messages', 'Product');
            const element = this.element.querySelector('button[data-action="add"]');

            this.showValidationMessage(msg, element);

            return true;
        }

        // noinspection JSUnusedGlobalSymbols
        validateValid() {
            let isValid = true;

            this.getDataList().forEach(item => {
                if (item.options.length)  {
                    return;
                }

                isValid = false;

                const msg = this.translate('optionsRequired', 'messages', 'Product');
                const element = this.element.querySelector(`.list-group-item[data-id="${item.id}"] .selectize-control`);

                this.showValidationMessage(msg, element, this.getItemView(item.id).getFieldView());
            });

            return !isValid;
        }
    }

    return ProductAttributesView;
});
