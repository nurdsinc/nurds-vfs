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

define('sales:views/product/variant-select', ['view', 'model', 'collection'], function (View, Model) {
/** @module modules/sales/views/product/variant-select */

    return class extends View {

        // language=Handlebars
        templateContent = `
            <div
                class="panel panel-default"
                {{#if isMultiple}}
                    style="border-bottom-left-radius: 0; border-bottom-right-radius: 0"
                {{/if}}
            >
                {{#if isMultiple}}
                    <div class="panel-heading">
                        <h4 class="panel-title">{{name}}</h4>
                    </div>
                {{/if}}
                <div class="panel-body">
                    <div class="grid-auto-fill-sm">
                        {{#each attributeDataList}}
                            <div class="cell margin-bottom">
                                <label class="control-label">{{name}}</label>
                                <div class="field" data-id="{{id}}">{{{var id ../this}}}</div>
                            </div>
                        {{/each}}
                    </div>
                </div>
            </div>
            {{#if isMultiple}}
            <div
                class="panel panel-default sticked"
                style="border-top-left-radius: 0; border-top-right-radius: 0"
            >
                <div class="panel-body">
                    <div class="list-container">{{{list}}}</div>
                </div>
            </div>
            {{else}}
                <div class="list-container">{{{list}}}</div>
            {{/if}}
        `

        data() {
            return {
                attributeDataList: this.attributeDataList,
                isMultiple: this.isMultiple,
                name: this.model.get('name'),
            };
        }

        setup() {
            this.isMultiple = this.options.isMultiple;

            const mandatorySelectAttributeList = this.options.mandatorySelectAttributeList || [];

            this.where = Espo.Utils.cloneDeep(this.options.where || [])
                .filter(item => item.type !== 'primary');

            this.wait(
                this.model.fetch()
                    .then(() => {
                        /** @type {{id: string, name: string, options: {id: string, name: string}[]}[]} */
                        this.attributeDataList = this.model.get('attributes') || [];

                        this.initAttributes();
                    })
            );

            this.wait(
                this.getCollectionFactory().create('Product')
                    .then(collection => {
                        collection.url = `Product/${this.model.id}/variants`;
                        collection.data.primaryFilter = 'availableVariants';
                        collection.where = this.where;
                        collection.orderBy = 'variantOrder';
                        collection.defaultOrderBy = 'variantOrder';
                        collection.maxSize = (
                            this.isMultiple ?
                                this.getConfig().get('recordsPerPageSmall') :
                                this.getConfig().get('recordsPerPageSelect')
                        ) || 5;

                        this.collection = collection;

                        return this.createView('list', 'views/record/list', {
                            selector: `.list-container`,
                            collection: collection,
                            layoutName: 'listVariant',
                            rowActionsDisabled: true,
                            massActionsDisabled: true,
                            checkboxesDisabled: !this.isMultiple,
                            checkboxes: this.isMultiple,
                            checkAllResultDisabled: true,
                            selectable: true,
                            buttonsDisabled: true,
                            skipBuildRows: true,
                        });
                    })
                    .then(view => {
                        this.getListView().getSelectAttributeList(select => {
                            const list = [...new Set([...select, ...mandatorySelectAttributeList])];

                            this.collection.data.select = list.join(',');
                        });

                        this.listenTo(view, 'select', model => {
                            if (!this.isMultiple) {
                                this.trigger('select', [model]);

                                return;
                            }

                            this.trigger('select', model);
                        });
                    })
            );
        }

        /**
         * @return {module:views/record/list}
         */
        getListView() {
            return this.getView('list');
        }

        afterRender() {
            this.collection.fetch();
        }

        initAttributes() {
            const model = new Model();

            this.attributeDataList.forEach(item => {
                this.createView(item.id, 'views/fields/enum', {
                    name: item.id,
                    model: model,
                    selector: `[data-id="${item.id}"]`,
                    mode: 'edit',
                    params: {
                        options: ['', ...item.options.map(it => it.id)],
                    },
                    translatedOptions: item.options.reduce((o, item) => {
                        return {[item.id]: item.name, ...o};
                    }, {}),
                });
            });

            this.listenTo(model, 'change', () => {
                const ids = this.attributeDataList
                    .map(item => model.get(item.id))
                    .filter(id => id);

                const where = [...this.where];

                if (ids.length) {
                    where.push({
                        type: 'linkedWithAll',
                        attribute: 'variantAttributeOptions',
                        value: ids,
                    });
                }

                this.collection.where = where;

                Espo.Ui.notify(' ... ');

                this.collection.fetch()
                    .then(() => Espo.Ui.notify(false));
            });
        }
    }
});
