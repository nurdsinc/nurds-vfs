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

define('advanced:views/report-panel/fields/column',
['views/fields/enum', 'advanced:views/report/fields/columns'], function (Dep, Columns) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.listenTo(this.model, 'update-columns', columnList => {
                this.params.options = columnList;
                Columns.prototype.setupTranslatedOptions.call(this, this.model.get('reportEntityType'));

                this.translatedOptions[''] = this.translate('All');

                this.setupColumnLabelTranslation();

                this.reRender();
            });

            this.listenTo(this.model, 'change:columnList', () => {
                this.model.trigger('update-columns', this.model.get('columnList') || []);
            });
        },

        setupOptions: function () {
            this.params.options = Espo.Utils.clone(this.model.get('columnList'));

            if (
                !this.model.isNew &&
                this.model.get('reportType') === 'Grid' &&
                !this.params.options
            ) {
                this.listenToOnce(this.model, 'sync', () => {
                    if (this.model.get('columnList')) {
                        this.params.options = Espo.Utils.clone(this.model.get('columnList'));


                        Columns.prototype.setupTranslatedOptions.call(this, this.model.get('reportEntityType'));

                        this.translatedOptions[''] = this.translate('All');

                        this.setupColumnLabelTranslation();

                        this.reRender();
                    }
                });
            }

            if (!this.params.options && this.model.get('column')) {
                this.params.options = [this.model.get('column')];
            }

            if (!this.params.options) {
                this.params.options = [];
            }

            Columns.prototype.setupTranslatedOptions.call(this, this.model.get('reportEntityType'));

            this.translatedOptions[''] = this.translate('All');

            this.setupColumnLabelTranslation();
        },

        setupColumnLabelTranslation: function () {
            /** @type {Object.<string, {label?: string|null}>} */
            const data = this.model.get('columnsData') || {};

            this.params.options.forEach(column => {
                const item = data[column] || {};

                if (item.label) {
                    this.translatedOptions[column] = item.label;
                }
            });
        },
    });
});
