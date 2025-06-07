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

define('advanced:views/bpmn-flowchart-element/record/gateway-exclusive-detail',
['advanced:views/bpmn-flowchart-element/record/detail'], function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (!this.isDivergent()) {
                this.hideField('flowsConditions');
                this.hidePanel('flowsConditions');
                this.hideField('defaultFlowId');
                this.hidePanel('divergent');
            } else {
                this.showPanel('divergent');
            }
        },

        isConvergent: function () {
            var flowchartDataList = this.model.dataHelper.getAllDataList();
            var id = this.model.id;

            var count = 0;

            flowchartDataList.forEach(item => {
                if (item.type === 'flow' && item.endId === id) {
                    count++;
                }
            });

            return count > 1;
        },

        isDivergent: function () {
            var flowchartDataList = this.model.dataHelper.getAllDataList();
            var id = this.model.id;

            var count = 0;

            flowchartDataList.forEach(item => {
                if (item.type === 'flow' && item.startId === id) {
                    count++;
                }
            });

            return count > 1;
        },
    });
});
