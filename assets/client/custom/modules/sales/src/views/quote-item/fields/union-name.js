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

define('sales:views/quote-item/fields/union-name', ['views/fields/varchar'], function (Dep) {

    return class extends Dep {

        // noinspection JSUnusedGlobalSymbols
        listTemplateContent = `
            <a
                href="#{{entityType}}/view/{{id}}"
                class="link"
                data-id="{{itemId}}"
                title="{{name}}"
            >
            {{#if hasName}}
                {{name}}
            {{else}}
                {{translate 'None'}}
            {{/if}}
            </a>
        `

        data() {
            const entityType = this.model.get('_entityType') ||
                this.model.get('_scope') || 'DummyItem';

            const parentType = entityType.slice(0, -4);

            const id = this.model.get(Espo.Utils.lowerCaseFirst(parentType) + 'Id');
            const name = this.model.get('name');

            return {
                entityType: parentType,
                name: name,
                hasName: name !== undefined && name !== null,
                id: id,
                itemId: this.model.id,
            };
        }
    }
});
