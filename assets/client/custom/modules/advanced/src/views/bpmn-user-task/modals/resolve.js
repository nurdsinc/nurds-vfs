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

define('advanced:views/bpmn-user-task/modals/resolve', ['views/modal'], function (Dep) {

    return Dep.extend({

        template: 'advanced:bpmn-user-task/modals/resolve',

        backdrop: true,

        setup: function () {
            this.header = this.translate('BpmnUserTask', 'scopeNames') + ' <span class="chevron-right"></span> ' +
                Handlebars.Utils.escapeExpression(this.model.get('name'));

            this.originalModel = this.model;
            this.model = this.model.clone();

            this.createView('record', 'advanced:views/bpmn-user-task/record/resolve', {
                model: this.model,
                el: this.getSelector() + ' .record'
            });

            this.buttonList = [
                {
                    name: 'resolve',
                    text: this.translate('Resolve', 'labels', 'BpmnUserTask'),
                    style: 'danger',
                    disabled: true
                },
                {
                    name: 'cancel',
                    label: 'Cancel'
                }
            ];

            this.listenTo(this.model, 'change:resolution', (model, value) => {
                if (value) {
                    this.enableButton('resolve');
                } else {
                    this.disableButton('resolve');
                }
            });
        },

        actionResolve: function () {
            this.disableButton('resolve');

            this.model.save().then(() => {
                this.originalModel.set('resolution', this.model.get('resolution'));
                this.originalModel.set('resolutionNote', this.model.get('resolutionNote'));
                this.originalModel.set('isResolved', true);
                this.originalModel.trigger('sync');

                Espo.Ui.success(this.translate('Done'));

                this.close();
            });
        },
    });
});
