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

define('advanced:views/report/result', ['views/main', 'advanced:report-helper'], function (Dep, ReportHelper) {

    // noinspection JSUnusedGlobalSymbols
    return Dep.extend({

        template: 'advanced:report/result',

        name: 'result',

        shortcutKeys: {
            'Control+Enter': function (e) {
                this.getReportView().run();

                e.preventDefault();
                e.stopPropagation();
            },
        },

        setup: function () {
            const reportHelper = new ReportHelper(
                this.getMetadata(),
                this.getLanguage(),
                this.getDateTime(),
                this.getConfig(),
                this.getPreferences()
            );

            const viewName = reportHelper.getReportView(this.model);

            this.setupHeader();

            this.createView('report', viewName, {
                el: this.options.el + ' .report-container',
                model: this.model,
                reportHelper: reportHelper,
                showChartFirst: true,
                isLargeMode: true,
            });
        },

        getReportView: function () {
            return this.getView('report');
        },

        setupHeader: function () {
            this.createView('header', 'views/header', {
                model: this.model,
                el: '#main > .header',
                scope: this.scope,
            });
        },

        getHeader: function () {
            let name = this.getHelper().escapeString(this.model.get('name'));

            if (name === '') {
                name = this.model.id;
            }

            const rootUrl = this.options.rootUrl || this.options.params.rootUrl || `#${this.scope}`;

            const headerIconHtml = this.getHeaderIconHtml();

            return this.buildHeaderHtml([
                `${headerIconHtml}<a
                    href="${rootUrl}"
                    class="action"
                    data-action="navigateToRoot"
                >${this.getLanguage().translate(this.scope, 'scopeNamesPlural')}</a>`,
               `<a
                    href="#${this.scope}/view/${this.model.id}"
                    class="action"
                    data-action="backToView"
                >${name}</a>`
            ]);
        },

        actionBackToView: function () {
            const options = {
                id: this.model.id,
                model: this.model,
            };

            options.rootUrl = this.options.rootUrl || this.options.params.rootUrl;

            this.getRouter().navigate(`#${this.scope}/view/${this.model.id}`, {trigger: false});
            this.getRouter().dispatch(this.scope, 'view', options);
        },
    });
});
