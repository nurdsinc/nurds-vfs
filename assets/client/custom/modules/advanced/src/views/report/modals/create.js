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

define('advanced:views/report/modals/create', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        cssName: 'create-report',

        template: 'advanced:report/modals/create',

        data: function () {
            return {
                entityTypeList: this.entityTypeList,
                typeList: this.typeList,
            };
        },

        events: {
            'click [data-action="create"]': function (e) {
                let type = $(e.currentTarget).data('type');

                /** @type {module:views/fields/base.Class} */
                let entityTypeView = this.getView('entityType');

                entityTypeView.fetch();
                entityTypeView.validate();

                let entityType = this.model.get('entityType')

                if (!entityType) {
                    return;
                }

                this.trigger('create', {
                    type: type,
                    entityType: entityType,
                });
            }
        },

        setup: function () {
            this.buttonList = [
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: dialog => {
                        dialog.close();
                    },
                }
            ];

            this.typeList = this.getMetadata().get('entityDefs.Report.fields.type.options');

            let scopes = this.getMetadata().get('scopes');
            let entityListToIgnore = this.getMetadata().get('entityDefs.Report.entityListToIgnore') || [];
            let entityListAllowed = this.getMetadata().get('entityDefs.Report.entityListAllowed') || [];

            this.entityTypeList = Object.keys(scopes)
                .filter(scope => {
                    if (~entityListToIgnore.indexOf(scope)) {
                        return;
                    }

                    if (!this.getAcl().check(scope, 'read')) {
                        return;
                    }

                    let defs = scopes[scope];

                    return (
                        defs.entity &&
                        (defs.tab || defs.object || ~entityListAllowed.indexOf(scope))
                    );
                })
                .sort((v1, v2) => {
                     return this.translate(v1, 'scopeNamesPlural')
                         .localeCompare(this.translate(v2, 'scopeNamesPlural'));
                });

            this.entityTypeList.unshift('');

            this.model = new Model();

            this.createView('entityType', 'views/fields/enum', {
                model: this.model,
                mode: 'edit',
                name: 'entityType',
                el: this.getSelector() + ' [data-name="entityType"]',
                params: {
                    options: this.entityTypeList,
                    translation: 'Global.scopeNames',
                    required: true,
                },
                labelText: this.translate('entityType', 'fields', 'Report'),
            });

            this.header = this.translate('Create Report', 'labels', 'Report');
        },
    });
});
