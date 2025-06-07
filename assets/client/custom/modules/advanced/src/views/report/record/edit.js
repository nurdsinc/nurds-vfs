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

define(
    'advanced:views/report/record/edit',
    ['views/record/edit', 'advanced:views/report/record/detail', 'advanced:report-helper'],
    function (Dep, Detail, ReportHelper) {

    return Dep.extend({

        saveAndContinueEditingAction: true,

        saveAndNewAction: false,

        setup: function () {
            if (!this.model.get('type')) {
                throw new Error();
            }

            if (this.model.get('isInternal')) {
                this.layoutName = 'detail';
            } else {
                this.layoutName = 'detail' + this.model.get('type');
            }

            this.reportHelper = new ReportHelper(
                this.getMetadata(),
                this.getLanguage(),
                this.getDateTime(),
                this.getConfig(),
                this.getPreferences()
            );

            if (
                this.model.get('type') === 'List' &&
                this.model.isNew() &&
                !this.model.has('columns')
            ) {
                if (this.getMetadata().get('entityDefs.' + this.model.get('entityType') + '.fields.name')) {
                    this.model.set('columns', ['name']);
                }
            }

            Dep.prototype.setup.call(this);

            this.controlChartColorsVisibility();

            this.listenTo(this.model, 'change', () => {
                if (
                    this.model.hasChanged('chartType') ||
                    this.model.hasChanged('groupBy') ||
                    this.model.hasChanged('columns') ||
                    this.model.hasChanged('columnsData')
                ) {
                    this.controlChartColorsVisibility();
                }
            });

            if (this.model.get('type') === 'Grid') {
                this.controlOrderByField();

                this.listenTo(this.model, 'change:groupBy', this.controlOrderByField);

                this.controlChartColumnsFields();

                this.listenTo(this.model, 'change', (m, o) => {
                    if (
                        this.model.hasChanged('chartType') ||
                        this.model.hasChanged('groupBy') ||
                        this.model.hasChanged('columns')
                    ) {
                        this.controlChartColumnsFields(o.ui);
                    }
                });
            }

            if (
                this.getMetadata().get(['scopes', 'ReportCategory', 'disabled']) ||
                !this.getAcl().checkScope('ReportCategory', 'read')
            ) {
                this.hideField('category');
            }

            this.setupEmailSendingFieldsVisibility();

            if (this.getAcl().get('portalPermission') === 'no') {
                this.hideField('portals');
            }

            this.controlChartTypeFieldOptions();

            this.listenTo(this.model, 'change:groupBy', this.controlChartTypeFieldOptions);
        },

        controlChartTypeFieldOptions: function () {
            let countString = (this.model.get('groupBy') || []).length.toString();

            let optionList = this.getMetadata()
                .get(['entityDefs', 'Report', 'fields', 'chartType', 'optionListMap', countString]);

            this.setFieldOptionList('chartType', optionList);
        },

        setupEmailSendingFieldsVisibility: function () {
            Detail.prototype.setupEmailSendingFieldsVisibility.call(this);
        },

        controlEmailSendingIntervalField: function () {
            Detail.prototype.controlEmailSendingIntervalField.call(this);
        },

        controlChartColorsVisibility: function () {
            let chartType = this.model.get('chartType');

            if (!chartType || chartType === '') {
                this.hideField('chartColor');
                this.hideField('chartColorList');

                return;
            }

            if ((this.model.get('groupBy') || []).length > 1) {
                this.hideField('chartColor');
                this.showField('chartColorList');

                return;
            }

            if (chartType === 'Pie') {
                this.hideField('chartColor');
                this.showField('chartColorList');

                return;
            }

            if (~['Line', 'BarHorizontal', 'BarVertical', 'Radar'].indexOf(chartType)) {
                const columnList = (this.model.get('columns') || []).filter(item => {
                    return this.reportHelper.isColumnNumeric(item, this.model);
                });

                if (columnList.length > 1) {
                    this.hideField('chartColor');
                    this.showField('chartColorList');

                    return;
                }
            }

            this.showField('chartColor');
            this.hideField('chartColorList');
        },

        controlOrderByField: function () {
            const count = (this.model.get('groupBy') || []).length;

            if (count === 0) {
                this.hideField('orderBy');
            } else {
                this.showField('orderBy');
            }
        },

        controlChartColumnsFields: function (isChangedFromUi) {
            let chartType = this.model.get('chartType');

            let columnList = this.model.get('columns') || [];
            let groupBy = this.model.get('groupBy') || [];

            let toShow;

            this.setFieldOptionList('chartOneColumns', columnList);
            this.setFieldOptionList('chartOneY2Columns', columnList);

            if (columnList.length === 0 || /*columnList.length === 1 ||*/ groupBy.length > 1) {
                if (isChangedFromUi) {
                    this.model.set('chartOneColumns', []);
                    this.model.set('chartOneY2Columns', []);
                }

                toShow = false;
            } else {
                toShow = true;
            }

            if (!['BarVertical', 'BarHorizontal', 'Line', 'Radar'].includes(chartType)) {
                toShow = false;
            }

            if (toShow) {
                this.showField('chartOneColumns');

                if (chartType !== 'Radar') {
                    this.showField('chartOneY2Columns');
                }
                else {
                    this.hideField('chartOneY2Columns');
                }
            } else {
                this.hideField('chartOneColumns');
                this.hideField('chartOneY2Columns');
            }

            if (isChangedFromUi && columnList.length > 1) {
                let yList = Espo.Utils.clone(this.model.get('chartOneColumns') || []);
                let y2List = Espo.Utils.clone(this.model.get('chartOneY2Columns') || []);

                yList = yList.filter(item => {
                    return ~columnList.indexOf(item);
                });

                y2List = y2List.filter(item => {
                    return ~columnList.indexOf(item);
                });

                this.model.set('chartOneColumns', yList, {ui: true});
                this.model.set('chartOneY2Columns', y2List, {ui: true});
            }
        },
    });
});
