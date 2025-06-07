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

define('advanced:views/workflow/actions/send-email', ['advanced:views/workflow/actions/base', 'model'],
function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/actions/send-email',

        type: 'sendEmail',

        defaultActionData: {
            execution: {
                type: 'immediately',
                field: false,
                shiftDays: 0,
                shiftUnit: 'days',
            },
            from: 'system',
            to: '',
            optOutLink: false,
        },

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.fromLabel = this.translateEmailOption(this.actionData.from);
            data.toLabel = this.translateEmailOption(this.actionData.to);
            data.replyToLabel = this.translateEmailOption(this.actionData.replyTo);

            return data;
        },

        setModel: function () {
            this.model.set({
                emailTemplateId: this.actionData.emailTemplateId,
                emailTemplateName: this.actionData.emailTemplateName,
                doNotStore: this.actionData.doNotStore || false,
                optOutLink: this.actionData.optOutLink || false,
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.createView('executionTime', 'advanced:views/workflow/action-fields/execution-time', {
                el: this.options.el + ' .execution-time-container',
                executionData: this.actionData.execution || {},
                entityType: this.entityType,
                readOnly: true,
            });

            let model = this.model = new Model();
            model.name = 'Workflow';

            this.setModel();

            this.on('change', () => {
                this.setModel();
            });

            this.createView('emailTemplate', 'views/fields/link', {
                el: this.options.el + ' .field-emailTemplate',
                model: model,
                mode: 'edit',
                foreignScope: 'EmailTemplate',
                defs: {
                    name: 'emailTemplate',
                    params: {
                        required: true,
                    }
                },
                readOnly: true,
            });

            this.createView('toSpecifiedTeams', 'views/fields/link-multiple', {
                el: this.options.el + ' .toSpecifiedTeams-container .field-toSpecifiedTeams',
                model: model,
                mode: 'edit',
                foreignScope: 'Team',
                defs: {
                    name: 'toSpecifiedTeams'
                },
                readOnly: true,
            });

            this.createView('toSpecifiedUsers', 'views/fields/link-multiple', {
                el: this.options.el + ' .toSpecifiedUsers-container .field-toSpecifiedUsers',
                model: model,
                mode: 'edit',
                foreignScope: 'User',
                defs: {
                    name: 'toSpecifiedUsers'
                },
                readOnly: true,
            });

            this.createView('toSpecifiedContacts', 'views/fields/link-multiple', {
                el: this.options.el + ' .toSpecifiedContacts-container .field-toSpecifiedContacts',
                model: model,
                mode: 'edit',
                foreignScope: 'Contact',
                defs: {
                    name: 'toSpecifiedContacts'
                },
                readOnly: true,
            });

            this.createView('doNotStore', 'views/fields/bool', {
                el: this.options.el + ' .field-doNotStore',
                model: model,
                mode: 'edit',
                defs: {
                    name: 'doNotStore',
                },
                readOnly: true,
            });

            this.createView('optOutLink', 'views/fields/bool', {
                el: this.options.el + ' .field[data-name="optOutLink"]',
                model: model,
                mode: 'edit',
                defs: {
                    name: 'optOutLink',
                },
                readOnly: true,
            });
        },

        render: function (callback) {
            this.getView('executionTime').reRender();

            let emailTemplateView = this.getView('emailTemplate');

            emailTemplateView.model.set({
                emailTemplateId: this.actionData.emailTemplateId,
                emailTemplateName: this.actionData.emailTemplateName,
            });

            emailTemplateView.reRender();

            if (this.actionData.toSpecifiedEntityIds) {
                let viewName = 'to' + this.actionData.to.charAt(0).toUpperCase() + this.actionData.to.slice(1);
                let toSpecifiedEntityView = this.getView(viewName);

                if (toSpecifiedEntityView) {
                    let toSpecifiedEntityData = {};

                    toSpecifiedEntityData[viewName + 'Ids'] = this.actionData.toSpecifiedEntityIds;
                    toSpecifiedEntityData[viewName + 'Names'] = this.actionData.toSpecifiedEntityNames;

                    toSpecifiedEntityView.model.set(toSpecifiedEntityData);
                    toSpecifiedEntityView.reRender();
                }
            }

            let doNotStore = this.getView('doNotStore');

            doNotStore.model.set({doNotStore: this.actionData.doNotStore});

            doNotStore.reRender();

            Dep.prototype.render.call(this, callback);
        },

        renderFields: function () {
        },

        translateEmailOption: function (value) {
            let linkDefs = this.getMetadata().get('entityDefs.' + this.entityType + '.links.' + value);

            if (linkDefs) {
                return this.translate(value, 'links' , this.entityType);
            }

            if (value && value.indexOf('link:') === 0) {
                let link = value.substring(5);

                if (~link.indexOf('.')) {
                    let arr = link.split('.');
                    link = arr[0];
                    let subLink = arr[1];

                    if (subLink === 'followers') {
                        return this.translate('Related', 'labels', 'Workflow') +
                            ': ' + this.translate(link, 'links', this.entityType) +
                            '.' + this.translate('Followers');
                    }

                    let relatedEntityType = this.getMetadata()
                        .get(['entityDefs', this.entityType, 'links', link, 'entity']);

                    return this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links', this.entityType) +
                        '.' + this.translate(subLink, 'links', relatedEntityType);
                }

                return this.translate('Related', 'labels', 'Workflow') + ': ' +
                    this.translate(link, 'links', this.entityType);

            }

            let label = this.translate(value, 'emailAddressOptions', 'Workflow');

            if (value === 'targetEntity') {
                label += ' (' + this.entityType + ')';
            }

            return label;
        },
    });
});
