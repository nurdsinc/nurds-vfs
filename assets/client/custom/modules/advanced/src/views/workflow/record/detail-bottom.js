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

define('advanced:views/workflow/record/detail-bottom',
['views/record/edit-bottom', 'advanced:views/workflow/record/edit-bottom'],
function (Dep, Edit) {

    return Dep.extend({

        editMode: false,

        template: 'advanced:workflow/record/edit-bottom',

        setup: function () {
            Dep.prototype.setup.call(this);

            if (
                this.model.get('type') === 'scheduled' ||
                this.model.get('type') === 'manual'
            ) {
                this.hideConditions();
            }

            this.createView('workflowLogRecords', 'views/record/panels/relationship', {
                model: this.model,
                el: this.options.el + ' .panel[data-name="workflowLogRecords"] .panel-body',
                panelName: 'workflowLogRecords',
                defs: {
                    create: false,
                    rowActionsView: "views/record/row-actions/remove-only"
                },
                recordHelper: this.recordHelper,
            });
        },

        afterRender: function () {
            if (!this.model.isNew()) {
                this.showConditions();
                this.showActions();
            } else {
                if (this.model.get('entityType')) {
                    this.showConditions();
                    this.showActions();
                }
            }

            Dep.prototype.afterRender.call(this);
        },

        showConditions: function () {
            Edit.prototype.showConditions.call(this);
        },

        showActions: function () {
            this.$el.find('.panel-actions').removeClass('hidden');

            this.createView('actions', 'advanced:views/workflow/record/actions', {
                model: this.model,
                el: this.options.el + ' .actions-container',
                readOnly: !this.editMode,
            }, (view) => {
                view.render();
            });
        },

        hideConditions: function () {
            if (!this.isRendered()) {
                this.once('after:render', () => {
                    this.hideConditions();
                });

                return;
            }

            this.$el.find('.panel-conditions').addClass('hidden');

            var view = this.getView('conditions');

            if (view) {
                view.remove();
            }
        },

        hideActions: function () {
            this.$el.find('.panel-actions').addClass('hidden');

            var view = this.getView('actions');

            if (view) {
                view.remove();
            }
        },
    });
});
