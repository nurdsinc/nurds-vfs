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

define('advanced:report-helper', ['view'], function (Fake) {

    const ReportHelper = function (metadata, language, dateTime, config, preferences) {
        this.metadata = metadata;
        this.language = language;
        this.dateTime = dateTime;
        this.config = config;
        this.preferences = preferences;

        let formatData = this.getFormatData();

        this.decimalMark = formatData.decimalMark;
        this.thousandSeparator = formatData.thousandSeparator;
        this.currencyDecimalPlaces = formatData.currencyDecimalPlaces;
        this.currencySymbol = formatData.currencySymbol;
        this.currency = formatData.currency;
        this.currencySymbol = formatData.currencySymbol;
        this.currencyFormat = formatData.currencyFormat;
    };

    _.extend(ReportHelper.prototype, {

        getFormatData: function () {
            let config = this.config;
            let preferences = this.preferences;

            let currency = config.get('defaultCurrency') || 'USD';
            let currencySymbol = this.getMetadata().get(['app', 'currency', 'symbolMap', currency]) || '';

            let decimalMark = '.';
            let thousandSeparator = ',';

            if (preferences.has('decimalMark')) {
                decimalMark = preferences.get('decimalMark');
            } else {
                if (config.has('decimalMark')) {
                    decimalMark = config.get('decimalMark');
                }
            }

            if (preferences.has('thousandSeparator')) {
                thousandSeparator = preferences.get('thousandSeparator');
            } else {
                if (config.has('thousandSeparator')) {
                    thousandSeparator = config.get('thousandSeparator');
                }
            }

            let currencyDecimalPlaces = config.get('currencyDecimalPlaces');

            return {
                currency: currency,
                currencySymbol: currencySymbol,
                decimalMark: decimalMark,
                thousandSeparator: thousandSeparator,
                currencyDecimalPlaces: currencyDecimalPlaces,
                currencyFormat: parseInt(config.get('currencyFormat')),
            };
        },

        formatCellValue: function (value, column, result, useSiMultiplier) {
            let isCurrency = false;

            let arr = column.split(':');

            if (arr.length === 1) {
                arr = ['', column];
            }

            if (arr.length > 1) {
                let data = this.getGroupFieldData(column, result) || {};

                let entityType = data.entityType;
                let field = data.field;
                let fieldType = data.fieldType;

                isCurrency = !!~['currency', 'currencyConverted'].indexOf(fieldType);

                if (!isCurrency && entityType === 'Opportunity' && field === 'amountWeightedConverted') {
                    isCurrency = true;
                }
            }

            let columnDecimalPlacesMap = result.columnDecimalPlacesMap || {};

            let decimalPlaces = columnDecimalPlacesMap[column];

            return this.formatNumber(value, isCurrency, useSiMultiplier, null, null, decimalPlaces);
        },

        formatNumber: function (
            value,
            isCurrency,
            useSiMultiplier,
            noDecimalPart,
            no3CharCurrencyFormat,
            decimalPlaces
        ) {
            if (typeof decimalPlaces === 'undefined') {
                decimalPlaces = null;
            }

            var currencySymbol = this.currencySymbol;
            var decimalMark = this.decimalMark;
            var thousandSeparator = this.thousandSeparator;
            let currencyDecimalPlaces = this.currencyDecimalPlaces;

            if (decimalPlaces != null) {
                currencyDecimalPlaces = decimalPlaces;
            }

            var siSuffix = '';

            if (useSiMultiplier) {
                if (value >= 1000000) {
                    siSuffix = 'M';
                    value = value / 1000000;
                } else if (value >= 1000) {
                    siSuffix = 'k';
                    value = value / 1000;
                }
            }

            if (value !== null) {
                let maxDecimalPlaces = 2;

                if (isCurrency) {
                    if (!noDecimalPart && useSiMultiplier) {
                        if (siSuffix !== '') {
                            if (value >= 100) {
                                maxDecimalPlaces = 0;
                                currencyDecimalPlaces = 0;
                            } else if (value >= 10) {
                                maxDecimalPlaces = 1;
                                currencyDecimalPlaces = 1;
                            } else {
                                maxDecimalPlaces = 2;
                                currencyDecimalPlaces = 2;
                            }
                        }
                    }

                    if (noDecimalPart) {
                        currencyDecimalPlaces = null;
                    }
                    else if (currencyDecimalPlaces === 0) {
                        value = Math.round(value);
                    }
                    else if (currencyDecimalPlaces) {
                        value = Math.round(
                            value * Math.pow(10, currencyDecimalPlaces)) / (Math.pow(10, currencyDecimalPlaces)
                        );
                    } else {
                        value = Math.round(value * Math.pow(10, maxDecimalPlaces)) / (Math.pow(10, maxDecimalPlaces));
                    }
                }
                else {
                    let maxDecimalPlaces = 4;

                    if (decimalPlaces !== null && decimalPlaces < maxDecimalPlaces) {
                        maxDecimalPlaces = decimalPlaces;
                    }

                    if (!noDecimalPart && useSiMultiplier) {
                        if (siSuffix !== '') {
                            if (value >= 10) {
                                maxDecimalPlaces = 1;
                            } else {
                                maxDecimalPlaces = 2;
                            }
                        }
                    }

                    value = Math.round(value * Math.pow(10, maxDecimalPlaces)) / (Math.pow(10, maxDecimalPlaces));
                }

                var parts = value.toString().split(".");

                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

                if (isCurrency) {
                    if (currencyDecimalPlaces === 0) {
                        delete parts[1];
                    }
                    else if (currencyDecimalPlaces) {
                        var decimalPartLength = 0;

                        if (parts.length > 1) {
                            decimalPartLength = parts[1].length;
                        } else {
                            parts[1] = '';
                        }

                        if (currencyDecimalPlaces && decimalPartLength < currencyDecimalPlaces) {
                            let limit = currencyDecimalPlaces - decimalPartLength;

                            for (var i = 0; i < limit; i++) {
                                parts[1] += '0';
                            }
                        }
                    }
                }

                if (!noDecimalPart && !isCurrency && decimalPlaces !== null && siSuffix === '') {
                    let decimalPartLength = 0;

                    if (parts.length > 1) {
                        decimalPartLength = parts[1].length;
                    } else {
                        parts[1] = '';
                    }

                    if (decimalPlaces !== 0) {
                        let limit = decimalPlaces - decimalPartLength;

                        for (let i = 0; i < limit; i++) {
                            parts[1] += '0';
                        }
                    }
                    else {
                        parts.pop();
                    }
                }

                value = parts.join(decimalMark);

                if (isCurrency) {
                    if (this.currencyFormat === 1) {
                        if (no3CharCurrencyFormat) {
                            value = value + siSuffix;
                        } else {
                            value = value + siSuffix + ' ' + this.currency;
                        }
                    }
                    else if (this.currencyFormat === 3) {
                        value = value + siSuffix + ' ' + currencySymbol;
                    }
                    else {
                        value = currencySymbol + value + siSuffix;
                    }
                }
                else {
                    value = value + siSuffix;
                }

                return value;
            }

            return '';
        },

        /**
         * Returns an escaped string.
         */
        formatColumn: function (value, result) {
            let string = value;

            if (value in result.columnNameMap) {
                string = result.columnNameMap[value];
            }

            return Handlebars.Utils.escapeExpression(string);
        },

        /**
         * Returns an escaped string.
         */
        formatGroup: function (gr, value, result) {
            if (gr in result.groupValueMap) {
                value = result.groupValueMap[gr][value] || value;

                if (value === '__STUB__') {
                    return '';
                }

                if (value === null || value === '') {
                    value = this.language.translate('-Empty-', 'labels', 'Report');
                }

                return Handlebars.Utils.escapeExpression(value);
            }

            if (~gr.indexOf('MONTH:')) {
                return moment(value + '-01').format('MMM YYYY');
            }

            if (~gr.indexOf('DAY:')) {
                let today = moment().tz(this.dateTime.getTimeZone()).startOf('day');
                let dateObj = moment(value);
                let readableFormat = this.dateTime.getReadableDateFormat();

                if (dateObj.format('YYYY') !== today.format('YYYY')) {
                    readableFormat += ', YYYY'
                }

                return dateObj.format(readableFormat);
            }

            if (value === null || value === '') {
                return this.language.translate('-Empty-', 'labels', 'Report');
            }

            return Handlebars.Utils.escapeExpression(value);;
        },

        /**
         *
         * @param {string} item
         * @param {string} entityType
         * @param {module:model} [model]
         * @return {string|null}
         */
        translateGroupName: function (item, entityType, model) {
            //let hasFunction = false;

            if (item === 'COUNT:id') {
                return this.language.translate('COUNT', 'functions', 'Report').toUpperCase();
            }

            if (model) {
                /** @type {Object.<string, {label?: string|null}>} */
                const data = model.attributes.columnsData || {};

                if (data[item] && data[item].label) {
                    return data[item].label;
                }
            }

            let fieldData = this.getGroupFieldData(item, {entityType: entityType}) || {};

            let fieldEntityType = fieldData.entityType;
            let field = fieldData.field;
            let fieldType = fieldData.fieldType;
            let func = fieldData.function;
            let link = fieldData.link;

            let value = this.language.translate(field, 'fields', fieldEntityType);

            if (fieldType === 'currencyConverted' && field.substr(-9) === 'Converted') {
                value = this.language.translate(field.substr(0, field.length - 9), 'fields', fieldEntityType);
            }

            if (link) {
                value = this.language.translate(link, 'links', entityType) + '.' + value;
            }

            if (func) {
                value = this.language.translate(func, 'functions', 'Report').toUpperCase() + ': ' + value;
            }

            return value;
        },

        getCode: function () {
            return '666d14eca4fd54205a89f2a8f2b55ea2';
        },

        getMetadata: function () {
            return this.metadata;
        },

        getReportView: function (model) {
            let type = model.get('type');
            let groupBy = model.get('groupBy') || [];

            switch (type) {
                case 'Grid':
                case 'JointGrid':
                    let depth = model.get('depth') || groupBy.length;

                    if (depth > 2) {
                        throw new Error('Bad report.');
                    }
                    return 'advanced:views/report/reports/grid' + depth.toString();

                case 'List':
                    return 'advanced:views/report/reports/list';
            }

            throw new Error('Bad report type.');
        },

        getChartColumnGroupList: function (result) {
            let columnList = result.numericColumnList || result.columnList;

            const groupList = [];

            if (!['Line', 'BarHorizontal', 'BarVertical', 'Radar'].includes(result.chartType)) {
                columnList.forEach(column => {
                    groupList.push({column: column});
                });

                return groupList;
            }

            if (result.chartDataList && result.chartDataList.length && result.chartDataList[0]) {
                columnList = (result.chartDataList[0].columnList || []).concat(
                    result.chartDataList[0].y2ColumnList || []
                );

                return [
                    {
                        columnList: columnList,
                        secondColumnList: result.chartDataList[0].y2ColumnList,
                        column: null,
                    }
                ];
            }

            if (!result.chartDataList && result.isJoint) {
                return [
                    {
                        columnList: columnList,
                        secondColumnList: [],
                    },
                ];
            }

            const sumCurrencyItemList = [];
            const currencyItemList = [];

            let secondColumn = null;
            let group1 = null;
            let group2 = null;

            const countColumnList = [];

            columnList.forEach((item) => {
                const data = this.getGroupFieldData(item, result);

                if (!data) {
                    return;
                }

                if (!this.isColumnAggregated(item, result)) {
                    return;
                }

                //var fieldType = data.fieldType;
                //var field = data.field;
                const func = data.function;

                if (
                    data.fieldType === 'currencyConverted' ||
                    (data.field === 'amountWeightedConverted' && data.entityType === 'Opportunity')
                ) {
                    if (func === 'SUM' || !func) {
                        sumCurrencyItemList.push(item);
                    } else {
                        currencyItemList.push(item);
                    }
                }
                else {
                    if (func === 'COUNT') {
                        countColumnList.push(item);
                    } else {
                        if (!secondColumn) {
                            secondColumn = item;
                        } else {
                            groupList.push({
                                column: item,
                            });
                        }
                    }
                }
            });

            if (sumCurrencyItemList.length) {
                group1 = {
                    columnList: sumCurrencyItemList,
                };
            }

            if (currencyItemList.length) {
                group2 = {
                    columnList: currencyItemList,
                };
            }

            let group3 = null;

            if (secondColumn || countColumnList.length) {
                if (sumCurrencyItemList.length) {
                    if (countColumnList.length) {
                        group1.secondColumnList = countColumnList;

                        countColumnList.forEach((column) => {
                            group1.columnList.push(column);
                        });
                    } else {
                        group1.columnList.push(secondColumn);
                        group1.secondColumnList = [secondColumn];
                    }
                }
                else if (currencyItemList.length) {
                    if (countColumnList.length) {
                        group2.secondColumnList = countColumnList;

                        countColumnList.forEach((column) => {
                            group2.columnList.push(column);
                        });
                    } else {
                        group2.columnList.push(secondColumn);
                        group2.secondColumnList = [secondColumn];
                    }
                }
                else {
                    if (countColumnList.length > 1 || countColumnList.length && secondColumn) {
                        group3 = {
                            columnList: countColumnList
                        };
                        if (secondColumn) {
                            group3.columnList.push(secondColumn);
                            group3.secondColumnList = [secondColumn];
                        }
                    } else if (countColumnList.length === 1) {
                        group3 = {
                            column: countColumnList[0]
                        };
                    } else {
                        if (groupList.length) {
                            groupList[0].columnList = [secondColumn, groupList[0].column];
                            groupList[0].secondColumnList = [groupList[0].column];
                            groupList[0].column = null;
                        } else {
                            groupList.push({
                                column: secondColumn
                            })
                        }
                    }
                }
            }

            if (currencyItemList.length) {
                groupList.unshift(group2);

                if (currencyItemList.length === 1) {
                    group2.column = currencyItemList[0];
                    group2.columnList = null;
                }
            }

            if (sumCurrencyItemList.length) {
                groupList.unshift(group1);

                if (sumCurrencyItemList.length === 1) {
                    group1.column = sumCurrencyItemList[0];
                    group1.columnList = null;
                }
            }

            if (group3) {
                groupList.unshift(group3);
            }

            return groupList;
        },

        getGroupFieldData: function (item, result) {
            let entityType = result.entityType;

            if (~item.indexOf('@')) {
                let arr = item.split('@');

                if (parseInt(arr[arr.length - 1]).toString() === arr[arr.length - 1]) {
                    let numString = arr[arr.length - 1];
                    let num = parseInt(numString);

                    item = item.substr(0, item.length - numString.length - 1);
                    entityType = result.entityTypeList[num];
                }
            }

            let field = item;
            let func = null;
            let link = null;

            if (field.includes(':')) {
                field = item.split(':')[1];
                func = item.split(':')[0];
            }

            if (item.includes(':(')) {
                return;
            }

            if (item.includes('.')) {
                let arr = field.split('.');

                field = arr[1];
                link = arr[0];

                entityType = this.metadata.get(['entityDefs', entityType, 'links', link, 'entity']);

                if (!entityType) {
                    return;
                }
            }

            let fieldType = this.metadata.get(['entityDefs', entityType, 'fields', field, 'type']);

            return {
                entityType: entityType,
                field: field,
                fieldType: fieldType,
                function: func,
                link: link,
            };
        },

        /**
         *
         * @param item
         * @param {string|module:model|Record} result
         * @return {boolean}
         */
        isColumnNumeric: function (item, result) {
            if (typeof result === 'string') {
                result = {entityType: result};
            }

            if (result.get && result.set) {
                const columnsData = result.get('columnsData') || {};

                if ((item in columnsData) && columnsData[item].type != null) {
                    if (columnsData[item].type === 'Summary') {
                        return true;
                    }
                }

                result = {entityType: result.get('entityType')};
            }

            let data = this.getGroupFieldData(item, result) || {};

            if (result.numericColumnList && ~result.numericColumnList.indexOf(item)) {
                return true;
            }

            if (['COUNT', 'SUM', 'AVG'].includes(data.function)) {
                return true;
            }

            return ['int', 'float', 'currencyConverted', 'currency', 'enumInt', 'enumFloat'].includes(data.fieldType);
        },

        isColumnAggregated: function (item, result) {
            if (!result.aggregatedColumnList) {
                return true;
            }

            return !!~result.aggregatedColumnList.indexOf(item);
        },

        isColumnSummary: function (item) {
            let isSummary = false;

            ['COUNT:', 'SUM:', 'AVG:', 'MIN:', 'MAX:'].forEach(part => {
                if (item.indexOf(part) === 0) {
                    isSummary = true;
                }
            });

            return isSummary;
        },
    });

    return ReportHelper;
});
