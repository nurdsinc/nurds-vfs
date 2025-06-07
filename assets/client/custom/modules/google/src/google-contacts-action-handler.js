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
 * License ID: 96ea385d4e0a9d0ba460925d713d8f63
 ************************************************************************************/

define('google:google-contacts-action-handler', ['action-handler'], function (Dep) {

    return Dep.extend({

        actionPushToGoogle: function () {
            Espo.Ui.notify('...');

            Espo.Ajax
                .postRequest('GoogleContacts/action/push', {
                    idList: [this.view.model.id],
                    entityType: this.view.model.entityType,
                })
                .then(response => {
                    if (response.count) {
                        Espo.Ui.success(this.view.translate('Done'));

                        return;
                    }

                    Espo.Ui.error(this.view.translate('Error'));
              });
        },
    });
});
