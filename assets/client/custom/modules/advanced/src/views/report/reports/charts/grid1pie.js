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

define('advanced:views/report/reports/charts/grid1pie', ['advanced:views/report/reports/charts/grid1bar-vertical'],
function (Dep) {

    return Dep.extend({

        noLegend: false,
        zooming: false,
        isSquare: true,

        prepareData: function () {
            const result = this.result;
            const grList = this.grList = result.grouping[0];

            if (grList.length <= 5) {
                this.colorList = this.colorListAlt;
            }

            const data = [];
            this.values = [];

            grList.forEach((gr) => {
                const value = (this.result.reportData[gr] || {})[this.column] || 0;

                this.values.push(value);

                const o = {
                    label: this.formatGroup(0, gr),
                    groupValue: gr,
                    data: [[0, value]],
                    value: value,
                };

                if (gr in this.colors) {
                    o.color = this.colors[gr];
                }

                data.push(o);
            });

            this.chartData = data;
        },

        isNoData: function () {
            if (!this.chartData.length) {
                return true;
            }

            let isEmpty = true;

            this.chartData.forEach(item => {
                if (item && item.value) {
                    isEmpty = false;
                }
            });

            return isEmpty;
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

            this.$graph = this.flotr.draw(this.$container.get(0), this.chartData, {
                shadowSize: false,
                colors: this.colorList,
                pie: {
                    show: true,
                    fillOpacity: 1,
                    explode: 0,
                    lineWidth: 1,
                    sizeRatio: 0.75,
                    labelFormatter: (total, value) => {
                        const percentage = (100 * value / total).toFixed(0);

                        if (percentage < 3) {
                            return '';
                        }

                        const percentageString = percentage.toString() + '%';

                        const css = `color:${this.textColor};`;

                        return `<span class="small numeric-text" style="${css}">${percentageString}</span>`;
                    },
                },
                grid: {
                    horizontalLines: false,
                    verticalLines: false,
                    outline: '',
                    color: this.gridColor,
                },
                yaxis: {
                    showLabels: false
                },
                xaxis: {
                    showLabels: false
                },
                mouse: {
                    track: true,
                    relative: true,
                    lineColor: this.hoverColor,
                    cursorPointer: true,
                    trackFormatter: (obj) => {
                        const column = this.options.column;
                        const value = this.formatCellValue(obj.series.value, column);

                        const fraction = obj.fraction || 0;
                        const percentage = (100 * fraction).toFixed(2).toString();

                        const label = (obj.series.label || this.translate('-Empty-', 'labels', 'Report'));

                        return `${label}<br><span class="numeric-text">${value} / ${percentage}%</span>`;
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
            });

            Flotr.EventAdapter.observe(this.$container.get(0), 'flotr:click', (position) => {
                if (!position.hit) {
                    return;
                }

                if (!('index' in position.hit)) {
                    return;
                }

                this.trigger('click-group', position.hit.series.groupValue);
            });

            this.adjustLegend();
        },
    });
});
