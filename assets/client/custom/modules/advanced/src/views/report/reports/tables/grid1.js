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

define('advanced:views/report/reports/tables/grid1',
['view', 'advanced:views/report/reports/tables/grid2'], function (Dep, Grid2) {

    return Dep.extend({

        template: 'advanced:report/reports/tables/table',

        columnWidthPx: 130,

        STUB_KEY: '__STUB__',

        setup: function () {
            this.column = this.options.column;
            this.result = this.options.result;
            this.reportHelper = this.options.reportHelper;
        },

        events: {
            'click [data-action="showSubReport"]': function (e) {
                const $target = $(e.currentTarget);

                const value = $target.attr('data-group-value');

                this.trigger('click-group', value);
            },
        },

        formatCellValue: function (value, column, isTotal) {
            return Grid2.prototype.formatCellValue.call(this, value, column, isTotal);
        },

        formatNumber: function (value, isCurrency) {
            return Grid2.prototype.formatNumber.call(this, value, isCurrency);
        },

        calculateColumnWidth: function () {
            const columnCount = (this.result.columnList.length + 1);

            let columnWidth;

            if (this.options.isLargeMode) {
                if (columnCount === 2) {
                    columnWidth = 22;
                } else if (columnCount === 3) {
                    columnWidth = 22;
                } else if (columnCount === 4) {
                    columnWidth = 20;
                } else {
                    columnWidth = 100 / columnCount;
                }
            } else {
                if (columnCount === 2) {
                    columnWidth = 35;
                } else if (columnCount === 3) {
                    columnWidth = 30;
                } else {
                    columnWidth = 100 / columnCount;
                }
            }

            return columnWidth;
        },

        afterRender: function () {
            const result = this.result;

            let groupBy = this.result.groupByList[0];

            let noGroup = false;

            if (this.result.groupByList.length === 0) {
                noGroup = true;
                groupBy = this.STUB_KEY;
            }

            const columnCount = (this.result.columnList.length + 1);

            const columnWidth = this.calculateColumnWidth();

            const $table = $('<table style="table-layout: fixed;">')
                .addClass('table table-no-overflow')
                .addClass('table-bordered');

            const $tbody = $('<tbody>');

            $table.append($tbody);

            const columnWidthPx = this.columnWidthPx;

            if (columnCount > 4) {
                const tableWidthPx = columnWidthPx * columnCount;

                $table.css('min-width', tableWidthPx  + 'px');
            }

            if (!this.options.hasChart || this.options.isLargeMode) {
                $table.addClass('no-margin');
                //this.$el.addClass('no-bottom-margin');
            }

            let $tr = $('<tr class="accented">');

            const hasSubListColumns = (this.result.subListColumnList || []).length;

            if (!noGroup) {
                const $th = $('<th>');

                if (!~groupBy.indexOf(':') && (this.result.isJoint || hasSubListColumns)) {
                    const columnData = this.reportHelper.getGroupFieldData(groupBy, this.result);

                    let columnString = null;

                    if (columnData.fieldType === 'link') {
                        const foreignEntityType = this.getMetadata()
                            .get(['entityDefs', columnData.entityType, 'links', columnData.field, 'entity']);

                        if (foreignEntityType) {
                            columnString = this.translate(foreignEntityType, 'scopeNames');
                        }
                    }

                    if (columnString) {
                        columnString = '<strong class="text-soft">' + columnString + '</strong>';
                        $th.html(columnString);

                        if (this.options.isLargeMode && noGroup && this.result.columnList.length < 3) {
                            $th.css('font-size', '125%');
                        }
                    }
                }

                $tr.append($th);
            }

            this.result.columnList.forEach(col => {
                let columnString = this.reportHelper.formatColumn(col, this.result);

                columnString = '<strong class="text-soft">' + columnString + '</strong>';

                const $th = $(`<th style="width: ${columnWidth}%">`)
                    .html(columnString + '&nbsp;');

                $th.css('font-weight', '600');

                if (
                    this.options.isLargeMode &&
                    (noGroup && !hasSubListColumns) &&
                    this.result.columnList.length < 3
                ) {
                    $th.css('font-size', '125%');
                }

                $tr.append($th);
            });

            $tbody.append($tr);

            this.result.grouping[0].forEach(gr => {
                let $tr = $('<tr>');

                if (hasSubListColumns) {
                    $tr.addClass('accented');
                }

                let groupTitle;

                if (!noGroup) {
                    groupTitle = this.reportHelper.formatGroup(groupBy, gr, this.result);

                    let html = groupTitle;

                    if (!this.result.isJoint) {
                        html = '<a role="button" tabindex="0" data-action="showSubReport"' +
                            ' data-group-value="' + Handlebars.Utils.escapeExpression(gr) + '">' +
                            html + '</a>&nbsp;';
                    }

                    let $td = $('<td>').html(html);

                    if (hasSubListColumns) {

                        $td.css('font-weight', '600');
                    }

                    $tr.append($td);

                    if (hasSubListColumns) {
                        this.result.columnList.forEach(col => {
                            const $td = $('<td>');

                            if (!this.options.reportHelper.isColumnNumeric(col, this.result)) {
                                const itemData = this.result.reportData[gr] || {};

                                const formattedValue = this.formatCellValue(
                                    itemData[col] || '',
                                    col
                                );

                                $td.text(formattedValue);
                                $td.attr('title', formattedValue);
                            }

                            $tr.append($td);
                        });

                        $tbody.append($tr);

                        $tr = $('<tr>');

                        const $td = $('<td>');

                        $td.addClass('text-soft');

                        $td.html(this.translate('Group Total', 'labels', 'Report'));

                        $tr.append($td);
                    }
                }

                if (hasSubListColumns) {
                    const recordList = this.result.subListData[gr];

                    recordList.forEach(recordItem => {
                        const $tr = $('<tr>');

                        if (!noGroup) {
                            $tr.append('<td>');
                        }

                        this.result.columnList.forEach(col => {
                            const $td = $('<td>');

                            if (!~this.result.subListColumnList.indexOf(col)) {
                                $tr.append('<td>');

                                return;
                            }

                            if (this.options.reportHelper.isColumnNumeric(col, this.result)) {
                                $td.attr('align', 'right');
                                $td.addClass('numeric-text');
                            }

                            const value = recordItem[col];

                            const formattedValue = this.formatCellValue(value, col);

                            $td.html(formattedValue);
                            $td.attr('title', formattedValue);

                            if (formattedValue === '') {
                                $td.html('&nbsp;');
                            }

                            $tr.append($td);
                        });

                        $tbody.append($tr);
                    });
                }

                let hasGroupTotal = false;

                this.result.columnList.forEach(col => {
                    let value = null;
                    let toSkip = false;

                    if (gr in result.reportData) {
                        value = result.reportData[gr][col];
                    }

                    const $td = $('<td>');

                    if (this.options.reportHelper.isColumnNumeric(col, this.result)) {
                        $td.attr('align', 'right');
                        $td.addClass('numeric-text');
                    }

                    if (noGroup) {
                        $td.css('font-weight', '600');
                        $td.addClass('text-soft');

                        if (this.options.isLargeMode) {
                            $td.css('font-size', '175%');
                        }
                        else if (!hasSubListColumns) {
                            $td.css('font-size', '125%');
                        }
                    } else {
                        const columnString = this.reportHelper.formatColumn(col, this.result);

                        const title = this.unescapeString(groupTitle) + '\n' + this.unescapeString(columnString);

                        $td.attr('title', title);

                        if (hasSubListColumns && this.options.reportHelper.isColumnNumeric(col, this.result)) {
                            $td.css('font-weight', '600');
                            $td.addClass('text-soft');

                            hasGroupTotal = true;
                        }

                        if (hasSubListColumns && !this.options.reportHelper.isColumnNumeric(col, this.result)) {
                            toSkip = true;
                        }

                        if (hasSubListColumns && !this.options.reportHelper.isColumnAggregated(col, this.result)) {
                           toSkip = true;
                        }
                    }

                    const formattedValue = !toSkip ? this.formatCellValue(value, col) : '';

                    $td.html(formattedValue);

                    $tr.append($td);
                });

                if (this.result.summaryColumnList.length !== 0 || hasGroupTotal) {
                    $tbody.append($tr);
                }
            });

            if (!noGroup) {
                $tr = $('<tr class="accented">');

                const $text = $('<span>' + this.translate('Total', 'labels', 'Report') + '</span>');

                const $td = $('<td>')
                    .html($text)
                    .addClass('text-soft')
                    .css('font-weight', '600');

                $tr.append($td);

                if (this.options.isLargeMode) {
                    $text.css('vertical-align', 'middle');
                }

                this.result.columnList.forEach(col => {
                    let value = result.sums[col];

                    let cellValue;

                    const columnString = this.reportHelper.formatColumn(col, this.result);

                    if (
                        this.options.reportHelper.isColumnNumeric(col, this.result) &&
                        this.options.reportHelper.isColumnAggregated(col, this.result)
                    ) {
                        value = value || 0;

                        cellValue = this.formatCellValue(value, col, true);
                    } else {
                        cellValue = '';
                    }

                    const $td = $('<td style="text-align: right" class="numeric-text">')
                        .css('font-weight', '600')
                        .html(cellValue);

                    if (this.options.isLargeMode) {
                        $td.css('font-size', '125%');
                    }

                    const title = this.unescapeString(columnString);

                    $td.attr('title', title);

                    $tr.append($td);
                });

                $tbody.append($tr);
            }

            this.$el.find('.table-container').append($table);

            if (columnCount > 4) {
                this.$el.find('.table-container').css('overflow-y', 'auto');
            }
        },

        unescapeString: function (value) {
            return $('<div>').html(value).text();
        },
    });
});
