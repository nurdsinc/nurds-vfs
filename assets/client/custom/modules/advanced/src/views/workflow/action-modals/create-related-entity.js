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

define('advanced:views/workflow/action-modals/create-related-entity',
['advanced:views/workflow/action-modals/create-entity', 'model'],
function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/create-related-entity',

        permittedLinkTypes: ['belongsTo', 'hasMany', 'hasChildren'],

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
                const defs = this.getMetadata().get(`entityDefs.${this.entityType}.links.${item}`);

                if (defs.disabled) {
                    return;
                }

                if (this.permittedLinkTypes.includes(defs.type)) {
                    const label = this.translate(item, 'links', this.entityType);

                    options.push([item, label]);
                }
            });

            return options;
        },

        setupScope: function (callback) {
            if (this.actionData.link) {
                const scope = this.getMetadata()
                    .get(`entityDefs.${this.entityType}.links.${this.actionData.link}.entity`);

                this.scope = scope;

                if (scope) {
                    this.wait(true);

                    this.getModelFactory().create(scope, model => {
                        this.model = model;

                        (this.actionData.fieldList || []).forEach(field => {
                            const attributes = (this.actionData.fields[field] || {}).attributes || {};

                            model.set(attributes, {silent: true});
                        });

                        callback();
                    });
                } else {
                    throw new Error;
                }
            } else {
                this.model = null;

                callback();
            }
        },

        setupFormulaView: function () {
            const model = new Model;

            if (this.hasFormulaAvailable) {
                model.set('formula', this.actionData.formula || null);

                this.createView('formula', 'views/fields/formula', {
                    name: 'formula',
                    model: model,
                    mode: this.readOnly ? 'detail' : 'edit',
                    height: 100,
                    el: this.getSelector() + ' .field[data-name="formula"]',
                    inlineEditDisabled: true,
                    targetEntityType: this.scope,
                }, view => {
                    view.render();
                });
            }
        },
    });
});
