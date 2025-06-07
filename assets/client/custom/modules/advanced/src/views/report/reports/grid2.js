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

define('advanced:views/report/reports/grid2', ['advanced:views/report/reports/base'], function (Dep) {

    return Dep.extend({

        setup: function () {
            this.initReport();
        },

        export: function () {
            let where = this.getRuntimeFilters();

            let columnsTranslation = {};
            let entityType = this.model.get('entityType');

            let columnList = (this.model.get('columns') || []).filter(item => {
                return this.options.reportHelper.isColumnSummary(item);
            });

            columnList.forEach(item => {
                columnsTranslation[item] = this.options.reportHelper.translateGroupName(item, entityType);
            });

            let o = {
                scope: entityType,
                reportType: 'Grid',
                columnList: columnList,
                columnsTranslation: columnsTranslation,
            };

            let url;

            let data = {
                id: this.model.id,
                where: where,
            };

            this.createView('dialogExport', 'advanced:views/report/modals/export-grid', o, view => {
                view.render();

                this.listenToOnce(view, 'proceed', dialogData => {
                    data.column = dialogData.column;

                    if (dialogData.format === 'csv') {
                        url = 'Report/action/exportGridCsv';
                        data.column = dialogData.column;
                    } else if (dialogData.format === 'xlsx') {
                        url = 'Report/action/exportGridXlsx';
                    }

                    Espo.Ui.notify(' ... ');

                    Espo.Ajax.postRequest(url, data, {timeout: 0}).then(response => {
                        Espo.Ui.notify(false);

                        if ('id' in response) {
                            window.location = this.getBasePath() + '?entryPoint=download&id=' + response.id;
                        }
                    });
                });
            });
        },

        run: function () {
            Espo.Ui.notify(' ... ');

            let $container = this.$el.find('.report-results-container');
            $container.empty();

            let where = this.getRuntimeFilters();

            Espo.Ajax.getRequest('Report/action/run', {
                id: this.model.id,
                where: where,
            }, {timeout: 0}).then(result => {
                this.notify(false);
                this.result = result;

                this.storeRuntimeFilters();

                this.processInformation();

                let headerTag = this.options.isLargeMode ? 'h4' : 'h5';
                let headerMarginTop = this.options.isLargeMode ? 60 : 50;

                let summaryColumnList = result.summaryColumnList || result.columnList;

                summaryColumnList.forEach((column, i) => {
                    let $column = $('<div>')
                        .addClass('column-' + i)
                        .addClass('section')
                        .addClass('sections-container');

                    let $header = $('<'+headerTag+' style="margin-bottom: 25px">' +
                        this.options.reportHelper.formatColumn(column, result) + '</'+headerTag+'>');

                    if (!this.options.isLargeMode) {
                        $header.addClass('text-soft');
                    }

                    if (headerMarginTop && i) {
                        $header.css('marginTop', headerMarginTop);
                    }

                    let $tableContainer = $('<div>')
                        .addClass('report-table clearfix')
                        .addClass('report-table-' + i)
                        .addClass('section');

                    let $chartContainer = $('<div>')
                        .addClass('report-chart')
                        .addClass('report-chart-' + i)
                        .addClass('section');

                    if (this.chartType) {
                        $tableContainer.addClass('margin-bottom');
                    }

                    $column.append($header);

                    if (!this.options.showChartFirst) {
                        $column.append($tableContainer);
                    }

                    if (this.chartType) {
                        $column.append($chartContainer);
                    }

                    if (this.options.showChartFirst) {
                        $column.append($tableContainer);
                    }

                    $container.append($column);
                });

                summaryColumnList.forEach((column, i) => {
                    this.createView('reportTable' + i, 'advanced:views/report/reports/tables/grid2', {
                        el: this.options.el + ' .report-results-container .column-' + i + ' .report-table',
                        column: column,
                        result: result,
                        reportHelper: this.options.reportHelper,
                        hasChart: !!this.chartType,
                        isLargeMode: this.options.isLargeMode,
                        showChartFirst: this.options.showChartFirst,
                    }, (view) => {
                        view.render();
                    });

                    if (this.chartType) {
                        let viewName = 'advanced:views/report/reports/charts/grid2' +
                            Espo.Utils.camelCaseToHyphen(this.chartType);

                        this.createView('reportChart' + i, viewName, {
                            el: this.options.el + ' .report-results-container .column-' + i + ' .report-chart',
                            column: column,
                            result: result,
                            reportHelper: this.options.reportHelper,
                            colors: result.chartColors || {},
                            color: result.chartColor || null,
                        }, (view) => {
                            view.render();

                            this.listenTo(view, 'click-group', (groupValue, groupIndex, groupValue2) => {
                                this.showSubReport(groupValue, groupIndex, groupValue2);
                            });
                        });
                    }
                });
            });
        },

        processInformation() {
            if (this.result.emptyStringGroupExcluded) {
                this.$information
                    .removeClass('hidden')
                    .text(this.translate('emptyStringGroupExcluded', 'messages', 'Report'));

                return;
            }

            this.$information
                .addClass('hidden')
                .text('');
        },
    });
})
