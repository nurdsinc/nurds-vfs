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

define('advanced:views/report/list', 'views/list-with-categories', function (Dep) {

    return Dep.extend({

        createButton: false,

        quickCreate: false,

        currentCategoryId: null,

        currentCategoryName: '',

        categoryScope: 'ReportCategory',

        categoryField: 'category',

        categoryFilterType: 'inCategory',

        getCreateAttributes: function () {
            return {
                categoryId: this.currentCategoryId,
                categoryName: this.currentCategoryName
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            this.addMenuItem('buttons', {
                action: 'create',
                html: '<span class="fas fa-plus fa-sm"></span> ' + this.translate('Create ' +  this.scope,  'labels', this.scope),
                style: 'default',
                acl: 'create',
                aclScope: 'Report',
            }, true);
        },

        actionCreate: function () {
            this.createView('createModal', 'advanced:views/report/modals/create', {}, function (view) {
                view.render();

                this.listenToOnce(view, 'create', function (data) {
                    view.close();
                    this.getRouter().dispatch('Report', 'create', {
                        entityType: data.entityType,
                        type: data.type,
                        categoryId: this.currentCategoryId,
                        categoryName: this.currentCategoryName,
                        returnUrl: this.lastUrl || '#' + this.scope,
                        returnDispatchParams: {
                            controller: this.scope,
                            action: null,
                            options: {
                                isReturn: true
                            }
                        }
                    });
                    this.getRouter().navigate('#Report/create/entityType=' + data.entityType + '&type=' + data.type, {trigger: false});
                }, this);
            });
        }
    });
});
