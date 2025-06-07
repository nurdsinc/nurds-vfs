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

define('sales:views/product/modals/select-variants', ['views/modal'], function (ModalView) {

    return class extends ModalView {

        // language=Handlebars
        templateContent = `
            {{#each viewObject.models}}
                <div
                    data-id="{{id}}"
                    class="margin-bottom-2x"
                >{{{var id ../this}}}</div>
            {{/each}}
        `

        setup() {
            this.headerText = this.translate('Select Variants', 'labels', 'Product');

            this.buttonList.push({
                name: 'select',
                style: 'danger',
                label: 'Select',
            });

            this.buttonList.push({
                name: 'cancel',
                label: 'Cancel',
            });

            /** @type {module:model[]} */
            this.models = this.options.models;

            this.models.forEach(model => {
                this.createView(model.id, 'sales:views/product/variant-select', {
                    model: model,
                    selector: `[data-id="${model.id}"]`,
                    isMultiple: true,
                    where: this.options.where,
                    mandatorySelectAttributeList: this.options.mandatorySelectAttributeList,
                }).then(view => {
                    this.listenTo(view, 'select', /** module:model[] */models => {
                        const listView = /** module:views/record/list */view.getListView();

                        models.forEach(model => listView.checkRecord(model.id));
                    });
                });
            });
        }

        /**
         * @param {string} id
         * @return {module:modules/sales/views/product/variant-select}
         */
        getItemView(id) {
            return this.getView(id);
        }

        // noinspection JSUnusedGlobalSymbols
        actionSelect() {
            const selectedModels = [];

            this.models.forEach(model => {
                const view = this.getItemView(model.id);

                view.getListView()
                    .getSelected()
                    .forEach(model => selectedModels.push(model));
            });

            this.trigger('select', selectedModels);
            this.close();
        }
    }
});
