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

define('advanced:views/workflow/actions/create-notification',
['advanced:views/workflow/actions/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/actions/create-notification',

        type: 'createNotification',

        defaultActionData: {
            recipient: 'specifiedUsers',
            userIdList: [],
            userNames: {},
        },

        data: function () {
            var data = Dep.prototype.data.call(this);

            data.recipientLabel = this.translateRecipientOption(this.actionData.recipient);
            data.messageTemplate = this.actionData.messageTemplate;

            return data;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            var model = new Model();

            model.name = 'Workflow';
            model.set({
                recipient: this.actionData.recipient,
                messageTemplate: this.actionData.messageTemplate,
                usersIds: this.actionData.userIdList,
                usersNames: this.actionData.userNames,
                specifiedTeamsIds: this.actionData.specifiedTeamsIds,
                specifiedTeamsNames: this.actionData.specifiedTeamsNames,
            });

            if (this.actionData.recipient === 'specifiedUsers') {
                this.createView('users', 'views/fields/link-multiple', {
                    mode: 'detail',
                    model: model,
                    el: this.options.el + ' .field-recipient',
                    foreignScope: 'User',
                    defs: {
                        name: 'users'
                    },
                    readOnly: true,
                }, view => {
                    view.render();
                });
            }

            if (this.actionData.recipient === 'specifiedTeams') {
                this.createView('specifiedTeams', 'views/fields/link-multiple', {
                    mode: 'detail',
                    model: model,
                    el: this.options.el + ' .field-recipient',
                    foreignScope: 'Team',
                    defs: {
                        name: 'specifiedTeams'
                    },
                    readOnly: true,
                }, view => {
                    view.render();
                });
            }
        },

        translateRecipientOption: function (value) {
            var linkDefs = this.getMetadata().get('entityDefs.' + this.entityType + '.links.' + value);

            if (linkDefs) {
                return this.translate(value, 'links' , this.entityType);
            }

            if (value && value.indexOf('link:') === 0) {
                var link = value.substring(5);

                if (~link.indexOf('.')) {
                    var arr = link.split('.');
                    link = arr[0];
                    var subLink = arr[1];

                    if (subLink === 'followers') {
                        return this.translate('Related', 'labels', 'Workflow') + ': ' +
                            this.translate(link, 'links', this.entityType) +
                            '.' + this.translate('Followers');
                    }

                    var relatedEntityType = this.getMetadata().get(['entityDefs', this.entityType, 'links', link, 'entity']);

                    return this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links', this.entityType) +
                        '.' + this.translate(subLink, 'links', relatedEntityType);
                }

                return this.translate('Related', 'labels', 'Workflow') + ': ' + this.translate(link, 'links', this.entityType);
            }

            var label = this.translate(value, 'emailAddressOptions', 'Workflow');

            if (value === 'targetEntity') {
                label += ' (' + this.entityType + ')';
            }

            return label;
        },
    });
});
