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

define('advanced:views/workflow/action-modals/base',
['views/modal', 'advanced:views/workflow/actions/base'], function (Dep, ActionBase) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/base',

        data: function () {
            return {};
        },

        setup: function () {
            this.actionData = this.options.actionData || {};

            this.actionDataInitial = Espo.Utils.cloneDeep(this.actionData);

            this.actionType = this.options.actionType;
            this.entityType = this.options.entityType;

            this.once('close', () => {
                if (!this.isApplied) {
                    if (this.actionDataInitial && this.actionData) {
                        for (var i in this.actionDataInitial) {
                            this.actionData[i] = this.actionDataInitial[i];
                        }
                    }
                }

                this.isApplied = false;
            });

            this.buttonList = [
                {
                    name: 'apply',
                    label: 'Apply',
                    style: 'primary',
                    onClick: () => {
                        if (this.fetch()) {
                            this.isApplied = true;

                            this.trigger('apply', this.actionData);
                            this.close();
                        }
                    },
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: dialog => {
                        this.trigger('cancel');
                        dialog.close();
                    },
                }
            ];

            this.header = this.translate(this.actionType, 'actionTypes', 'Workflow');
        },

        translateCreatedEntityAlias: function (target, optionItem) {
            return ActionBase.prototype.translateCreatedEntityAlias.call(this, target, optionItem);
        },

        getEntityTypeFromTarget: function (target, targetEntityType) {
            if (target && target.indexOf('created:') === 0) {
                const aliasId = target.substr(8);

                if (!this.options.flowchartCreatedEntitiesData[aliasId]) {
                    return null;
                }

                return this.options.flowchartCreatedEntitiesData[aliasId].entityType;
            }

            if (target && target.indexOf('link:') === 0) {
                const linkPath = target.substr(5);
                const linkList = linkPath.split('.');

                let entityType = targetEntityType || this.entityType;

                linkList.forEach(link => {
                    if (!entityType) {
                        return;
                    }

                    entityType = this.getMetadata().get(['entityDefs', entityType, 'links', link, 'entity']);
                });

                return entityType;
            }

            const entityType = targetEntityType || this.entityType;

            if (target === 'followers') {
                return 'User';
            }

            if (target === 'currentUser') {
                return 'User';
            }

            if (target === 'targetEntity') {
                return entityType;
            }

            if (!target) {
                return entityType;
            }

            return null;
        },

        translateTargetItem: function (target, optionItem, targetEntityType) {
            return ActionBase.prototype.translateTargetItem.call(this, target, optionItem, targetEntityType);
        },
    });
});
