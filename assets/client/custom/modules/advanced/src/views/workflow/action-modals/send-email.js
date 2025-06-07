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

define('advanced:views/workflow/action-modals/send-email', ['advanced:views/workflow/action-modals/base', 'model'],
function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/send-email',

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.handleFrom();
            this.handleTo();
            this.handleReplyTo();
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.createView('executionTime', 'advanced:views/workflow/action-fields/execution-time', {
                selector: '.execution-time-container',
                executionData: this.actionData.execution || {},
                entityType: this.entityType
            });

            const model = this.formModel = new Model();

            model.name = 'Workflow';

            model.set({
                from: this.actionData.from,
                to: this.actionData.to || 'currentUser',
                replyTo: this.actionData.replyTo,
                emailTemplateId: this.actionData.emailTemplateId,
                emailTemplateName: this.actionData.emailTemplateName,
                doNotStore: this.actionData.doNotStore,
                optOutLink: this.actionData.optOutLink,
                fromEmailAddress: this.actionData.fromEmail,
                toEmailAddress: this.actionData.toEmail,
                replyToEmailAddress: this.actionData.replyToEmail,
            });

            if (this.actionData.toSpecifiedEntityIds) {
                const viewName = 'to' + this.actionData.to.charAt(0).toUpperCase() + this.actionData.to.slice(1);

                model.set(viewName + 'Ids', this.actionData.toSpecifiedEntityIds);
                model.set(viewName + 'Names', this.actionData.toSpecifiedEntityNames);
            }

            const fromOptions = this.getFromOptions();
            const toOptions = this.getToOptions();
            const replyToOptions = this.getReplyToOptions();

            this.createView('from', 'views/fields/enum', {
                selector: '.field-from',
                model: model,
                mode: 'edit',
                name: 'from',
                params: {
                    options: fromOptions.map(it => it[0]),
                },
                translatedOptions: fromOptions.reduce((prev, it) => ({...prev, [it[0]]: it[1]}), {}),
            });

            this.createView('to', 'views/fields/enum', {
                selector: '.field-to',
                model: model,
                mode: 'edit',
                name: 'to',
                params: {
                    options: toOptions.map(it => it[0]),
                },
                translatedOptions: toOptions.reduce((prev, it) => ({...prev, [it[0]]: it[1]}), {}),
            });

            this.createView('replyTo', 'views/fields/enum', {
                selector: '.field-replyTo',
                model: model,
                mode: 'edit',
                name: 'replyTo',
                params: {
                    options: replyToOptions.map(it => it[0]),
                },
                translatedOptions: replyToOptions.reduce((prev, it) => ({...prev, [it[0]]: it[1]}), {}),
            });

            this.createView('fromEmailAddress', 'views/fields/email-address', {
                selector: '.field[data-name="fromEmailAddress"]',
                model: model,
                mode: 'edit',
                name: 'fromEmailAddress',
                labelText: this.translate('Email Address', 'labels', 'Workflow'),
            });

            this.createView('toEmailAddress', 'views/fields/email-address', {
                selector: '.field[data-name="toEmailAddress"]',
                model: model,
                mode: 'edit',
                name: 'toEmailAddress',
                labelText: this.translate('Email Address', 'labels', 'Workflow'),
            });

            this.createView('replyToEmailAddress', 'views/fields/email-address', {
                selector: '.field[data-name="replyToEmailAddress"]',
                model: model,
                mode: 'edit',
                name: 'replyToEmailAddress',
                labelText: this.translate('Email Address', 'labels', 'Workflow'),
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
                    },
                },
                labelText: this.translate('Email Template', 'labels', 'Workflow'),
            });

            this.createView('toSpecifiedTeams', 'views/fields/link-multiple', {
                el: this.options.el + ' .toSpecifiedTeams-container .field-toSpecifiedTeams',
                model: model,
                mode: 'edit',
                foreignScope: 'Team',
                defs: {
                    name: 'toSpecifiedTeams',
                },
            });

            this.createView('toSpecifiedUsers', 'views/fields/link-multiple', {
                el: this.options.el + ' .toSpecifiedUsers-container .field-toSpecifiedUsers',
                model: model,
                mode: 'edit',
                foreignScope: 'User',
                defs: {
                    name: 'toSpecifiedUsers',
                },
            });

            this.createView('toSpecifiedContacts', 'views/fields/link-multiple', {
                el: this.options.el + ' .toSpecifiedContacts-container .field-toSpecifiedContacts',
                model: model,
                mode: 'edit',
                foreignScope: 'Contact',
                defs: {
                    name: 'toSpecifiedContacts',
                },
            });

            this.createView('doNotStore', 'views/fields/bool', {
                el: this.options.el + ' .doNotStore-container .field-doNotStore',
                model: model,
                mode: 'edit',
                defs: {
                    name: 'doNotStore',
                },
            });

            this.createView('optOutLink', 'views/fields/bool', {
                el: this.options.el + ' .field[data-name="optOutLink"]',
                model: model,
                mode: 'edit',
                defs: {
                    name: 'optOutLink',
                },
            });

            this.listenTo(this.formModel, 'change:from', () => this.handleFrom());
            this.listenTo(this.formModel, 'change:to', () => this.handleTo());
            this.listenTo(this.formModel, 'change:replyTo', () => this.handleReplyTo());
        },

        handleFrom: function () {
            const value = this.formModel.attributes.from;

            if (value === 'specifiedEmailAddress') {
                this.$el.find('.from-email-container').removeClass('hidden');
            } else {
                this.$el.find('.from-email-container').addClass('hidden');
            }
        },

        handleReplyTo: function () {
            const value = this.formModel.attributes.replyTo;

            if (value === 'specifiedEmailAddress') {
                this.$el.find('.reply-to-email-container').removeClass('hidden');
            } else {
                this.$el.find('.reply-to-email-container').addClass('hidden');
            }
        },

        handleTo: function () {
            const value = this.formModel.attributes.to;

            if (value === 'specifiedEmailAddress') {
                this.$el.find('.to-email-container').removeClass('hidden');
            } else {
                this.$el.find('.to-email-container').addClass('hidden');
            }

            const fieldList = ['specifiedTeams', 'specifiedUsers', 'specifiedContacts'];

            fieldList.forEach(field => {
                const $elem = this.$el.find('.to' + Espo.Utils.upperCaseFirst(field) + '-container');

                if (!$elem.hasClass('hidden')) {
                    $elem.addClass('hidden');
                }
            });

            if (fieldList.includes(value)) {
                this.$el.find('.to' + Espo.Utils.upperCaseFirst(value) + '-container')
                    .removeClass('hidden');
            }
        },

        /**
         * @return {string[][]}
         */
        getFromOptions: function () {
            const options = [];

            const value = this.actionData.from;

            const arr = ['system', 'specifiedEmailAddress'];

            if (!this.options.flowchartCreatedEntitiesData) {
                arr.push('currentUser');
            }

            arr.forEach(item => {
                const label = this.translate(item, 'emailAddressOptions', 'Workflow');

                options.push([item, label]);
            });

            this.getLinkOptions(value, true, true).forEach(it => options.push(it));

            return options;
        },

        /**
         * @return {string[][]}
         */
        getReplyToOptions: function () {
            const options = [];
            const value = this.actionData.replyTo;
            const arr = ['', 'system', 'currentUser', 'specifiedEmailAddress'];

            arr.forEach(item => {
                const label = this.translate(item, 'emailAddressOptions', 'Workflow');

                options.push([item, label]);
            });

            this.getLinkOptions(value, false, true).forEach(it => options.push(it));

            return options;
        },

        getToOptions: function () {
            const options = [];
            const value = this.actionData.to;

            const arr = [
                'currentUser',
                'teamUsers',
                'specifiedTeams',
                'specifiedUsers',
                'specifiedContacts',
                'specifiedEmailAddress',
                'followers',
                'followersExcludingAssignedUser',
            ];

            if (this.entityType === 'Email') {
                arr.push('fromOrReplyTo');
            }

            const fieldDefs = this.getMetadata().get(`entityDefs.${this.entityType}.fields`) || {};

            if ('emailAddress' in fieldDefs && this.entityType !== 'Email') {
                const item = 'targetEntity';
                const label = this.translate(item, 'emailAddressOptions', 'Workflow') + ': ' + this.entityType;

                options.push([item, label]);
            }

            arr.forEach(item => {
                const label = this.translate(item, 'emailAddressOptions', 'Workflow');

                options.push([item, label]);
            });

            this.getLinkOptions(value).forEach(it => options.push(it));

            return options;
        },

        /**
         *
         * @param {string} value
         * @param {boolean} [onlyUser]
         * @param {boolean} [noMultiple]
         * @return {string[][]}
         */
        getLinkOptions: function (value, onlyUser, noMultiple) {
            const options = [];

            const linkDefs = this.getMetadata().get(`entityDefs.${this.entityType}.links`) || {};

            Object.keys(linkDefs).forEach(link => {
                if (
                    linkDefs[link].type === 'belongsTo' ||
                    linkDefs[link].type === 'hasMany'
                ) {
                    const foreignEntityType = linkDefs[link].entity;

                    if (!foreignEntityType) {
                        return;
                    }

                    if (linkDefs[link].type === 'hasMany') {
                        if (noMultiple) {
                            return;
                        }

                        if (
                            this.getMetadata().get(['entityDefs', this.entityType, 'fields', link, 'type']) !==
                            'linkMultiple'
                        ) {
                            return;
                        }
                    }

                    const fieldDefs = this.getMetadata().get(`entityDefs.${foreignEntityType}.fields`) || {};

                    if (onlyUser && foreignEntityType !== 'User') {
                        return;
                    }

                    if ('emailAddress' in fieldDefs && fieldDefs.emailAddress.type === 'email') {
                        const label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                            this.translate(link, 'links', this.entityType);

                        options.push([`link:${link}`, label]);
                    }
                }
                else if (linkDefs[link].type === 'belongsToParent') {
                    if (onlyUser) {
                        return;
                    }

                    const label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links', this.entityType);

                    options.push([`link:${link}`, label]);
                }
            });

            Object.keys(linkDefs).forEach(link => {
                if (linkDefs[link].type !== 'belongsTo') {
                    return;
                }

                const foreignEntityType = this.getMetadata()
                    .get(['entityDefs', this.entityType, 'links', link, 'entity']);

                if (!foreignEntityType) {
                    return;
                }

                if (foreignEntityType === 'User') {
                    return;
                }

                if (!noMultiple && this.getMetadata().get(['scopes', foreignEntityType, 'stream'])) {
                    const label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links', this.entityType) + ' . ' + this.translate('Followers');

                    options.push([`link:${link}.followers`, label]);
                }

                const subLinkDefs = this.getMetadata().get(`entityDefs.${foreignEntityType}.links`) || {};

                Object.keys(subLinkDefs).forEach(subLink => {
                    let subForeignEntityType;

                    if (
                        subLinkDefs[subLink].type === 'belongsTo' ||
                        subLinkDefs[subLink].type === 'hasMany'
                    ) {
                        subForeignEntityType = subLinkDefs[subLink].entity;

                        if (!subForeignEntityType) {
                            return;
                        }
                    }

                    if (
                        subLinkDefs[subLink].type === 'hasMany' &&
                        this.getMetadata().get(['entityDefs', subForeignEntityType, 'fields', subLink, 'type']) !==
                        'linkMultiple'
                    ) {
                        return;
                    }

                    const fieldDefs = this.getMetadata().get(['entityDefs', subForeignEntityType, 'fields']) || {};

                    if (onlyUser && subForeignEntityType !== 'User') {
                        return;
                    }

                    if ('emailAddress' in fieldDefs && fieldDefs.emailAddress.type === 'email') {
                        const label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                            this.translate(link, 'links', this.entityType) + ' . ' +
                            this.translate(subLink, 'links', foreignEntityType);

                        options.push([`link:${link}.${subLink}`, label]);
                    }
                });
            });

            Object.keys(this.getMetadata().get(['entityDefs', this.entityType, 'links']) || {}).forEach(link => {
                if (
                    this.getMetadata().get(['entityDefs', this.entityType, 'links', link, 'type']) ===
                    'belongsToParent'
                ) {
                    let subLink = 'assignedUser';

                    let label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links' , this.entityType) + ' . ' + this.translate(subLink, 'links');

                    options.push([`link:${link}.${subLink}`, label]);

                    if (noMultiple) {
                        return;
                    }

                    subLink = 'followers';

                    label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links' , this.entityType) + ' . ' + this.translate('Followers');

                    options.push([`link:${link}.${subLink}`, label]);

                    subLink = 'contacts';

                    label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links' , this.entityType) + ' . ' +
                        this.translate('Contact', 'scopeNamesPlural');

                    options.push([`link:${link}.${subLink}`, label]);
                }
            });

            return options;
        },

        fetch: function () {
            let isInvalid = false;

            const emailTemplateView = this.getView('emailTemplate');
            emailTemplateView.fetchToModel();

            if (emailTemplateView.validate()) {
                isInvalid = true;
            }

            const o = emailTemplateView.fetch();

            if (this.formModel.attributes.from === 'specifiedEmailAddress') {
                if (this.getView('fromEmailAddress').validate()) {
                    isInvalid = true;
                }
            }

            if (this.formModel.attributes.to === 'specifiedEmailAddress') {
                if (this.getView('toEmailAddress').validate()) {
                    isInvalid = true;
                }
            }

            if (this.formModel.attributes.replyTo === 'specifiedEmailAddress') {
                if (this.getView('replyToEmailAddress').validate()) {
                    isInvalid = true;
                }
            }

            if (isInvalid) {
                return;
            }

            this.actionData.emailTemplateId = o.emailTemplateId;
            this.actionData.emailTemplateName = o.emailTemplateName;

            this.actionData.from = this.formModel.attributes.from;
            this.actionData.to = this.formModel.attributes.to;
            this.actionData.replyTo = this.formModel.attributes.replyTo;

            if (['specifiedTeams', 'specifiedUsers', 'specifiedContacts'].includes(this.actionData.to)) {
                this.actionData = _.extend(
                    this.actionData,
                    this.getSpecifiedEntityData(this.actionData.to, 'to')
                );
            }

            this.actionData.fromEmail = this.formModel.attributes.fromEmailAddress;
            this.actionData.toEmail = this.formModel.attributes.toEmailAddress;
            this.actionData.replyToEmail = this.formModel.attributes.replyToEmailAddress;

            this.actionData.doNotStore = this.getViewData('doNotStore').doNotStore || false;
            this.actionData.optOutLink = this.getViewData('optOutLink').optOutLink || false;

            const executionData = this.getView('executionTime').fetch();

            // Important.
            this.actionData.execution = this.actionData.execution || {};

            this.actionData.execution.type = executionData.type;

            delete this.actionData.execution.field;
            delete this.actionData.execution.shiftDays;
            delete this.actionData.execution.shiftUnit;

            if (executionData.type !== 'immediately') {
                this.actionData.execution.field = executionData.field;
                this.actionData.execution.shiftDays = executionData.shiftValue;
                this.actionData.execution.shiftUnit = executionData.shiftUnit;
            }

            return true;
        },

        getViewData: function (viewName) {
            const view = this.getView(viewName);

            if (view) {
                view.fetchToModel();

                return view.fetch();
            }

            return {};
        },

        getSpecifiedEntityData: function (field, type) {
            const viewName = type + field.charAt(0).toUpperCase() + field.slice(1);
            const view = this.getView(viewName);

            const data = {};

            if (view) {
                view.fetchToModel();

                const viewData = view.fetch();

                data[type + 'SpecifiedEntityName'] = view.foreignScope;
                data[type + 'SpecifiedEntityIds'] = viewData[view.idsName];
                data[type + 'SpecifiedEntityNames'] = viewData[view.nameHashName];
            }

            return data;
        },
    });
});
