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

define('advanced:views/workflow/actions/create-related-entity', ['advanced:views/workflow/actions/base'], function (Dep) {

    return Dep.extend({

        type: 'createRelatedEntity',

        defaultActionData: {
            link: false,
            fieldList: [],
            fields: {},
        },

        data: function () {
            const data = Dep.prototype.data.call(this);

            if (this.actionData.link) {
                data.linkTranslated = this.translate(this.actionData.link, 'links', this.entityType);
            }

            data.numberId = this.numberId;
            data.aliasId = this.aliasId;

            return data;
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.numberId = null;

            if (this.options.flowchartElementId && this.options.flowchartCreatedEntitiesData) {
                const aliasId = this.options.flowchartElementId + '_' + this.actionData.id;

                if (aliasId in this.options.flowchartCreatedEntitiesData) {
                    this.numberId = this.options.flowchartCreatedEntitiesData[aliasId].numberId;
                }

                this.aliasId = aliasId;
            }
        },

        additionalSetup: function() {
            Dep.prototype.additionalSetup.call(this);

            if (this.actionData.link) {
                this.linkedEntityName = this.getMetadata()
                    .get(`entityDefs.${this.entityType}.links.${this.actionData.link}.entity`);
            }
        },
    });
});
