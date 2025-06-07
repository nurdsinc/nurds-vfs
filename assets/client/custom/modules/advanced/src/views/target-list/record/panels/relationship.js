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

define('advanced:views/target-list/record/panels/relationship',
['crm:views/target-list/record/panels/relationship'], function (Dep) {

    return Dep.extend({

        actionPopulateFromReport: function (data) {
            let link = data.link;

            let filterName = 'list' + Espo.Utils.upperCaseFirst(link);

            Espo.Ui.notify(' ... ');

            this.createView('dialog', 'views/modals/select-records', {
                scope: 'Report',
                multiple: false,
                createButton: false,
                primaryFilterName: filterName,
            }, view => {
                view.render();

                Espo.Ui.notify(false);

                this.listenToOnce(view, 'select', select => {
                    Espo.Ajax
                        .postRequest('Report/action/populateTargetList', {
                            id: select.id,
                            targetListId: this.model.id,
                        })
                        .then(() => {
                            Espo.Ui.success(this.translate('Linked'));

                            this.collection.fetch();
                        });
                });
            });
        },
    });
});
