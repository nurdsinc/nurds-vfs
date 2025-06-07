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

define('sales:views/quote-item/record/list-union', ['views/record/list'], function (Dep) {

    return class extends Dep {

        setup() {
            this.listLayout = [
                {
                    name: 'name',
                    notSortable: true,
                    view: 'sales:views/quote-item/fields/union-name',
                },
                {
                    name: 'parentType',
                    notSortable: true,
                    noLabel: true,
                    width: 24,
                    view: 'sales:views/quote-item/fields/union-entity-type',
                },
                {
                    name: 'status',
                    notSortable: true,
                    width: 18,
                    customLabel: this.translate('status', 'fields', 'Quote'),
                    view: 'sales:views/quote-item/fields/union-status',
                },
                {
                    name: 'quantity',
                    notSortable: true,
                    width: 12,
                },
                {
                    name: 'createdAt',
                    notSortable: true,
                    width: 14,
                    view: 'views/fields/datetime-short',
                    customLabel: this.translate('Created'),
                },
            ];

            // Cancel the default handler.
            this.addHandler('click', 'a.link', e => e.stopPropagation());

            super.setup();
        }

        // noinspection JSUnusedGlobalSymbols
        actionQuickView(data) {
            const model = this.collection.get(data.id);

            const entityType = model.get('_scope') || model.get('_entityType');
            const parentType = entityType.slice(0, -4);
            const id = model.get(Espo.Utils.lowerCaseFirst(parentType) + 'Id');

            super.actionQuickView({
                id: id,
                scope: parentType,
            });
        }
    }
});
