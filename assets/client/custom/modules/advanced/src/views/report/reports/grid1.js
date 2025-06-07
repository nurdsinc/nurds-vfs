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

define('advanced:views/report/reports/grid1', ['advanced:views/report/reports/base'], function (Dep) {

    return Dep.extend({

        setup: function () {
            this.initReport();
        },

        export: function () {
            const where = this.getRuntimeFilters();

            const o = {
                scope: this.model.get('entityType'),
                reportType: 'Grid',
            };

            let url;

            const data = {
                id: this.model.id,
                where: where,
            };

            this.createView('dialogExport', 'advanced:views/report/modals/export-grid', o, view => {
                view.render();

                this.listenToOnce(view, 'proceed', (dialogData) => {
                    data.where = where;

                    if (dialogData.format === 'csv') {
                        url = 'Report/action/exportGridCsv';
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

            const $container = this.$el.find('.report-results-container');
            $container.empty();

            const where = this.getRuntimeFilters();

            Espo.Ajax.getRequest('Report/action/run', {
                id: this.model.id,
                where: where,
            }, {timeout: 0}).then(result => {
                Espo.Ui.notify(false);

                this.result = result;

                this.storeRuntimeFilters();

                const $tableContainer = $('<div>').addClass('report-table').addClass('section');

                if (!this.options.showChartFirst) {
                    $container.append($tableContainer);
                }

                let columnGroupList;

                if (this.chartType) {
                    const headerTag = this.options.isLargeMode ? 'h4' : 'h5';
                    const headerMarginTop = this.options.isLargeMode ? 60 : 0;

                    columnGroupList = this.options.reportHelper.getChartColumnGroupList(result);

                    columnGroupList.forEach((item, i) => {
                        let column = item.column;

                        if (!column && item.columnList && item.columnList.length === 1) {
                            column = item.columnList[0];
                        }

                        const $column = $('<div>')
                            .addClass('section')
                            .addClass('column-' + i);

                        if (column) {
                            const $header = $('<' + headerTag + '>')
                                .css('marginBottom', '25px')
                                .html(this.options.reportHelper.formatColumn(column, result));

                            if (headerMarginTop && i) {
                                $header.css('marginTop', headerMarginTop);
                            }

                            $column.append($header);
                        }

                        const $chartContainer = $('<div>')
                            .addClass('section')
                            .addClass('report-chart')
                            .addClass('report-chart-' + i);

                        $column.append($chartContainer);
                        $container.append($column);
                    });
                }

                if (this.options.showChartFirst) {
                    $container.append($tableContainer);
                }

                this.createView('reportTable', 'advanced:views/report/reports/tables/grid1', {
                    el: this.options.el + ' .report-results-container .report-table',
                    result: result,
                    reportHelper: this.options.reportHelper,
                    hasChart: !!this.chartType,
                    isLargeMode: this.options.isLargeMode,
                }, (view) => {
                    view.render();
                });

                this.processInformation();

                if (this.chartType) {
                    columnGroupList.forEach((item, i) => {
                        const column = item.column;
                        const columnList = item.columnList;
                        const secondColumnList = item.secondColumnList;

                        const viewName = 'advanced:views/report/reports/charts/grid1' +
                            Espo.Utils.camelCaseToHyphen(this.chartType);

                        this.createView('reportChart' + i, viewName, {
                            el: this.options.el + ' .report-results-container .column-' + i + ' .report-chart',
                            column: column,
                            columnList: columnList,
                            secondColumnList: secondColumnList,
                            result: result,
                            reportHelper: this.options.reportHelper,
                            colors: result.chartColors || {},
                            color: result.chartColor || null,
                        }, (view) => {
                            view.render();

                            this.listenTo(view, 'click-group', (groupValue, s1, s2, column) => {
                                this.showSubReport(groupValue, undefined, undefined, column);
                            });
                        });
                    });
                }
            });
        },

        getPDF: function (id, where) {
            this.getRouter();
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
});
