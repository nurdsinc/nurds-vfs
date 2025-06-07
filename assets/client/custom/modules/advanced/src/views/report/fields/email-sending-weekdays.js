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

define('advanced:views/report/fields/email-sending-weekdays', ['views/fields/base'], function (Dep) {

    return Dep.extend({

        editTemplate: 'advanced:report/fields/email-sending-weekdays/edit',
        detailTemplate: 'advanced:report/fields/email-sending-weekdays/detail',

        afterRender: function () {
            if (this.mode === 'edit' || this.mode === 'search') {
                this.$element = this.$el.find('input[data-name="'+this.name+'"]');

                if (this.mode === 'edit') {
                    this.$element.on('change', () => {
                        this.trigger('change');
                    });
                }
            }
        },

        data: function () {
            var weekday = this.model.get(this.name) || '';
            var weekdays = {};

            for (let i = 0; i < 7; i++) {
                weekdays[i] = (weekday.indexOf(i.toString())) > -1 || false;
            }

            return _.extend({
                selectedWeekdays: weekdays,
                days: this.translate('dayNamesShort', 'lists'),
            }, Dep.prototype.data.call(this));
        },

        fetch: function () {
            var data = {};
            var value = '';

            this.$element.each(function () {
                if ($(this).is(':checked')) {
                    value += $(this).val();
                }
            });

            data[this.name] = value;

            return data;
        },
    });
});
