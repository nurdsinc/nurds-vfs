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

define('advanced:views/report/fields/filters', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        getFilterList: function () {
            const entityType = this.model.get('entityType');

            const fields = this.getMetadata().get(`entityDefs.${entityType}.fields`);

            const filterList = Object.keys(fields).filter(field => {
                if (this.options.skipLinkMultiple) {
                    if (fields[field].type === 'linkMultiple') {
                        return;
                    }
                }

                if (fields[field].type === 'map') {
                    return;
                }

                if (fields[field].disabled || fields[field].utility) {
                    return;
                }

                if (fields[field].reportDisabled) {
                    return;
                }

                if (fields[field].reportFilterDisabled) {
                    return;
                }

                if (fields[field].directAccessDisabled) {
                    return;
                }

                if (!this.getFieldManager().isEntityTypeFieldAvailable(entityType, field)) {
                    return;
                }

                return this.getFieldManager().checkFilter(fields[field].type);
            });

            filterList.sort((v1, v2) => {
                return this.translate(v1, 'fields', entityType)
                    .localeCompare(this.translate(v2, 'fields', entityType));
            });

            const links = this.getMetadata().get(`entityDefs.${entityType}.links`) || {};

            const linkList = Object.keys(links).sort((v1, v2) => {
                return this.translate(v1, 'links', entityType)
                    .localeCompare(this.translate(v2, 'links', entityType));
            });

            linkList.forEach(link => {
                const type = links[link].type

                if (
                    type !== 'belongsTo' &&
                    type !== 'hasMany' &&
                    type !== 'hasChildren'
                ) {
                    return;
                }

                const scope = links[link].entity;

                if (!scope) {
                    return;
                }

                if (links[link].disabled || links[link].utility) {
                    return;
                }

                const fields = this.getMetadata().get(`entityDefs.${scope}.fields`) || {};

                const foreignFilterList = Object.keys(fields).filter(field => {
                    const type = fields[field].type;

                    if (
                        [
                            'linkMultiple',
                            'linkParent',
                            'personName',
                            'foreign',
                        ].includes(type)
                    ) {
                        return;
                    }

                    if (fields[field].reportDisabled) {
                        return;
                    }

                    if (fields[field].reportFilterDisabled) {
                        return;
                    }

                    if (fields[field].directAccessDisabled) {
                        return;
                    }

                    if (fields[field].foreignAccessDisabled) {
                        return;
                    }

                    if (!this.getFieldManager().isEntityTypeFieldAvailable(scope, field)) {
                        return;
                    }

                    return this.getFieldManager().checkFilter(fields[field].type) && !fields[field].disabled;
                });

                foreignFilterList.sort((v1, v2) => {
                    return this.translate(v1, 'fields', scope).localeCompare(this.translate(v2, 'fields', scope));
                });

                foreignFilterList.forEach(item => {
                    filterList.push(link + '.' + item);
                });
            });

            return filterList;
        },

        setupTranslatedOptions: function () {
            this.translatedOptions = {};

            const entityType = this.model.get('entityType');

            this.params.options.forEach(item => {
                const link = item.split('.')[0];
                let field = item;
                let scope = entityType;
                let isForeign = false;

                if (~item.indexOf('.')) {
                    isForeign = true;
                    field = item.split('.')[1];

                    scope = this.getMetadata().get(`entityDefs.${entityType}.links.${link}.entity`);
                }

                this.translatedOptions[item] = this.translate(field, 'fields', scope);

                if (isForeign) {
                    this.translatedOptions[item] =  this.translate(link, 'links', entityType) + ' . ' +
                        this.translatedOptions[item];
                }
            });
        },

        setupOptions: function () {
            Dep.prototype.setupOptions.call(this);

            this.params.options = this.getFilterList();
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
