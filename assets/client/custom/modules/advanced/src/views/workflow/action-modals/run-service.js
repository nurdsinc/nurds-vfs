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

define('advanced:views/workflow/action-modals/run-service',
['advanced:views/workflow/action-modals/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/run-service',

        data: function () {
            return _.extend({

            }, Dep.prototype.data.call(this));
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            var model = new Model();
            model.name = 'Workflow';
            this.actionModel = model;

            if (this.actionData.methodName) {
                model.set({
                    methodName: this.actionData.methodName,
                    additionalParameters: this.actionData.additionalParameters,
                    helpText: this.getHelperText(this.actionData.methodName),
                    target: this.actionData.target || 'targetEntity'
                });
            }

            this.controlTargetEntity();

            this.listenTo(model, 'change:target', () => {
                this.actionData.target = model.get('target') || null;
                model.set({
                    methodName: null
                });

                this.controlTargetEntity();

                var methodNameView = this.getView('methodName');

                if (methodNameView) {
                    methodNameView.translatedOptions = this.methodTranslatedOptions;
                    methodNameView.setOptionList(this.methodOptionList);
                }
            });

            this.setupTargetOptions();

            this.createView('target', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="target"]',
                defs: {
                    name: 'target',
                    params: {
                        options: this.targetOptionList
                    }
                },
                readOnly: this.readOnly,
                translatedOptions: this.targetTranslatedOptions,
            });

            this.createView('methodName', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="methodName"]',
                defs: {
                    name: 'methodName',
                    params: {
                        options: this.methodOptionList,
                        required: true,
                        translatedOptions: this.methodTranslatedOptions,
                    },
                },
                readOnly: this.readOnly,
            });

            this.createView('additionalParameters', 'views/fields/formula', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="additionalParameters"]',
                defs: {
                    name: 'additionalParameters'
                },
                readOnly: this.readOnly,
                height: 60,
                insertDisabled: true,
                checkSyntaxDisabled: true,
            }, view => {
                view.validations = ['json'];

                view.validateJson = function () {
                    var value = this.model.get(this.name);

                    if (!value) {
                        return;
                    }

                    value = value.trim();

                    if (!value) {
                        return;
                    }

                    try {
                        JSON.parse(value);

                        return false;
                    }
                    catch (e) {}

                    var msg = this.translate('jsonInvalid', 'messages', 'Workflow');

                    this.showValidationMessage(msg, '.ace_editor');

                    return true;
                };
            });

            var helpView = this.createView('helpText', 'advanced:views/workflow/fields/help-text', {
                mode: 'detail',
                model: model,
                el: this.options.el + ' .field[data-name="helpText"]',
                defs: {
                    name: 'helpText'
                },
                readOnly: true,
            });

            this.listenTo(model, 'change:methodName', () => {
                var text = this.getHelperText(model.get('methodName')).toString();

                model.set('helpText', text);
            });
        },

        controlTargetEntity: function () {
            this.setupMethodOptionList();
        },

        setupMethodOptionList: function () {
            var methodOptionList = [''];
            var translatedOptions = {};

            var entityType = this.entityType;

            var target = this.actionData.target || 'targetEntity';

            if (target.indexOf('link:') === 0) {
                var link = target.substr(5);

                entityType = this.getMetadata().get(['entityDefs', this.entityType, 'links', link, 'entity']);
            }
            else if (target.indexOf('created:') === 0) {
                var aliasId = target.substr(8);
                entityType = this.options.flowchartCreatedEntitiesData[aliasId].entityType;
            }

            if (entityType) {
                const actionsData = this.getMetadata().get(['entityDefs', 'Workflow', 'serviceActions', entityType]);

                if (actionsData && Array.isArray(actionsData)) {
                    actionsData.forEach(methodName => {
                        methodOptionList.push(methodName);

                        translatedOptions[methodName] = this.getLabel(methodName, 'serviceActions');
                    });
                }
                else if (actionsData) {
                    for (const methodName in actionsData) {
                        methodOptionList.push(methodName);
                        translatedOptions[methodName] = this.getLabel(methodName, 'serviceActions');
                    }
                }

                /** @type {string[]} */
                const actions = [
                    ...Object.keys(this.getMetadata().get(`app.workflow.serviceActions.Global`) || {}),
                    ...Object.keys(this.getMetadata().get(`app.workflow.serviceActions.${entityType}`) || {}),
                ];

                actions.forEach(item => {
                    if (methodOptionList.includes(item))  {
                        return;
                    }

                    methodOptionList.push(item);
                    translatedOptions[item] = this.getLabel(item, 'serviceActions');
                });
            }

            this.targetEntityType = entityType;
            this.methodOptionList = methodOptionList;
            this.methodTranslatedOptions = translatedOptions;
        },

        setupTargetOptions: function () {
            const targetOptionList = [];

            const translatedOptions = {
                targetEntity: this.translateTargetItem('targetEntity', true)
            };

            targetOptionList.push('targetEntity');

            const linkDefs = this.getMetadata().get(['entityDefs', this.entityType, 'links']) || {};

            Object.keys(linkDefs).forEach(link =>{
                const type = linkDefs[link].type;

                if (type !== 'belongsTo') {
                    return;
                }

                const value = 'link:' + link;
                targetOptionList.push(value);

                translatedOptions[value] = this.translateTargetItem(value, true);
            });

            if (this.options.flowchartCreatedEntitiesData) {
                Object.keys(this.options.flowchartCreatedEntitiesData).forEach(aliasId => {
                    const value = 'created:' + aliasId;
                    targetOptionList.push(value);

                    translatedOptions[value] = this.translateTargetItem(value, true);
                });
            }

            this.targetOptionList = targetOptionList;
            this.targetTranslatedOptions = translatedOptions;
        },

        fetch: function () {
            const actionModel = this.actionModel;

            this.getView('methodName').fetchToModel();
            this.getView('additionalParameters').fetchToModel();

            let isInvalid = false;

            isInvalid = isInvalid || this.getView('methodName').validate();
            isInvalid = isInvalid || this.getView('additionalParameters').validate();

            if (isInvalid) {
                return;
            }

            this.actionData.target = actionModel.get('target') || null;

            this.actionData.targetEntityType = this.targetEntityType;

            this.actionData.methodName = (this.getView('methodName').fetch()).methodName;
            this.actionData.additionalParameters = (this.getView('additionalParameters').fetch()).additionalParameters;

            return true;
        },

        getLabel: function (methodName, category, defaultValue) {
            if (!methodName) {
                return defaultValue;
            }

            const labelName = this.targetEntityType + methodName.charAt(0).toUpperCase() + methodName.slice(1);

            if (this.getLanguage().has(labelName, category, 'Workflow')) {
                return this.translate(labelName, category, 'Workflow');
            }

            if (defaultValue != null && !this.getLanguage().has(methodName, category, 'Workflow')) {
                return defaultValue;
            }

            return this.translate(methodName, category, 'Workflow');
        },

        getHelperText: function (methodName) {
            let label = this.getLabel(methodName, 'serviceActionsHelp', '');

            if (this.getHelper().transformMarkdownText) {
                label = label.replace(/&quot;/g, '"')
                label = this.getHelper().transformMarkdownText(label, {});
            }

            return label;
        },
    });
});
