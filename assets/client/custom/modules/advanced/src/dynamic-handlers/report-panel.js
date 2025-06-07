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

define('advanced:dynamic-handlers/report-panel', [], function () {


    var DynamicHandler = function (recordView) {
        this.recordView = recordView;
        this.model = recordView.model;
    }

    _.extend(DynamicHandler.prototype, {

        init: function () {
            this.controlReportType();
            this.controlReportId();
            this.controlEntityType();
            this.controlType();
            this.controlTotal();
        },

        onChange: function () {
            this.controlTotal();
        },

        onChangeEntityType: function (model, value, o) {
            if (!o.ui) return;

            this.model.set({
                reportId: null,
                reportName: null,
                dynamicLogicVisible: null
            });

            this.controlEntityType();
        },

        onChangeReportId: function (model, value, o) {
            this.controlReportId();
        },

        onChangeReportType: function (model, value, o) {
            this.controlReportType();
        },

        onChangeType: function (model, value, o) {
            this.controlType();
        },

        controlEntityType: function () {
            if (!this.model.get('entityType')) {
                this.recordView.hideField('dynamicLogicVisible');
            } else {
                this.recordView.showField('dynamicLogicVisible');
            }
        },

        controlReportType: function () {
            if (this.model.get('reportType') === 'Grid') {
                this.recordView.showField('displayTotal');
                this.recordView.showField('column');
            } else if (this.model.get('reportType') === 'JointGrid') {
                this.recordView.showField('displayTotal');
                this.recordView.hideField('column');
            } else {
                this.recordView.hideField('displayTotal');
                this.recordView.hideField('column');
            }
        },

        controlReportId: function () {
            if (this.model.get('reportId')) {
                this.recordView.showField('reportType');
            } else {
                this.recordView.hideField('reportType');
            }
        },

        controlType: function () {
            if (this.model.get('type') === 'bottom') {
                this.recordView.showField('order');
            } else {
                this.recordView.hideField('order');
            }
        },

        controlTotal: function () {
            if (
                this.model.get('reportId') &&
                (this.model.get('displayTotal') || this.model.get('displayOnlyTotal'))
            ) {
                this.recordView.showField('useSiMultiplier');
            } else {
                this.recordView.hideField('useSiMultiplier');
            }
        },
    });

    return DynamicHandler;

});
