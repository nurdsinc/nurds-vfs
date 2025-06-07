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

define('advanced:views/report/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        editModeDisabled: true,
        printPdfAction: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            if (
                this.getMetadata().get(['scopes', 'ReportCategory', 'disabled']) ||
                !this.getAcl().checkScope('ReportCategory', 'read')
            ) {
                this.hideField('category');
            }

            if (!this.getUser().isPortal()) {
                this.setupEmailSendingFieldsVisibility();
            }

            this.hidePanel('emailSending');

            if (!this.getUser().isPortal()) {
                if (this.model.has('emailSendingInterval')) {
                    this.controlEmailSendingPanelVisibility();
                } else {
                    this.listenToOnce(this.model, 'sync', this.controlEmailSendingPanelVisibility, this);
                }
            }

            if (this.getUser().isPortal()) {
                this.hidePanel('default');
            }

            this.controlPortalsFieldVisibility();
            this.listenTo(this.model, 'sync', this.controlPortalsFieldVisibility);

            this.controlDescriptionFieldVisibility();
            this.listenTo(this.model, 'sync', this.controlDescriptionFieldVisibility);
        },

        controlPortalsFieldVisibility: function () {
            if (this.getAcl().get('portalPermission') === 'no') {
                this.hideField('portals');
                return;
            }
            if (this.model.getLinkMultipleIdList('portals').length) {
                this.showField('portals');
            } else {
                this.hideField('portals');
            }
        },

        controlDescriptionFieldVisibility: function () {
            if (this.model.get('description')) {
                this.showField('description');
            } else {
                this.hideField('description');
            }
        },

        controlEmailSendingPanelVisibility: function () {
            if (this.model.get('emailSendingInterval')) {
                this.showPanel('emailSending');
            } else {
                this.hidePanel('emailSending');
            }
        },

        setupEmailSendingFieldsVisibility: function () {
            this.controlEmailSendingIntervalField();

            this.listenTo(this.model, 'change:emailSendingInterval', () => {
                this.controlEmailSendingIntervalField();
            });
        },

        controlEmailSendingIntervalField: function() {
            const interval = this.model.get('emailSendingInterval');

            if (this.model.get('type') === 'List') {
                if (interval === '' || !interval) {
                    this.hideField('emailSendingDoNotSendEmptyReport');
                } else {
                    this.showField('emailSendingDoNotSendEmptyReport');
                }
            } else {
                this.hideField('emailSendingDoNotSendEmptyReport');
            }

            if (interval === 'Daily') {
                this.showField('emailSendingTime');
                this.showField('emailSendingUsers');
                this.hideField('emailSendingSettingMonth');
                this.hideField('emailSendingSettingDay');
                this.hideField('emailSendingSettingWeekdays');
            } else if (interval === 'Monthly') {
                this.showField('emailSendingTime');
                this.showField('emailSendingUsers');
                this.hideField('emailSendingSettingMonth');
                this.showField('emailSendingSettingDay');
                this.hideField('emailSendingSettingWeekdays');
            } else if (interval === 'Weekly') {
                this.showField('emailSendingTime');
                this.showField('emailSendingUsers');
                this.hideField('emailSendingSettingMonth');
                this.hideField('emailSendingSettingDay');
                this.showField('emailSendingSettingWeekdays');
            } else if (interval === 'Yearly') {
                this.showField('emailSendingTime');
                this.showField('emailSendingUsers');
                this.showField('emailSendingSettingMonth');
                this.showField('emailSendingSettingDay');
                this.hideField('emailSendingSettingWeekdays');
            } else {
                this.hideField('emailSendingTime');
                this.hideField('emailSendingUsers');
                this.hideField('emailSendingSettingMonth');
                this.hideField('emailSendingSettingDay');
                this.hideField('emailSendingSettingWeekdays');
            }
        },

        handleShortcutKeyCtrlEnter: function (e) {
            if (!this.inlineEditModeIsOn && this.mode === this.MODE_DETAIL) {
                this.recordHelper.trigger('run-report');

                e.stopPropagation();

                return;
            }

            Dep.prototype.handleShortcutKeyCtrlEnter.call(this, e);
        },
    });
});
