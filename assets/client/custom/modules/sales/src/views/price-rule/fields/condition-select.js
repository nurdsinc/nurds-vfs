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

define('sales:views/price-rule/fields/condition-select', ['views/fields/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        detailTemplateContent: `
            {{#if valueIsSet}}
                {{#if id}}
                    {{name}}
                {{else}}
                    <span class="none-value">{{translate 'None'}}</span>
                {{/if}}
            {{else}}
                <span class="loading-value"></span>
            {{/if}}
        `,

        editTemplateContent: `<div class="enum">{{{enum}}}</div>`,

        validationElementSelector: '.selectize-control',

        data: function () {
            return {
                valueIsSet: this.model.has('conditionId'),
                id: this.model.get('conditionId'),
                name: this.model.get('conditionName') || this.model.get('conditionId'),
            };
        },

        getAttributeList: function () {
            return ['conditionId'];
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.setupOptions();

            this.enumModel = new Model();
            this.enumModel.setDefs({
                fields: {
                    value: {
                        type: 'enum',
                        options: this.enumOptions.map(it => it.id),
                    },
                },
            });

            this.enumModel.set('value', this.model.get('conditionId'));
        },

        prepare: function () {
            if (!this.isEditMode()) {
                return undefined;
            }

            return this.createView('enum', 'views/fields/enum', {
                name: 'value',
                model: this.enumModel,
                mode: 'edit',
                selector: '.enum',
                translatedOptions: this.enumOptions.reduce((p, it) => ({...p, [it.id]: it.name}), {}),
            });
        },

        afterRenderEdit: function () {
            if (this.loadedEnumOptions) {
                return;
            }

            this.getEnumOptions().then(items => {
                this.getEnumView().translatedOptions = items.reduce((p, it) => ({...p, [it.id]: it.name}), {});
                this.getEnumView().setOptionList(items.map(it => it.id));
            });
        },

        /**
         * @return {Promise<{id: string, name: string}[]>}
         */
        getEnumOptions: function () {
            if (this.loadedEnumOptions) {
                return Promise.resolve(this.loadedEnumOptions);
            }

            return Espo.Ajax.getRequest('PriceRuleCondition/list').then(items => {
                this.loadedEnumOptions = items;

                return items;
            });
        },

        validateRequired: function () {
            if (this.model.get('conditionId') || !this.isRequired()) {
                return false;
            }

            const msg = this.translate('fieldIsRequired', 'messages')
                .replace('{field}', this.translate('condition', 'fields', this.entityType));

            this.showValidationMessage(msg);

            return true;
        },

        setupOptions: function () {
            this.loadedEnumOptions = undefined;
            const options = [];

            const currentId = this.model.get('conditionId');

            if (currentId) {
                options.push({id: currentId, name: this.model.get('conditionName')});
            }

            this.enumOptions = options;
        },

        /**
         * @return {module:views/fields/base}
         */
        getEnumView() {
            return this.getView('enum');
        },

        fetch: function () {
            this.getEnumView().fetchToModel();

            const id = this.enumModel.get('value') || null;

            let name = id;

            if (id) {
                const options = this.loadedEnumOptions || this.enumOptions;

                name = (options.find(it => it.id === id) || {}).name || id;
            }

            return {
                conditionId: id,
                conditionName: name,
            };
        },
    });
});
