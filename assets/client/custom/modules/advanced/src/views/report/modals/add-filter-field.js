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


define('advanced:views/report/modals/add-filter-field', ['views/modal'], function (Dep) {

    return Dep.extend({

        templateContent: '<div class="field" data-name="filters">{{{field}}}</div>',

        backdrop: true,

        events: {
            'click a[data-action="addField"]': function (e) {
                this.trigger('add-field', $(e.currentTarget).data().name);
            }
        },

        data: function () {
            return {};
        },

        setup: function () {
            this.header = this.translate('Add Field');

            var scope = this.scope = this.options.scope;

            this.wait(true);

            this.getModelFactory().create('Report', model => {
                model.set('entityType', scope);

                this.createView('field', 'advanced:views/report/fields/filters', {
                    el: this.getSelector() + ' .field',
                    model: model,
                    mode: 'edit',
                    defs: {
                        name: 'filters',
                        params: {},
                    },
                }, view =>{
                    this.listenTo(view, 'change', () => {
                        var list = model.get('filters') || [];

                        if (!list.length) {
                            return;
                        }

                        this.trigger('add-field', list[0]);
                    });
                });

                this.wait(false);
            });
        }
    });
});
