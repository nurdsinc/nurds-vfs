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

define('advanced:views/workflow/conditions/link', ['advanced:views/workflow/conditions/base'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/conditions/base',

        defaultConditionData: {
            comparison: 'notEmpty',
        },

        comparisonList: [
            'notEmpty',
            'isEmpty',
            'equals',
            'notEquals',
            'changed',
            'notChanged',
        ],

        setupComparisonList: function () {
            Dep.prototype.setupComparisonList.call(this)

            if (this.fieldType === 'image' || this.fieldType === 'file') {
                const comparisonList = [];

                Espo.Utils.clone(this.comparisonList).forEach(item => {
                    if (~['equals', 'notEquals', 'wasEqual', 'wasNotEqual'].indexOf(item)) {
                        return;
                    }

                    comparisonList.push(item);
                });

                this.comparisonList = comparisonList;
            }
        },

        data: function () {
            return _.extend({
            }, Dep.prototype.data.call(this));
        },

        getSubjectInputViewName: function (subjectType) {
            return 'advanced:views/workflow/condition-fields/subjects/link';
        },
    });
});
