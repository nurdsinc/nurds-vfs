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

define('google:views/google/fields/labeled-array', 'views/fields/array', function (Dep) {

    return Dep.extend({


        data: function () {
            var itemHtmlList = [];
            (this.selected || []).forEach(function (value) {
                itemHtmlList.push(this.getItemHtml(value));
            }, this);

            return _.extend({
                selected: this.selected,
                translatedOptions: this.translatedOptions,
                hasOptions: this.params.options ? true : false,
                itemHtmlList: itemHtmlList
            }, Dep.prototype.data.call(this));
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            var t = {};
            var arr = this.params.options;
            for (key in arr) {
                var scope = this.params.options[key]
                 t[scope] = this.translate(scope, 'scopeNamesPlural', 'Global');
            }

            this.listenTo(this.model, 'change:' + this.name, function () {
                this.selected = Espo.Utils.clone(this.model.get(this.name));
            }, this);


            this.translatedOptions = null;

            var translatedOptions = {};
            if (this.params.options) {
                this.params.options.forEach(function (o) {
                    if (typeof t === 'object' && o in t) {
                        translatedOptions[o] = t[o];
                    } else {
                        translatedOptions[o] = o;
                    }
                }.bind(this));
                this.translatedOptions = translatedOptions;
            }
            this.selected = Espo.Utils.clone(this.model.get(this.name) || []);
            if (Object.prototype.toString.call(this.selected) !== '[object Array]') {
                this.selected = [];
            }
        },

        getItemHtml: function (value) {
            if (this.translatedOptions != null) {
                for (var item in this.translatedOptions) {
                    if (this.translatedOptions[item] == value) {
                        value = item;
                        break;
                    }
                }
            }

            var label = value;
            if (this.translatedOptions) {
                label = ((value in this.translatedOptions) ? this.translatedOptions [value]: value);
            }

            var  identLabel = this.model.get(value + 'IdentificationLabel');
            var identificationLabel = value.substring(0, 1);

            if (identLabel != null) {
                identificationLabel = identLabel;
            }

            let escapedValue = this.getHelper().escapeString(value);
            let escapedLabel= this.getHelper().escapeString(label);
            let escapedIdentificationLabel= this.getHelper().escapeString(identificationLabel);

            var html = '' +
            '<div class="list-group-item link-with-role form-inline" data-value="' + escapedValue + '">' +
                '<div class="pull-left" style="width: 92%; display: inline-block;">' +
                    '<input data-name="translatedValue" data-value="' + escapedValue + '" class="role form-control input-sm pull-right" value="'+escapedIdentificationLabel+'">' +
                    '<div>' + escapedLabel + '</div>' +
                '</div>' +
                '<div style="width: 8%; display: inline-block; vertical-align: top;">' +
                    '<a role="button" class="pull-right" data-value="' + escapedValue + '" data-action="removeValue"><span class="fas fa-times"></a>' +
                '</div><br style="clear: both;" />' +
            '</div>';

            return html;
        },

        fetch: function () {
            var data = {};
            data[this.name] = Espo.Utils.clone(this.selected || []);
            for (key in data[this.name]){
                var scope = data[this.name][key];
                data[scope+ 'IdentificationLabel'] = this.$el.find('.list-group .list-group-item input[data-name="translatedValue"][data-value="' + scope + '"]').val();
            }
            //hack
            data['calendarEnabled'] = true;
            //end Hack
            return data;
        },

        validateRequired: function () {
            if (this.params.required || this.model.isRequired(this.name)) {
                var value = this.model.get(this.name);
                if (!value || value.length == 0) {
                    var msg = this.translate('fieldIsRequired', 'messages').replace('{field}', this.translate(this.name, 'fields', this.model.name));
                    this.showValidationMessage(msg,'.link-container');
                    return true;
                }
                //only one could be without identification label

            }
            //
            var hasEmptyIdentLabel = false;
            for (key in value) {
                var label = this.model.get(value[key] + 'IdentificationLabel');
                if (label == null || label == '') {
                    if (hasEmptyIdentLabel) {
                        var msg = this.translate('fieldLabelIsRequired', 'messages','GoogleCalendar').replace('{field}', this.translate(this.name, 'fields', this.model.name));
                        this.showValidationMessage(msg, '[data-name="translatedValue"]:last');
                        return true;
                    }
                    hasEmptyIdentLabel = true;

                }
            }

            return false;
        },

    });
});
