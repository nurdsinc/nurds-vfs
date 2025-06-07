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

define('sales:handlers/quote/lock-mass-action',
['action-handler', 'helpers/mass-action'], function (ActionHandler, MassActionHelper) {

    class Handler extends ActionHandler {

        // noinspection JSUnusedGlobalSymbols
        actionLock() {
            const msg = this.view.translate('confirmMassLock', 'messages', 'Quote');

            this.view.confirm(msg).then(() => this.process('lock'));
        }

        // noinspection JSUnusedGlobalSymbols
        actionUnlock() {
            const msg = this.view.translate('confirmMassUnlock', 'messages', 'Quote');

            this.view.confirm(msg).then(() => this.process('unlock'));
        }

        process(action) {
            const helper = new MassActionHelper(this.view);
            const params = this.view.getMassActionSelectionPostData();
            const idle = !!params.searchParams && helper.checkIsIdle(this.view.collection.total);

            const onDone = count => {
                const labelKey = action === 'lock' ? 'massLockDone': 'massUnlockDone';

                const msg = this.view.translate(labelKey, 'messages', 'Quote')
                    .replace('{count}', count.toString());

                Espo.Ui.success(msg);
            };

            Espo.Ui.notify(' ... ');

            Espo.Ajax
                .postRequest('MassAction', {
                    entityType: this.view.entityType,
                    action: action,
                    params: params,
                    idle: idle,
                })
                .then(result => {
                    if (result.id) {
                        helper.process(result.id, action)
                            .then(view => {
                                this.view.listenToOnce(view, 'close:success', result => onDone(result.count));
                            });

                        return;
                    }

                    onDone(result.count);
                });
        }

        // noinspection JSUnusedGlobalSymbols
        initLock() {
            if (this.view.getAcl().getPermissionLevel('massUpdate') !== 'yes') {
                this.view.removeMassAction('lock');
            }
        }

        // noinspection JSUnusedGlobalSymbols
        initUnlock() {
            if (this.view.getAcl().getPermissionLevel('massUpdate') !== 'yes') {
                this.view.removeMassAction('unlock');
            }
        }
    }

    return Handler;
});
