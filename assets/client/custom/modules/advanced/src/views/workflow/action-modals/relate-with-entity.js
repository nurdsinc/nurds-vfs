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

define('advanced:views/workflow/action-modals/relate-with-entity',
['advanced:views/workflow/action-modals/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/relate-with-entity',

        setup: function () {
            Dep.prototype.setup.call(this);
            this.setupScope();

            this.model = new Model();
            this.model.set('entityId', this.actionData.entityId || null);
            this.model.set('entityName', this.actionData.entityName || null);

            const model = this.actionModel = new Model();
            model.name = 'Workflow';

            this.actionModel.set({
                link: this.actionData.link,
            });

            const linkOptions = this.getLinkOptions();

            this.createView('link', 'views/fields/enum', {
                name: 'link',
                model: model,
                mode: 'edit',
                selector: '.field[data-name="link"]',
                params: {
                    options: linkOptions.map(it => it[0]),
                    required: true,
                },
                translatedOptions: linkOptions.reduce((prev, it) => ({...prev, [it[0]]: it[1]}), {}),
                labelText: this.translate('Field'),
            });

            this.listenTo(model, 'change:link', () => this.changeLinkAction());
        },

        /**
         * @return {string[][]}
         */
        getLinkOptions: function () {
            const options = [['']];

            const list = Object.keys(this.getMetadata().get(`entityDefs.${this.entityType}.links`) || [])
                .sort((v1, v2) => {
                    return this.translate(v1, 'links', this.scope)
                        .localeCompare(this.translate(v2, 'links', this.scope));
                });

            list.forEach(item => {
                const defs = this.getMetadata().get(`entityDefs.${this.entityType}.links.${item}`) || {};

                if (defs.disabled) {
                    return;
                }

                if ((defs.type !== 'hasMany' && defs.type !== 'hasChildren')) {
                    return;
                }

                const label = this.translate(item, 'links', this.entityType);

                options.push([item, label]);
            });

            return options;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.actionData.link) {
                this.createEntityLinkField();
            }
        },

        changeLinkAction: function () {
            this.actionData.link = this.actionModel.attributes.link;

            if (!this.actionData.link) {
                this.actionData.link = null;
            }

            this.setupScope();

            if (this.actionData.link) {
                this.createEntityLinkField();
            }

            this.model.set({
                'entityId': null,
                'entityName': null
            });
        },

        createEntityLinkField: function () {
            this.createView('entity', 'views/fields/link', {
                selector: '.field[data-name="entity"]',
                foreignScope: this.scope,
                name: 'entity',
                model: this.model,
                mode: 'edit',
            }, view => {
                view.render();
            });
        },

        setupScope: function () {
            if (this.actionData.link) {
                this.scope = this.getMetadata()
                    .get(`entityDefs.${this.entityType}.links.${this.actionData.link}.entity`);

                if (!this.scope) {
                    throw new Error;
                }
            } else {
                this.scope = null;
            }
        },

        fetch: function () {
            let isInvalid = false;

            if (this.getView('link')) {
                if (this.getView('link').validate()) {
                    isInvalid = true;
                }
            }

            if (isInvalid) {
                return false;
            }

            this.actionData.link = this.actionModel.attributes.link;

            if (!this.actionData.link) {
                return false;
            }

            this.actionData.entityId = this.model.get('entityId');
            this.actionData.entityName = this.model.get('entityName');

            if (!this.actionData.entityId) {
                return false;
            }

            return true;
        },
    });
});
