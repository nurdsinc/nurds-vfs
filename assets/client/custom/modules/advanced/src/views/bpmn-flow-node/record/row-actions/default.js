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

define('advanced:views/bpmn-flow-node/record/row-actions/default', ['views/record/row-actions/default'], function (Dep) {

    return Dep.extend({

        getActionList: function () {
            let list = [];

            let status = this.model.get('status');
            let elementType = this.model.get('elementType');

            if (['In Process'].includes(status)) {
                list.push({
                    action: 'interruptFlowNode',
                    html: this.translate('Interrupt', 'labels', 'BpmnProcess'),
                    data: {
                        id: this.model.id,
                    },
                });
            }

            if (!['Processed', 'Interrupted', 'Rejected', 'Failed'].includes(status)) {
                list.push({
                    action: 'rejectFlowNode',
                    html: this.translate('Reject', 'labels', 'BpmnProcess'),
                    data: {
                        id: this.model.id,
                    },
                });
            }

            if (
                ['eventStartError', 'eventIntermediateErrorBoundary'].includes(elementType) &&
                status === 'Processed'
            ) {
                list.push({
                    action: 'viewError',
                    html: this.translate('View Error', 'labels', 'BpmnProcess'),
                    data: {
                        id: this.model.id,
                    },
                });
            }

            return list;
        },
    });
});
