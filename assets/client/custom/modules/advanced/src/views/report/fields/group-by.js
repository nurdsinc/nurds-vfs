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

define('advanced:views/report/fields/group-by', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        validations: ['required', 'maxCount'],

        validateMaxCount: function () {
            const items = this.model.get(this.name) || [];
            const maxCount = 2;

            if (items.length > maxCount) {
                var msg = this.translate('validateMaxCount', 'messages', 'Report')
                    .replace('{field}', this.translate(this.name, 'fields', this.model.name))
                    .replace('{maxCount}', maxCount);

                this.showValidationMessage(msg, '.selectize-control');

                return true;
            }
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupOptions();
            this.setupTranslatedOptions();

            this.allowCustomOptions = false;

            const version = this.getConfig().get('version') || '';
            const arr = version.split('.');

            if (version !== 'dev' && arr.length > 2 && parseInt(arr[0]) * 100 + parseInt(arr[1]) < 506) {
                this.allowCustomOptions = false;
            }

            this.events['click [data-action="edit-groups"]'] = 'editGroups';
        },

        translateValueToEditLabel: function (value) {
            if (!~(this.params.options || []).indexOf(value)) {
                return value.replace(/\t/g, '');
            }

            return Dep.prototype.translateValueToEditLabel.call(this, value);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.mode === 'edit') {
                const buttonHtml = '<button class="pull-right btn btn-default" data-action="edit-groups">' +
                    '<span class="fas fa-pencil-alt fa-sm"></span></button>';

                const $b = $(buttonHtml);
                this.$el.prepend($b);

                const width = $b.outerWidth() + 8;

                this.$el.find('.selectize-control').css('width', 'calc(100% - ' + width + 'px)');
            }
        },

        editGroups: function () {
            this.createView('dialog', 'advanced:views/report/modals/edit-group-by', {
                value: Espo.Utils.clone(this.model.get(this.name) || []),
                model: this.model,
            }, (view) => {
                view.render();

                this.listenToOnce(view, 'apply', (value) => {
                    this.model.set(this.name, value);
                });
            });
        },

        setupOptions: function () {
            const entityType = this.model.get('entityType');

            const fields = this.getMetadata().get(`entityDefs.${entityType}.fields`) || {};

            const itemList = [];

            const fieldList = Object.keys(fields);

            let weekEnabled = true;
            const version = this.getConfig().get('version') || '';

            const arr = version.split('.');

            if (version !== 'dev' && arr.length > 2 && parseInt(arr[0]) * 100 + parseInt(arr[1]) < 408) {
                weekEnabled = false;
            }

            let quarterEnabled = true;

            if (version !== 'dev' && arr.length > 2 && parseInt(arr[0]) * 100 + parseInt(arr[1]) < 505) {
                quarterEnabled = false;
            }

            fieldList.sort((v1, v2) => {
                return this.translate(v1, 'fields', entityType)
                    .localeCompare(this.translate(v2, 'fields', entityType));
            });

            fieldList.forEach((field) => {
                if (fields[field].disabled || fields[field].utility) {
                    return;
                }

                if (fields[field].reportDisabled) {
                    return;
                }

                if (fields[field].reportGroupByDisabled) {
                    return;
                }

                if (fields[field].directAccessDisabled) {
                    return;
                }

                if (!this.getFieldManager().isEntityTypeFieldAvailable(entityType, field)) {
                    return;
                }

                if (~['date', 'datetime', 'datetimeOptional'].indexOf(fields[field].type)) {
                    itemList.push('MONTH:' + field);
                    itemList.push('YEAR:' + field);
                    itemList.push('DAY:' + field);

                    if (weekEnabled) {
                        itemList.push('WEEK:' + field);
                    }

                    if (quarterEnabled) {
                        itemList.push('QUARTER:' + field);
                    }

                    if (this.getConfig().get('fiscalYearShift')) {
                        itemList.push('YEAR_FISCAL:' + field);
                        itemList.push('QUARTER_FISCAL:' + field);
                    }
                }
            });

            itemList.push('id');

            fieldList.forEach((field) => {
                if (
                    ~[
                        'linkMultiple',
                        'date',
                        'datetime',
                        'currency',
                        'currencyConverted',
                        'text',
                        'map',
                        'multiEnum',
                        'array',
                        'checklist',
                        'urlMultiple',
                        'address',
                        'foreign',
                        'linkOne',
                        'attachmentMultiple',
                    ].indexOf(fields[field].type)
                ) {
                    return;
                }

                if (fields[field].disabled || fields[field].utility) {
                    return;
                }

                if (fields[field].reportDisabled) {
                    return;
                }

                if (fields[field].reportGroupByDisabled) {
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

            const links = this.getMetadata().get(`entityDefs.${entityType}.links`) || {};

            const linkList = Object.keys(links);

            linkList.sort((v1, v2) => {
                return this.translate(v1, 'links', entityType)
                    .localeCompare(this.translate(v2, 'links', entityType));
            });

            linkList.forEach((link) => {
                if (links[link].type !== 'belongsTo' && links[link].type !== 'hasOne') {
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
                const fieldList = Object.keys(fields);

                fieldList.sort((v1, v2) => {
                    return this.translate(v1, 'fields', scope).localeCompare(this.translate(v2, 'fields', scope));
                });

                fieldList.forEach((field) => {
                    if (fields[field].disabled || fields[field].utility) return;
                    if (fields[field].reportDisabled) return;
                    if (fields[field].reportGroupByDisabled) return;
                    if (fields[field].directAccessDisabled) return;
                    if (fields[field].foreignAccessDisabled) return;

                    if (~['date', 'datetime'].indexOf(fields[field].type)) {
                        itemList.push('MONTH:' + link + '.' + field);
                        itemList.push('YEAR:' + link + '.' +  field);
                        itemList.push('DAY:' + link + '.' + field);
                        if (weekEnabled) {
                            itemList.push('WEEK:' + link + '.' + field);
                        }
                    }

                    if (
                        ~[
                            'linkMultiple',
                            'linkParent',
                            'phone',
                            'email',
                            'date',
                            'datetime',
                            'currency',
                            'currencyConverted',
                            'text',
                            'personName',
                            'map',
                            'multiEnum',
                            'checklist',
                            'array',
                            'urlMultiple',
                            'address',
                            'foreign',
                            'attachmentMultiple',
                        ].indexOf(fields[field].type)
                    ) {
                        return;
                    }

                    if (!this.getFieldManager().isEntityTypeFieldAvailable(scope, field)) {
                        return;
                    }

                    itemList.push(link + '.' + field);
                });
            });

            this.params.options = itemList;
        },

        setupTranslatedOptions: function (customEntityType) {
            this.translatedOptions = {};

            const entityType = customEntityType || this.model.get('entityType');

            this.params.options.forEach(item => {
                let hasFunction = false;
                let field = item;
                let scope = entityType;
                let isForeign = false;
                let p = item;
                let link = null;
                let func = null;

                if (~item.indexOf(':')) {
                    hasFunction = true;
                    func = item.split(':')[0];
                    p = field = item.split(':')[1];
                }

                if (~p.indexOf('.')) {
                    isForeign = true;
                    link = p.split('.')[0];
                    field = p.split('.')[1];
                    scope = this.getMetadata().get('entityDefs.' + entityType + '.links.' + link + '.entity');
                }

                this.translatedOptions[item] = this.translate(field, 'fields', scope);

                const fieldType = this.getMetadata().get(['entityDefs', scope, 'fields', field, 'type']);

                if (fieldType === 'currencyConverted' && field.substr(-9) === 'Converted') {
                    this.translatedOptions[item] = this.translate(field.substr(0, field.length - 9), 'fields', scope);
                }

                if (isForeign) {
                    this.translatedOptions[item] = this.translate(link, 'links', entityType) + ' . ' +
                        this.translatedOptions[item];
                }

                if (hasFunction) {
                    this.translatedOptions[item] = this.translate(func, 'functions', 'Report').toUpperCase() + ': ' +
                        this.translatedOptions[item];
                }
            });
        },

    });
});
