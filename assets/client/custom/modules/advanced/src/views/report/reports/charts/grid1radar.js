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

define('advanced:views/report/reports/charts/grid1radar',
['advanced:views/report/reports/charts/base'], function (Dep) {

    return Dep.extend({

        noLegend: true,
        zooming: false,
        defaultHeight: 450,

        prepareData: function () {
            const result = this.result;

            const grList = this.grList = result.grouping[0];

            if (this.options.color) {
                this.colorList = Espo.Utils.clone(this.colorList);
                this.colorList[0] = this.options.color;
            }

            const columnList = this.columnList || [this.column];

            if (this.columnList && this.columnList.length > 1) {
                this.noLegend = false;
            }

            let max = 0;
            let min = 0;

            const chartData = [];

            this.ticks = [];

            grList.forEach((group, i) => {
                const label = this.formatGroup(0, group);
                this.ticks.push([i, label]);
            });

            columnList.forEach(column => {
                if (this.secondColumnList && ~this.secondColumnList.indexOf(column)) {
                    return;
                }

                const label = this.reportHelper.formatColumn(column, this.result);

                const columnData = {
                    data: [],
                    label: label,
                    column: column,
                };

                grList.forEach((group, i) => {
                    const value = (this.result.reportData[group] || {})[column] || 0;

                    if (value > max) {
                        max = value;
                    }

                    if (value < min) {
                        min = value;
                    }

                    columnData.data.push([i, value]);
                });

                if (column in this.colors) {
                    columnData.color = this.colors[column];
                }

                chartData.push(columnData);
            });

            this.max = max;
            this.min = min;

            this.chartData = chartData;
        },

        isNoData: function () {
            if (!this.chartData.length || this.grList.length < 3) {
                return true;
            }

            let isEmpty = true;

            this.chartData.forEach(item => {
                if (item && item.data && item.data.length) {
                    isEmpty = false;
                }
            });

            if (isEmpty) {
                return true;
            }

            return false;
        },

        draw: function () {
            if (this.$container.height() === 0) {
                this.$container.empty();

                return;
            }

            if (this.isNoData()) {
                this.showNoData();

                return;
            }

            const factor = this.getFontSizeFactor();

            this.$graph = this.flotr.draw(this.$container.get(0), this.chartData, {
                shadowSize: false,
                colors: this.colorList,
                htmlText: true,
                style: {
                    fontSize: 10 * factor,
                },
                radar: {
                    show: true,
                    fill: true,
                    shadowSize: 0,
                    lineWidth: 2 * factor,
                    fillOpacity: 0.2,
                    radiusRatio: 0.90,
                },
                grid: {
                    circular: true,
                    color: this.gridColor,
                    tickColor: this.gridColor,
                },
                xaxis: {
                    ticks: this.ticks,
                    color: this.textColor,
                    fontSize: 9 * factor,
                },
                yaxis : {
                    min: 0,
                    max: this.max,
                    minorTickFreq: 2,
                    color: this.textColor,
                    fontSize: 9 * factor,
                    tickFormatter: (value) => {
                        // noinspection EqualityComparisonWithCoercionJS
                        if (value === '0' || value == 0) {
                            return '';
                        }

                        const intValue = parseInt(value);

                        if (intValue > this.max - this.max * 0.09) {
                            return '';
                        }

                        // noinspection EqualityComparisonWithCoercionJS
                        if (value % 1 == 0) {
                            return this.formatNumber(Math.floor(value), this.isCurrency, true, true, true).toString();
                        }

                        return '';
                    }
                },
                legend: {
                    show: !this.noLegend,
                    noColumns: this.getLegendColumnNumber(),
                    container: this.$el.find('.legend-container'),
                    labelBoxMargin: 0,
                    labelFormatter: this.labelFormatter.bind(this),
                    labelBoxBorderColor: 'transparent',
                    backgroundOpacity: 0,
                },
            });

            if (!this.noLegend) {
                this.adjustLegend();
            }
        },

        formatGroup: function (i, value) {
            const gr = this.result.groupByList[i];

            return this.reportHelper.formatGroup(gr, value, this.result);
        },
    });
});
