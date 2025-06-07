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

define('advanced:views/report/modals/result',
['views/modal', 'advanced:report-helper', 'views/modals/detail'], function (Dep, ReportHelper, Detail) {

    return Dep.extend({

        template: 'advanced:report/modals/result',

        backdrop: true,

        shortcutKeys: {
            'Control+ArrowLeft': function (e) {
                this.handleShortcutKeyControlArrowLeft(e);
            },
            'Control+ArrowRight': function (e) {
                this.handleShortcutKeyControlArrowRight(e);
            },
            'Control+Enter': function (e) {
                this.getReportView().run();

                e.preventDefault();
                e.stopPropagation();
            },
        },

        setup: function () {
            this.reportHelper = new ReportHelper(
                this.getMetadata(),
                this.getLanguage(),
                this.getDateTime(),
                this.getConfig(),
                this.getPreferences()
            );

            this.createRecordView();

            if (this.model && this.model.collection && !this.navigateButtonsDisabled) {
                this.buttonList.push({
                    name: 'previous',
                    html: '<span class="fas fa-chevron-left"></span>',
                    title: this.translate('Previous Entry'),
                    pullLeft: true,
                    className: 'btn-text',
                    disabled: true,
                });

                this.buttonList.push({
                    name: 'next',
                    html: '<span class="fas fa-chevron-right"></span>',
                    title: this.translate('Next Entry'),
                    pullLeft: true,
                    className: 'btn-text',
                    disabled: true,
                });

                this.indexOfRecord = this.model.collection.indexOf(this.model);
            } else {
                this.navigateButtonsDisabled = true;
            }

            this.on('after:render', () => {
                this.$el.find('.modal-body').css({
                    'overflow-x': 'hidden',
                    'overflow-y': 'auto',
                });
            });
        },

        createRecordView: function (callback) {
            this.headerHtml = this.header =
                '<a data-action="link" class="action" href="#Report/view/'+this.model.id+'">' +
                Handlebars.Utils.escapeExpression(this.model.get('name')) + '</a>';

            var viewName = this.reportHelper.getReportView(this.model);

            this.createView('record', viewName, {
                el: this.options.el + ' .report-container',
                model: this.model,
                reportHelper: this.reportHelper,
                showChartFirst: true,
                isLargeMode: true,
            }, callback, this);
        },

        getReportView: function () {
            return this.getView('record');
        },

        afterRender: function () {
            this.$el.find('.modal-body').addClass('panel-body');

            setTimeout(() => {
                this.$el.children(0).scrollTop(0);
            }, 50);

            if (!this.navigateButtonsDisabled) {
                this.controlNavigationButtons();
            }
        },

        actionLink: function () {
            this.trigger('navigate-to-detail', this.model);
        },

        actionPrevious: function () {
            Detail.prototype.actionPrevious.call(this);
        },

        actionNext: function () {
            Detail.prototype.actionNext.call(this);
        },

        controlNavigationButtons: function () {
            Detail.prototype.controlNavigationButtons.call(this);
        },

        controlRecordButtonsVisibility: function () {
            Detail.prototype.controlRecordButtonsVisibility.call(this);
        },

        switchToModelByIndex: function (indexOfRecord) {
            Detail.prototype.switchToModelByIndex.call(this, indexOfRecord);
        },

        getRecordView: function () {
            return this.getView('record');
        },

        /**
         * @private
         * @param {JQueryKeyEventObject} e
         */
        handleShortcutKeyControlArrowLeft: function (e) {
            if (!this.model.collection) {
                return;
            }

            if (this.buttonList.findIndex(item => item.name === 'previous' && !item.disabled) === -1) {
                return;
            }

            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            this.actionPrevious();
        },

        /**
         * @private
         * @param {JQueryKeyEventObject} e
         */
        handleShortcutKeyControlArrowRight: function (e) {
            if (!this.model.collection) {
                return;
            }

            if (this.buttonList.findIndex(item => item.name === 'next' && !item.disabled) === -1) {
                return;
            }

            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            this.actionNext();
        },
    });
});
