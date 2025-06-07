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

define('sales:views/product/record/panels/variants', ['views/record/panels/relationship'], function (Dep) {

    return class extends Dep {

        isGenerating = false

        setup() {
            super.setup();

            if (
                this.getAcl().checkScope('Product', 'create') &&
                this.getAcl().checkScope('Product', 'edit')
            ) {
                this.buttonList.unshift({
                    action: 'generate',
                    label: this.translate('Generate', 'labels', 'Product'),
                });
            }
        }

        // noinspection JSUnusedGlobalSymbols
        actionGenerate() {
            if (this.isGenerating) {
                return;
            }

            this.confirm(this.translate('generateVariantsConfirmation', 'messages', 'Product'))
                .then(() => {
                    this.isGenerating = true;

                    Espo.Ui.notify(' ... ');

                    Espo.Ajax.postRequest(`Product/${this.model.id}/generateVariants`)
                        .then(/** */result => {
                            Espo.Ui.notify(false);

                            this.collection.fetch()
                                .then(() => {
                                    const msg = this.translate('variantsGenerated', 'messages', 'Product')
                                        .replace('{count}', result.count);

                                    Espo.Ui.success(msg);
                                });
                        })
                        .finally(() => this.isGenerating = false);
                });
        }
    }
});
