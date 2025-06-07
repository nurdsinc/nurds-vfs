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

define('advanced:views/report/modals/export-grid', ['views/modal', 'model'], function (Dep, Model) {

    return Dep.extend({

        templateContent: '<div class="record">{{{record}}}</div>',

        setup: function () {
            this.buttonList = [
                {
                    name: 'export',
                    label: 'Export',
                    style: 'danger',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                }
            ];

            this.model = new Model();
            this.model.name = 'Report';

            this.scope = this.options.scope;

            let exportFormat = (this.getMetadata().get('app.export.gridReportFormatList') || [])[0];

            this.model.set('exportFormat', exportFormat);

            this.createView('record', 'advanced:views/report/record/export-grid', {
                scope: this.scope,
                model: this.model,
                el: this.getSelector() + ' .record',
                columnList: this.options.columnList,
                columnsTranslation: this.options.columnsTranslation,
            });
        },

        actionExport: function () {
            let data = this.getView('record').fetch();

            this.model.set(data);

            if (this.getView('record').validate()) {
                return;
            }

            let returnData = {
                format: data.exportFormat,
                column: data.column,
            };

            this.trigger('proceed', returnData);
            this.close();
        },
    });
});
