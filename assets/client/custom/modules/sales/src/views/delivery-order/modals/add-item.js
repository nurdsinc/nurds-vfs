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

define('sales:views/delivery-order/modals/add-item', ['views/modal'], function (ModalView) {

    class AddItemModalView extends ModalView {

        backdrop = true

        // language=Handlebars
        templateContent = `
            {{#if itemList}}
                <ul class="list-group list-group-panel array-add-list-group no-side-margin">
                    {{#each itemList}}
                        <li class="list-group-item clearfix" data-name="{{id}}">
                            <input
                                class="cell form-checkbox form-checkbox-small"
                                type="checkbox"
                                data-id="{{id}}"
                            >
                            <a
                                role="button"
                                tabindex="0"
                                class="add text-bold"
                                data-id="{{id}}"
                            >{{name}}</a>
                        </li>
                    {{/each}}
                </ul>
            {{else}}
                {{translate 'No Data'}}
            {{/if}}
        `

        data() {
            return {
                itemList: this.dataItemList,
            };
        }

        setup() {
            this.addHandler('click', 'a.add', (e, target) => this.handleAdd(target));
            this.addHandler('click', 'input[type="checkbox"]', (e, target) => this.handleCheck(target));

            this.dataItemList = this.options.dataItemList;

            this.checkedList = [];

            this.headerText = this.translate('Add Item', 'labels', 'Quote');

            this.buttonList = [
                {
                    name: 'add',
                    label: 'Add',
                    style: 'primary',
                    disabled: true,
                    onClick: () => this.actionAdd(),
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                    onClick: () => this.close(),
                },
            ];
        }

        actionAdd() {
            this.trigger('add', this.checkedList);
        }

        handleCheck(target) {
            const id = target.getAttribute('data-id');

            if (target.checked) {
                this.checkedList.push(id);
            }
            else {
                const index = this.checkedList.indexOf(id);

                if (index !== -1) {
                    this.checkedList.splice(index, 1);
                }
            }

            this.checkedList.length ?
                this.enableButton('add') :
                this.disableButton('add');
        }

        handleAdd(target) {
            const id = target.getAttribute('data-id');

            this.trigger('add', [id]);
        }
    }

    return AddItemModalView;
});
