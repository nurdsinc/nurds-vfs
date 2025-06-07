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

define('advanced:views/workflow/record/edit-bottom', ['views/record/edit-bottom'], function (Dep) {

    return Dep.extend({

        editMode: true,

        template: 'advanced:workflow/record/edit-bottom',

        setup: function () {
            Dep.prototype.setup.call(this);

            if (
                this.model.get('type') === 'scheduled' ||
                this.model.get('type') === 'manual'
            ) {
                this.hideConditions();
            }

            this.listenTo(this.model, 'change', function (model, options) {
                if (!options.ui) {
                    return;
                }

                if (this.model.hasChanged('entityType') || this.model.hasChanged('type')) {
                    var entityType = model.get('entityType');

                    if (this.model.hasChanged('entityType')) {
                        model.set('conditionsAny', []);
                        model.set('conditionsAll', []);
                        model.set('actions', []);
                    }

                    if (
                        this.model.hasChanged('type') &&
                        ~['scheduled', 'manual'].indexOf(this.model.get('type'))
                    ) {
                        this.storeConditions();

                        model.set('conditionsAny', []);
                        model.set('conditionsAll', []);
                        model.set('conditionsFormula', null);
                    }

                    if (
                        this.model.hasChanged('type') &&
                        !~['scheduled', 'manual'].indexOf(this.model.get('type'))
                    ) {
                        this.restoreConditions();
                    }

                    if (
                        this.model.get('type') === 'scheduled'||
                        this.model.get('type') === 'manual'
                    ) {
                        this.hideConditions();

                        if (entityType) {
                            this.showActions();
                        } else {
                            this.hideActions();
                        }
                    } else {
                        if (entityType) {
                            this.showConditions();
                            this.showActions();
                        } else {
                            this.hideConditions();
                            this.hideActions();
                        }
                    }
                }
            }, this);
        },

        storeConditions: function () {
            var previousConditions = {
                conditionsAny: this.model.get('conditionsAny'),
                conditionsAll: this.model.get('conditionsAll'),
                conditionsFormula: this.model.get('conditionsFormula'),
            };

            this.previousConditions = Espo.Utils.cloneDeep(previousConditions);
        },

        restoreConditions: function () {
            if (!this.previousConditions) {
                return;
            }

            this.model.set(this.previousConditions, {ui: true});

            this.previousConditions = null;
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
            this.$el.find('.panel-conditions').removeClass('hidden');

            this.clearView('conditions');

            this.createView('conditions', 'advanced:views/workflow/record/conditions', {
                model: this.model,
                el: this.options.el + ' .conditions-container',
                readOnly: !this.editMode,
            }, function (view) {
                view.render();

                if (this.editMode) {
                    this.listenTo(view, 'change', function () {
                        if (!this.recordViewObject) {
                            return;
                        }

                        this.recordViewObject.onChangeConditions();
                    }, this);
                }
            });
        },

        showActions: function () {
            this.$el.find('.panel-actions').removeClass('hidden');

            this.clearView('actions');

            this.createView('actions', 'advanced:views/workflow/record/actions', {
                model: this.model,
                el: this.options.el + ' .actions-container',
                readOnly: !this.editMode,
            }, function (view) {
                view.render();

                if (this.editMode) {
                    this.listenTo(view, 'change', function () {
                        if (!this.recordViewObject) {
                            return;
                        }

                        this.recordViewObject.onChangeActions();
                    }, this);
                }
            });
        },

        hideConditions: function () {
            if (!this.isRendered()) {
                this.once('after:render', function () {
                    this.hideConditions();
                }, this);

                return;
            }

            this.$el.find('.panel-conditions').addClass('hidden');

            this.clearView('conditions');
        },

        hideActions: function () {
            this.$el.find('.panel-actions').addClass('hidden');

            this.clearView('actions');
        },

        getFields: function () {
        },

        getFieldViews: function () {
            return {};
        },

    });
});
