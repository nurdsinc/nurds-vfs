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

define('advanced:views/report/record/list', ['views/record/list'], function (Dep) {

    return Dep.extend({

        quickEditDisabled: true,

        mergeAction: false,

        massActionList: ['remove', 'massUpdate', 'export'],

        rowActionsView: 'advanced:views/report/record/row-actions/default',

        massPrintPdfDisabled: true,

        actionShow: function (data) {
            if (!data.id) {
                return;
            }

            let model = this.collection.get(data.id);

            if (!model) {
                return;
            }

            this.createView('resultModal', 'advanced:views/report/modals/result', {
                model: model
            }, (view) => {
                view.render();

                this.listenToOnce(view, 'navigate-to-detail', (model) => {
                    let options = {
                        id: model.id,
                        model: model,
                        rootUrl: this.getRouter().getCurrentUrl(),
                    };

                    this.getRouter().navigate('#Report/view/' + model.id, {trigger: false});
                    this.getRouter().dispatch('Report', 'view', options);

                    view.close();
                });
            });
        },
    });
});
