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

define('sales:views/product/modals/select-variant', ['views/modal'], function (ModalView) {

    return class extends ModalView {

        templateContent = `
            {{{record}}}
        `

        setup() {
            this.allowProductTemplate = this.options.allowProductTemplate;

            this.headerText = this.translate('Select Variant', 'labels', 'Product');

            if (this.allowProductTemplate) {
                this.buttonList.push({
                    name: 'selectTemplate',
                    text: this.translate('Select Template', 'labels', 'Product'),
                });
            }

            this.buttonList.push({
                name: 'cancel',
                label: 'Cancel',
            });

            this.createView('record', 'sales:views/product/variant-select', {
                model: this.model,
                selector: ' ',
                isMultiple: false,
                where: this.options.where,
                mandatorySelectAttributeList: this.options.mandatorySelectAttributeList,
            }).then(view => {
                this.listenToOnce(view, 'select', models => {
                    this.trigger('select', models[0]);

                    this.clearView('record');
                    this.close();
                });
            });
        }

        // noinspection JSUnusedGlobalSymbols
        actionSelectTemplate() {
            this.trigger('select', this.model);

            this.clearView('record');
            this.close();
        }
    }
});
