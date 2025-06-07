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

define('advanced:views/report/record/panels/report', ['view', 'advanced:report-helper'], function (Dep, ReportHelper) {

    return Dep.extend({

        template: 'advanced:report/record/panels/report',

        setup: function () {
            const reportHelper = new ReportHelper(
                this.getMetadata(),
                this.getLanguage(),
                this.getDateTime(),
                this.getConfig(),
                this.getPreferences()
            );

            const viewName = reportHelper.getReportView(this.model);

            this.createView('report', viewName, {
                el: this.options.el + ' .report-container',
                model: this.model,
                reportHelper: reportHelper,
            });

            this.recordHelper = this.options.recordHelper;

            this.listenTo(this.recordHelper, 'run-report', () => this.actionRefresh());
        },

        actionRefresh: function () {
            const reportView = this.getView('report');

            reportView.run();
        },
    });
});
