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

define('advanced:views/bpmn-flow-node/modals/view-error', ['views/modal', 'model'], function (Dep, Model) {
    /**
     * @module module:advanced_views/bpmn-flow-node/modals/view-error
     */

    /**
     * @class
     * @name Class
     * @memberOf module:advanced_views/bpmn-flow-node/modals/view-error
     * @extends module:views/modal.Class
     */
    return Dep.extend(/** @lends module:advanced_views/bpmn-flow-node/modals/view-error.Class# */{

        templateContent: `<div class="record no-side-margin">{{{record}}}</div>`,

        className: 'dialog dialog-record',
        backdrop: true,

        setup: function () {
            this.headerText = this.translate('View Error', 'labels', 'BpmnProcess');

            /** @type {module:model.Class} */
            let model = new Model();
            model.name = 'Dummy';

            model.set({
                code: this.options.nodeData.code || null,
                message: this.options.nodeData.message || null,
            })

            this.createView('record', 'views/record/detail', {
                readOnly: true,
                bottomView: null,
                sideView: null,
                buttonsDisabled: true,
                scope: 'Dummy',
                model: model,
                el: this.getSelector() + ' .record',
                detailLayout: [
                    {
                        rows: [
                            [
                                {
                                    name: 'code',
                                    view: 'views/fields/varchar',
                                    customLabel: this.translate('errorCode', 'fields', 'BpmnFlowchartElement'),
                                },
                                false
                            ],
                            [
                                {
                                    name: 'message',
                                    view: 'views/fields/varchar',
                                    customLabel: this.translate('Error Message', 'labels', 'BpmnFlowchartElement'),
                                }
                            ]
                        ]
                    }
                ],
            });
        },
    });
});
