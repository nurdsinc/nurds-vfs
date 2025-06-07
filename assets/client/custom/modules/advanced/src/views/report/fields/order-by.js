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

define('advanced:views/report/fields/order-by', ['views/fields/multi-enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            var entityType = this.model.get('entityType');
            var itemList = [];

            var groupByItemList = this.model.get('groupBy') || [];

            groupByItemList.forEach(item => {
                if (item === 'id') {
                    return;
                }

                var scope = entityType;
                var field = item;
                var link = null;

                if (~field.indexOf(':')) {
                    field = item.split(':')[1];
                }

                if (~field.indexOf('.')) {
                    field = item.split('.')[1];
                    link = item.split('.')[0];
                    scope = this.getMetadata().get('entityDefs.' + entityType + '.links.' + link + '.entity');
                }

                var type = this.getMetadata().get('entityDefs.' + scope + '.fields.' + field + '.type');

                if (link) {
                    if (~['link', 'file', 'image', 'linkParent'].indexOf(type)) {
                        return;
                    }
                }

                switch (type) {
                    case 'enum':
                        itemList.push('LIST:' + item);

                        return;

                    case 'date':
                    case 'datetime':
                        return;

                    default:
                        if (!~this.selected.indexOf('ASC:' + item) && !~this.selected.indexOf('DESC:' + item)) {
                            itemList.push('ASC:' + item);
                            itemList.push('DESC:' + item);
                        } else {
                            if (~this.selected.indexOf('ASC:' + item)) {
                                itemList.push('ASC:' + item);
                            } else if (~this.selected.indexOf('DESC:' + item)) {
                                itemList.push('DESC:' + item);
                            }
                        }
                }
            });

            var columnList = this.model.get('columns') || [];

            columnList.forEach(item => {
                itemList.push('ASC:' + item);
                itemList.push('DESC:' + item);
            });

            this.params.options = itemList;
        },

        setupTranslatedOptions: function () {
            this.translatedOptions = {};

            this.params.options.forEach(item => {
                if (~item.indexOf(':') && ~item.indexOf('(')) {
                    return;
                }

                const order = item.substr(0, item.indexOf(':'));
                let p = item.substr(item.indexOf(':') + 1);

                let scope = this.model.get('entityType');
                const entityType = scope;

                let field = p;

                let func = false;
                let link = false;

                if (~p.indexOf(':')) {
                    func = p.split(':')[0];
                    p = field = p.split(':')[1];
                }

                if (~p.indexOf('.')) {
                    link = p.split('.')[0];
                    field = p.split('.')[1];
                    scope = this.getMetadata().get(`entityDefs.${entityType}.links.${link}.entity`);
                }

                this.translatedOptions[item] = this.translate(field, 'fields', scope);

                if (link) {
                    this.translatedOptions[item] = this.translate(link, 'links', entityType) + ' . ' +
                        this.translatedOptions[item];
                }

                if (func) {
                    if (func === 'COUNT') {
                        this.translatedOptions[item] = this.translate(func, 'functions', 'Report').toUpperCase()
                    } else {
                        this.translatedOptions[item] = this.translate(func, 'functions', 'Report').toUpperCase() +
                            ': ' + this.translatedOptions[item];
                    }
                }
                if (order !== 'LIST') {
                    this.translatedOptions[item] = this.translatedOptions[item] +
                        ' (' + this.translate(order, 'orders', 'Report').toUpperCase() + ')';
                }
            });
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupOptions();
            this.setupTranslatedOptions();

            this.listenTo(this.model, 'change', (m, o) => {
                if (
                    this.model.hasChanged('orderBy') ||
                    this.model.hasChanged('groupBy') ||
                    this.model.hasChanged('columns')
                ) {
                    this.setupOptions();
                    this.setupTranslatedOptions();

                    if (
                        o.ui &&
                        (this.model.hasChanged('columns') || this.model.hasChanged('groupBy'))
                    ) {
                        const columns = this.model.get('columns') || [];
                        const groupBy = this.model.get('groupBy') || [];
                        const values = this.model.get(this.name) || [];

                        const newValues = values.filter(/** string */item => {
                            item = item.startsWith('ASC:') ?
                                item.substring(4) :
                                item.substring(5);

                            return columns.includes(item) || groupBy.includes(item);
                        });

                        if (values.length !== newValues.length) {
                            this.model.set(this.name, newValues);

                            return;
                        }
                    }

                    this.reRender();
                }
            });
        },
    });
});
