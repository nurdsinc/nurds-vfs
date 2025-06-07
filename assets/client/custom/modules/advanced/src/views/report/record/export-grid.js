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

define('advanced:views/report/record/export-grid', ['views/record/base'], function (Dep) {

    return Dep.extend({

        template: 'advanced:report/record/export-grid',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.scope = this.options.scope;

            var gridReportFormatList = this.getMetadata().get('app.export.gridReportFormatList') || [];

            var version = this.getConfig().get('version') || '';
            var arr = version.split('.');

            if (version !== 'dev' && arr.length > 2 && parseInt(arr[0]) * 100 + parseInt(arr[1]) < 407) {
                gridReportFormatList = ['csv'];
            }

            this.createField('exportFormat', 'views/fields/enum', {
                options: gridReportFormatList,
            });

            this.controlColumnField();
            this.listenTo(this.model, 'change:exportFormat', this.controlColumnField, this);

            if (this.options.columnList) {
                this.createField('column', 'views/fields/enum', {
                    options: this.options.columnList,
                    translatedOptions: this.options.columnsTranslation || {}
                });
            }
        },

        controlColumnField: function () {
            if (this.model.get('exportFormat') === 'csv') {
                this.showField('column');
            } else {
                this.hideField('column');
            }
        },
    });
});
