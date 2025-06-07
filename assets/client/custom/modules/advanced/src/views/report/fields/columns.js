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

define(
    'advanced:views/report/fields/columns',
    ['views/fields/multi-enum', 'advanced:views/report/fields/group-by'],
    function (Dep, GroupBy) {

    return Dep.extend({

        fieldTypeList: [
            'currencyConverted',
            'int',
            'float',
            'duration',
            'enumInt',
            'enumFloat',
            'enum',
            'varchar',
            'link',
            'date',
            'datetime',
            'datetimeOptional',
            'email',
            'phone',
            'url',
            'personName',
            'array',
            'multiEnum',
            'checklist',
            'urlMultiple',
        ],

        numericFieldTypeList: [
            'currencyConverted',
            'int',
            'float',
            'enumInt',
            'enumFloat',
            'duration',
        ],

        setupOptions: function () {
            const entityType = this.model.get('entityType');

            const fields = this.getMetadata().get(['entityDefs', entityType, 'fields']) || {};

            let skipForeign = false;
            const version = this.getConfig().get('version') || '';

            const arr = version.split('.');

            if (version !== 'dev' && arr.length > 2 && parseInt(arr[0]) * 100 + parseInt(arr[1]) < 506) {
                skipForeign = true;
            }

            let noEmailField = false;

            if (
                version !== 'dev' && arr.length > 2 &&
                parseInt(arr[0]) * 100 + parseInt(arr[1]) * 10 +  parseInt(arr[2]) < 562
            ) {
                noEmailField = true;
            }

            const itemList = [];

            itemList.push('COUNT:id');

            let fieldList = Object.keys(fields) || [];

            fieldList = fieldList.sort((v1, v2) =>  {
                return this.translate(v1, 'fields', entityType)
                    .localeCompare(this.translate(v2, 'fields', entityType));
            });

            fieldList.forEach(field => {
                if (fields[field].disabled) {
                    return;
                }

                if (fields[field].directAccessDisabled) {
                    return;
                }

                if (fields[field].reportDisabled) {
                    return;
                }

                if (
                    this.getFieldManager().isEntityTypeFieldAvailable &&
                    !this.getFieldManager().isEntityTypeFieldAvailable(entityType, field)
                ) {
                    return;
                }

                if (~this.numericFieldTypeList.indexOf(fields[field].type)) {
                    itemList.push('SUM:' + field);
                    itemList.push('MAX:' + field);
                    itemList.push('MIN:' + field);
                    itemList.push('AVG:' + field);
                }
            });

            const groupBy = this.model.get('groupBy') || [];

            groupBy.forEach(foreignGroup => {
                if (!skipForeign) {
                    const links = this.getMetadata().get(['entityDefs', entityType, 'links']) || {};
                    const linkList = Object.keys(links);

                    linkList.sort((v1, v2) => {
                        return this.translate(v1, 'links', entityType)
                            .localeCompare(this.translate(v2, 'links', entityType));
                    });

                    linkList.forEach(link => {
                        if (links[link].type !== 'belongsTo') {
                            return;
                        }

                        if (link !== foreignGroup) {
                            return;
                        }

                        const scope = links[link].entity;

                        if (!scope) {
                            return;
                        }

                        if (
                            links[link].disabled ||
                            links[link].utility
                        ) {
                            return;
                        }

                        const fields = this.getMetadata().get(['entityDefs', scope, 'fields']) || {};
                        const fieldList = Object.keys(fields);

                        fieldList.sort((v1, v2) => {
                            return this.translate(v1, 'fields', scope)
                                .localeCompare(this.translate(v2, 'fields', scope));
                        });

                        fieldList.forEach(field => {
                            if (
                                fields[field].disabled ||
                                fields[field].utility
                            ) {
                                return;
                            }

                            if (fields[field].directAccessDisabled) {
                                return;
                            }
                            if (fields[field].reportDisabled) {
                                return;
                            }

                            if (
                                this.getFieldManager().isEntityTypeFieldAvailable &&
                                !this.getFieldManager().isEntityTypeFieldAvailable(scope, field)
                            ) {
                                return;
                            }

                            if (~this.fieldTypeList.indexOf(fields[field].type)) {
                                if (fields[field].type === 'enum' && field.substr(-8) === 'Currency') {
                                    return;
                                }

                                if (noEmailField && fields[field].type === 'email') {
                                    return;
                                }

                                if (noEmailField && fields[field].type === 'phone') {
                                    return;
                                }
                                if (field === 'name') {
                                    return;
                                }

                                itemList.push(link + '.' + field);
                            }
                        });
                    });
                }
            });

            fieldList.forEach(field => {
                if (groupBy.length > 1) {
                    return;
                }

                if (
                    fields[field].disabled ||
                    fields[field].reportDisabled ||
                    this.getFieldManager().isEntityTypeFieldAvailable &&
                    !this.getFieldManager().isEntityTypeFieldAvailable(entityType, field)
                ) {
                    return;
                }

                if (!~this.fieldTypeList.indexOf(fields[field].type)) {
                    return;
                }

                itemList.push(field);
            });

            const links = this.getMetadata().get(['entityDefs', entityType, 'links']) || {};
            const linkList = Object.keys(links);

            linkList.sort((v1, v2) => {
                return this.translate(v1, 'links', entityType)
                    .localeCompare(this.translate(v2, 'links', entityType));
            });

            linkList.forEach(link => {
                if (links[link].type !== 'belongsTo' && links[link].type !== 'hasOne') {
                    return;
                }

                if (
                    links[link].disabled ||
                    links[link].utility
                ) {
                    return;
                }

                const subEntityType = links[link].entity;

                if (!subEntityType) {
                    return;
                }

                const fields = this.getMetadata().get(['entityDefs', subEntityType, 'fields']) || {};

                let fieldList = Object.keys(fields) || [];

                fieldList = fieldList.sort((v1, v2) => {
                    return this.translate(v1, 'fields', subEntityType)
                        .localeCompare(this.translate(v2, 'fields', subEntityType));
                });

                fieldList.forEach(field => {
                    if (
                        fields[field].disabled ||
                        fields[field].utility
                    ) {
                        return;
                    }

                    if (fields[field].directAccessDisabled) {
                        return;
                    }

                    if (fields[field].reportDisabled) {
                        return;
                    }

                    if (
                        this.getFieldManager().isEntityTypeFieldAvailable &&
                        !this.getFieldManager().isEntityTypeFieldAvailable(subEntityType, field)
                    ) {
                        return;
                    }

                    if (~this.numericFieldTypeList.indexOf(fields[field].type)) {
                        itemList.push('SUM:' + link + '.' + field);
                        itemList.push('MAX:' + link + '.' +  field);
                        itemList.push('MIN:' + link + '.' +  field);
                        itemList.push('AVG:' + link + '.' +  field);
                    }
                });
            });

            this.params.options = itemList;
        },

        setupTranslatedOptions: function (customEntityType) {
            GroupBy.prototype.setupTranslatedOptions.call(this, customEntityType);

            this.params.options.forEach(item => {
                if (item === 'COUNT:id') {
                    this.translatedOptions[item] = this.translate('COUNT', 'functions', 'Report').toUpperCase();
                }
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupOptions();
            this.setupTranslatedOptions();

            this.listenTo(this.model, 'change', model => {
                if (model.hasChanged('groupBy')) {
                    this.setupOptions();
                    this.setupTranslatedOptions();
                    this.reRender();
                }
            });

            this.addActionHandler('editColumns', () => this.actionEditColumns());
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.isEditMode() && this.name === 'columns') {
                const buttonHtml = '<button class="pull-right btn btn-default" data-action="editColumns">'+
                    '<span class="fas fa-pencil-alt fa-sm"></span></button>';

                const $b = $(buttonHtml);

                this.$el.prepend($b);

                const width = $b.outerWidth() + 8;

                this.$el.find('.selectize-control').css('width', 'calc(100% - ' + width + 'px)');
            }
        },

        actionEditColumns() {
            /** @type {string[]} */
            const expressions = this.model.get(this.name) || [];
            /** @type {Object.<string, {label?: string|null, type?: string|null, decimalPlaces?: number|null}>} */
            const data = this.model.get('columnsData') || {};
            /** @type {string[]} */
            const labels = expressions.map(item => (data[item] || {}).label || null);
            /** @type {string[]} */
            const types = expressions.map(item => (data[item] || {}).type || null);
            /** @type {string[]} */
            const decimals = expressions.map(item => {
                const value = (data[item] || {}).decimalPlaces;

                if (value === undefined) {
                    return null;
                }

                return value;
            });

            this.createView('dialog', 'advanced:views/report/modals/edit-columns', {
                expressions: expressions,
                labels: labels,
                types: types,
                decimals: decimals,
                entityType: this.model.get('entityType'),
            }, view => {
                view.render();

                this.listenToOnce(view, 'apply',
                    /**
                     * @param {string[]} expressions
                     * @param {(string|null)[]} labels
                     * @param {(string|null)[]} types
                     * @param {(number|null)[]} decimals
                     */
                    (expressions, labels, types, decimals) => {
                        const data = expressions.reduce((o, value, i) => {
                            const label = labels[i] || null;
                            const type = types[i] || null;
                            const decimalPlaces = decimals[i];

                            return {...o, [value]: {label: label, type: type, decimalPlaces: decimalPlaces}}
                        }, {});

                        this.model.set({
                            [this.name]: expressions,
                            columnsData: data,
                        }, {ui: true});

                        this.clearView('dialog');

                        this.reRender();
                    });
            });
        },
    });
});
