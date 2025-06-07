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

define('advanced:views/workflow/actions/relate-with-entity',
['advanced:views/workflow/actions/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/actions/relate-with-entity',

        type: 'relateWithEntity',

        data: function () {
            let data = Dep.prototype.data.call(this);

            data.linkTranslated = this.translate(this.actionData.link, 'links', this.entityType);

            return data;
        },

        defaultActionData: {
            link: null
        },

        additionalSetup: function() {
            Dep.prototype.additionalSetup.call(this);

            if (this.actionData.link) {
                this.foreignEntityType = this.getMetadata()
                    .get('entityDefs.' + this.entityType + '.links.' + this.actionData.link + '.entity');
            }

            this.model = new Model();

            this.model.set({
                entityId: this.actionData.entityId,
                entityName: this.actionData.entityName,
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.actionData.entityId) {
                this.createView('entity', 'views/fields/link', {
                    el: this.getSelector() + ' .field[data-name="entity"]',
                    foreignScope: this.foreignEntityType,
                    name: 'entity',
                    model: this.model,
                    mode: 'detail',
                    readOnly: true,
                }, view => {
                    view.render();
                });
            }
        },
    });
});
