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

define('advanced:views/bpmn-flowchart-element/fields/message-related-to', ['views/fields/enum'], function (Dep, From) {

    return Dep.extend({

        fetchEmptyValueAsNull: true,

        setupOptions: function () {
            var list = [''];
            var translatedOptions = {};

            if (this.getMetadata().get(['scopes', this.model.targetEntityType, 'object'])) {
                list.push('targetEntity');
            }

            var ignoreEntityTypeList = ['User', 'Email'];
            this.model.elementHelper.getTargetCreatedList().forEach(function (item) {
                var entityType = this.model.elementHelper.getEntityTypeFromTarget(item);
                if (~ignoreEntityTypeList.indexOf(entityType)) return;
                if (!this.getMetadata().get(['scopes', entityType, 'object'])) return;

                list.push(item);
                translatedOptions[item] = this.model.elementHelper.translateTargetItem(item);
            }, this);

            this.model.elementHelper.getTargetLinkList(2, false, false).forEach(function (item) {
                var entityType = this.model.elementHelper.getEntityTypeFromTarget(item);
                if (~ignoreEntityTypeList.indexOf(entityType)) return;
                if (!this.getMetadata().get(['scopes', entityType, 'object'])) return;

                list.push(item);
                translatedOptions[item] = this.model.elementHelper.translateTargetItem(item);
            }, this);

            this.params.options = list;

            translatedOptions[''] = this.translate('None');
            translatedOptions['targetEntity'] = this.getLanguage().translateOption('targetEntity', 'emailAddress', 'BpmnFlowchartElement') +
            ' (' + this.translate(this.model.targetEntityType, 'scopeNames') + ')';

            this.translatedOptions = translatedOptions;
        },
    });
});