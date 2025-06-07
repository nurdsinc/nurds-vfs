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

define('advanced:views/workflow/actions/update-created-entity',
['advanced:views/workflow/actions/base'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/actions/update-created-entity',

        type: 'updateCreatedEntity',

        defaultActionData: {
            target: null,
            fieldList: [],
            fields: {},
        },

        data: function () {
            const data = Dep.prototype.data.call(this);

            if (this.actionData.target) {
                const aliasId = this.actionData.target.substr(8);

                if (this.options.flowchartCreatedEntitiesData[aliasId]) {
                    const link = this.options.flowchartCreatedEntitiesData[aliasId].link;
                    const entityType = this.options.flowchartCreatedEntitiesData[aliasId].entityType;
                    const numberId = this.options.flowchartCreatedEntitiesData[aliasId].numberId;
                    const text = this.options.flowchartCreatedEntitiesData[aliasId].text;

                    if (link) {
                        data.linkTranslated = this.translate(link, 'links', this.entityType);
                    }

                    data.entityTypeTranslated = this.translate(entityType, 'scopeNames');
                    data.numberId = numberId;
                    data.text = text;
                }
            }

            return data;
        },

        additionalSetup: function() {
            Dep.prototype.additionalSetup.call(this);

            if (this.actionData.target) {
                let id = this.actionData.target;

                if (id.indexOf('created:') === 0) {
                    id = id.substr(8);
                }

                if (this.options.flowchartCreatedEntitiesData[id]) {
                    this.linkedEntityName = this.options.flowchartCreatedEntitiesData[id].entityType;
                }
            }
        },
    });
});
