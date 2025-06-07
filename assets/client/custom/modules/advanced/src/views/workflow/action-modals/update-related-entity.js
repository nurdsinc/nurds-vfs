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

define('advanced:views/workflow/action-modals/update-related-entity',
['advanced:views/workflow/action-modals/create-entity', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/update-related-entity',

        permittedLinkTypes: ['belongsTo', 'hasMany', 'hasChildren', 'belongsToParent', 'hasOne'],

        /**
         * @return {string[][]}
         */
        getLinkOptions: function () {
            const list = Object.keys(this.getMetadata().get(`entityDefs.${this.entityType}.links`));
            const options = [['']];

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

        setup: function () {
            Dep.prototype.setup.call(this);

            const model = new Model();
            model.name = 'Workflow';

            this.modelForParentEntityType = model;

            this.actionModel = model;

            model.set({
                assignmentRule: this.actionData.assignmentRule,
                targetTeamId: this.actionData.targetTeamId,
                targetTeamName: this.actionData.targetTeamName,
                targetUserPosition: this.actionData.targetUserPosition,
                listReportId: this.actionData.listReportId,
                listReportName: this.actionData.listReportName,
                link: this.actionData.link,
            });

            let parentEntityTypeList = [];

            if (this.isParentLink()) {
                parentEntityTypeList = this.getParentEntityTypeList(this.actionData.link);
            }

            if (this.actionData.parentEntityType) {
                model.set('parentEntityType', this.actionData.parentEntityType);
            }

            this.createView('parentEntityType', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                el: this.getSelector() + ' .field[data-name="parentEntityType"]',
                defs: {
                    name: 'parentEntityType',
                    params: {
                        options: parentEntityTypeList,
                        translation: 'Global.scopeNames'
                    }
                },
                readOnly: this.readOnly,
            });

            this.listenTo(model, 'change', (m, o) => {
                if (o.ui) {
                    this.onParentEntityTypeChange();
                }
            });

            const linkOptions = this.getLinkOptions();

            this.createView('link', 'views/fields/enum', {
                name: 'link',
                model: model,
                mode: 'edit',
                selector: ' .field[data-name="link"]',
                params: {
                    options: linkOptions.map(it => it[0]),
                    required: true,
                },
                translatedOptions: linkOptions.reduce((prev, it) => ({...prev, [it[0]]: it[1]}), {}),
                labelText: this.translate('Field'),
            });

            this.listenTo(model, 'change:link', () => this.changeLinkAction());
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.controlParentEntityType();
        },

        controlParentEntityType: function () {
            const $parentEntityTypeCell = this.$el.find('.cell[data-name="parentEntityType"]');

            if (this.isParentLink()) {
                const parentEntityTypeList = this.getParentEntityTypeList(this.actionData.link);

                this.getView('parentEntityType').setOptionList(parentEntityTypeList);

                $parentEntityTypeCell.removeClass('hidden');
            } else {
                $parentEntityTypeCell.addClass('hidden');
            }
        },

        isParentLink: function () {
            return this.actionData.link &&
                this.getMetadata()
                    .get(['entityDefs', this.entityType, 'links', this.actionData.link, 'type']) === 'belongsToParent';
        },

        setupScope: function (callback) {
            if (this.actionData.link) {
                let scope;

                if (this.isParentLink()) {
                    scope = this.actionData.parentEntityType;
                } else {
                    scope = this.getMetadata()
                        .get(`entityDefs.${this.entityType}.links.${this.actionData.link}.entity`);
                }

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

        onParentEntityTypeChange: function () {
            this.actionData.fieldList.forEach(field => {
                this.$el.find('.field-row[data-field="' + field + '"]').remove();

                this.clearView('field-' + field);
            });

            this.actionData.fieldList = [];
            this.actionData.fields = {};

            this.actionData.parentEntityType = this.modelForParentEntityType.get('parentEntityType');

            this.handleLink();
        },

        changeLinkAction: function (e) {
            this.actionData.link = this.actionModel.attributes.link;
            this.actionData.parentEntityType = null;

            if (this.isParentLink()) {
                if (this.isParentLink()) {
                    const entityList = this.getParentEntityTypeList(this.actionData.link);

                    if (entityList.length) {
                        this.actionData.parentEntityType = entityList[0];
                    }
                }
            }

            this.modelForParentEntityType.set('parentEntityType', this.actionData.parentEntityType);

            this.actionData.fieldList.forEach(field => {
                this.$el.find('.field-row[data-field="' + field + '"]').remove();

                this.clearView('field-' + field);
            });

            this.actionData.fieldList = [];
            this.actionData.fields = {};

            this.controlParentEntityType();
            this.handleLink();
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

        getParentEntityTypeList: function(name) {
            return this.getMetadata().get(['entityDefs', this.entityType, 'fields', name, 'entityList']) ||
                this.getAllEntityList() || [];
        },

        getAllEntityList: function() {
            return  Object.keys(this.getMetadata().get('scopes'))
                .filter(scope => {
                    if (this.getMetadata().get('scopes.' + scope + '.disabled')) {
                        return;
                    }

                    return this.getMetadata().get('scopes.' + scope + '.entity') &&
                        this.getMetadata().get('scopes.' + scope + '.object');
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNamesPlural')
                        .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });
        },
    });
});
