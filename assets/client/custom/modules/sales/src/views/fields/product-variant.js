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
 * License ID: 799ba07927a6a02c6a0ae59de64ec1ec
 ************************************************************************************/

define('sales:views/fields/product-variant', ['views/fields/link'], function (LinkFieldView) {

    return class extends LinkFieldView {

        allowProductTemplate = false

        select(model) {
            if (model.get('type') === 'Template') {
                this.selectVariant(model)
                    .then(model => super.select(model));

                return;
            }

            super.select(model);
        }

        // noinspection JSUnusedGlobalSymbols
        selectOneOf(models) {
            const regularModels = [];
            const templateModels = [];

            models.forEach(model => {
                model.get('type') === 'Template' ?
                    templateModels.push(model) :
                    regularModels.push(model);
            });

            if (!templateModels.length) {
                super.selectOneOf(models);

                return;
            }

            Espo.Ui.notify(' ... ');

            this.createView('dialog', 'sales:views/product/modals/select-variants', {models: templateModels})
                .then(view => {
                    view.render();

                    Espo.Ui.notify(false);

                    this.listenToOnce(view, 'select', models => {
                        super.selectOneOf([...regularModels, ...models]);
                    });
                });
        }

        selectVariant(model) {
            Espo.Ui.notify(' ... ');

            return new Promise(resolve => {
                this.createView('dialog', 'sales:views/product/modals/select-variant', {
                    model: model,
                    allowProductTemplate: this.allowProductTemplate,
                }).then(view => {
                    view.render();

                    Espo.Ui.notify(false);

                    this.listenToOnce(view, 'select', model => {
                        resolve(model);
                    });
                });
            });
        }
    }
});
