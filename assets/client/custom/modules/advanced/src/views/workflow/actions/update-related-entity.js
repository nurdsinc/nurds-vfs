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

define('advanced:views/workflow/actions/update-related-entity', ['advanced:views/workflow/actions/base'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/actions/update-related-entity',

        type: 'updateRelatedEntity',

        defaultActionData: {
            link: false,
            fieldList: [],
            fields: {},
        },

        data: function () {
            var data = Dep.prototype.data.call(this);

            if (this.actionData.link) {
                data.linkTranslated = this.translate(this.actionData.link, 'links', this.entityType);
            }

            if (this.actionData.parentEntityType) {
                data.parentEntityTypeTranslated = this.translate(this.actionData.parentEntityType, 'scopeNames');
            }

            return data;
        },

        additionalSetup: function() {
            Dep.prototype.additionalSetup.call(this);

            if (this.actionData.link) {
                var linkData = this.getMetadata().get('entityDefs.' + this.entityType + '.links.' + this.actionData.link);

                this.linkedEntityName = linkData.entity || this.entityType;
                this.displayedLinkedEntityName = null;

                if (linkData.type === 'belongsToParent') {
                    this.linkedEntityName = this.actionData.parentEntityType || this.linkedEntityName;
                    this.displayedLinkedEntityName = this.translate(this.actionData.link, 'links' , this.entityType) +
                        ' <span class="chevron-right"></span> ' +
                        this.translate(this.actionData.parentEntityType, 'scopeNames');
                }
            }
        },
    });
});
