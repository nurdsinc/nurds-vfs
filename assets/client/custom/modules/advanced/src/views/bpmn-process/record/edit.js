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

define('advanced:views/bpmn-process/record/edit', 'views/record/edit', function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
            this.setupFlowchartDependency();
        },

        setupFlowchartDependency: function () {
            this.listenTo(this.model, 'change:flowchartId', function (model, value, o) {
                if (!o.ui) return;
                this.model.set({
                    'targetId': null,
                    'targetName': null
                });
                if (!value) {
                    this.model.set('startElementIdList', []);
                }

                this.model.set('name', this.model.get('flowchartName'));
            }, this);

            if (this.model.has('startElementIdList')) {
                this.showField('startElementId');
                this.setStartElementIdList(this.model.get('startElementIdList'));
            } else {
                this.hideField('startElementId');
            }

            this.listenTo(this.model, 'change:startElementIdList', function (model, value, o) {
                this.setStartElementIdList(value);
            }, this);
        },

        setStartElementIdList: function (value) {
            value = value || [];
            this.setFieldOptionList('startElementId', value);

            if (value.length) {
                this.model.set('startElementId', value[0]);
            } else {
                this.model.set('startElementId', null);
            }
            if (value.length > 0) {
                this.showField('startElementId');
            } else {
                this.hideField('startElementId');
            }
        },

    });
});
