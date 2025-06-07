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

define('sales:views/price-rule/fields/percentage', ['views/fields/base', 'model'], function (BaseView, Model) {

    /**
     * @extends import('views/fields/base').default
     */
    class PercentageView extends BaseView {

        // noinspection JSUnusedGlobalSymbols
        listTemplateContent = `{{#if isNotEmpty}}<span title="{{markup}}%">{{type}} {{absolute}}%</span>{{/if}}`

        // language=Handlebars
        detailTemplateContent = `
            {{#if isNotEmpty}}
                <span title="{{markup}}%">{{type}} {{absolute}}%</span>
            {{else}}
                {{#if valueIsSet}}
                    <span class="none-value">{{translate 'None'}}</span>
                {{else}}
                    <span class="loading-value"></span>
                {{/if}}
            {{/if}}
        `
        // language=Handlebars
        editTemplateContent = `
            <div class="row">
                <div data-name="type" class="col-sm-12">{{{typeField}}}</div>
                <div class="col-sm-12 input-group">
                    <span data-name="value" class="input-group-item radius-left">{{{valueField}}}</span>
                    <span class="input-group-addon radius-right">%</span>
                </div>
            </div>
        `

        data() {
            const discount = this.model.get('discount');

            const isMarkup = discount < 0;
            const type = isMarkup ? 'Markup' : 'Discount';

            const value = - (discount || 0.0);
            const absoluteValue = Math.abs(value);
            const sign = (value > 0 ? '+' : '-');

            const absoluteValueString = this.getNumberUtil().formatFloat(absoluteValue);

            return {
                valueIsSet: this.model.has('discount'),
                isNotEmpty: this.model.get('discount') !== null,
                type: this.getLanguage().translateOption(type, 'percentageType', 'PriceRule'),
                absolute: absoluteValueString,
                markup: sign + absoluteValueString,
            };
        }

        getAttributeList() {
            return ['discount'];
        }

        setup() {
            super.setup();

            if (this.isDetailMode() || this.isEditMode()) {
                this.setupSubModel();
            }
        }

        // noinspection JSUnusedGlobalSymbols
        afterRenderEdit() {
            const element = /** @type {Element} */this.element;

            if (element) {
                const inputElement = element.querySelector('input[data-name="value"]');

                if (inputElement) {
                    inputElement.classList.add('radius-left');
                }
            }
        }

        setupSubModel() {
            this.subModel = new Model();
            this.subModel.setDefs({
                fields: {
                    type: {
                        type: 'enum',
                        options: ['Discount', 'Markup'],
                        translation: 'PriceRule.options.percentageType',
                    },
                    value: {
                        type: 'float',
                        min: 0.0,
                        required: this.model.getFieldParam('discount', 'required'),
                    },
                }
            });

            this.syncModels();

            this.listenTo(this.model, 'change:discount', (m, v, o) => {
                if (o.ui) {
                    return;
                }

                this.syncModels();
            });

            this.listenTo(this.subModel, 'change', (m, o) => {
                if (!o.ui) {
                    return;
                }

                this.trigger('change');
            });
        }

        syncModels() {
            let value = this.model.get('discount');

            this.subModel.set({
                value: value !== null ? Math.abs(value) : null,
                type: value < 0 ? 'Markup' : 'Discount',
            });
        }

        prepare() {
            if (!this.isEditMode()) {
                return undefined;
            }

            const p1 = this.createView('typeField', 'views/fields/enum', {
                name: 'type',
                model: this.subModel,
                mode: 'edit',
                selector: '[data-name="type"]',
                labelText: this.translate('percentage', 'fields', 'PriceRule'),
            });

            const p2 = this.createView('valueField', 'views/fields/float', {
                name: 'value',
                model: this.subModel,
                mode: 'edit',
                selector: '[data-name="value"]',
                labelText: this.translate('percentage', 'fields', 'PriceRule'),
            });

            return Promise.all([p1, p2]);
        }

        /**
         * @return {import('views/fields/base').default}
         */
        getTypeView() {
            return this.getView('typeField');
        }

        /**
         * @return {import('views/fields/base').default}
         */
        getValueView() {
            return this.getView('valueField');
        }

        fetch() {
            this.getTypeView().fetchToModel();
            this.getValueView().fetchToModel();

            const type = this.subModel.get('type');
            let value = this.subModel.get('value');

            if (type === 'Markup' && value !== null) {
                value = -value;
            }

            return {
                discount: value,
            };
        }

        validate() {
            const v1 = this.getTypeView().validate();
            const v2 = this.getValueView().validate();

            return v1 || v2;
        }

        validateRequired() {
            if (this.model.get('discount') || !this.isRequired()) {
                return false;
            }

            const msg = this.translate('fieldIsRequired', 'messages')
                .replace('{field}', this.translate('percentage', 'fields', this.entityType));

            this.getValueView().showValidationMessage(msg);

            return true;
        }
    }

    return PercentageView;
});
