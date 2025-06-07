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
 * License ID: 666d14eca4fd54205a89f2a8f2b55ea2
 ************************************************************************************/

define('advanced:views/workflow/action-fields/add-field', ['view'], function (Dep) {

    return Dep.extend({

        templateContent: `
            <button
                class="btn btn-default radius-right"
                type="button"
                data-action="showAddField"
            >{{translate 'Add Field' scope='Workflow'}}</button>
        `,

        setup: function () {
            this.addActionHandler('showAddField', () => {
                const fieldList = this.options.fieldList.filter(it => !this.options.addedFieldList.includes(it))

               this.createView('modal', 'advanced:views/workflow/modals/add-field', {
                   fieldList: fieldList,
                   scope: this.options.scope,
               }).then(view => {
                    view.render();

                    this.listenToOnce(view, 'add', field => {
                        this.options.onAdd(field);
                    });
               });
            });
        },
    });
});
