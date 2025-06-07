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
 * License ID: 799ba07927a6a02c6a0ae59de64ec1ec
 ************************************************************************************/

define('sales:handlers/quote/lock-action', ['action-handler'], function (ActionHandler) {

    class Handler extends ActionHandler {

        // noinspection JSUnusedGlobalSymbols
        actionLock() {
            Espo.Ui.notify(' ... ');

            const model = this.view.model;

            Espo.Ajax.postRequest(`${model.entityType}/${model.id}/lock`)
                .then(() => {

                    Espo.Ui.success(this.view.translate('Locked', 'labels', 'Quote'));

                    model.fetch();
                })
                .catch(() => Espo.Ui.notify(false));
        }

        // noinspection JSUnusedGlobalSymbols
        actionUnlock() {
            Espo.Ui.notify(' ... ');

            const model = this.view.model;

            Espo.Ajax.postRequest(`${model.entityType}/${model.id}/unlock`)
                .then(() => {

                    Espo.Ui.success(this.view.translate('Unlocked', 'labels', 'Quote'));

                    model.fetch();
                })
                .catch(() => Espo.Ui.notify(false));
        }

        // noinspection JSUnusedGlobalSymbols
        canBeLocked() {
            if (this.isForbidden()) {
                return false;
            }

            const model = this.view.model;

            if (!model.get('isNotActual')) {
                return false;
            }

            if (model.get('isLocked')) {
                return false;
            }

            return true;
        }

        // noinspection JSUnusedGlobalSymbols
        canBeUnlocked() {
            if (this.isForbidden()) {
                return false;
            }

            const model = this.view.model;

            if (!model.get('isLocked')) {
                return false;
            }

            if (model.get('isHardLocked')) {
                return false;
            }

            return true;
        }

        isForbidden() {
            // Does not work as read-only fields are forbidden.
            /*return this.view.getAcl().getScopeForbiddenFieldList(this.view.entityType, 'edit')
                .includes('isLocked');*/

            return false;
        }
    }

    return Handler;
});
