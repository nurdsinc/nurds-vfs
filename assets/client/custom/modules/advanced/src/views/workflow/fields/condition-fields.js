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

define('advanced:views/workflow/fields/condition-fields', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        getItemList: function () {
            const entityType = this.model.targetEntityType;

            const conditionFieldTypes = this.getMetadata().get('entityDefs.Workflow.conditionFieldTypes') || {};

            const fields = /** @type {Record<string, Record>} */
                this.getMetadata().get(`entityDefs.${entityType}.fields`);

            const itemList = Object.keys(fields).filter(field => {
                if (!fields[field].type) {
                    return;
                }

                if (!(fields[field].type in conditionFieldTypes)) {
                    return;
                }

                if (fields[field].disabled) {
                    return;
                }

                if (fields[field].utility) {
                    return;
                }

                if (fields[field].workflowConditionDisabled) {
                    return;
                }

                if (fields[field].directAccessDisabled) {
                    return;
                }

                return true;
            });

            itemList.sort((v1, v2) => {
                return this.translate(v1, 'fields', entityType)
                    .localeCompare(this.translate(v2, 'fields', entityType));
            });

            const links = /** @type {Record<string, Record>} */
                this.getMetadata().get(`entityDefs.${entityType}.links`) || {};

            const linkList = Object.keys(links).sort((v1, v2) => {
                return this.translate(v1, 'links', entityType)
                    .localeCompare(this.translate(v2, 'links', entityType));
            });

            linkList.forEach(link => {
                const type = links[link].type;

                if (type !== 'belongsTo') {
                    return;
                }

                if (links[link].disabled || links[link].utility) {
                    return false;
                }

                const scope = links[link].entity;

                if (!scope) {
                    return;
                }

                const fields = /** @type {Record<string, Record>} */
                    this.getMetadata().get(`entityDefs.${scope}.fields`) || {};

                const foreignItemList = Object.keys(fields).filter(field => {
                    if (!fields[field].type) {
                        return;
                    }

                    if (!(fields[field].type in conditionFieldTypes)) {
                        return;
                    }

                    if (fields[field].disabled) {
                        return;
                    }

                    if (fields[field].utility) {
                        return;
                    }

                    if (fields[field].workflowConditionDisabled) {
                        return;
                    }

                    if (fields[field].directAccessDisabled) {
                        return;
                    }

                    return true;
                });

                foreignItemList.sort((v1, v2) => {
                    return this.translate(v1, 'fields', scope)
                        .localeCompare(this.translate(v2, 'fields', scope));
                });

                foreignItemList.forEach(item => {
                    itemList.push(`${link}.${item}`);
                });
            });

            if (this.options.createdEntitiesData) {
                const createdAliasIdList = Object.keys(this.options.createdEntitiesData);

                createdAliasIdList.sort((v1, v2) => {
                    const entityType1 = this.options.createdEntitiesData[v1].entityType || '';
                    const entityType2 = this.options.createdEntitiesData[v2].entityType || '';

                    return this.translate(entityType1, 'scopeNames')
                        .localeCompare(this.translate(entityType2, 'scopeNames'));
                });

                createdAliasIdList.forEach(aliasId => {
                    const item = this.options.createdEntitiesData[aliasId];
                    const entityType = item.entityType;

                    const fields = this.getMetadata().get(['entityDefs', entityType, 'fields']) || {};

                    const foreignItemList = Object.keys(fields).filter(field => {
                        const defs = fields[field];

                        if (!defs.type) {
                            return;
                        }

                        if (!(defs.type in conditionFieldTypes)) {
                            return;
                        }

                        if (defs.disabled) {
                            return;
                        }

                        if (defs.workflowConditionDisabled) {
                            return;
                        }

                        return true;
                    });

                    foreignItemList.sort((v1, v2) => {
                        return this.translate(v1, 'fields', entityType)
                            .localeCompare(this.translate(v2, 'fields', entityType));
                    });

                    foreignItemList.forEach(item => {
                        itemList.push(`created:${aliasId}.${item}`);
                    });
                });
            }

            return itemList;
        },

        setupTranslatedOptions: function () {
            this.translatedOptions = {};

            const entityType = this.model.targetEntityType;

            this.params.options.forEach(item => {
                let field = item;
                let scope = entityType;
                let isForeign = false;
                let isCreated = false;

                let link;
                let text;
                let numberId;

                if (~item.indexOf('.')) {
                    if (item.indexOf('created:') === 0) {
                        isCreated = true;
                        field = item.split('.')[1];

                        const aliasId = item.split('.')[0].substr(8);

                        scope = this.options.createdEntitiesData[aliasId].entityType;
                        numberId = this.options.createdEntitiesData[aliasId].numberId;
                        link = this.options.createdEntitiesData[aliasId].link;
                        text = this.options.createdEntitiesData[aliasId].text;
                    }
                    else {
                        isForeign = true;
                        field = item.split('.')[1];
                        link = item.split('.')[0];
                        scope = this.getMetadata().get('entityDefs.' + entityType + '.links.' + link + '.entity');
                    }
                }

                this.translatedOptions[item] = this.translate(field, 'fields', scope);

                if (isForeign) {
                    this.translatedOptions[item] =  this.translate(link, 'links', entityType) +
                        ' . ' + this.translatedOptions[item];
                }
                else if (isCreated) {
                    let labelLeftPart = this.translate('Created', 'labels', 'Workflow') + ': ';

                    if (link) {
                        labelLeftPart += this.translate(link, 'links', entityType) + ' - ';
                    }

                    labelLeftPart += this.translate(scope, 'scopeNames');

                    if (text) {
                        labelLeftPart += ' \'' + text + '\'';
                    } else {
                        if (numberId) {
                            labelLeftPart += ' #' + numberId.toString();
                        }
                    }

                    this.translatedOptions[item] = labelLeftPart + ' . ' + this.translatedOptions[item];
                }
            });
        },

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = this.getItemList();
            this.setupTranslatedOptions();
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.$element && this.$element[0] && this.$element[0].selectize) {
                this.$element[0].selectize.focus();
            }
        },
    });
});
