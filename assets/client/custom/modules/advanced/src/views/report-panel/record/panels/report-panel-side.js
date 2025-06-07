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

define('advanced:views/report-panel/record/panels/report-panel-side', [
    'views/record/panels/side',
    'advanced:views/dashlets/report',
    'advanced:report-helper'
], function (Dep, Dashlet, ReportHelper) {

    return Dep.extend({

        templateContent: '<div class="report-results-container"></div>',

        isPanel: true,

        totalFontSizeMultiplier: 1.3,
        totalLineHeightMultiplier: 1.1,
        totalMarginMultiplier: 0.4,
        totalOnlyFontSizeMultiplier: 3,
        totalLabelMultiplier: 0.7,
        total2LabelMultiplier: 0.5,
        defaultHeight: 250,

        rowActionsView: 'views/record/row-actions/view-only',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.collectionMaxSize = this.getConfig().get('recordsPerPageSmall');

            this.reportHelper = new ReportHelper(
                this.getMetadata(),
                this.getLanguage(),
                this.getDateTime(),
                this.getConfig(),
                this.getPreferences()
            );
        },

        getOption: function (name) {
            if (name === 'entityType') {
                return this.defs.reportEntityType;
            }
            if (name === 'type') {
                return this.defs.reportType;
            }
            if (name === 'displayOnlyCount') {
                return this.defs.displayOnlyTotal;
            }
            if (name === 'displayTotal') {
                return this.defs.displayTotal;
            }
            if (name === 'reportId') {
                return this.defs.reportPanelId;
            }
            if (name === 'column') {
                return this.defs.column;
            }
            if (name === 'title') {
                return this.defs.title;
            }
            if (name === 'useSiMultiplier') {
                return this.defs.useSiMultiplier;
            }
            if (name === 'displayType') {
                return this.defs.displayType;
            }
        },

        getListLayout: function () {
            return Dashlet.prototype.getListLayout.call(this);
        },

        getContainerTotalHeight: function (withLabels) {
            return Dashlet.prototype.getContainerTotalHeight.call(this, withLabels);
        },

        displayTable: function (result, where) {
            return Dashlet.prototype.displayTable.call(this, result, where);
        },

        displayTotal: function (dataList, isWithChart) {
            return Dashlet.prototype.displayTotal.call(this, dataList, isWithChart);
        },

        displayError: function (msg) {
            return Dashlet.prototype.displayError.call(this, msg);
        },

        controlTotalTextOverflow: function () {
            return Dashlet.prototype.controlTotalTextOverflow.call(this);
        },

        _isHidden: function () {
            let defs = (this.defs || {});

            let parentView = this.getParentView();

            if (parentView && parentView.hasTabs) {
                if (parentView.currentTab !== defs.tabNumber) {
                    return true;
                }
            }

            let name = defs.name;

            if (!name) {
                return false;
            }

            return !!this.recordHelper.getPanelStateParam(name, 'hidden');
        },

        showSubReport: function (where, result, groupValue, groupIndex, groupValue2, column) {
            this.getCollectionFactory().create(this.getOption('entityType'), collection => {
                collection.url = 'ReportPanel/action/runList?id=' + this.getOption('reportId') +
                    '&groupValue=' + encodeURIComponent(groupValue);

                if (groupIndex) {
                    collection.url += '&groupIndex=' + groupIndex;
                }

                if (groupValue2 !== undefined) {
                    collection.url += '&groupValue2=' + encodeURIComponent(groupValue2);
                }
                collection.url += '&parentId=' + this.model.id;
                collection.url += '&parentType=' + this.model.entityType;

                if (result.isJoint && column) {
                    collection.url += '&subReportId=' + result.columnReportIdMap[column];
                }

                collection.maxSize = this.getConfig().get('recordsPerPage');

                Espo.Ui.notify(' ... ');

                this.createView('subReport', 'advanced:views/report/modals/sub-report', {
                    reportId: this.getOption('reportId'),
                    reportName: this.getOption('title'),
                    result: result,
                    groupValue: groupValue,
                    groupIndex: groupIndex,
                    groupValue2: groupValue2,
                    collection: collection,
                    column: column,
                }, view => {
                    Espo.Ui.notify(false);

                    view.render();
                });
            });
        },

        actionRefresh: function () {
            if (this.hasView('reportChart')) {
                this.clearView('reportChart');
            }

            this.reRender();
        },

        afterRender: function () {
            this.$container = this.$el.find('.report-results-container');

            this.run();

            if (this.getOption('type') === 'List') {
                this.$container.addClass('list-container');
            }
        },

        getCollectionUrl: function () {
            return 'ReportPanel/action/runList?id=' + this.defs.reportPanelId + '&parentType=' +
                this.model.name + '&parentId=' + this.model.id;
        },

        getGridReportUrl: function () {
            return 'ReportPanel/action/runGrid';
        },

        getGridReportRequestData: function () {
            return {
                id: this.defs.reportPanelId,
                parentType: this.model.name,
                parentId: this.model.id,
            }
        },

        run: function () {
            return Dashlet.prototype.run.call(this);
        },

        setContainerHeight: function () {
            let type = this.getOption('type');

            if (type === 'List') {
                this.$container.css('height', 'auto');
            } else {
                this.$container.css('height', '100%');
            }
        },
    });
});
