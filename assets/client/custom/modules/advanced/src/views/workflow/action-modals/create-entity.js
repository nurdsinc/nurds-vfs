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

define('advanced:views/workflow/action-modals/create-entity', ['advanced:views/workflow/action-modals/base', 'model'],
function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/create-entity',

        data: function () {
            return _.extend({
                scope: this.scope,
            }, Dep.prototype.data.call(this));
        },

        events: {
            'click [data-action="addField"]': function (e) {
                const $target = $(e.currentTarget);
                const field = $target.data('field');

                if (!this.actionData.fieldList.includes(field)) {
                    this.actionData.fieldList.push(field);
                    this.actionData.fields[field] = {};

                    this.addField(field, false, true);
                }
            },
            'click [data-action="removeField"]': function (e) {
                const $target = $(e.currentTarget);
                const field = $target.data('field');
                this.clearView('field-' + field);

                delete this.actionData.fields[field];

                const index = this.actionData.fieldList.indexOf(field);
                this.actionData.fieldList.splice(index, 1);

                $target.parent().remove();
            },
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.$fieldDefinitions = this.$el.find('.field-definitions');
            this.$formulaCell = this.$el.find('.cell[data-name="formula"]');

            this.handleLink();

            (this.actionData.fieldList || []).forEach(field => {
                this.addField(field, this.actionData.fields[field]);
            });
        },

        setupScope: function (callback) {
            if (this.actionData.link) {
                const scope = this.actionData.link;

                this.scope = scope;

                if (!scope) {
                    throw new Error;
                }

                this.wait(true);

                this.getModelFactory().create(scope, model => {
                    this.model = model;

                    (this.actionData.fieldList || []).forEach(field => {
                        const attributes = (this.actionData.fields[field] || {}).attributes || {};

                        model.set(attributes, {silent: true});
                    });

                    this.linkList = this.getLinkList(scope);

                    if (this.isRendered()) {
                        this.controlLinkList();
                    } else {
                        this.once('after:render', () => {
                            this.controlLinkList();
                        });
                    }

                    callback();
                });

                return;
            }

            this.model = null;

            this.linkList = [];

            if (this.isRendered()) {
                this.controlLinkList();
            } else {
                this.once('after:render', () => {
                    this.controlLinkList();
                });
            }

            callback();
        },

        controlLinkList: function () {
            const $linkListCell = this.$el.find('.cell[data-name="linkList"]');
            const translatedOptions = {};

            if (this.linkList.length) {
                $linkListCell.removeClass('hidden');

                this.linkList.forEach(link => {
                    translatedOptions[link] = this.getLanguage().translate(link, 'links', this.scope);
                });

            } else {
                $linkListCell.addClass('hidden');
            }

            this.getView('linkList').setOptionList(this.linkList);
            this.getView('linkList').setTranslatedOptions(translatedOptions);
            this.getView('linkList').reRender();
        },

        getLinkList: function (scope) {
            const targetEntity = this.entityType;

            const linkDefs = this.getMetadata().get(['entityDefs', scope, 'links']) || {};
            const fieldDefs = this.getMetadata().get(['entityDefs', scope, 'fields']) || {};

            const linkList = [];

            Object.keys(linkDefs).forEach(link => {
                const foreignEntity = (linkDefs[link] || {}).entity;
                const type = (linkDefs[link] || {}).type;

                if (type === 'belongsToParent') {
                    if (~((fieldDefs[link] || {}).entityList || []).indexOf(targetEntity)) {
                        linkList.push(link);
                    }
                } else {
                    if (foreignEntity === targetEntity) {
                        linkList.push(link);
                    }
                }
            });

            return linkList;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.hasFormulaAvailable = !!this.getMetadata().get('app.formula.functionList');

            this.wait(true);

            this.setupScope(() => {
                this.wait(false);
            });

            const model = this.actionModel = new Model();
            model.name = 'Workflow';

            this.actionModel.set({
                link: this.actionData.link,
            });

            if (this.actionType === 'createEntity') {
                model.set('linkList', this.actionData.linkList || []);

                this.createView('linkList', 'views/fields/multi-enum', {
                    name: 'linkList',
                    model: model,
                    selector: ' .field[data-name="linkList"]',
                    mode: 'edit',
                });
            }

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

        addField: function (field, fieldData, isNew) {
            const fieldType = this.getMetadata().get(`entityDefs.${this.scope}.fields.${field}.type`) || 'base';
            const type = this.getMetadata().get(`entityDefs.Workflow.fieldDefinitions.${fieldType}`) || 'base';

            fieldData = fieldData || false;

            const escapedField = this.getHelper().escapeString(field);

            const fieldNameHtml = '<label>' + this.translate(escapedField, 'fields', this.scope) + '</label>';

            const removeLinkHtml =
                '<a role="button" tabindex="0" class="pull-right" data-action="removeField" ' +
                'data-field="' + escapedField + '"><span class="fas fa-times"></span></a>';

            const html = '<div class="margin clearfix field-row" ' +
                'data-field="' + escapedField + '" style="margin-left: 20px;">' + removeLinkHtml + fieldNameHtml +
                '<div class="field-container field" data-field="' + escapedField + '"></div></div>';

            this.$fieldDefinitions.append($(html));

            const fieldViewName =`advanced:views/workflow/field-definitions/${Espo.Utils.camelCaseToHyphen(type)}`;

            this.createView(`field-${field}`, fieldViewName, {
                selector: `.field-container[data-field="${field}"]`,
                fieldData: fieldData,
                model: this.model,
                field: field,
                entityType: this.entityType,
                scope: this.scope,
                type: type,
                fieldType: fieldType,
                isNew: isNew,
            }, view => {
                view.render();
            });
        },

        handleLink: function () {
            const link = this.actionData.link;

            if (!link) {
                this.clearView('addField');
                this.clearView('formula');
                this.$formulaCell.addClass('hidden');

                return;
            }

            if (this.hasFormulaAvailable) {
                this.$formulaCell.removeClass('hidden');
            }

            this.setupScope(() => {
                this.createView('addField', 'advanced:views/workflow/action-fields/add-field', {
                    selector: '.add-field-container',
                    scope: this.scope,
                    fieldList: this.getFieldList(),
                    addedFieldList: this.actionData.fieldList,
                    onAdd: field => {
                        if (this.actionData.fieldList.includes(field)) {
                            return;
                        }

                        this.actionData.fieldList.push(field);
                        this.actionData.fields[field] = {};

                        this.addField(field, false, true);
                    },
                }, view => {
                    view.render();
                });
            });

            this.setupFormulaView();
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
                    targetEntityType: this.actionData.link
                }, view => {
                    view.render();
                });
            }
        },

        getFieldList: function () {
            const fieldDefs = this.getMetadata().get('entityDefs.' + this.scope + '.fields') || {};

            return Object.keys(fieldDefs)
                .filter(field => {
                    const type = fieldDefs[field].type;

                    if (fieldDefs[field].workflowDisabled) {
                        return false;
                    }

                    if (fieldDefs[field].disabled || fieldDefs[field].utility) {
                        return false;
                    }

                    if (fieldDefs[field].directAccessDisabled) {
                        return false;
                    }

                    if (fieldDefs[field].directUpdateDisabled) {
                        return false;
                    }

                    return !~['currencyConverted', 'autoincrement', 'map', 'foreign'].indexOf(type);
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'fields', this.scope)
                        .localeCompare(this.translate(v2, 'fields', this.scope));
                });
        },

        /**
         * @return {string[][]}
         */
        getLinkOptions: function () {
            const options = [['']];

            this.getEntityList().forEach(entityType => {
                const label = this.translate(entityType, 'scopeNames');

                options.push([entityType, label]);
            });

            return options;
        },

        fetch: function () {
            let isValid = true;
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

            (this.actionData.fieldList || []).forEach(field => {
                isValid = this.getView(`field-${field}`).fetch();

                this.actionData.fields[field] = this.getView(`field-${field}`).fieldData;
            });

            if (this.hasFormulaAvailable) {
                if (this.actionData.link) {
                    const formulaView = this.getView('formula');

                    if (formulaView) {
                        this.actionData.formula = formulaView.fetch().formula;
                    }
                }
            }

            if (this.actionType === 'createEntity') {
                this.actionData.linkList = this.actionModel.get('linkList');
                this.actionData.entityType = this.actionData.link;
            }

            return isValid;
        },

        /**
         * @return {string[]}
         */
        getEntityList: function() {
            const scopes = this.getMetadata().get('scopes');

            return Object.keys(scopes)
                .filter(scope => {
                    const defs = scopes[scope];

                    return (defs.entity && (defs.tab || defs.object || defs.workflow));
                })
                .sort((v1, v2) => {
                    return this.translate(v1, 'scopeNamesPlural')
                        .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });
        },

        changeLinkAction: function () {
            this.actionData.link = this.actionModel.attributes.link;

            this.actionData.fieldList.forEach(field => {
                this.$el.find(`.field-row[data-field="${field}"]`).remove();

                this.clearView('field-' + field);
            });

            this.actionData.fieldList = [];
            this.actionData.fields = {};

            this.actionData.linkList = [];

            if (this.actionType === 'createEntity') {
                this.actionModel.set('linkList', []);
            }

            this.handleLink();
        },
    });
});
