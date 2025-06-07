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

define('advanced:views/report/reports/base', ['view'], function (Dep) {

    return Dep.extend({

        template: 'advanced:report/reports/base',

        data: function () {
            return {
                hasSendEmail: this.getAcl().checkScope('Email'),
                hasRuntimeFilters: this.hasRuntimeFilters(),
                hasPrintPdf: ~(this.getHelper().getAppParam('templateEntityTypeList') || []).indexOf('Report'),
            }
        },

        events: {
            'click [data-action="run"]': function () {
                this.run();
                this.afterRun();
            },
            'click [data-action="refresh"]': function () {
                this.run();
            },
            'click [data-action="exportReport"]': function () {
                this.export();
            },
            'click [data-action="sendInEmail"]': function () {
                this.actionSendInEmail();
            },
            'click [data-action="printPdf"]': function () {
                this.actionPrintPdf();
            },
            'click [data-action="showSubReport"]': function (e) {
                let groupValue = $(e.currentTarget).data('group-value');
                let groupIndex = $(e.currentTarget).data('group-index');

                this.showSubReport(groupValue, groupIndex);
            },
        },

        afterRender: function () {
            this.$information = this.$el.find('.information-box');
        },

        showSubReport: function (groupValue, groupIndex, groupValue2, column) {
            let reportId = this.model.id;
            let entityType = this.model.get('entityType');

            if (this.result.isJoint) {
                reportId = this.result.columnReportIdMap[column];
                entityType = this.result.columnEntityTypeMap[column];
            }

            this.getCollectionFactory().create(entityType, collection => {
                collection.url = 'Report/action/runList?id=' + reportId + '&groupValue=' +
                    encodeURIComponent(groupValue);

                if (groupIndex) {
                    collection.url += '&groupIndex=' + groupIndex;
                }

                if (groupValue2 !== undefined) {
                    collection.url += '&groupValue2=' + encodeURIComponent(groupValue2);
                }

                if (this.hasRuntimeFilters()) {
                    collection.where = this.lastFetchedWhere;
                }

                collection.maxSize = this.getConfig().get('recordsPerPage') || 20;

                Espo.Ui.notify(' ... ');

                this.createView('subReport', 'advanced:views/report/modals/sub-report', {
                    model: this.model,
                    result: this.result,
                    groupValue: groupValue,
                    collection: collection,
                    groupIndex: groupIndex,
                    groupValue2: groupValue2,
                    column: column,
                }, view => {
                    view.notify(false);
                    view.render();
                });
            });
        },

        initReport: function () {
            this.once('after:render', () => {
                this.run();
            });

            this.chartType = this.model.get('chartType');

            if (this.hasRuntimeFilters()) {
                this.createRuntimeFilters();
            }
        },

        afterRun: function () {},

        createRuntimeFilters: function () {
            let filtersData = this.getStorage().get('state', this.getFilterStorageKey()) || null;

            this.createView('runtimeFilters', 'advanced:views/report/runtime-filters', {
                el: this.options.el + ' .report-runtime-filters-container',
                entityType: this.model.get('entityType'),
                filterList: this.model.get('runtimeFilters'),
                filtersData: filtersData,
            });

        },

        hasRuntimeFilters: function () {
            if ((this.model.get('runtimeFilters') || []).length) {
                return true;
            }
        },

        getRuntimeFilters: function () {
            if (this.hasRuntimeFilters()) {
                this.lastFetchedWhere = this.getView('runtimeFilters').fetch();

                return this.lastFetchedWhere;
            }

            return null;
        },

        getFilterStorageKey: function () {
            return 'report-filters-' + this.model.id;
        },

        storeRuntimeFilters: function () {
            if (this.hasRuntimeFilters()) {
                if (!this.getView('runtimeFilters')) {
                    return;
                }

                let filtersData = this.getView('runtimeFilters').fetchRaw();

                this.getStorage().set('state', this.getFilterStorageKey(), filtersData);
            }
        },

        actionSendInEmail: function () {
            Espo.Ui.notify(' ... ');

            Espo.Ajax
                .postRequest('Report/action/getEmailAttributes', {
                    id: this.model.id,
                    where: this.getRuntimeFilters()
                }, {timeout: 0})
                .then(attributes => {
                    Espo.Ui.notify(false);

                    this.createView('compose', 'views/modals/compose-email', {
                        attributes: attributes,
                        keepAttachmentsOnSelectTemplate: true,
                        signatureDisabled: true
                    }, view => {
                        view.render();
                    });
                });
        },

        actionPrintPdf: function () {
            this.createView('pdfTemplate', 'views/modals/select-template', {entityType: 'Report'}, view => {
                view.render();

                this.listenToOnce(view, 'select', template => {
                    this.clearView('pdfTemplate');

                    let where = this.getRuntimeFilters();

                    let data = {
                        id: this.model.id,
                        where: where,
                        templateId: template.id,
                    };

                    let url = 'Report/action/printPdf';

                    Espo.Ui.notify(' ... ');

                    Espo.Ajax.postRequest(url, data, {timeout: 0}).then(response => {
                        Espo.Ui.notify(false);

                        if ('id' in response) {
                            let url = this.getBasePath() + '?entryPoint=download&id=' + response.id;

                            window.open(url, '_blank');
                        }
                    });
                });
            });
        },
    });
});
