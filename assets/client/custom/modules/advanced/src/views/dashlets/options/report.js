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

define('advanced:views/dashlets/options/report',
['views/dashlets/options/base', 'advanced:views/report/fields/columns', 'advanced:report-helper'],
function (Dep, Columns, ReportHelper) {

    return Dep.extend({

        template: 'advanced:dashlets/options/report',

        setup: function () {
            if (!this.optionsData.displayType && this.optionsData.type) {
                this.setCorrespondingDisplayType();
            }

            Dep.prototype.setup.call(this);

            this.reportData = {
                entityType: this.optionsData.entityType || null,
                type: this.optionsData.type || null,
                runtimeFilters: this.optionsData.runtimeFilters || null,
                columns: this.optionsData.columns || null,
                depth: this.optionsData.depth || 0,
                columnsData: this.optionsData.columnsData || {},
            };

            this.reportHelper = new ReportHelper(
                this.getMetadata(),
                this.getLanguage(),
                this.getDateTime(),
                this.getConfig(),
                this.getPreferences()
            );

            this.listenTo(this.model, 'change:reportName', model => {
                setTimeout(() => {
                    model.set('title', model.get('reportName'));
                }, 100);
            });

            this.controlUseSiMultiplierField();

            this.listenTo(this.model, 'change:displayTotal', () => {
                this.controlUseSiMultiplierField();
            });

            this.listenTo(this.model, 'change:displayOnlyCount', () => {
                this.controlUseSiMultiplierField();
            });

            this.listenTo(this.model, 'change:reportId', (model) => {
                this.reportData = {};

                this.removeRuntimeFilters();
                this.hideColumnsField();

                this.hideField('useSiMultiplier');

                const reportId = model.get('reportId');

                if (!reportId) {
                    this.controlRuntimeFiltersPanel();

                    return;
                }

                this.getModelFactory().create('Report', model => {
                    model.id = reportId;

                    model.fetch()
                        .then(() => {
                            const columns = (model.get('columns') || []).filter(item => {
                                // @todo Is summary check instead?
                                return this.reportHelper.isColumnNumeric(item, model);
                            });

                            const type = model.get('type');

                            const reportData = {
                                entityType: model.get('entityType'),
                                type: model.get('type'),
                                runtimeFilters: model.get('runtimeFilters'),
                                columns: columns,
                                columnsData: model.get('columnsData') || {},
                            };

                            if (
                                (type === 'Grid' || type === 'JointGrid') &&
                                model.get('groupBy')
                            ) {
                                reportData.depth = model.get('groupBy').length;
                            } else {
                                reportData.depth = null;
                            }

                            this.model.set('depth', reportData.depth);
                            this.model.set('entityType', model.get('entityType'));

                            if (type === 'Grid' || type === 'JointGrid') {
                                this.model.set('column', columns[0] || null);
                            }

                            let displayType = '';

                            if (reportData.type === 'List') {
                                displayType = 'List';
                            }
                            else if (reportData.type === 'Grid' || reportData.type === 'JointGrid') {
                                displayType = 'Chart';
                            }

                            this.model.set('displayType', displayType);
                            this.model.set('type', reportData.type);

                            this.reportData = reportData;

                            if (this.hasRuntimeFilters()) {
                                this.createRuntimeFilters();
                            }

                            this.controlRuntimeFiltersPanel();

                            this.handleColumnField();
                            this.controlUseSiMultiplierField();
                        });
                });
            });
        },

        setCorrespondingDisplayType: function () {
            const type = this.optionsData.type;

            const displayTotal = this.optionsData.displayTotal;
            const displayOnlyCount = this.optionsData.displayOnlyCount;

            if (displayOnlyCount) {
                this.optionsData.displayType = 'Total';

                return;
            }

            if (displayTotal && (type === 'Grid' || type === 'JointGrid')) {
                this.optionsData.displayType = 'Chart-Total';

                return;
            }

            if (type === 'List') {
                this.optionsData.displayType = 'List';

                return;
            }

            if (type === 'Grid' || type === 'JointGrid') {
                this.optionsData.displayType = 'Chart';
            }
        },

        controlUseSiMultiplierField: function () {
            if (this.model.get('displayOnlyCount') || this.model.get('displayTotal')) {
                this.showField('useSiMultiplier');
            } else {
                this.hideField('useSiMultiplier');
            }
        },

        handleColumnField: function () {
            const recordView = this.getView('record');

            this.hideField('displayOnlyCount');

            if (this.reportData.type) {
                this.showField('displayOnlyCount');

                if (this.reportData.type === 'Grid') {
                    this.showField('displayTotal');
                }

                if (this.reportData.type === 'JointGrid') {
                    this.showField('displayTotal');
                }

                if (this.reportData.type === 'List') {
                    this.hideField('displayTotal');
                }
            }

            if (recordView) {
                const columnView = /** @type {module:views/fields/enumeration}*/ recordView.getFieldView('column');

                if (this.reportData.type === 'Grid') {
                    columnView.params.options = Espo.Utils.clone(this.reportData.columns || []);
                    columnView.translatedOptions = {};

                    Columns.prototype.setupTranslatedOptions.call(columnView);

                    if (
                        (this.reportData.depth === 0 || this.reportData.depth === 1) &&
                        columnView.params.options.length > 1
                    ) {
                        columnView.params.options.unshift('');
                        columnView.translatedOptions[''] = this.translate('All');
                    }

                    columnView.params.options.forEach(column => {
                        const label = (this.reportData.columnsData[column] || {}).label;

                        if (label) {
                            columnView.translatedOptions[column] = label;
                        }
                    });

                    this.$el.find('.cell-column').removeClass('hidden');

                    if ('showField' in recordView) {
                        recordView.showField('column');
                    }
                } else {
                    columnView.params.options = [];

                    this.hideColumnsField();
                }

                columnView.render();
            }
        },

        hideColumnsField: function () {
            this.$el.find('.cell-column').addClass('hidden');

            var recordView = this.getView('record');

            if ('hideField' in recordView) {
                recordView.hideField('column');
            }
        },

        afterRender: function () {
            this.handleColumnField();

            if (this.hasRuntimeFilters()) {
                this.createRuntimeFilters();
            }

            this.controlRuntimeFiltersPanel();
        },

        controlRuntimeFiltersPanel: function () {
            let $panel = this.$el.find('.runtime-filters-panel');

            this.hasRuntimeFilters() ?
                $panel.removeClass('hidden') :
                $panel.addClass('hidden');
        },

        hasRuntimeFilters: function () {
            return (this.reportData.runtimeFilters || []).length !== 0
        },

        removeRuntimeFilters: function () {
            this.clearView('runtimeFilters');
        },

        createRuntimeFilters: function () {
            this.createView('runtimeFilters', 'advanced:views/report/runtime-filters', {
                el: this.options.el + ' .runtime-filters-container',
                entityType: this.reportData.entityType,
                filterList: this.reportData.runtimeFilters,
                filtersData: this.optionsData.filtersData || null,
            }, view => {
                view.render();
            });
        },

        fetchAttributes: function () {
            if (this.getView('record').getFieldView('report').validate()) {
                return;
            }

            var attributes = Dep.prototype.fetchAttributes.call(this) || {};

            if (this.hasRuntimeFilters()) {
                const runtimeFiltersView = this.getView('runtimeFilters');

                if (runtimeFiltersView) {
                    attributes.filtersData = runtimeFiltersView.fetchRaw();
                }
            }

            attributes.entityType = this.reportData.entityType;
            attributes.runtimeFilters = this.reportData.runtimeFilters;
            attributes.type = this.reportData.type;
            attributes.columns = this.reportData.columns;
            attributes.depth = this.reportData.depth;
            attributes.columnsData = this.reportData.columnsData;

            return attributes;
        },
    });
});
