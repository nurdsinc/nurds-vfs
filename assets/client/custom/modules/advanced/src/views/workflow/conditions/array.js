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

define('advanced:views/workflow/conditions/array', ['advanced:views/workflow/conditions/base'], function (Dep) {

    return Dep.extend({

        template: 'advanced:workflow/conditions/enum',

        defaultConditionData: {
            comparison: 'notEmpty',
            subjectType: 'value',
        },

        comparisonList: [
            'notEmpty',
            'isEmpty',
            'has',
            'notHas',
            'changed',
            'notChanged',
        ],

        data: function () {
            return _.extend({
            }, Dep.prototype.data.call(this));
        },

        getSubjectInputViewName: function (subjectType) {
            const optionList = this.getMetadata()
                .get(['entityDefs', this.options.actualEntityType, 'fields', this.options.actualField, 'options']) ||
                [];

            if (optionList.length) {
                return 'advanced:views/workflow/condition-fields/subjects/enum-input';
            } else {
                return 'advanced:views/workflow/condition-fields/subjects/text-input';
            }
        },
    });
});
