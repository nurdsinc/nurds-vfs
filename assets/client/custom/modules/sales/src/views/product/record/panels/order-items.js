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

define('sales:views/product/record/panels/order-items', ['views/record/panels/relationship'], function (Dep) {

    return class extends Dep {

        setup() {
            this.defs.createDisabled = true;
            this.defs.selectDisabled = true;
            this.defs.editDisabled = true;
            this.defs.unlinkDisabled = true;
            this.defs.removeDisbeld = true;
            this.defs.viewDisabled = true;
            this.defs.filterList = ['actual', 'completed', 'all'];
            this.defs.rowActionsView = 'views/record/row-actions/view-only';

            this.link = 'orderItems';
            this.entityType = this.scope = 'QuoteItem';
            this.url = `Product/${this.model.id}/orderItems`;

            super.setup();
        }
    }
});
