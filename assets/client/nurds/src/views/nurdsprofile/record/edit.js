define('nurds:views/nurdsprofile/record/edit', ['views/record/edit'], function (Dep) {

    return Dep.extend({

        sideView: null,
        saveAndContinueEditingAction: false,

        buttonList: [
            {
                name: 'save',
                label: 'Save',
                style: 'primary',
            },
            {
                name: 'cancel',
                label: 'Cancel',
            }
        ],

        dynamicLogicDefs: {
            fields: {
                'tabList': {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isTrue',
                                attribute: 'useCustomTabList',
                            }
                        ]
                    }
                },
                'addCustomTabs': {
                    visible: {
                        conditionGroup: [
                            {
                                type: 'isTrue',
                                attribute: 'useCustomTabList',
                            }
                        ]
                    }
                },
            },
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            const model = this.model;

            this.addDropdownItem({
                name: 'reset',
                text: this.getLanguage().translate('Reset to Default', 'labels', 'Admin'),
                style: 'danger',
                onClick: () => this.actionReset(),
            });

            const forbiddenEditFieldList = this.getAcl().getScopeForbiddenFieldList('NurdsProfile', 'edit');

            if (!forbiddenEditFieldList.includes('dashboardLayout') && !model.isPortal()) {
                this.addDropdownItem({
                    name: 'resetDashboard',
                    text: this.getLanguage().translate('Reset Dashboard to Default', 'labels', 'NurdsProfile'),
                    onClick: () => this.actionResetDashboard(),
                });
            }

            if (model.isPortal()) {
                this.layoutName = 'detailPortal';
            }

            if (this.model.id === this.getUser().id) {
                const preferencesModel = this.getPreferences();

                this.on('save', (a, attributeList) => {
                    const data = this.model.getClonedAttributes();
                    delete data['smtpPassword'];

                    preferencesModel.set(data);
                    preferencesModel.trigger('update', attributeList);
                });
            }

            if (!this.getUser().isAdmin() || model.isPortal()) {
                this.hidePanel('dashboard');
                this.hideField('dashboardLayout');
            }

            this.controlFollowCreatedEntityListVisibility();
            this.listenTo(this.model, 'change:followCreatedEntities', this.controlFollowCreatedEntityListVisibility);

            this.controlColorsField();
            this.listenTo(this.model, 'change:scopeColorsDisabled', this.controlColorsField.bind(this));

            let hideNotificationPanel = true;

            if (!this.getConfig().get('assignmentEmailNotifications') || model.isPortal()) {
                this.hideField('receiveAssignmentEmailNotifications');
                this.hideField('assignmentEmailNotificationsIgnoreEntityTypeList');
            } else {
                hideNotificationPanel = false;
                this.controlAssignmentEmailNotificationsVisibility();
                this.listenTo(this.model, 'change:receiveAssignmentEmailNotifications', this.controlAssignmentEmailNotificationsVisibility.bind(this));
            }

            if ((this.getConfig().get('assignmentEmailNotificationsEntityList') || []).length === 0) {
                this.hideField('assignmentEmailNotificationsIgnoreEntityTypeList');
            }

            if ((this.getConfig().get('assignmentNotificationsEntityList') || []).length === 0 || model.isPortal()) {
                this.hideField('assignmentNotificationsIgnoreEntityTypeList');
            } else {
                hideNotificationPanel = false;
            }

            if (this.getConfig().get('emailForceUseExternalClient')) {
                this.hideField('emailUseExternalClient');
            }

            if (!this.getConfig().get('mentionEmailNotifications') || model.isPortal()) {
                this.hideField('receiveMentionEmailNotifications');
            } else {
                hideNotificationPanel = false;
            }

            if (!this.getConfig().get('streamEmailNotifications') && !model.isPortal()) {
                this.hideField('receiveStreamEmailNotifications');
            } else if (!this.getConfig().get('portalStreamEmailNotifications') && model.isPortal()) {
                this.hideField('receiveStreamEmailNotifications');
            } else {
                hideNotificationPanel = false;
            }

            if (hideNotificationPanel) {
                this.hidePanel('notifications');
            }

            if (this.getConfig().get('userThemesDisabled')) {
                this.hideField('theme');
            }

            this.on('save', function (initialAttributes) {
                if (
                    this.model.get('language') !== initialAttributes.language ||
                    this.model.get('theme') !== initialAttributes.theme ||
                    (this.model.get('themeParams') || {}).navbar !== (initialAttributes.themeParams || {}).navbar
                ) {
                    this.setConfirmLeaveOut(false);
                    window.location.reload();
                }
            });
        },

        controlFollowCreatedEntityListVisibility: function () {
            if (!this.model.get('followCreatedEntities')) {
                this.showField('followCreatedEntityTypeList');
            } else {
                this.hideField('followCreatedEntityTypeList');
            }
        },

        controlColorsField: function () {
            if (this.model.get('scopeColorsDisabled')) {
                this.hideField('tabColorsDisabled');
            } else {
                this.showField('tabColorsDisabled');
            }
        },

        controlAssignmentEmailNotificationsVisibility: function () {
            if (this.model.get('receiveAssignmentEmailNotifications')) {
                this.showField('assignmentEmailNotificationsIgnoreEntityTypeList');
            } else {
                this.hideField('assignmentEmailNotificationsIgnoreEntityTypeList');
            }
        },

        actionReset: function () {
            this.confirm(this.translate('resetPreferencesConfirmation', 'messages'), function () {
                Espo.Ajax
                    .deleteRequest(`NurdsProfile/${this.model.id}`)
                    .then((data) => {
                        Espo.Ui.success(this.translate('resetPreferencesDone', 'messages'));

                        this.model.set(data);

                        for (const attribute in data) {
                            this.setInitialAttributeValue(attribute, data[attribute]);
                        }

                        this.getPreferences().set(this.model.getClonedAttributes());
                        this.getPreferences().trigger('update');

                        this.setIsNotChanged();
                    });
            });
        },

        actionResetDashboard: function () {
            this.confirm(this.translate('confirmation', 'messages'), function () {
                Espo.Ajax.postRequest('NurdsProfile/action/resetDashboard', { id: this.model.id })
                    .then((data) => {
                        const isChanged = this.isChanged;
                        Espo.Ui.success(this.translate('Done'));

                        this.model.set(data);

                        for (const attribute in data) {
                            this.setInitialAttributeValue(attribute, data[attribute]);
                        }

                        this.getPreferences().set(this.model.getClonedAttributes());
                        this.getPreferences().trigger('update');

                        if (!isChanged) {
                            this.setIsNotChanged();
                        }
                    });
            });
        },

        exit: function (after) {
            if (after === 'cancel') {
                let url = `#NurdsProfile/view/${this.model.id}`;

                if (!this.getAcl().checkModel(this.getUser())) {
                    url = '#';
                }

                this.getRouter().navigate(url, { trigger: true });
            }
        },

        handleShortcutKeyCtrlS: function (e) {
            this.handleShortcutKeyCtrlEnter(e);
        }

    });

});