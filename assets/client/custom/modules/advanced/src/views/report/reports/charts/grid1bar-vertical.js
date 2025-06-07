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

define('advanced:views/report/reports/charts/grid1bar-vertical',
['advanced:views/report/reports/charts/grid2bar-vertical'], function (Dep) {

    return Dep.extend({

        noLegend: true,
        columnWidth: 60,
        barWidth: 0.5,
        legendColumnWidth: 160,
        pointXHalfWidth: 0.5,

        prepareData: function () {
            const result = this.result;
            const grList = this.grList = result.grouping[0];

            if (this.options.color) {
                this.colorList = Espo.Utils.clone(this.colorList);
                this.colorList[0] = this.options.color;
            }

            const columnList = this.columnList = this.columnList || [this.column];

            let baseShift = 1, middleIndex;

            if (this.columnList) {
                if (this.columnList.length > 1) {
                    this.barWidth = 1 / (this.columnList.length) * 0.65;
                }

                baseShift = 1 / this.columnList.length;

                middleIndex = Math.ceil(this.columnList.length / 2) - 1;

                if (this.columnList.length > 1) {
                    this.noLegend = false;
                }
            }

            let max = 0;
            let max2 = 0;

            let min = 0;
            let min2 = 0;

            const chartData = [];

            columnList.forEach((column, j) => {
                const columnData = {
                    data: [],
                    label: this.reportHelper.formatColumn(column, this.result),
                    column: column,
                };

                let shift = 0;

                if (this.columnList) {
                    if (!this.isLine) {
                        const diffIndex = j - middleIndex;

                        shift = baseShift * diffIndex;

                        if (this.columnList.length % 2 === 0) {
                            shift -= baseShift / 2;
                        }

                        shift *= 0.75;
                    }

                    if (this.secondColumnList && ~this.secondColumnList.indexOf(column)) {
                        columnData.yaxis = 2;
                    }
                }

                columnData.value = 0;

                grList.forEach((group, i) => {
                    const value = (this.result.reportData[group] || {})[column] || 0;

                    if (this.secondColumnList && ~this.secondColumnList.indexOf(column)) {
                        if (value > max2) {
                            max2 = value;
                        }

                        if (value < min2) {
                            min2 = value;
                        }
                    } else {
                        if (value > max) {
                            max = value;
                        }

                        if (value < min) {
                            min = value;
                        }
                    }

                    columnData.data.push([i + shift, value]);

                    columnData.value += value;
                });

                if (column in this.colors) {
                    columnData.color = this.colors[column];
                }

                chartData.push(columnData);
            });

            this.max = max;
            this.max2 = max2;

            this.min = min;
            this.min2 = min2;

            this.chartData = chartData;
        },

        getTickNumber: function () {
            const containerWidth = this.$container.width();

            return Math.floor(containerWidth / this.columnWidth);
        },

        isNoData: function () {
            if (!this.chartData.length) {
                return true;
            }

            let isEmpty = true;

            for (const item of this.chartData) {
                if (
                    item &&
                    item.data &&
                    item.data.length &&
                    item.value
                ) {
                    isEmpty = false;

                    break;
                }
            }

            return isEmpty;
        },

        getHorizontalPointCount: function () {
            return this.grList.length;
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
                    tickColor: this.tickColor,
                },
                yaxis: {
                    min: this.min + 0.08 * this.min,
                    showLabels: true,
                    color: this.textColor,
                    max: this.max + 0.08 * this.max,
                    tickFormatter: value => {
                        if (value == 0 && this.min === 0) {
                            return '';
                        }

                        if (value > this.max + 0.072 * this.max) {
                            return '';
                        }

                        if (value % 1 == 0) {
                            return '<span class="numeric-text">' +
                                this.formatNumber(Math.floor(value), this.isCurrency, true, true, true).toString() +
                                '</span>';
                        }

                        return '';
                    },
                },
                y2axis: {
                    min: this.min2 + 0.08 * this.min2,
                    showLabels: true,
                    color: this.textColor,
                    max: this.max2 + 0.08 * this.max2,
                    tickFormatter: value => {
                        if (value == 0 && this.min2 === 0) {
                            return '';
                        }

                        if (value > this.max2 + 0.07 * this.max2) {
                            return '';
                        }

                        if (value % 1 == 0) {
                            return '<span class="numeric-text">' +
                                this.formatNumber(Math.floor(value), false, true, true).toString() +
                                '</span>';
                        }

                        return '';
                    },
                },
                xaxis: {
                    min: this.xMin || 0,
                    max: this.xMax || null,
                    noTicks: tickNumber,
                    color: this.textColor,
                    tickFormatter: value => {
                        if (value % 1 == 0) {
                            const i = parseInt(value);

                            if (i in this.grList) {
                                if (
                                    this.grList.length - tickNumber > 5 &&
                                    i === this.grList.length - 1 && !this.isZoomed
                                ) {
                                    return '';
                                }

                                return this.formatGroup(0, this.grList[i]);
                            }
                        }

                        return '';
                    },
                },
                mouse: {
                    track: true,
                    relative: true,
                    position: 's',
                    lineColor: this.hoverColor,
                    autoPositionVertical: true,
                    cursorPointer: true,
                    trackFormatter: obj => {
                        const i = obj.index;
                        const column = obj.series.column;
                        let string = this.formatGroup(0, this.grList[i]);

                        if (this.columnList) {
                            if (string) {
                                string += '<br>';
                            }

                            string += obj.series.label;
                        }

                        if (string) {
                            string += '<br>';
                        }

                        string += '<span class="numeric-text">' + this.formatCellValue(obj.y, column) + '</span>';

                        return string;
                    },
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

            if (this.dragStart) {
                return;
            }

            Flotr.EventAdapter.observe(this.$container.get(0), 'flotr:click', position => {
                if (!position.hit) {
                    return;
                }

                if (!('index' in position.hit)) {
                    return;
                }

                let column = null;

                if (this.result.isJoint) {
                    if (this.columnList) {
                        column = this.columnList[position.hit.seriesIndex];
                    }
                    else {
                        column = this.column;
                    }
                }

                this.trigger('click-group', this.grList[position.hit.index], undefined, undefined, column);
            });
        },
    });
});
