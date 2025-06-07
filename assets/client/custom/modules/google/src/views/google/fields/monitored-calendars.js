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

define('google:views/google/fields/monitored-calendars', ['views/fields/link-multiple'], function (Dep) {

    return Dep.extend({

        nameHashName: null,

        idsName: null,

        nameHash: null,

        events: {
            'click [data-action="selectLink"]': function () {
                var self = this;

                this.notify('Please wait...');

                this.createView('modal', 'google:views/google/modals/select-calendar', {
                    calendars: this.model.calendarList
                }, view => {
                    self.notify(false);
                    view.render();
                    self.listenToOnce(view, 'select', calendar => {
                        view.close();
                        self.addCalendar(calendar);
                    });
                });
            },
            'click [data-action="clearLink"]' : function (e) {
                this.clearLink(e);
            },
        },

        addCalendar: function (calendarId) {
            this.addLink(calendarId, this.model.calendarList[calendarId]);
        },

        /*afterRender: function () {
           this.$element = this.$el.find('input.main-element');
        },*/

        clearLink: function (e) {
            var id = $(e.currentTarget).data('id').toString();
            this.deleteLink(id);
        },

        setup: function () {
            this.nameHashName = this.name + 'Names';
            this.idsName = this.name + 'Ids';

            var self = this;

            this.ids = Espo.Utils.clone(this.model.get(this.idsName) || []);
            this.nameHash = Espo.Utils.clone(this.model.get(this.nameHashName) || {});

            this.listenTo(this.model, 'change:' + this.idsName, function () {
                this.ids = Espo.Utils.clone(this.model.get(this.idsName) || []);
                this.nameHash = Espo.Utils.clone(this.model.get(this.nameHashName) || {});
            }.bind(this));
        },

        afterRender: function () {
           this.renderLinks();
        },

        deleteLinkHtml: function (id) {
            var explodedId = id.split('@');
            var newId = explodedId[0].replace('.', '\\.');
            this.$el.find('.link-' + newId).remove();
        },

        addLinkHtml: function (id, name) {
            var conteiner = this.$el.find('.link-container');
            var explodedId = id.split('@');
            var $el = $('<div />').addClass('link-' + explodedId[0]).addClass('list-group-item');

            $el.html(name + '&nbsp');

            let escapedId = this.getHelper().escapeString(id);

            $el.append(
                '<a role="button" class="pull-right" data-id="' + escapedId + '" data-action="clearLink">' +
                '<span class="fas fa-times"></a>'
            );

            conteiner.append($el);

            return $el;
        },

        fetch: function () {
            var data = {};

            if (this.$el.is(':visible')) {
                data[this.idsName] = this.ids;
                data[this.nameHashName] = this.nameHash;
            } else {
                data[this.idsName] = null;
                data[this.nameHashName] = null;
            }

            if (Array.isArray(data[this.nameHashName])) {
                data[this.nameHashName] = null;
            }

            return data;
        },

         validateRequired: function () {
            if (this.$el.is(':visible') && this.model.isRequired(this.name)) {
                if (this.model.get(this.idsName).length === 0) {
                    var msg = this.translate('fieldIsRequired', 'messages')
                        .replace('{field}', this.translate(this.name, 'fields', this.model.name));

                    this.showValidationMessage(msg);

                    return true;
                }
            }
        },
    });
});
