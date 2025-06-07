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

define('advanced:views/report/fields/columns-list', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            var entityType = this.model.get('entityType');
            var fields = this.getMetadata().get('entityDefs.' + entityType + '.fields') || {};

            var itemList = [];

            Object.keys(fields).forEach(field => {
                if (fields[field].disabled || fields[field].utility) {
                    return;
                }

                if (fields[field].type === 'map') {
                    return;
                }

                if (fields[field].reportDisabled) {
                    return;
                }

                if (fields[field].reportColumnDisabled) {
                    return;
                }

                if (fields[field].directAccessDisabled) {
                    return;
                }

                if (!this.getFieldManager().isEntityTypeFieldAvailable(entityType, field)) {
                    return;
                }

                itemList.push(field);
            });

            var version = this.getConfig().get('version') || '';
            var arr = version.split('.');
            var noEmailField = false;

            if (
                version !== 'dev' &&
                arr.length > 2 &&
                parseInt(arr[0]) * 100 + parseInt(arr[1]) * 10 +  parseInt(arr[2]) < 562
            ) {
                noEmailField = true;
            }

            var links = this.getMetadata().get('entityDefs.' + entityType + '.links') || {};

            var linkList = Object.keys(links);

            linkList.sort((v1, v2) => {
                return this.translate(v1, 'links', entityType)
                    .localeCompare(this.translate(v2, 'links', entityType));
            });

            linkList.forEach(link => {
                if (links[link].type !== 'belongsTo') {
                    return;
                }

                var scope = links[link].entity;

                if (!scope) {
                    return;
                }

                if (links[link].disabled || links[link].utility) {
                    return;
                }

                var fields = this.getMetadata().get('entityDefs.' + scope + '.fields') || {};
                var fieldList = Object.keys(fields);

                fieldList.sort((v1, v2) => {
                    return this.translate(v1, 'fields', scope)
                        .localeCompare(this.translate(v2, 'fields', scope));
                });

                fieldList.forEach(field => {
                    if (fields[field].disabled || fields[field].utility) {
                        return;
                    }

                    if (fields[field].reportDisabled) {
                        return;
                    }

                    if (fields[field].reportColumnDisabled) {
                        return;
                    }

                    if (fields[field].directAccessDisabled) {
                        return;
                    }

                    var fieldType = fields[field].type;

                    if (
                        this.getFieldManager().isEntityTypeFieldAvailable &&
                        !this.getFieldManager().isEntityTypeFieldAvailable(scope, field)
                    ) {
                        return;
                    }

                    if (
                        ~[
                            'linkMultiple',
                            'linkParent',
                            'currency',
                            'personName',
                            'map',
                            'address',
                            'foreign',
                        ].indexOf(fieldType)
                    ) {
                        return;
                    }

                    if (noEmailField) {
                        if (fieldType === 'phone' || fieldType === 'email') {
                            return;
                        }
                    }

                    itemList.push(link + '.' + field);
                });
            });

            this.params.options = itemList;
        },

        setupTranslatedOptions: function () {
            this.translatedOptions = {};

            var entityType = this.model.get('entityType');

            this.params.options.forEach(item => {
                var field = item;
                var scope = entityType;
                var isForeign = false;
                var p = item;
                var link = null

                if (~p.indexOf('.')) {
                    isForeign = true;
                    link = p.split('.')[0];
                    field = p.split('.')[1];
                    scope = this.getMetadata().get('entityDefs.' + entityType + '.links.' + link + '.entity');
                }

                this.translatedOptions[item] = this.translate(field, 'fields', scope);

                if (isForeign) {
                    this.translatedOptions[item] =
                        this.translate(link, 'links', entityType) + '.' + this.translatedOptions[item];
                }
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupOptions();
            this.setupTranslatedOptions();
        },
    });
});
