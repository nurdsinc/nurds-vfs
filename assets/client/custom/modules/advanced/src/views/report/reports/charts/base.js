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

define('advanced:views/report/reports/charts/base', ['view', 'lib!Flotr'], function (Dep, Flotr) {

    return Dep.extend({

        template: 'advanced:report/reports/charts/chart',

        decimalMark: '.',

        thousandSeparator: ',',

        colorList: ['#6FA8D6', '#4E6CAD', '#EDC555', '#ED8F42', '#DE6666', '#7CC4A4', '#8A7CC2', '#D4729B'],
        colorListAlt: ['#6FA8D6', '#EDC555', '#ED8F42', '#7CC4A4', '#D4729B'],
        successColor: '#5ABD37',
        gridColor: '#ddd',
        tickColor: '#e8eced',
        textColor: '#333',
        hoverColor: '#FF3F19',

        defaultHeight: 350,
        legendColumnWidth: 110,
        legendColumnNumber: 8,

        noLegend: false,

        zoomMaxDistanceBetweenPoints: 60,
        zoomStepRatio: 1.5,
        pointXHalfWidth: 0,
        zoomMaxDistanceMultiplier: 1,
        isSquare: false,

        init: function () {
            Dep.prototype.init.call(this);

            this.flotr = this.Flotr = Flotr;

            this.reportHelper = this.options.reportHelper;

            this.successColor = this.getThemeManager().getParam('chartSuccessColor') || this.successColor;
            this.colorList = this.getThemeManager().getParam('chartColorList') || this.colorList;
            this.colorListAlt = this.getThemeManager().getParam('chartColorAlternativeList') || this.colorListAlt;
            this.gridColor = this.getThemeManager().getParam('chartGridColor') || this.gridColor;
            this.tickColor = this.getThemeManager().getParam('chartTickColor') || this.tickColor;
            this.textColor = this.getThemeManager().getParam('textColor') || this.textColor;
            this.hoverColor = this.getThemeManager().getParam('hoverColor') || this.hoverColor;

            this.defaultHeight = this.options.defaultHeight || this.defaultHeight;

            if (this.options.colorList && this.options.colorList.length) {
                this.colorList = this.options.colorList;
                this.colorListAlt = this.options.colorList;
            }

            this.colors = this.options.colors || {};

            this.on('resize', () => {
                if (!this.isRendered()) {
                    return;
                }

                setTimeout(() => {
                    this.adjustContainer();
                    this.processDraw();
                }, 50);
            });

            $(window).on('resize.report-chart-' + this.cid, () => {
                this.adjustContainer();
                this.processDraw();
            });

            this.listenToOnce(this, 'remove', () => {
                $(window).off('resize.report-chart-'+this.cid);

                if (this.zooming && !this.options.isDashletMode) {
                    $(document).off('mouseup.' + this.cid);
                    $(document).off('touchend.' + this.cid);

                    if (this.$container.get(0)) {
                        Flotr.EventAdapter.stopObserving(this.$container.get(0), 'mousemove');
                        Flotr.EventAdapter.stopObserving(this.$container.get(0), 'touchmove');
                    }
                }
                if (this.$graph) {
                    this.$graph.destroy();
                }
            });

            this.result = this.options.result;
            this.column = this.options.column;
            this.columnList = this.options.columnList;
            this.secondColumnList = this.options.secondColumnList;

            let firstColumn = this.column;

            if (this.columnList && this.columnList.length) {
                firstColumn = this.columnList[0];
            }

            if (this.result.columnTypeMap && this.result.columnTypeMap[firstColumn]) {
                this.isCurrency = this.result.columnTypeMap[firstColumn] === 'currencyConverted';
            }

            if (this.zooming && !this.options.isDashletMode) {
                this.events = this.events || {};
                this.events['click [data-action="zoomIn"]'] = this.zoomIn;
                this.events['click [data-action="zoomOut"]'] = this.zoomOut;
            }
        },

        getFontSizeFactor: function () {
            return this.getThemeManager().getFontSizeFactor ? this.getThemeManager().getFontSizeFactor() : 1;
        },

        labelFormatter: function (v) {
            return '<span style="color:'+this.textColor+'">' + v + '</span>';
        },

        formatCellValue: function (value, column) {
            return this.reportHelper.formatCellValue(value, column, this.result);
        },

        formatNumber: function (value, isCurrency, useSiMultiplier, noDecimalPart, no3CharCurrencyFormat) {
            return this.reportHelper.formatNumber(
                value,
                isCurrency,
                useSiMultiplier,
                noDecimalPart,
                no3CharCurrencyFormat
            );
        },

        adjustContainer: function () {
            let heightCss;

            const factor = this.getFontSizeFactor();

            if (this.options.fitHeight) {
                let subtract = 0;

                if (!this.noLegend) {
                    subtract += this.getLegendHeight();
                }

                /*if (this.options.heightSubtract) {
                    subtract += this.options.heightSubtract;
                }*/

                if (subtract) {
                    heightCss = 'calc(100% - ' + subtract.toString() + 'px)';
                } else {
                    heightCss = this.options.height ||
                        ((this.defaultHeight * factor).toString() + 'px');
                }
            } else {
                let heightCalculated;

                const defaultHeight = this.defaultHeight * this.getFontSizeFactor();

                if (!this.options.height) {
                    heightCalculated = this.calculateHeight();

                    if (defaultHeight) {
                        if (heightCalculated < defaultHeight) {
                            heightCalculated = null;
                        }
                    }
                }

                if (heightCalculated) {
                    heightCss = heightCalculated + 'px';
                } else {
                    heightCss = this.options.height || (defaultHeight + 'px');
                }
            }

            this.$container.css('height', heightCss);

            if (this.isSquare) {
                // noinspection JSSuspiciousNameCombination
                this.$container.css({
                    width: heightCss,
                    margin: '0 auto',
                });
            }
        },

        beforeDraw: function () {
            if (this.zooming && !this.options.isDashletMode) {
                if (this.$container.get(0)) {
                    Flotr.EventAdapter.stopObserving(this.$container.get(0), 'mousemove');
                }
            }
        },

        afterDraw: function () {
            if (this.zooming && !this.options.isDashletMode) this.controlZoomButtons();

            if (this.zooming && !this.dragStart) {
                Flotr.EventAdapter.stopObserving(this.$container.get(0), 'flotr:mousedown');
                Flotr.EventAdapter.stopObserving(this.$container.get(0), 'touchstart');

                if (this.isZoomed) {
                    Flotr.EventAdapter.observe(this.$container.get(0), 'flotr:mousedown', this.initDrag.bind(this));
                    Flotr.EventAdapter.observe(this.$container.get(0), 'touchstart', this.initTouchDrag.bind(this));
                }
            }

            if (this.zooming && !this.options.isDashletMode && this.isZoomed) {
                this.$el.css('overflow', 'hidden');
            }
        },

        getDisplayedPointCount: function () {
            let pointCount;

            if (this.xMax) {
                pointCount = this.xMax - this.xMin;
            } else {
                pointCount = this.getHorizontalPointCount();
            }

            pointCount = Math.round(pointCount);

            return pointCount;
        },

        controlZoomButtons: function () {
            if (this.$zoomIn) {
                this.$zoomIn.remove();
            }

            let rightOffset = 0;

            if (this.secondColumnList) {
                rightOffset += 30;
            }

            this.$zoomIn = $('<a role="button" data-action="zoomIn"><span class="fas fa-plus fa-sm"></span></a>');
            this.$zoomIn.css('position', 'absolute');
            this.$zoomIn.css('right', rightOffset);
            this.$zoomIn.css('top', 0);

            this.$zoomOut = $('<a role="button" data-action="zoomOut"><span class="fas fa-minus fa-sm"></span></a>');
            this.$zoomOut.css('position', 'absolute');
            this.$zoomOut.css('right', rightOffset + 20);
            this.$zoomOut.css('top', 0);

            if (!this.zoomRatio || this.zoomRatio === 1.0) {
                this.$zoomOut.css('display', 'none');
            }

            const pointCount = this.getDisplayedPointCount();

            if (
                pointCount <= 1 ||
                this.$container.width() / pointCount > (this.zoomMaxDistanceBetweenPoints * this.zoomMaxDistanceMultiplier)
            ) {
                this.$zoomIn.css('display', 'none');
            }

            this.$container.append(this.$zoomIn);
            this.$container.append(this.$zoomOut);
        },

        zoomIn: function () {
            if (this.xMin === undefined) {
                this.xMin = 0 - this.pointXHalfWidth;
            }

            if (this.xMax === undefined) {
                this.xMax = this.getHorizontalPointCount() + this.pointXHalfWidth;
            }

            const diff = this.xMax - this.xMin;

            if (diff <= 1) {
                return;
            }

            this.middle = diff / 2;
            const newDiff = diff / this.zoomStepRatio;

            const pointCount = this.getHorizontalPointCount();

            this.xMin = Math.ceil(this.middle - newDiff / 2);
            this.xMax = Math.floor(this.middle + newDiff / 2);
            this.zoomRatio = pointCount / (this.xMax - this.xMin);

            this.isZoomed = true;

            this.processDraw();
        },

        zoomOut: function () {
            if (this.xMin === undefined) {
                this.xMin = 0 - this.pointXHalfWidth;
            }

            if (this.xMax === undefined) {
                this.xMax = this.getHorizontalPointCount();
            }

            const diff = this.xMax - this.xMin;

            this.middle = diff / 2;
            const newDiff = Math.round(diff * this.zoomStepRatio, 2);

            this.xMin = Math.floor(this.xMin - newDiff / 2);
            this.xMax = Math.ceil(this.xMax + newDiff / 2);

            const pointCount = this.getHorizontalPointCount();

            if (this.xMin < 0 - this.pointXHalfWidth) {
                this.xMin = 0 - this.pointXHalfWidth;
            }

            if (this.xMax > pointCount) {
                this.xMax = pointCount;
            }


            this.zoomRatio = pointCount / (this.xMax - this.xMin - this.pointXHalfWidth);

            if (this.zoomRatio === 1.0) {
                this.isZoomed = false;
            }

            this.processDraw();
        },

        processDraw: function () {
            this.beforeDraw();
            this.draw();
            this.afterDraw();
        },

        getHorizontalPointCount: function () {},

        initDrag: function (e) {
            this.dragStart = this.$graph.getEventPosition(e);

            Flotr.EventAdapter.observe(this.$container.get(0), 'mousemove', this.drag.bind(this));

            $(document).off('mouseup.' + this.cid);
            $(document).on('mouseup.' + this.cid, this.stopDrag.bind(this));

            this.$container.css('cursor', 'grabbing');
        },

        initTouchDrag: function (e) {
            this.dragStart = {
                isTouch: true,
                x: this.$graph.axes.x.p2d(e.touches[0].clientX - this.$container.get(0).getBoundingClientRect().left)
            };

            Flotr.EventAdapter.observe(this.$container.get(0), 'touchmove', this.drag.bind(this));

            $(document).off('touchend.' + this.cid);
            $(document).on('touchend.' + this.cid, this.stopTouchDrag.bind(this));
        },

        stopDrag: function () {
            $(document).off('mouseup.' + this.cid);
            Flotr.EventAdapter.stopObserving(this.$container.get(0), 'mousemove');
            this.dragStart = null;

            this.$container.css('cursor', '');

            setTimeout(() => {
                this.processDraw();
            }, 50);
        },

        stopTouchDrag: function () {
            $(document).off('touchend.' + this.cid);
            Flotr.EventAdapter.stopObserving(this.$container.get(0), 'touchmove');
            this.dragStart = null;

            setTimeout(() => {
                this.processDraw();
            }, 50);
        },

        drag: function (e) {
            if (!this.dragStart) {
                return;
            }

            let offset;

            if (this.dragStart.isTouch) {
                const x = e.changedTouches[0].clientX - this.$container.get(0).getBoundingClientRect().left;

                offset = this.dragStart.x - this.$graph.axes.x.p2d(x);
            } else {
                const end = this.$graph.getEventPosition(e);
                offset = this.dragStart.x - end.x;
            }

            const pointCount = this.getHorizontalPointCount() - 1;

            const xMin = this.xMin;
            const xMax = this.xMax;

            this.xMin = this.xMin + offset;
            this.xMax = this.xMax + offset;

            if (this.xMin < 0 - this.pointXHalfWidth) {
                this.xMax = xMax + offset - (this.xMin + this.pointXHalfWidth);
                this.xMin = 0 - this.pointXHalfWidth;
            } else if (this.xMax > pointCount + this.pointXHalfWidth) {
                this.xMin = xMin + offset - (this.xMax - pointCount - this.pointXHalfWidth);
                this.xMax = pointCount + this.pointXHalfWidth;
            }

            this.draw(true);
        },

        calculateHeight: function () {
            return null;
        },

        adjustLegend: function () {
            const number = this.getLegendColumnNumber();

            if (!number) {
                return;
            }

            const dashletChartLegendBoxWidth =
                (this.getThemeManager().getParam('dashletChartLegendBoxWidth') || 21) *
                this.getFontSizeFactor();

            const containerWidth = this.$legendContainer.width();

            const width = Math.floor((containerWidth - dashletChartLegendBoxWidth * number) / number);

            const columnNumber = this.$legendContainer.find('> table tr:first-child > td').length / 2;
            const tableWidth = (width + dashletChartLegendBoxWidth) * columnNumber;

            this.$legendContainer.find('> table')
                .css('table-layout', 'fixed')
                .attr('width', tableWidth);

            this.$legendContainer.find('td.flotr-legend-label').attr('width', width);
            this.$legendContainer.find('td.flotr-legend-color-box').attr('width', dashletChartLegendBoxWidth);

            this.$legendContainer.find('td.flotr-legend-label > span').each((i, span) => {
                span.setAttribute('title', span.textContent);
            });
        },

        afterRender: function () {
            this.prepareData();

            this.$container = this.$el.find('.chart-container');
            this.$legendContainer = this.$el.find('.legend-container');

            this.adjustContainer();

            setTimeout(() => {
                this.processDraw();
            }, 1);
        },

        getLegendColumnNumber: function () {
            if (!this.getParentView()) {
                return 1;
            }

            const width = this.getParentView().$el.width();
            const legendColumnNumber = Math.floor(width / (this.legendColumnWidth * this.getFontSizeFactor()));

            return legendColumnNumber || this.legendColumnNumber;
        },

        getLegendHeight: function () {
            if (this.noLegend) {
                return 0;
            }

            const lineNumber = Math.ceil(this.chartData.length / this.getLegendColumnNumber());
            let legendHeight = 0;

            const lineHeight = this.getThemeManager().getParam('dashletChartLegendRowHeight') || 19;
            const paddingTopHeight = this.getThemeManager().getParam('dashletChartLegendPaddingTopHeight') || 7;

            if (lineNumber > 0) {
                legendHeight = lineHeight * lineNumber + paddingTopHeight;
            }

            return legendHeight * this.getFontSizeFactor();
        },

        showNoData: function () {
            const fontSize = this.getThemeManager().getParam('fontSize') || 14;
            this.$container.empty();
            const textFontSize = fontSize * 1.2;

            const $text = $('<span>').html(this.translate('No Data')).addClass('text-muted');

            const $div = $('<div>')
                .css('text-align', 'center')
                .css('font-size', textFontSize + 'px')
                .css('display', 'table')
                .css('width', '100%')
                .css('height', '100%');

            $text
                .css('display', 'table-cell')
                .css('vertical-align', 'middle')
                .css('padding-bottom', fontSize * 1.5 + 'px');

            $div.append($text);

            this.$container.append($div);
        },
    });
});
