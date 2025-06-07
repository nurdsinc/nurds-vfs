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

define('advanced:views/bpmn-flow-node/record/list', ['views/record/list'], function (Dep) {
    /**
     * @module module:advanced_views/bpmn-flow-node/record/list
     */

    /**
     * @class
     * @name Class
     * @memberOf module:advanced_views/bpmn-flow-node/record/list
     * @extends module:views/record/list.Class
     */
    return Dep.extend(/** @lends module:advanced_views/bpmn-flow-node/record/list.Class# */{

        actionInterruptFlowNode: function (data) {
            this.actionRejectFlowNode(data);
        },

        actionRejectFlowNode: function (data) {
            let id = data.id;

            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax
                    .postRequest('BpmnProcess/action/rejectFlowNode', {id: id})
                    .then(() => {
                        this.collection.fetch().then(() => {
                            Espo.Ui.success(this.translate('Done'));

                            if (this.collection.parentModel) {
                                this.collection.parentModel.fetch();
                            }
                        });
                    });
                });
        },

        actionViewError: function (data) {
            let model = this.collection.get(data.id);

            if (!model) {
                return;
            }

            let nodeData = model.get('data') || {};

            this.createView('dialog', 'advanced:views/bpmn-flow-node/modals/view-error', {nodeData: nodeData})
                .then(view => {
                    view.render();
                });
        },
    });
});
