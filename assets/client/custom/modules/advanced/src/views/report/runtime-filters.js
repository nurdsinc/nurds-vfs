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

define('advanced:views/report/runtime-filters', ['view'], function (Dep) {

    return Dep.extend({

        template: 'advanced:report/runtime-filters',

        data: function () {
            return {
                filterDataList: this.getFilterDataList()
            };
        },

        setup: function () {
            this.wait(true);

            this.filterList = this.options.filterList;
            this.filtersData = this.options.filtersData || {};
            this.ignoreFilterList = [];

            this.getModelFactory().create(this.options.entityType, (model) => {
                this.model = model;

                this.getCollectionFactory().create(this.options.entityType, (collection) => {
                    Espo.loader.require('search-manager', SearchManager => {
                        this.searchManager = new SearchManager(collection, 'report', null, this.getDateTime());

                        if ('setTimeZone' in this.searchManager) {
                            this.searchManager.setTimeZone(null);
                        }

                        this.createFilters();
                        this.wait(false);
                    });
                });
            });
        },

        createFilters: function () {
            this.options.filterList.forEach((name) => {
                var params = this.filtersData[name] || this.getFilterDefaultData(name) || null;
                this.createFilter(name, params);
            });
        },

        getFilterDefaultData: function (name) {
            var fieldType = this.getMetadata().get(['entityDefs', this.model.name, 'fields', name, 'type']);

            if (['date', 'datetime', 'datetimeOptional'].includes(fieldType)) {
                return {
                    type: 'currentYear',
                    field: name,
                };
            }
        },

        getFilterDataList: function () {
            var list = [];

            this.options.filterList.forEach((name) => {
                if (~this.ignoreFilterList.indexOf(name)) {
                    return;
                }

                list.push({
                    key: 'filter-' + name,
                    name: name,
                });
            });

            return list;
        },

        createFilter: function (name, params, callback) {
            params = params || {};

            var scope = this.model.name;
            var field = name;

            if (~name.indexOf('.')) {
                var link = name.split('.')[0];
                field = name.split('.')[1];
                scope = this.getMetadata().get('entityDefs.' + this.model.name + '.links.' + link + '.entity');
            }

            if (!scope || !field) {
                return;
            }

            if (!this.getMetadata().get(['entityDefs', scope, 'fields', field])) {
                this.ignoreFilterList.push(name);

                return;
            }

            this.getModelFactory().create(scope, (model) => {
                this.createView('filter-' + name, 'views/search/filter', {
                    name: field,
                    model: model,
                    params: params,
                    el: this.options.el + ' .filter[data-name="'+name+'"]',
                    notRemovable: true,
                }, (view) => {
                    view.once('after:render', () => {
                        if (~name.indexOf('.')) {
                            var label = this.translate(link, 'links',
                                this.options.entityType) + '.' + this.translate(field, 'fields', scope);

                                view.$el.find('.control-label').html(label);
                        }

                        if (typeof callback === 'function') {
                            callback();
                        }
                    });
                });
            });
        },

        fetchRaw: function () {
            const data = {};

            this.filterList.forEach(name => {
                if (!this.hasView('filter-' + name)) {
                    return;
                }

                const view = /** @type {module:views/fields/base} */
                    this.getView('filter-' + name).getView('field');

                if (!view) {
                    return;
                }

                let filterData = view.fetchSearch();

                const prepareItem = (data, name) => {
                    const type = data.type;

                    if (type === 'or' || type === 'and') {
                        (data.value || []).forEach(item => prepareItem(item, name));

                        return;
                    }

                    let attribute = data.attribute || data.field || name;

                    if (name.includes('.') && !attribute.includes('.')) {
                        const link = name.split('.')[0];
                        attribute = link + '.' + attribute;
                    }

                    data.field = attribute;
                    data.attribute = attribute;
                };

                filterData = filterData || null;

                if (filterData) {
                    prepareItem(filterData, name);
                }

                data[name] = filterData;
            });

            return data;
        },

        fetch: function () {
            const data = this.fetchRaw();

            this.searchManager.setAdvanced(data);

            return this.searchManager.getWhere();
        },
    });
});
