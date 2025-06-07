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
 * License ID: 96ea385d4e0a9d0ba460925d713d8f63
 ************************************************************************************/

define('google:views/google/integration', ['views/admin/integrations/oauth2', 'model'], function (Dep, Model) {

    return Dep.extend({

        products: [],

        setup: function () {
            this.integration = this.options.integration;

            this.helpText = false;

            if (this.getLanguage().has(this.integration, 'help', 'Integration')) {
                this.helpText = this.translate(this.integration, 'help', 'Integration');

                if (this.getHelper().transformMarkdownText) {
                    this.helpText = this.getHelper().transformMarkdownText(this.helpText, {});
                }
                else if (this.getHelper().transfromMarkdownText) {
                    this.helpText = this.getHelper().transfromMarkdownText(this.helpText, {});
                }
            }

            this.fieldList = [];
            this.fields = [];

            this.dataFieldList = [];

            this.model = new Model();
            this.model.id = this.integration;
            this.model.name = 'Integration';
            this.model.urlRoot = 'Integration';

            this.model.defs = {
                fields: {
                    enabled: {
                        required: true,
                        type: 'bool'
                    },
                }
            };

            this.wait(true);

            this.fields = this.getMetadata().get('integrations.' + this.integration + '.fields');

            Object.keys(this.fields).forEach(function (name) {
                this.model.defs.fields[name] = this.fields[name];
                this.dataFieldList.push(name);
            }, this);

            this.products = this.getMetadata().get('integrations.' + this.integration + '.products');
            this.model.populateDefaults();


            this.listenToOnce(this.model, 'sync', function () {
                this.createFieldView('bool', 'enabled');

                Object.keys(this.fields).forEach(function (name) {
                    this.createFieldView(this.fields[name]['type'], name, null, this.fields[name]);
                }, this);

                this.wait(false);
            }, this);

            this.model.fetch();
        }
    });
});
