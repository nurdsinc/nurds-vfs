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

define('advanced:views/report-panel/fields/report',
['views/fields/link', 'advanced:report-helper'], function (Dep, ReportHelper) {

    return Dep.extend({

        createDisabled: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.reportHelper = new ReportHelper(
                this.getMetadata(),
                this.getLanguage(),
                this.getDateTime(),
                this.getConfig(),
                this.getPreferences()
            );
        },

        select: function (model) {
            this.model.set('reportType', model.get('type'), {isManual: true});
            this.model.set('reportEntityType', model.get('entityType'));

            if (model.get('type') !== 'Grid') {
                if (model.get('type') === 'List') {
                    this.model.set('displayTotal', false);
                }

                this.model.set('column', null);
            }
            else {
                let column = null;
                let columns = model.get('columns') || [];

                if (columns.length) {
                    column = columns[0];
                }

                columns = columns.filter(item => {
                    // @todo Is summary check instead?
                    return this.reportHelper.isColumnNumeric(item, model);
                });

                if ((model.get('groupBy') || []).length < 2 && columns.length > 1) {
                    columns.unshift('');
                }

                this.model.set('column', column);
                this.model.set('columnsData', model.get('columnsData'));

                this.model.trigger('update-columns', columns);
            }

            Dep.prototype.select.call(this, model);
        },

        clearLink: function () {
            Dep.prototype.clearLink.call(this);
            this.model.set('reportType', null, {isManual: true});
            this.model.set('displayTotal', false);
        }
    });
});
