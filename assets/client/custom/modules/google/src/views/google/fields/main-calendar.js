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

define('google:views/google/fields/main-calendar', ['views/fields/link'], function (Dep) {

    return Dep.extend({

        nameName: null,

        idName: null,

        data: function () {
            return _.extend({
                idName: this.idName,
                nameName: this.nameName,
                idValue: this.model.get(this.idName),
                nameValue: this.model.get(this.nameName),
            }, Dep.prototype.data.call(this));
        },

        events: {
            'click [data-action="selectLink"]': function () {
                var self = this;
                this.notify('Please wait...');

                this.createView('modal', 'google:views/google/modals/select-calendar', {
                    calendars: this.model.calendarList
                }, function (view) {
                    self.notify(false);
                    view.render();
                    self.listenToOnce(view, 'select', function (calendar){
                        view.close();
                        self.addCalendar(calendar);
                    });
                });
            } ,
            'click [data-action="clearLink"]' : function (e) {
                    this.clearLink(e);
                },
        },


        setup: function () {
            this.nameName = this.name + 'Name';
            this.idName = this.name + 'Id';
        },

        clearLink: function(e) {
            this.$elementName.val('');
            this.$elementId.val('');
            this.trigger('change');
        },

        afterRender: function () {
                this.$elementId = this.$el.find('input[name="' + this.idName + '"]');
                this.$elementName = this.$el.find('input[name="' + this.nameName + '"]');

                if (!this.$elementId.length) {
                    this.$elementId = this.$el.find('input[data-name="' + this.idName + '"]');
                }
                if (!this.$elementName.length) {
                    this.$elementName = this.$el.find('input[data-name="' + this.nameName + '"]');
                }

                this.$elementName.on('change', function () {
                    if (this.$elementName.val() === '') {
                        this.$elementName.val('');
                        this.$elementId.val('');
                        this.trigger('change');
                    }
                }.bind(this));
        },

        addCalendar: function (calendarId) {
            this.$elementName.val(this.model.calendarList[calendarId]);
            this.$elementId.val(calendarId);
            this.trigger('change');
        },

        fetch: function () {
            var data = {};
            if (this.$el.is(':visible')) {
                data[this.nameName] = this.$elementName.val() || null;
                data[this.idName] = this.$elementId.val() || null;
            } else {
                data[this.nameName] = null;
                data[this.idName] = null;
            }

            return data;
        },

        validateRequired: function () {
            if (this.$el.is(':visible') && (this.params.required || this.model.isRequired(this.name))) {
                if (this.model.get(this.idName) == null) {
                    var msg = this.translate('fieldIsRequired', 'messages')
                        .replace('{field}', this.translate(this.name, 'fields', this.model.name));

                    this.showValidationMessage(msg);

                    return true;
                }
            }
        },

    });
});
