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

define('advanced:views/workflow/action-modals/create-notification',
['advanced:views/workflow/action-modals/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/create-notification',

        data: function () {
            return _.extend({
                messageTemplateHelpText: this.translate('messageTemplateHelpText', 'messages', 'Workflow'),
            }, Dep.prototype.data.call(this));
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.handleRecipient();
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            const model = this.formModel = new Model();
            model.name = 'Workflow';

            model.set({
                recipient: this.actionData.recipient,
                messageTemplate: this.actionData.messageTemplate,
                usersIds: this.actionData.userIdList,
                usersNames: this.actionData.userNames,
                specifiedTeamsIds: this.actionData.specifiedTeamsIds,
                specifiedTeamsNames: this.actionData.specifiedTeamsNames,
            });

            const recipientOptions = this.getRecipientOptions();

            this.createView('recipient', 'views/fields/enum', {
                selector: '.field-recipient',
                model: model,
                mode: 'edit',
                defs: {
                    name: 'recipient',
                },
                params: {
                    options: recipientOptions.map(it => it[0]),
                },
                translatedOptions: recipientOptions.reduce((prev, it) => ({...prev, [it[0]]: it[1]}), {}),
            });

            this.createView('messageTemplate', 'views/fields/text', {
                el: this.options.el + ' .field-messageTemplate',
                model: model,
                mode: 'edit',
                defs: {
                    name: 'messageTemplate',
                    params: {
                        required: false
                    },
                },
            });

            this.createView('users', 'views/fields/link-multiple', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field-users',
                foreignScope: 'User',
                defs: {
                    name: 'users'
                },
                readOnly: this.readOnly,
            });

            this.createView('specifiedTeams', 'views/fields/link-multiple', {
                el: this.options.el + ' .field-specifiedTeams',
                model: model,
                mode: 'edit',
                foreignScope: 'Team',
                defs: {
                    name: 'specifiedTeams'
                },
                readOnly: this.readOnly,
            });

            this.listenTo(this.formModel, 'change:recipient', () => this.handleRecipient());
        },

        handleRecipient: function () {
            const value = this.formModel.attributes.recipient;

            if (value === 'specifiedUsers') {
                this.$el.find('.cell-users').removeClass('hidden');
            } else {
                this.$el.find('.cell-users').addClass('hidden');
            }

            if (value === 'specifiedTeams') {
                this.$el.find('.cell-specifiedTeams').removeClass('hidden');
            } else {
                this.$el.find('.cell-specifiedTeams').addClass('hidden');
            }
        },

        /**
         * @return {string[][]}
         */
        getRecipientOptions: function () {
            const arr = [
                'specifiedUsers',
                'teamUsers',
                'specifiedTeams',
                'followers',
                'followersExcludingAssignedUser',
            ];

            if (!this.options.flowchartCreatedEntitiesData) {
                arr.push('currentUser');
            }

            const options = [];

            arr.forEach(item => {
                const label = this.translate(item, 'emailAddressOptions', 'Workflow');

                options.push([item, label]);
            });

            this.getLinkOptions().forEach(it => options.push(it));

            return options;
        },

        getLinkOptions: function () {
            const linkDefs = this.getMetadata().get(`entityDefs.${this.entityType}.links`) || {};

            const options = [];

            Object.keys(linkDefs).forEach(link => {
                if (linkDefs[link].type === 'belongsTo' || linkDefs[link].type === 'hasMany') {
                    const foreignEntityType = linkDefs[link].entity;

                    if (foreignEntityType !== 'User') {
                        return;
                    }

                    const label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links', this.entityType);

                    options.push([`link:${link}`, label]);
                }
            });

            Object.keys(linkDefs).forEach(link => {
                const linkType = linkDefs[link].type;

                if (linkType !== 'belongsTo' && linkType !== 'hasMany') {
                    return;
                }

                const foreignEntityType = this.getMetadata()
                    .get(['entityDefs', this.entityType, 'links', link, 'entity']);

                if (!foreignEntityType || foreignEntityType === 'User') {
                    return;
                }

                if (this.getMetadata().get(['scopes', foreignEntityType, 'stream'])) {
                    const label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links', this.entityType) + ' . ' + this.translate('Followers');

                    options.push([`link:${link}.followers`, label]);
                }

                const subLinkDefs = this.getMetadata().get(`entityDefs.${foreignEntityType}.links`) || {};

                Object.keys(subLinkDefs).forEach(subLink => {
                    let subForeignEntityType;
                    const subLinkType = subLinkDefs[subLink].type;

                    if (linkType !== 'belongsTo' && subLinkType === 'hasMany') {
                        return;
                    }

                    if (subLinkType === 'belongsTo' || subLinkType === 'hasMany') {
                        subForeignEntityType = subLinkDefs[subLink].entity;
                    }

                    if (subForeignEntityType !== 'User') {
                        return;
                    }

                    const label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links', this.entityType) + ' . ' +
                        this.translate(subLink, 'links', foreignEntityType);

                    options.push([`link:${link}.${subLink}`, label]);
                });
            });

            Object.keys(this.getMetadata().get(['entityDefs', this.entityType, 'links']) || {}).forEach(link => {
                const linkType = this.getMetadata().get(['entityDefs', this.entityType, 'links', link, 'type']);

                if (linkType !== 'belongsToParent') {
                    return;
                }

                let label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                    this.translate(link, 'links', this.entityType) + ' . ' + this.translate('assignedUser', 'links');

                options.push([`link:${link}.assignedUser`, label]);

                label = this.translate('Related', 'labels', 'Workflow') + ': ' +
                    this.translate(link, 'links', this.entityType) + ' . ' + this.translate('Followers');

                options.push([`link:${link}.followers`, label]);
            });

            return options;
        },

        fetch: function () {
            this.actionData.messageTemplate = (this.getView('messageTemplate').fetch() || {}).messageTemplate;

            this.actionData.recipient = this.formModel.attributes.recipient;

            if (this.actionData.recipient === 'specifiedUsers') {
                const usersData = this.getView('users').fetch() || {};

                this.actionData.userIdList = usersData.usersIds;
                this.actionData.userNames = usersData.usersNames;
            } else {
                this.actionData.userIdList = [];
                this.actionData.userNames = {};
            }

            this.actionData.specifiedTeamsIds = [];
            this.actionData.specifiedTeamsNames = {};

            if (this.actionData.recipient === 'specifiedTeams') {
                const specifiedTeamsData = this.getView('specifiedTeams').fetch() || {};

                this.actionData.specifiedTeamsIds = specifiedTeamsData.specifiedTeamsIds;
                this.actionData.specifiedTeamsNames = specifiedTeamsData.specifiedTeamsNames;
            }

            return true;
        },
    });
});
