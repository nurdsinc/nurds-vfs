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

define('advanced:views/workflow/fields/flowchart', 'views/fields/link', function (Dep) {

    return Dep.extend({

        selectPrimaryFilterName: 'active',

        createDisabled: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.targetEntityType = this.options.targetEntityType;

            this.listenTo(this.model, 'change-target-entity-type', function (targetEntityType) {
                this.targetEntityType = targetEntityType;
            });
        },

        select: function (model) {
            var hash = model.get('elementsDataHash') || {};

            var translation = {};

            (model.get('eventStartAllIdList') || []).forEach(function (id) {
                var item = hash[id];
                if (!item) return;

                var label = item.text || id;
                label = this.translate(item.type, 'elements', 'BpmnFlowchart') + ': ' + label;

                translation[id] = label;
            }, this);

            this.model.set('startElementNames', translation);

            this.model.set('startElementIdList', model.get('eventStartAllIdList'));

            Dep.prototype.select.call(this, model);
        },

        getSelectFilters: function () {
            if (!this.targetEntityType) return;
            return {
                targetType: {
                    type: 'in',
                    value: [this.targetEntityType]
                }
            };
        },
    });
});
