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

define('advanced:views/dashlets/fields/display-type', 'views/fields/enum', function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.reportTypeField = 'type';
            this.displayOnlyTotalField = 'displayOnlyCount';

            if (this.model.entityType === 'ReportPanel') {
                this.reportTypeField = 'reportType';
                this.displayOnlyTotalField = 'displayOnlyTotal';
            }

            this.controlOptions();

            this.listenTo(this.model, 'change:' + this.reportTypeField, function () {
                this.controlOptions();

                if (this.model.entityType === 'ReportPanel' && this.model.isNew()) {
                    var reportType = this.model.get('reportType');

                    var displayType = '';

                    if (reportType === 'Grid' || reportType === 'JointGrid') {
                        displayType = 'Chart';
                    }
                    else if (reportType === 'List') {
                        displayType = 'List';
                    }

                    this.model.set('displayType', displayType);
                }
            }, this);
        },

        fetch: function () {
            var data = Dep.prototype.fetch.call(this);

            var value = data[this.name];

            if (value === 'List') {
                data.displayTotal = false;
                data[this.displayOnlyTotalField] = false;
            }

            if (value === 'Chart') {
                data.displayTotal = false;
                data[this.displayOnlyTotalField] = false;
            }

            if (value === 'Chart-Total') {
                data.displayTotal = true;
                data[this.displayOnlyTotalField] = false;
            }

            if (value === 'Total') {
                data.displayTotal = true;
                data[this.displayOnlyTotalField] = true;
            }

            return data;
        },

        controlOptions: function () {
            var type = this.model.get(this.reportTypeField);

            if (type === 'List') {
                this.setOptionList([
                    'List',
                    'Total',
                ]);

                return;
            }

            if (type === 'Grid' || type === 'JointGrid') {
                this.setOptionList([
                    'Chart',
                    'Chart-Total',
                    'Total',
                    'Table',
                ]);

                return;
            }

            this.setOptionList(['']);
        },

    });
});
