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

define('sales:views/price-rule/fields/price', ['views/fields/base'], function (BaseView) {

    class PriceView extends BaseView {

        listTemplateContent = `{{#if isNotEmpty}}<span title="{{string}}">{{string}}</span>{{/if}}`

        getAttributeList() {
            return [
                'discount',
                'surcharge',
                'roundingMethod',
                'roundingFactor',
                'basedOn',
            ];
        }

        data() {
            const discount = this.model.get('discount');
            const surcharge = this.model.get('surcharge');
            const basedOn = this.model.get('basedOn');

            const isNotEmpty = discount != null && discount !== 0.0 || surcharge;

            let string = '';

            if (basedOn !== 'Unit') {
                string += this.getLanguage().translateOption(basedOn, 'basedOnShort', 'PriceRule');
            }

            if (discount != null) {
                const sign = discount > 0 ? '-' : '+';
                const value = this.getNumberUtil().formatFloat(Math.abs(discount));

                string += ` ${sign}${value}%`;
            }

            if (surcharge != null && surcharge !== 0.0) {
                const sign = surcharge > 0 ? '+' : '-';
                const value = this.getNumberUtil().formatFloat(Math.abs(surcharge));

                string += ` ${sign} ${value}`;
            }

            return {
                isNotEmpty: isNotEmpty,
                string: string.trim(),
            };
        }
    }

    return PriceView;
});
