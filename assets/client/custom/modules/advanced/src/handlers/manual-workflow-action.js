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

define('advanced:handlers/manual-workflow-action', ['action-handler'], function (Dep) {

    // noinspection JSUnusedGlobalSymbols
    return Dep.extend({

        actionRunWorkflow: function (data) {
            /** @type {module:views/detail} */
            const view = this.view;
            const id = data.id;

            const allWorkflows = view.getHelper().getAppParam('manualWorkflows') || {};

            /** @type {Record} */
            const item = (allWorkflows[view.model.entityType] || []).find(it => it.id === id);

            let msg = view.translate('confirmation', 'messages');

            if (item && item.confirmationText) {
                msg = view.getHelper().transformMarkdownText(item.confirmationText).toString();
            }

            if (!item.confirmation) {
                this.process(id);

                return;
            }

            Espo.Ui
                .confirm(msg, {
                    confirmText: view.translate('Yes', 'labels'),
                    cancelText: view.translate('No', 'labels'),
                    backdrop: true,
                    isHtml: true,
                })
                .then(() => this.process(id));
        },

        /**
         * @param {string} id
         */
        process(id) {
            const view = /** @type {module:views/detail} */this.view;
            const model = /** @type {module:model} */this.view.model;
            const name = 'runWorkflow_' + id;

            view.disableMenuItem(name);

            Espo.Ui.notify(' ... ');

            Espo.Ajax
                .postRequest('WorkflowManual/action/run', {
                    targetId: model.id,
                    id: id,
                })
                .then(() => {
                    model.fetch()
                        .then(() => {
                            Espo.Ui.success(view.translate('Done'));
                            view.enableMenuItem(name);

                            model.trigger('update-all');
                        });
                })
                .catch(() => {
                    view.enableMenuItem(name);
                });
        }
    });
});
