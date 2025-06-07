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

define('advanced:views/workflow/conditions/date', ['advanced:views/workflow/conditions/base'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/conditions/date',

        comparisonList: [
            'on',
            'before',
            'after',
            'today',
            'beforeToday',
            'afterToday',
            'isEmpty',
            'notEmpty',
            'changed',
            'notChanged',
        ],

        defaultConditionData: {
            comparison: 'on',
            subjectType: 'today',
            shiftDays: 0,
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            this.handleShiftDays(this.conditionData.shiftDays, true);
        },

        handleComparison: function (comparison, noFetch) {
            Dep.prototype.handleComparison.call(this, comparison, noFetch);

            switch (comparison) {
                case 'on':
                case 'before':
                case 'after':
                    this.$el.find('.subject').empty();

                    this.createView('subjectType', 'advanced:views/workflow/condition-fields/subject-type-date', {
                        selector: '.subject-type',
                        value: this.conditionData.subjectType,
                        readOnly: this.readOnly,
                    }, view => {
                        view.render().then(() => {
                            if (!noFetch) {
                                this.fetch();
                            }

                            this.handleSubjectType(this.conditionData.subjectType, noFetch);
                        });

                        this.listenTo(view, 'change', value => {
                            this.setSubjectType(value);
                            this.handleSubjectType(value);
                        });
                    });

                    this.createView('shiftDays', 'advanced:views/workflow/condition-fields/shift-days', {
                        selector: '.shift-days',
                        entityType: this.entityType,
                        field: this.field,
                        value: this.conditionData.shiftDays || 0,
                        readOnly: this.readOnly
                    }, (view) => {
                        view.render(() => {
                            if (!noFetch) {
                                this.fetch();
                                this.handleShiftDays(this.conditionData.subject);
                            }
                        });
                    });

                    break;

                default:
                    this.$el.find('.shift-days').empty();
            }
        },

        fetch: function () {
            Dep.prototype.fetch.call(this);

            this.fetchShiftDays();

            return this.conditionData;
        },

        fetchShiftDays: function () {
            const view = this.getView('shiftDays');

            if (!view) {
                // Otherwise, error may be logged in the console on condition addition.
                return;
            }

            const data = view.fetch();

            this.conditionData.shiftDays = data.value;
        },

        handleShiftDays: function (shiftDays, noFetch) {
            if (!noFetch) {
                this.fetch();
            }
        },
    });
});
