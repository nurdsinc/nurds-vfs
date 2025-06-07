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

define('advanced:views/bpmn-process/record/detail', ['views/record/detail'], function (Dep) {

    return Dep.extend({

        duplicateAction: false,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.hideField('startElementId');

            if (this.getAcl().checkModel(this.model, 'edit')) {
                this.dropdownItemList.push({
                    'label': 'Stop Process',
                    'name': 'stopProcess',
                    'hidden': !this.isStoppable(),
                });

                this.dropdownItemList.push({
                    'label': 'Reactivate',
                    'name': 'reactivate',
                    'hidden': !this.isReactivatable(),
                });

                this.listenTo(this.model, 'sync', () => this.controlActions());
            }

            this.dropdownItemList.push({
                'label': 'View Variables',
                'name': 'viewVariables',
            });
        },

        controlActions: function () {
            this.isStoppable() ?
                this.showActionItem('stopProcess') :
                this.hideActionItem('stopProcess');

            this.isReactivatable() ?
                this.showActionItem('reactivate') :
                this.hideActionItem('reactivate');
        },

        isReactivatable: function () {
            return ['Ended', 'Stopped', 'Interrupted'].includes(this.model.get('status'));
        },

        isStoppable: function () {
            return ['Started', 'Paused'].includes(this.model.get('status'));
        },

        actionStopProcess: function () {
            if (!this.isStoppable()) {
                console.error('Cannot stop. Not appropriate status.');

                return;
            }

            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax
                    .postRequest('BpmnProcess/action/stop', {id: this.model.id})
                    .then(() => {
                        this.model.set('status', 'Stopped');
                        Espo.Ui.success(this.translate('Done', 'labels'));
                        this.hideActionItem('stopProcess');

                        this.model.trigger('after:relate');
                        this.model.fetch();
                    });
            });
        },

        actionReactivate: function () {
            if (!this.isReactivatable()) {
                console.error('Cannot reactivate. Not appropriate status.');

                return;
            }

            this.confirm(this.translate('confirmation', 'messages'), () => {
                Espo.Ajax
                    .postRequest('BpmnProcess/action/reactivate', {id: this.model.id})
                    .then(() => {
                        Espo.Ui.success(this.translate('Done', 'labels'));

                        this.model.trigger('after:relate');
                        this.model.fetch();
                    });
            });
        },

        actionViewVariables: function () {
            this.createView('dialog', 'advanced:views/bpmn-process/modals/view-variables', {model: this.model})
                .then(view => {
                    view.render();
                });
        },
    });
});
