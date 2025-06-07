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

define('advanced:views/report/reports/charts/grid2bar-vertical',
['advanced:views/report/reports/charts/base'], function (Dep) {

    return Dep.extend({

        columnWidth: 60,
        barWidth: 0.5,
        zooming: true,
        pointXHalfWidth: 0.5,

        prepareData: function () {
            const result = this.result;

            const firstList = this.firstList = result.grouping[0];
            const secondList = this.secondList = result.grouping[1];

            if (secondList.length <= 5) {
                this.colorList = this.colorListAlt;
            }

            const columns = [];
            let i = 0;

            this.sumList = [];
            this.max = 0;
            this.min = 0;

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

                i++;
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
                    dataByGroup2[gr2].push([i + shift, columnData[gr2] || 0]);
                });
            });

            const data = [];

            secondList.forEach(gr2 => {
                const o = {
                    data: dataByGroup2[gr2],
                    label: this.formatGroup(1, gr2)
                };

                if (this.result.success && this.result.success === gr2) {
                    o.color = this.successColor;
                }

                if (gr2 in this.colors) {
                    o.color = this.colors[gr2];
                }

                data.push(o);
            });

            if (!this.isGrouped && !this.isLine) {
                this.max = 0;

                if (this.sumList.length) {
                    this.max = this.sumList.reduce((a, b) => {
                        return Math.max(a, b);
                    });
                }
            }

            if (this.isGrouped && !this.isLine) {
                this.zoomMaxDistanceMultiplier = 1;

                if (this.sumList.length) {
                    this.zoomMaxDistanceMultiplier = this.sumList.length;

                    if (this.sumList.length > 10) {
                        this.zoomMaxDistanceMultiplier = 4;
                    } else if (this.sumList.length > 3) {
                        this.zoomMaxDistanceMultiplier = 2;
                    }
                }
            }

            this.chartData = data;
        },

        formatGroup: function (i, value) {
            let gr = this.result.groupByList[i];

            if (this.result.groupByList.length === 0) {
                gr = '__STUB__';
            }

            return this.reportHelper.formatGroup(gr, value, this.result);
        },

        getTickNumber: function () {
            const containerWidth = this.$container.width();

            return Math.floor(containerWidth / this.columnWidth);
        },

        getHorizontalPointCount: function () {
            return this.sumList.length;
        },

        isNoData: function () {
            return !this.chartData.length;
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
                    horizontal: false,
                    shadowSize: 0,
                    lineWidth: 1,
                    fillOpacity: 1,
                    barWidth: this.barWidth,
                },
                grid: {
                    horizontalLines: true,
                    verticalLines: false,
                    outline: 'sw',
                    color: this.gridColor,
                    tickColor: this.tickColor
                },
                yaxis: {
                    //min: 0,
                    showLabels: true,
                    color: this.textColor,
                    max: this.max + this.max * 0.1,
                    min: this.min + this.min * 0.1,
                    tickFormatter: value => {
                        // noinspection EqualityComparisonWithCoercionJS
                        if (value == 0 && this.min === 0) {
                            return '';
                        }

                        if (value > this.max + 0.09 * this.max) {
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
                xaxis: {
                    min: this.xMin || 0,
                    max: this.xMax || null,
                    color: this.textColor,
                    noTicks: tickNumber,
                    tickFormatter: value => {
                        // noinspection EqualityComparisonWithCoercionJS
                        if (value % 1 == 0) {
                            const i = parseInt(value);

                            if (i in this.firstList) {
                                if (this.firstList.length - tickNumber > 5 && i === this.firstList.length - 1) {
                                    return '';
                                }

                                return '<span class="numeric-text">' +
                                    this.formatGroup(0, this.firstList[i]) + '</span>';
                            }
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
                    backgroundOpacity: 0,
                },
                mouse: {
                    track: this.isGrouped || !this.noMouseTrack,
                    relative: true,
                    position: 's',
                    lineColor: this.hoverColor,
                    autoPositionVertical: this.isGrouped,
                    autoPositionHorizontalHalf: !this.isGrouped,
                    cursorPointer: this.isGrouped || !this.noMouseTrack,
                    trackFormatter: obj => {
                        const i = Math.round(obj.x);
                        const column = this.options.column;
                        const value = obj.series.data[obj.index][1];

                        return this.formatGroup(0, this.firstList[i]) + '<br>' + obj.series.label +
                            '<br>' + '<span class="numeric-text">' + this.formatCellValue(value, column) + '</span>';
                    },
                },
            });

            this.adjustLegend();

            if (this.dragStart) {
                return;
            }

            if (this.isGrouped || !this.noMouseTrack) {
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
        },
    });
});
