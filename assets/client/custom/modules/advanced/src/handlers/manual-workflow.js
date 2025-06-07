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

define('advanced:handlers/manual-workflow', ['dynamic-logic'], function (DynamicLogic) {
/**
 * @module advanced_handlers/manual-workflow
 */

    /**
     * @typedef module:advanced_handlers/manual-workflow~Item
     * @type Object
     * @property {string} id
     * @property {'Button'|'Dropdown-Item'} elementType
     * @property {string} label
     * @property {string} style
     * @property {'read'|'edit'|'admin'} accessRequired
     * @property {?{'conditionGroup': Object[]}} dynamicLogic
     */

    /**
     * @class
     * @name Class
     * @memberOf module:advanced_handlers/manual-workflow
     */
    const Handler = function (view) {
        /** @type {module:views/detail.Class} */
        this.view = view;
    };

    _.extend(Handler.prototype, /** @lends module:advanced_handlers/manual-workflow.Class# */{

        process: function () {
            const allWorkflows = this.view.getHelper().getAppParam('manualWorkflows') || {};
            /** @type {module:advanced_handlers/manual-workflow~Item[]} */
            const workflowList = allWorkflows[this.view.scope] || [];

            if (!workflowList.length) {
                return;
            }
            /** @type {module:dynamic-logic.Class}*/
            const dynamicLogic = new DynamicLogic({}, this.view);

            const applyDynamicLogic = (id, conditionGroup) => {
                const name = 'runWorkflow_' + id;

                dynamicLogic.checkConditionGroup(conditionGroup) ?
                    this.view.showHeaderActionItem(name) :
                    this.view.hideHeaderActionItem(name);
            };

            workflowList.forEach(item => {
                const type = item.elementType === 'Button' ?
                    'buttons' :
                    'dropdown';

                /** @type {module:views/main~MenuItem} */
                const o = {
                    text: item.label,
                    acl: item.accessRequired === 'edit' ? 'edit' : 'read',
                    name: 'runWorkflow_' + item.id,
                    action: 'runWorkflow',
                    style: item.style || 'default',
                    data: {
                        id: item.id,
                        handler: 'advanced:handlers/manual-workflow-action',
                    },
                };

                this.view.addMenuItem(type, o, false);

                if (item.dynamicLogic) {
                    const conditionGroup = item.dynamicLogic.conditionGroup;

                    applyDynamicLogic(item.id, conditionGroup);
                    this.listenTo(this.view.model, 'sync', () => applyDynamicLogic(item.id, conditionGroup));
                }
            });
        },
    });

    _.extend(Handler.prototype, Backbone.Events);

    return Handler;
});
