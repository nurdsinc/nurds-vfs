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

define('advanced:views/workflow/record/detail', 'views/record/detail', function (Dep) {

    return Dep.extend({

        editModeEnabled: false,

        editModeDisabled: true,

        bottomView: 'advanced:views/workflow/record/detail-bottom',

        duplicateAction: true,

        stickButtonsContainerAllTheWay: true,

        saveAndContinueEditingAction: true,

        setup: function () {
            Dep.prototype.setup.call(this);
            this.manageFieldsVisibility();
            this.listenTo(this.model, 'change', function (model, options) {
                if (this.model.hasChanged('portalOnly') || this.model.hasChanged('type')) {
                    this.manageFieldsVisibility(options.ui);
                }
            }, this);

            if (!this.model.isNew()) {
                this.setFieldReadOnly('type');
                this.setFieldReadOnly('entityType');
            }
        },

        manageFieldsVisibility: function (ui) {
            let type = this.model.get('type');

            if (
                this.model.get('portalOnly') &&
                ~['afterRecordSaved', 'afterRecordCreated', 'afterRecordUpdated', 'signal'].indexOf(type)
            ) {
                this.showField('portal');
            } else {
                this.hideField('portal');
            }

            if (type !== 'scheduled') {
                this.hideField('targetReport');
                this.hideField('scheduling');
                this.setFieldNotRequired('targetReport');
            }

            if (type === 'manual') {
                this.hideField('portalOnly');
                this.hideField('portal');

                if (this.mode === 'edit' && ui) {
                    setTimeout(() => {
                        this.model.set({
                            'portalId': null,
                            'portalName': null,
                            'portalOnly': false
                        });
                    }, 100);
                }

                return;
            }

            if (type === 'scheduled') {
                this.showField('targetReport');
                this.showField('scheduling');
                this.setFieldRequired('targetReport');
                this.hideField('portal');
                this.hideField('portalOnly');

                if (this.mode === 'edit' && ui) {
                    setTimeout(() => {
                        this.model.set({
                            'portalId': null,
                            'portalName': null,
                            'portalOnly': false
                        });
                    }, 100);
                }

                return;
            }

            if (type === 'sequential') {
                this.hideField('portal');
                this.hideField('portalOnly');

                if (this.mode === 'edit' && ui) {
                    setTimeout(() => {
                        this.model.set({
                            'portalId': null,
                            'portalName': null,
                            'portalOnly': false
                        });
                    }, 100);
                }

                return;
            }

            if (this.model.get('portalOnly')) {
                this.showField('portal');
            }

            this.showField('portalOnly');
        },
    });
});
