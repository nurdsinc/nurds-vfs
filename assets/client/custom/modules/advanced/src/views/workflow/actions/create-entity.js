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

define('advanced:views/workflow/actions/create-entity', ['advanced:views/workflow/actions/base', 'model'],
function (Dep, Model) {

    return Dep.extend({

        type: 'createEntity',

        defaultActionData: {
            link: false,
            fieldList: [],
            fields: {},
        },

        data: function () {
            const data = Dep.prototype.data.call(this);

            data.numberId = this.numberId;
            data.aliasId = this.aliasId;

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.numberId = null;

            if (this.options.flowchartElementId && this.options.flowchartCreatedEntitiesData) {
                const aliasId = this.options.flowchartElementId + '_' + this.actionData.id;

                if (aliasId in this.options.flowchartCreatedEntitiesData) {
                    this.numberId = this.options.flowchartCreatedEntitiesData[aliasId].numberId;

                }

                this.aliasId = aliasId;
            }
        },

        additionalSetup: function() {
            Dep.prototype.additionalSetup.call(this);

            this.displayedLinkedEntityName = this.translate(this.actionData.link, 'scopeNames');
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.type === 'createEntity') {
                const model = new Model;

                model.set('linkList', this.actionData.linkList);

                const translatedOptions = {};

                (this.actionData.linkList || []).forEach(link => {
                    translatedOptions[link] = this.getLanguage().translate(link, 'links', this.actionData.link);
                });

                this.createView('linkList', 'views/fields/multi-enum', {
                    model: model,
                    selector: '.field[data-name="linkList"]',
                    mode: 'detail',
                    name: 'linkList',
                    inlineEditDisabled: true,
                    translatedOptions: translatedOptions,
                }, view => {
                    view.render();
                });
            }
        },
    });
});
