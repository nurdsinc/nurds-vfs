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

define('advanced:views/workflow/conditions/base', ['view', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/conditions/base',

        defaultConditionData: {
            comparison: 'equals',
            subjectType: 'value',
        },

        comparisonList: [
            'equals',
            'wasEqual',
            'notEquals',
            'wasNotEqual',
            'changed',
            'notChanged',
            'notEmpty',
        ],

        data: function () {
            return {
                field: this.field,
                entityType: this.entityType,
                comparisonValue: this.conditionData.comparison,
                comparisonList: this.comparisonList,
                readOnly: this.readOnly,
            };
        },

        setupComparisonList: function () {
            if (this.isComplexField || this.options.isChangedDisabled) {
                const comparisonList = [];

                Espo.Utils.clone(this.comparisonList).forEach(item => {
                    if (['changed', 'notChanged', 'wasEqual', 'wasNotEqual'].includes(item)) {
                        return;
                    }

                    comparisonList.push(item);
                });

                this.comparisonList = comparisonList;
            }
        },

        setup: function () {
            this.conditionType = this.options.conditionType;
            this.conditionData = this.options.conditionData || {};

            this.field = this.options.field;
            this.entityType = this.options.entityType;
            this.type = this.options.type;
            this.fieldType = this.options.fieldType;
            this.readOnly = this.options.readOnly;

            this.isComplexField = !!(~this.field.indexOf('.'));

            this.comparisonList = Espo.Utils.clone(this.comparisonList);
            this.setupComparisonList();

            if (this.options.isNew) {
                const cloned = {};

                for (const i in this.defaultConditionData) {
                    cloned[i] = Espo.Utils.clone(this.defaultConditionData[i]);
                }

                this.conditionData = _.extend(cloned, this.conditionData);
            }

            this.conditionData.fieldToCompare = this.field;

            if (this.readOnly) {
                return;
            }

            this.formModel = new Model();
            this.formModel.name = 'Dummy';
            this.formModel.set({
                comparison: this.conditionData.comparison,
            });

            this.createView('comparisonField', 'views/fields/enum', {
                selector: '[data-field="comparison"]',
                name: 'comparison',
                model: this.formModel,
                mode: 'edit',
                params: {
                    options: this.comparisonList,
                    translation: 'Workflow.labels',
                },
            });

            this.listenTo(this.formModel, 'change:comparison', () => {
                this.setComparison(this.formModel.attributes.comparison);
                this.handleComparison(this.formModel.attributes.comparison);
            });
        },

        afterRender: function () {
            this.handleComparison(this.conditionData.comparison, true);

            this.$el.find('.selectize-control').addClass('input-sm');
        },

        fetchComparison: function () {
            const $comparison = this.$el.find('[data-name="comparison"]');

            if ($comparison.length) {
                this.conditionData.comparison = $comparison.val();
            }
        },

        fetchSubjectType: function () {
            const view = this.getView('subjectType');

            if (view) {
                this.conditionData.subjectType = view.fetchValue();
            }
        },

        fetchSubject: function () {
            delete this.conditionData.value;
            delete this.conditionData.field;

            if ('fetch' in (this.getView('subject') || {})) {
                const data = this.getView('subject').fetch() || {};

                for (const attr in data) {
                    this.conditionData[attr] = data[attr];
                }

                return;
            }

            switch (this.conditionData.subjectType) {
                case 'field':
                    this.fetchSubjectField();

                    break;

                case 'value':
                    const $subject = this.$el.find('[data-name="subject"]');

                    if ($subject.length) {
                        this.conditionData.value = $subject.val().trim();
                    }

                    break;
            }
        },

        fetchSubjectField: function () {
            if (!this.getView('subject')) {
                return;
            }

            this.conditionData.field = this.getView('subject').fetchValue();
        },

        fetch: function () {
            this.fetchComparison();
            this.fetchSubjectType();
            this.fetchSubject();

            return this.conditionData;
        },

        setComparison: function (comparison) {
            this.conditionData.comparison = comparison;
        },

        setSubjectType: function (subjectType) {
            this.conditionData.subjectType = subjectType;
        },

        setSubject: function (subject) {
            this.conditionData.subject = subject;
        },

        handleComparison: function (comparison, noFetch) {
            switch (comparison) {
                case 'changed':
                case 'notChanged':
                case 'notEmpty':
                case 'isEmpty':
                case 'empty':
                case 'true':
                case 'false':
                case 'today':
                case 'beforeToday':
                case 'afterToday':
                    this.$el.find('.subject-type').empty();
                    this.$el.find('.subject').empty();

                    break;

                case 'equals':
                case 'wasEqual':
                case 'notEquals':
                case 'wasNotEqual':
                case 'greaterThan':
                case 'lessThan':
                case 'greaterThanOrEquals':
                case 'lessThanOrEquals':
                case 'has':
                case 'notHas':
                case 'contains':
                case 'notContains':
                    this.createView('subjectType', 'advanced:views/workflow/condition-fields/subject-type', {
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

                    break;
            }
        },

        getSubjectInputViewName: function () {
            return 'advanced:views/workflow/condition-fields/subjects/text-input';
        },

        handleSubjectType: function (subjectType, noFetch) {
            switch (subjectType) {
                case 'value':
                    this.createView('subject', this.getSubjectInputViewName(subjectType), {
                        selector: '.subject',
                        entityType: this.entityType,
                        field: this.field,
                        value: this.getSubjectValue(),
                        conditionData: this.conditionData,
                        readOnly: this.readOnly,
                    }, view => {
                        view.render(() => {
                            if (!noFetch) {
                                this.fetch();
                            }

                            this.handleSubject(this.conditionData.subject, noFetch);
                        });
                    });

                    break;

                case 'field':
                    this.createView('subject', 'advanced:views/workflow/condition-fields/subjects/field', {
                        selector: '.subject',
                        entityType: this.options.originalEntityType || this.entityType,
                        value: this.conditionData.field,
                        fieldType: this.fieldType,
                        field: this.field,
                        readOnly: this.readOnly,
                    }, view => {
                        view.render().then(() => {
                            if (!noFetch) {
                                setTimeout(() => this.fetch(), 100);
                            }
                        });
                    });

                    break;

                default:
                    this.$el.find('.subject').empty();
            }
        },

        handleSubject: function (subject, noFetch) {
            if (!noFetch) {
                this.fetch();
            }
        },

        getSubjectValue: function () {
            return this.conditionData.value;
        },
    });
});
