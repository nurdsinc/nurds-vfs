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

define('advanced:views/bpmn-flowchart-element/fields/task-send-message-from', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = Espo.Utils.clone(this.params.options);

            const linkOptionList = this.getLinkOptionList(true, true);

            linkOptionList.forEach(item => {
                this.params.options.push(item);
            });

            this.translateOptions();
        },

        translateOptions: function () {
            this.translatedOptions = {};

            const entityType = this.model.targetEntityType;

            this.params.options.forEach(item => {
                if (item.indexOf('link:') === 0) {
                    let link = item.substring(5);

                    if (~link.indexOf('.')) {
                        const arr = link.split('.');
                        link = arr[0];

                        const subLink = arr[1];

                        if (subLink === 'followers') {
                            this.translatedOptions[item] = this.translate('Related', 'labels', 'Workflow') + ': ' +
                                this.translate(link, 'links', entityType) +
                                ' . ' + this.translate('Followers');

                            return;
                        }

                        const relatedEntityType = this.getMetadata()
                            .get(['entityDefs', entityType, 'links', link, 'entity']);

                        this.translatedOptions[item] = this.translate('Related', 'labels', 'Workflow') + ': ' +
                            this.translate(link, 'links', entityType) +
                            ' . ' + this.translate(subLink, 'links', relatedEntityType);

                        return;
                    }

                    this.translatedOptions[item] = this.translate('Related', 'labels', 'Workflow') + ': ' +
                        this.translate(link, 'links', entityType);

                    return;

                }

                this.translatedOptions[item] = this.getLanguage()
                    .translateOption(item, 'emailAddress', 'BpmnFlowchartElement');
            });

            this.translatedOptions['targetEntity'] =
                this.getLanguage().translateOption('targetEntity', 'emailAddress', 'BpmnFlowchartElement') + ': ' +
                this.translate(entityType, 'scopeNames');
        },

        getLinkOptionList: function (onlyUser, noMultiple) {
            const list = [];

            const entityType = this.model.targetEntityType;

            Object.keys(this.getMetadata().get(['entityDefs', entityType, 'links']) || {}).forEach(link => {
                const defs = this.getMetadata().get(['entityDefs', entityType, 'links', link]) || {};

                if (defs.type === 'belongsTo' || defs.type === 'hasMany') {
                    const foreignEntityType = defs.entity;

                    if (!foreignEntityType) {
                        return;
                    }

                    if (defs.type === 'hasMany') {
                        if (noMultiple) {
                            return;
                        }

                        if (
                            this.getMetadata().get(['entityDefs', entityType, 'fields', link, 'type']) !==
                            'linkMultiple'
                        ) {
                            return;
                        }
                    }

                    if (onlyUser && foreignEntityType !== 'User') {
                        return;
                    }

                    const fieldDefs = this.getMetadata().get(['entityDefs', foreignEntityType, 'fields']) || {};

                    if ('emailAddress' in fieldDefs && fieldDefs.emailAddress.type === 'email') {
                        list.push('link:' + link);
                    }
                }
                else if (defs.type === 'belongsToParent') {
                    if (onlyUser) {
                        return;
                    }

                    list.push('link:' + link);
                }
            });

            Object.keys(this.getMetadata().get(['entityDefs', entityType, 'links']) || {}).forEach(link => {
                const defs = this.getMetadata().get(['entityDefs', entityType, 'links', link]) || {};

                if (defs.type !== 'belongsTo') {
                    return;
                }

                const foreignEntityType = this.getMetadata().get(['entityDefs', entityType, 'links', link, 'entity']);

                if (!foreignEntityType) {
                    return;
                }

                if (foreignEntityType === 'User') {
                    return;
                }

                if (!noMultiple) {
                    if (this.getMetadata().get(['scopes', foreignEntityType, 'stream'])) {
                        list.push('link:' + link + '.followers');
                    }
                }

                Object.keys(this.getMetadata().get(['entityDefs', foreignEntityType, 'links']) || {}).forEach(subLink => {
                    const subDefs = this.getMetadata()
                        .get(['entityDefs', foreignEntityType, 'links', subLink]) || {};

                    if (subDefs.type === 'belongsTo' || subDefs.type === 'hasMany') {
                        const subForeignEntityType = subDefs.entity;

                        if (!subForeignEntityType) {
                            return;
                        }

                        if (subDefs.type === 'hasMany') {
                            if (
                                this.getMetadata()
                                    .get(['entityDefs', subForeignEntityType, 'fields', subLink, 'type']) !==
                                'linkMultiple'
                            ) {
                                return;
                            }
                        }

                        if (onlyUser && subForeignEntityType !== 'User') {
                            return;
                        }

                        const fieldDefs = this.getMetadata()
                            .get(['entityDefs', subForeignEntityType, 'fields']) || {};

                        if ('emailAddress' in fieldDefs && fieldDefs.emailAddress.type === 'email') {
                            list.push(`link:${link}.${subLink}`);
                        }
                    }
                });
            });

            Object.keys(this.getMetadata().get(['entityDefs', entityType, 'links']) || {}).forEach(link => {
                if (
                    this.getMetadata().get(['entityDefs', entityType, 'links', link, 'type']) ===
                    'belongsToParent'
                ) {
                    list.push(`link:${link}.assignedUser`);

                    if (!onlyUser) {
                        list.push(`link:${link}.followers`);
                    }
                }
            });

            return list;
        },
    });
});
