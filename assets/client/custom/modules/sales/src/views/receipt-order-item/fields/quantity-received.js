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

define('sales:views/receipt-order-item/fields/quantity-received', ['views/fields/float'], function (FloatFieldView) {

    class QuantityReceivedFieldView extends FloatFieldView {

        setup() {
            super.setup();

            this.validations.push('notFractional');
        }

        // noinspection JSUnusedGlobalSymbols
        validateRequired() {
            const parentModel = this.options.parentModel;

            if (!parentModel) {
                return super.validateRequired();
            }

            const doneStatusList = this.getMetadata().get(`scopes.${parentModel.entityType}.doneStatusList`) || [];

            if (!doneStatusList.includes(parentModel.get('status'))) {
                return super.validateRequired();
            }

            if (this.model.get(this.name) !== null) {
                return false;
            }

            const msg = this.translate('fieldIsRequired', 'messages')
                .replace('{field}', this.getLabelText());

            this.showValidationMessage(msg);

            return true;
        }

        // noinspection JSUnusedGlobalSymbols
        validateNotFractional() {
            if (!this.model.get('productId')) {
                return false;
            }

            if (this.model.get('allowFractionalQuantity') === true) {
                return false;
            }

            /** @type number|null */
            const value = this.model.get(this.name);

            if (value === null) {
                return false;
            }

            if (Math.floor(value) === value) {
                return false;
            }

            const msg = this.translate('fieldCannotBeFractional', 'messages', 'Quote')
                .replace('{field}', this.getLabelText());

            this.showValidationMessage(msg);

            return true;
        }
    }

    return QuantityReceivedFieldView;
});
