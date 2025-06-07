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

define('advanced:views/workflow/actions/make-followed',
['advanced:views/workflow/actions/base', 'model', 'advanced:views/workflow/action-modals/make-followed'],
function (Dep, Model, ActionModal) {

    return Dep.extend({

        type: 'makeFollowed',

        template: 'advanced:workflow/actions/make-followed',

        setModel: function () {
            this.model.set({
                usersToMakeToFollowIds: this.actionData.userIdList,
                usersToMakeToFollowNames: this.actionData.userNames,
                whatToFollow: this.actionData.whatToFollow,
                recipient: this.actionData.recipient || 'specifiedUsers',
                specifiedTeamsIds: this.actionData.specifiedTeamsIds,
                specifiedTeamsNames: this.actionData.specifiedTeamsNames,
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            ActionModal.prototype.setupRecipientOptions.call(this);

            var model = this.model = new Model();
            model.name = 'Workflow';

            this.setModel();

            this.on('change', () => {
                this.setModel();
            });

            this.createView('recipient', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="recipient"]',
                defs: {
                    name: 'recipient',
                    params: {
                        options: this.recipientOptionList,
                        required: true,
                        translatedOptions: this.recipientTranslatedOptions
                    }
                },
                readOnly: true,
            });

            this.createView('whatToFollow', 'views/fields/enum', {
                mode: 'edit',
                model: model,
                el: this.options.el + ' .field[data-name="whatToFollow"]',
                defs: {
                    name: 'whatToFollow',
                    params: {
                        options: this.targetOptionList,
                        required: true,
                        translatedOptions: this.targetTranslatedOptions
                    }
                },
                readOnly: true,
            });

            this.createView('usersToMakeToFollow', 'views/fields/link-multiple', {
                mode: 'detail',
                model: model,
                el: this.options.el + ' .field[data-name="usersToMakeToFollow"]',
                foreignScope: 'User',
                defs: {
                    name: 'usersToMakeToFollow'
                },
                readOnly: true,
            });

            this.createView('specifiedTeams', 'views/fields/link-multiple', {
                el: this.options.el + ' .field[data-name="specifiedTeams"]',
                model: model,
                mode: 'edit',
                foreignScope: 'Team',
                defs: {
                    name: 'specifiedTeams'
                },
                readOnly: true,
            });
        },

        data: function () {
            var data = Dep.prototype.data.call(this);
            data.targetTranslated = this.getTargetTranslated();

            return data;
        },

        afterRender: function () {
            this.handleRecipient();
        },

        handleRecipient: function () {
            if (!this.actionData.recipient || this.actionData.recipient === 'specifiedUsers') {
                this.$el.find('.cell[data-name="usersToMakeToFollow"]').removeClass('hidden');
            } else {
                this.$el.find('.cell[data-name="usersToMakeToFollow"]').addClass('hidden');
            }

            if (this.actionData.recipient === 'specifiedTeams') {
                this.$el.find('.cell[data-name="specifiedTeams"]').removeClass('hidden');
            } else {
                this.$el.find('.cell[data-name="specifiedTeams"]').addClass('hidden');
            }
        },

        getTargetTranslated: function () {
            var target = this.actionData.whatToFollow;

            if (!target) {
                return '';
            }

            if (target === 'targetEntity') {
                return this.translate('Target Entity', 'labels', 'Workflow');
            }
            if (target.indexOf('created:') === 0) {
                return this.translateCreatedEntityAlias(target);
            }

            var link = target;

            if (link.indexOf('link:') === 0) {
                link = link.substr(5);
            }

            return this.translate('Related', 'labels', 'Workflow') + ': ' +
                this.getLanguage().translate(link, 'links', this.entityType);
        },

        translateRecipientOption: function (value) {
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

                    var relatedEntityType = this.getMetadata()
                        .get(['entityDefs', this.entityType, 'links', link, 'entity']);

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
