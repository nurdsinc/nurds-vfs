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

define('advanced:views/workflow/action-modals/send-request',
['advanced:views/workflow/action-modals/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/send-request',

        setModel: function () {
            this.model.set({
                requestType: this.actionData.requestType || null,
                contentType: this.actionData.contentType || null,
                content: this.actionData.content || null,
                requestUrl: this.actionData.requestUrl || null,
                headers: this.actionData.headers || null,
                contentVariable: this.actionData.contentVariable || null,
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            let model = this.model = new Model();
            model.name = 'Workflow';

            this.setModel();

            this.on('apply-change', () => {
                this.setModel();
            });

            this.createView('requestType', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="requestType"]',
                defs: {
                    name: 'requestType',
                    params: {
                        options: [
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE',
                            'GET',
                        ],
                    }
                },
                readOnly: this.readOnly,
            });

            this.createView('contentType', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="contentType"]',
                defs: {
                    name: 'contentType',
                    params: {
                        options: [
                            '',
                            'application/json',
                            'application/x-www-form-urlencoded',
                        ],
                    }
                },
                translatedOptions: {
                    '': this.translate('None'),
                },
                readOnly: this.readOnly,
            }, view => {
                view.fetchEmptyValueAsNull = true;
            });

            this.createView('contentVariable', 'views/fields/varchar', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="contentVariable"]',
                defs: {
                    name: 'contentVariable',
                    params: {
                        maxLength: 100,
                    }
                },
                readOnly: this.readOnly,
                tooltip: 'requestContentVariable',
            });

            this.createView('requestUrl', 'views/fields/varchar', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="requestUrl"]',
                defs: {
                    name: 'requestUrl',
                    params: {
                        required: true,
                    }
                },
                readOnly: this.readOnly,
                tooltip: 'requestUrl',
            });

            this.createView('content', 'views/fields/formula', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="content"]',
                defs: {
                    name: 'content',
                },
                insertDisabled: true,
                checkSyntaxDisabled: true,
                height: 60,
                readOnly: this.readOnly,
                tooltip: 'requestContent',
            }, (view) => {
                view.validations = ['json'];
                view.validateJson = function () {
                    let value = this.model.get(this.name) || '';

                    value = value.trim();

                    if (!value) {
                        return;
                    }

                    value = value.replace(/\{\$[a-zA-Z0-9_]+\}/g, '1');
                    value = value.replace(/\{\$\$[a-zA-Z0-9_]+\}/g, '1');

                    try {
                        JSON.parse(value);

                        return false;
                    } catch (e) {}

                    let msg = this.translate('jsonInvalid', 'messages', 'Workflow');

                    this.showValidationMessage(msg, '.ace_editor');

                    return true;
                };
            });

            this.createView('headers', 'advanced:views/workflow/fields/request-headers', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="headers"]',
                defs: {
                    name: 'headers',
                    params: {
                        noEmptyString: true,
                    },
                },
                readOnly: this.readOnly,
                tooltip: 'requestHeaders',
            });
        },

        fetch: function () {
            this.getView('requestType').fetchToModel();
            this.getView('contentType').fetchToModel();
            this.getView('requestUrl').fetchToModel();
            this.getView('content').fetchToModel();
            this.getView('headers').fetchToModel();
            this.getView('contentVariable').fetchToModel();

            let isInvalid = false;
            isInvalid = isInvalid || this.getView('content').validate();
            isInvalid = isInvalid || this.getView('requestUrl').validate();

            if (isInvalid) {
                return;
            }

            this.actionData.requestType = (this.getView('requestType').fetch() || {}).requestType;
            this.actionData.contentType = (this.getView('contentType').fetch() || {}).contentType;
            this.actionData.requestUrl = (this.getView('requestUrl').fetch() || {}).requestUrl;
            this.actionData.content = (this.getView('content').fetch() || {}).content;
            this.actionData.headers = (this.getView('headers').fetch() || {}).headers;
            this.actionData.contentVariable = (this.getView('contentVariable').fetch() || {}).contentVariable;

            return true;
        },
    });
});
