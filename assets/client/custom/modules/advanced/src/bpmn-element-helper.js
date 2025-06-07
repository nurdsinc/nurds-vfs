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

define('advanced:bpmn-element-helper', ['view'], function (Dummy) {

    var Helper = function (viewHelper, model) {
        this.viewHelper = viewHelper;
        this.model = model;
    };

    _.extend(Helper.prototype, {

        getTargetEntityTypeList: function () {
            let metadata = this.viewHelper.metadata;
            let language = this.viewHelper.language;

            var scopes = metadata.get('scopes');

            var entityListToIgnore1 = metadata.get(['entityDefs', 'Workflow', 'entityListToIgnore']) || [];
            var entityListToIgnore2 = metadata.get(['entityDefs', 'BpmnFlowchart', 'targetTypeListToIgnore']) || [];

            let list = Object.keys(scopes)
                .filter(scope => {
                    if (~entityListToIgnore1.indexOf(scope)) {
                        return;
                    }

                    if (~entityListToIgnore2.indexOf(scope)) {
                        return;
                    }

                    let defs = scopes[scope];

                    return defs.entity && defs.object;
                })
                .sort((v1, v2) => {
                    return language.translate(v1, 'scopeNamesPlural')
                        .localeCompare(language.translate(v2, 'scopeNamesPlural'));
                });

            return list;
        },

        getTargetCreatedList: function () {
            var flowchartCreatedEntitiesData = this.model.flowchartCreatedEntitiesData;

            var itemList = [];

            if (flowchartCreatedEntitiesData) {
                Object.keys(flowchartCreatedEntitiesData).forEach(aliasId => {
                    itemList.push('created:' + aliasId);
                });
            }

            return itemList;
        },

        getTargetLinkList: function (level, allowHasMany, skipParent) {
            var entityType = this.model.targetEntityType;

            var itemList = [];
            var linkList = [];

            var linkDefs = this.viewHelper.metadata.get(['entityDefs', entityType, 'links']) || {};

            Object.keys(linkDefs).forEach(link => {
                var type = linkDefs[link].type;

                if (linkDefs[link].disabled) {
                    return;
                }

                if (skipParent && type === 'belongsToParent') {
                    return;
                }

                if (!level || level === 1) {
                    if (!allowHasMany) {
                        if (!~['belongsTo', 'belongsToParent'].indexOf(type)) {
                            return;
                        }
                    } else {
                        if (!~['belongsTo', 'belongsToParent', 'hasMany'].indexOf(type)) {
                            return;
                        }
                    }
                } else {
                    if (!~['belongsTo', 'belongsToParent'].indexOf(type)) {
                        return;
                    }
                }

                var item = 'link:' + link;

                itemList.push(item);
                linkList.push(link);
            });

            if (level === 2) {
                linkList.forEach(link => {
                    var entityType = linkDefs[link].entity;

                    if (entityType) {
                        var subLinkDefs = this.viewHelper.metadata.get(['entityDefs', entityType, 'links']) || {};

                        Object.keys(subLinkDefs).forEach(subLink => {
                            var type = subLinkDefs[subLink].type;

                            if (subLinkDefs[subLink].disabled) {
                                return;
                            }

                            if (skipParent && type === 'belongsToParent') {
                                return;
                            }

                            if (!allowHasMany) {
                                if (!~['belongsTo', 'belongsToParent'].indexOf(type)) {
                                    return;
                                }
                            } else {
                                if (!~['belongsTo', 'belongsToParent', 'hasMany'].indexOf(type)) {
                                    return;
                                }
                            }

                            const item = `link:${link}.${subLink}`;

                            itemList.push(item);
                        });
                    }
                });
            }

            this.getTargetEntityTypeList().forEach(entityType => {
                itemList.push('record:' + entityType);
            });

            return itemList;
        },

        translateTargetItem: function (target) {
            if (target && target.indexOf('created:') === 0) {
                return this.translateCreatedEntityAlias(target);
            }

            if (target && target.indexOf('record:') === 0) {
                return this.viewHelper.language.translate('Record', 'labels', 'Workflow') + ': ' +
                    this.viewHelper.language.translate(target.substr(7), 'scopeNames');
            }

            const delimiter = ' . ';

            let entityType = this.model.targetEntityType;

            if (target && target.indexOf('link:') === 0) {
                const linkPath = target.substr(5);
                const linkList = linkPath.split('.');

                const labelList = [];

                linkList.forEach(link => {
                    labelList.push(this.viewHelper.language.translate(link, 'links', entityType));

                    if (!entityType) {
                        return;
                    }

                    entityType = this.viewHelper.metadata.get(['entityDefs', entityType, 'links', link, 'entity']);
                });

                return this.viewHelper.language.translate('Related', 'labels', 'Workflow') + ': ' +
                    labelList.join(delimiter);
            }

            if (target === 'currentUser') {
                return this.viewHelper.language.translate('currentUser', 'emailAddressOptions', 'Workflow');
            }

            if (target === 'targetEntity' || !target) {
                return this.getLanguage().translate('targetEntity', 'emailAddressOptions', 'Workflow') +
                    ' (' + this.viewHelper.language.translate(entityType, 'scopeName') + ')';
            }

            if (target === 'followers') {
                return this.viewHelper.language.translate('followers', 'emailAddressOptions', 'Workflow');
            }
        },

        translateCreatedEntityAlias: function (target) {
            let aliasId = target;

            if (target.indexOf('created:') === 0) {
                aliasId = target.substr(8);
            }

            if (!this.model.flowchartCreatedEntitiesData || !this.model.flowchartCreatedEntitiesData[aliasId]) {
                return target;
            }

            const link = this.model.flowchartCreatedEntitiesData[aliasId].link;
            const entityType = this.model.flowchartCreatedEntitiesData[aliasId].entityType;
            const numberId = this.model.flowchartCreatedEntitiesData[aliasId].numberId;

            let label = this.viewHelper.language.translate('Created', 'labels', 'Workflow') + ': ';

            const delimiter = ' - ';

            if (link) {
                label += this.viewHelper.language.translate(link, 'links', this.entityType) + ' ' + delimiter + ' ';
            }

            label += this.viewHelper.language.translate(entityType, 'scopeNames');

            if (numberId) {
                label += ' #' + numberId.toString();
            }

            return label;
        },

        getEntityTypeFromTarget: function (target) {
            if (target && target.indexOf('created:') === 0) {
                const aliasId = target.substr(8);

                if (
                    !this.model.flowchartCreatedEntitiesData ||
                    !this.model.flowchartCreatedEntitiesData[aliasId]
                ) {
                    return null;
                }

                return this.model.flowchartCreatedEntitiesData[aliasId].entityType;
            }

            if (target && target.indexOf('record:') === 0) {
                return target.substr(7);
            }

            const targetEntityType = this.model.targetEntityType;

            if (target && target.indexOf('link:') === 0) {
                const linkPath = target.substr(5);
                const linkList = linkPath.split('.');

                let entityType = targetEntityType;

                linkList.forEach(link => {
                    if (!entityType) {
                        return;
                    }

                    entityType = this.viewHelper.metadata.get(['entityDefs', entityType, 'links', link, 'entity']);
                });

                return entityType;
            }

            if (target === 'followers') {
                return 'User';
            }

            if (target === 'currentUser') {
                return 'User';
            }

            if (target === 'targetEntity') {
                return targetEntityType;
            }

            if (!target) {
                return targetEntityType;
            }

            return null;
        },
    });

    return Helper;
});
