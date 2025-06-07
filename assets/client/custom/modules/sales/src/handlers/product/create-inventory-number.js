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

define('sales:handlers/product/create-inventory-number', [], function () {

    function addDays(/** string */date, /** number */days) {
        const out = new Date(date);
        out.setDate(out.getDate() + days);

        return out.toISOString().split('T')[0];
    }

    class Handler {

        constructor(/** import('view-helper').default */helper) {
            this.helper = helper;
        }

        getAttributes(/** module:model */model) {
            let expirationDate = null;

            if (model.attributes.expirationDays) {
                expirationDate =
                    addDays(this.helper.dateTime.getToday(), model.attributes.expirationDays);
            }

            return Promise.resolve({
                type: model.get('inventoryNumberType') || 'Batch',
                expirationDate: expirationDate,
            });
        }
    }

    return Handler;
});
