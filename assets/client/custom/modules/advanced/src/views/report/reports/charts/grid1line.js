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

define('advanced:views/report/reports/charts/grid1line',
['advanced:views/report/reports/charts/grid1bar-vertical'], function (Dep) {

    return Dep.extend({

        noLegend: true,

        columnWidth: 80,
        isLine: true,
        zooming: true,
        pointXHalfWidth: 0,

        init: function () {
            Dep.prototype.init.call(this);
        },

        getTickNumber: function () {
            const containerWidth = this.$container.width();

            return Math.floor(containerWidth / this.columnWidth);
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

            if (this.columnList && this.columnList.length > 1) {
                this.noLegend = false;
            }

            const containerWidth = this.$container.width();
            let stripTicks = false;
            const tickNumber = this.getTickNumber();
            const pointCount = this.getDisplayedPointCount();
            let tickDelta;

            let verticalLineNumber = pointCount;

            if (containerWidth / pointCount < this.columnWidth) {
                verticalLineNumber = tickNumber;
            } else {
                if (pointCount > tickNumber) {
                    stripTicks = true;

                    tickDelta = Math.floor(pointCount / tickNumber);
                }
            }

            this.$graph = this.flotr.draw(this.$container.get(0), this.chartData, {
                shadowSize: false,
                colors: this.colorList,
                lines: {
                    show: true,
                    lineWidth: 3,
                    fill: !this.columnList || this.columnList.length === 1,
                },
                points: {
                    show: false,
                },
                grid: {
                    horizontalLines: true,
                    verticalLines: true,
                    outline: 'sw',
                    color: this.gridColor,
                    tickColor: this.tickColor
                },
                yaxis: {
                    min: this.min + 0.08 * this.min,
                    showLabels: true,
                    autoscale: true,
                    autoscaleMargin: 0.1,
                    color: this.textColor,
                    max: this.max + 0.08 * this.max,
                    tickFormatter: value => {
                        if (value > this.max + 0.09 * this.max) {
                            return '';
                        }

                        // noinspection EqualityComparisonWithCoercionJS
                        if (
                            (value != 0 || value == 0 && this.min < 0) &&
                            value % 1 == 0
                        ) {
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
                        // noinspection EqualityComparisonWithCoercionJS
                        if (value == 0 && this.min2 === 0) {
                            return '';
                        }

                        if (value > this.max2 + 0.07 * this.max2) {
                            return '';
                        }

                        // noinspection EqualityComparisonWithCoercionJS
                        if (value % 1 == 0) {
                            return '<span class="numeric-text">' +
                                this.formatNumber(Math.floor(value)).toString() +
                                '</span>'
                        }

                        return '';
                    },
                },
                xaxis: {
                    min: this.xMin || 0,
                    max: this.xMax || null,
                    color: this.textColor,
                    noTicks: verticalLineNumber,
                    tickFormatter: value => {
                        // noinspection EqualityComparisonWithCoercionJS
                        if (value % 1 == 0) {
                            const i = parseInt(value);

                            if (stripTicks) {
                                if (i % tickDelta !== 0) {
                                    return '';
                                }
                            }

                            if (i === 0) {
                                return '';
                            }

                            if (i in this.grList) {
                                if (this.grList.length > 4 && i === this.grList.length - 1) {
                                    return '';
                                }

                                if (i === this.grList.length - 1) {
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
                    lineColor: this.hoverColor,
                    autoPositionHorizontal: true,
                    cursorPointer: true,
                    trackFormatter: obj => {
                        const i = Math.floor(obj.x);

                        const column = obj.series.column;
                        let string = this.formatGroup(0, this.grList[i]);

                        if (this.columnList) {
                            string += '<br>' + obj.series.label;
                        }

                        string += '<br>' +
                            '<span class="numeric-text">' + this.formatCellValue(obj.y, column) + '</span>';

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
                    } else {
                        column = this.column;
                    }
                }

                this.trigger('click-group', this.grList[position.hit.index], undefined, undefined, column);
            });
        },
    });
});
