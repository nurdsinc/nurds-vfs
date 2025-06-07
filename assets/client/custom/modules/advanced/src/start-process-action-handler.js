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

define('advanced:start-process-action-handler', ['action-handler'], function (Dep) {

    return Dep.extend({

        init: function () {
            if (~(this.view.getHelper().getAppParam('flowchartEntityTypeList') || []).indexOf(this.view.model.entityType)) {
                this.view.showHeaderActionItem('startProcessGlobal');
            }
        },

        actionStartProcessGlobal: function () {
            var viewName = 'views/modals/select-records';
            this.view.createView('startProcessDialog', viewName, {
                scope: 'BpmnFlowchart',
                primaryFilterName: 'isManuallyStartable',
                createButton: false,
                filters: {
                    targetType: {
                        type: 'in',
                        value: [this.view.model.entityType],
                        data: {
                            type: 'anyOf',
                            valueList: [this.view.model.entityType]
                        },
                    },
                },
            }).then(
                function (view) {
                    view.render();

                    this.view.listenToOnce(view, 'select', function (m) {
                        var attributes = {
                            flowchartName: m.get('name'),
                            flowchartId: m.id,
                            targetType: this.view.model.entityType,
                            targetName: this.view.model.get('name'),
                            targetId: this.view.model.id,
                            startElementIdList: m.get('eventStartAllIdList'),
                            flowchartElementsDataHash: m.get('elementsDataHash'),
                        };

                        var router = this.view.getRouter();

                        var returnUrl = router.getCurrentUrl();
                        router.navigate('#BpmnProcess/create', {trigger: false});
                        router.dispatch('BpmnProcess', 'create', {
                            attributes: attributes,
                            returnUrl: returnUrl,
                        });

                    }.bind(this));

                }.bind(this)
            );
        },

    });
});
