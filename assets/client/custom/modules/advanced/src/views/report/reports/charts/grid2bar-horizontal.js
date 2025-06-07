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

define('advanced:views/report/reports/charts/grid2bar-horizontal',
['advanced:views/report/reports/charts/grid2bar-vertical'], function (Dep) {

    return Dep.extend({

        rowHeight: 25,
        zooming: false,

        prepareData: function () {
            const result = this.result;

            const firstList = this.firstList = Espo.Utils.clone(result.grouping[0]);
            const secondList = this.secondList = result.grouping[1];

            firstList.reverse();

            if (secondList.length <= 5) {
                this.colorList = this.colorListAlt;
            }

            const columns = [];

            this.max = 0;
            this.min = 0;
            this.sumList = [];

            firstList.forEach(gr1 => {
                const columnData = {};
                let sum;

                secondList.forEach(gr2 => {
                    if (result.reportData[gr1] && result.reportData[gr1][gr2]) {
                        const value = result.reportData[gr1][gr2][this.column] || 0;

                        columnData[gr2] = value;

                        if (value > this.max) {
                            this.max = value;
                        }


                        if (value < this.min) {
                            this.min = value;
                        }
                    }
                });

                columns.push(columnData);

                sum = (result.group1Sums[gr1] || {})[this.column] || 0;

                this.sumList.push(sum);
            });

            const dataByGroup2 = {};

            const group2Count = this.group2Count = secondList.length;

            if (this.isGrouped && group2Count) {
                this.barWidth = 1 / (group2Count) * 0.65;
            }

            const baseShift = 1 / group2Count;
            const middleIndex = Math.ceil(group2Count / 2) - 1;

            secondList.forEach((gr2, j) => {
                let shift = 0;

                if (this.isGrouped) {
                    const diffIndex = j - middleIndex;

                    shift = baseShift * diffIndex;

                    if (group2Count % 2 === 0) {
                        shift -= baseShift / 2;
                    }

                    shift *= 0.75;
                }

                dataByGroup2[gr2] = [];

                columns.forEach((columnData, i) => {
                    dataByGroup2[gr2].push([columnData[gr2] || 0, i - shift]);
                });
            });

            const data = [];

            secondList.forEach(gr2 => {
                const o = {
                    data: dataByGroup2[gr2],
                    label: this.formatGroup(1, gr2),
                };

                if (this.result.success && this.result.success === gr2) {
                    o.color = this.successColor;
                }

                if (gr2 in this.colors) {
                    o.color = this.colors[gr2];
                }

                data.push(o);
            });

            if (!this.isGrouped) {
                this.max = 0;

                if (this.sumList.length) {
                    this.max = this.sumList.reduce((a, b) => {
                        return Math.max(a, b);
                    });
                }
            }

            this.chartData = data;
        },

        calculateHeight: function () {
            let number = this.sumList.length;

            if (this.isGrouped && this.secondList.length > 1) {

                number *= this.secondList.length * 0.75;
            }

            return number * this.rowHeight;
        },

        getTickNumber: function () {
            const containerHeight = this.$container.height();

            return Math.floor(containerHeight / this.rowHeight);
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

            const tickNumber = this.getTickNumber();

            this.$graph = this.flotr.draw(this.$container.get(0), this.chartData, {
                shadowSize: false,
                colors: this.colorList,
                bars: {
                    show: true,
                    stacked : !this.isGrouped,
                    horizontal: true,
                    shadowSize: 0,
                    lineWidth: 1,
                    fillOpacity: 1,
                    barWidth: this.barWidth,
                },
                grid: {
                    horizontalLines: false,
                    verticalLines: true,
                    outline: 'sw',
                    color: this.gridColor,
                    tickColor: this.tickColor,
                },
                yaxis: {
                    min: 0,
                    showLabels: true,
                    color: this.textColor,
                    noTicks: tickNumber,
                    title: '&nbsp;',
                    tickFormatter: (value) => {
                        // noinspection EqualityComparisonWithCoercionJS
                        if (value % 1 == 0) {
                            const i = parseInt(value);

                            if (i in this.firstList) {
                                return this.formatGroup(0, this.firstList[i]);
                            }
                        }

                        return '';
                    },
                },
                xaxis: {
                    min: this.min + this.min * 0.1,
                    max: this.max + this.max * 0.1,
                    color: this.textColor,
                    tickFormatter: (value) => {
                        // noinspection EqualityComparisonWithCoercionJS
                        if (value == 0 && this.min == 0) {
                            return '';
                        }

                        // noinspection EqualityComparisonWithCoercionJS
                        if (value % 1 == 0) {
                            return '<span class="numeric-text">' +
                                this.formatNumber(Math.floor(value), this.isCurrency, true, true, true).toString() +
                                '</span>';
                        }

                        return '';
                    },
                },
                legend: {
                    show: true,
                    noColumns: this.getLegendColumnNumber(),
                    container: this.$el.find('.legend-container'),
                    labelBoxMargin: 0,
                    labelFormatter: this.labelFormatter.bind(this),
                    labelBoxBorderColor: 'transparent',
                    backgroundOpacity: 0
                },
                mouse: {
                    track: true,
                    relative: true,
                    position: 'w',
                    lineColor: this.hoverColor,
                    autoPositionHorizontal: this.isGrouped,
                    autoPositionVerticalHalf: !this.isGrouped,
                    cursorPointer: true,
                    trackFormatter: (obj) => {
                        const i = Math.round(obj.y);
                        const column = this.options.column;
                        const value = obj.series.data[obj.index][0];

                        return this.formatGroup(0, this.firstList[i]) + '<br>' + obj.series.label +
                            '<br>' + '<span class="numeric-text">' + this.formatCellValue(value, column) + '</span>';
                    },
                },
            });

            this.adjustLegend();

            Flotr.EventAdapter.observe(this.$container.get(0), 'flotr:click', position => {
                if (!position.hit) {
                    return;
                }

                if (!('index' in position.hit)) {
                    return;
                }

                this.trigger(
                    'click-group',
                    this.firstList[position.hit.index],
                    null,
                    this.secondList[position.hit.seriesIndex]
                );
            });
        }
    });
});
