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

define('advanced:views/report/reports/charts/grid2line',
['advanced:views/report/reports/charts/grid2bar-vertical'], function (Dep) {

    return Dep.extend({

        columnWidth: 80,

        pointXHalfWidth: 0,

        isLine: true,

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

            const containerWidth = this.$container.width();
            let stripTicks = false;
            const tickNumber = this.getTickNumber();
            const pointCount = this.getDisplayedPointCount();

            let tickDelta;

            let verticalLineNumber = pointCount;

            if (containerWidth / pointCount < this.columnWidth) {
                verticalLineNumber = tickNumber;
            } else if (pointCount > tickNumber) {
                stripTicks = true;

                tickDelta = Math.floor(pointCount / tickNumber);
            }

            this.$graph = this.flotr.draw(this.$container.get(0), this.chartData, {
                shadowSize: false,
                colors: this.colorList,
                lines: {
                    show: true,
                    lineWidth: 3,
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
                    max: this.max + this.max * 0.1,
                    min: this.min + this.min * 0.1,
                    showLabels: true,
                    autoscale: true,
                    autoscaleMargin: 1,
                    color: this.textColor,
                    tickFormatter: (value) => {
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
                    noTicks: verticalLineNumber,
                    tickFormatter: (value) => {
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

                            if (i in this.firstList) {
                                if (this.firstList.length > 4 && i === this.firstList.length - 1) {
                                    return '';
                                }

                                if (this.firstList.length > 200 && i > this.firstList.length - 4) {
                                    return '';
                                }

                                if (i === this.firstList.length - 1) {
                                    return '';
                                }

                                return this.formatGroup(0, this.firstList[i]);
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
                    trackFormatter: (obj) => {
                        const i = Math.floor(obj.x);
                        const column = this.options.column;

                        return this.formatGroup(0, this.firstList[i])  + '<br>' +
                            '<span class="numeric-text">' + this.formatCellValue(obj.y, column) + '</span>';
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
                }
            });

            this.adjustLegend();

            if (this.dragStart) {
                return;
            }

            Flotr.EventAdapter.observe(this.$container.get(0), 'flotr:click', (position) => {
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
