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
 * License ID: 96ea385d4e0a9d0ba460925d713d8f63
 ************************************************************************************/

define('google:views/google/panels/google-contacts', 'view', function (Dep) {

    return Dep.extend({

        template: 'google:google/panel',

        productName: 'googleContacts',

        fieldList: [
            'contactsGroups',
        ],

        contactsGroupList: [],

        isBlocked: true,

        fields: {
            contactsGroups: {
                type: 'linkMultiple',
                view: 'google:views/google/fields/monitored-contacts-groups',
            },
        },

        data: function () {
            return {
                integration: this.integration,
                helpText: this.helpText,
                isActive: this.model.get(this.productName + 'Enabled') || false,
                isBlocked: this.isBlocked,
                fields: this.fieldList,
                hasFields: this.fieldList.length > 0,
                name: this.productName,
            };
        },

        setup: function () {
            this.model = this.options.model;

            this.id = this.options.id;

            this.model.defs.fields = $.extend(this.model.defs.fields, this.fields);

            this.model.populateDefaults();

            this.fieldList = [];

            for (let i in this.fields) {
                this.createFieldView(
                    this.fields[i].type,
                    this.fields[i].view || null,
                    i,
                    false,
                    this.fields[i].params
                );
            }
        },

        createFieldView: function (type, view, name, readOnly, params) {
            var fieldView = view || this.getFieldManager().getViewName(type);

            this.createView(name, fieldView, {
                model: this.model,
                el: this.options.el + ' .field-' + name,
                defs: {
                    name: name,
                    params: params
                },
                mode: readOnly ? 'detail' : 'edit',
                readOnly: readOnly,
            });

            this.fieldList.push(name);
        },

        loadGroups: function () {
            Espo.Ajax.getRequest('GoogleContacts/action/usersContactsGroups')
                .then(groups => {
                    this.model.contactsGroupList = groups;

                    if (this.isBlocked) {
                        this.isBlocked = false;
                        this._parentView.reRender();
                    }
                })
                .catch(xhr => {
                    xhr.errorIsHandled = true;

                    if (!this.isBlocked) {
                        this.isBlocked = true;
                        this.model.set(this.productName+'Enabled', false);
                        this._parentView.reRender();
                    }
                })
        },

        afterRender: function () {

        },

        setConnected: function () {
            this.loadGroups();
        },

        setNotConnected: function () {

        },

        hideField: function (field) {
             this.$el.find('.cell-' + field).addClass('hidden');
        },

        showField: function (field) {
             this.$el.find('.cell-' + field).removeClass('hidden');
        },

        validate: function () {
            var notValid = false;

            this.fieldList.forEach(function (field) {
                notValid = this.getView(field).validate() || notValid;
            }, this);

            var contactsGroupsIds = this.model.get('contactsGroupsIds') || [];

            if (contactsGroupsIds.length > 1) {
                var msg = this.translate('onlyOneGroupAllowed', 'messages', 'GoogleContacts');

                var contactsGroupsView = this.getView('contactsGroups');

                contactsGroupsView.showValidationMessage(msg);

                notValid = true;
            }

            return notValid;
        },
    });
});
