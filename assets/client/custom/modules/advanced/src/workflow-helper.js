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

define('advanced:workflow-helper', ['view'], function (Fake) {

    var WorkflowHelper = function (metadata) {
        this.metadata = metadata;
    };

    _.extend(WorkflowHelper.prototype, {

        getComplexFieldEntityType: function (field, entityType) {
            if (~field.indexOf('.') && !~field.indexOf('created:')) {
                var arr = field.split('.');
                var link = arr[0];

                return this.getMetadata().get(['entityDefs', entityType, 'links', link, 'entity']);
            }

            return entityType;
        },

        getComplexFieldLinkPart: function (field) {
            if (~field.indexOf('.')) {
                var arr = field.split('.');

                return arr[0];
            }

            return null;
        },

        getComplexFieldFieldPart: function (field) {
            if (~field.indexOf('.')) {
                var arr = field.split('.');

                return arr[1];
            }

            return field;
        },

        getComplexFieldForeignEntityType: function (field, entityType) {
            var targetLinkEntityType;

            if (~field.indexOf('.')) {
                var arr = field.split('.');
                var foreignField = arr[1];
                var link = arr[0];

                var foreignEntityType = this.getMetadata()
                    .get(['entityDefs', entityType, 'links', link, 'entity']);

                targetLinkEntityType = this.getMetadata()
                    .get(['entityDefs', foreignEntityType, 'links', foreignField, 'entity']);
            } else {
                targetLinkEntityType = this.getMetadata().get(['entityDefs', entityType, 'links', field, 'entity']);
            }

            return targetLinkEntityType;
        },


        getMetadata: function () {
            return this.metadata;
        },
    });

    return WorkflowHelper;
});
