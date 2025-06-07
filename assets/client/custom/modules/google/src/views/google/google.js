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

define('google:views/google/google', ['views/external-account/oauth2', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'google:google/google',

        fields: {
            enabled: {
                type: 'bool'
            }
        },

        isConnected: false,

        activeProducts: [],

        events: {
            'click button[data-action="cancel"]': function () {
                this.getRouter().navigate('#ExternalAccount', {trigger: true});
            },
            'click button[data-action="save"]': function () {
                this.save();
            },
            'click [data-action="connect"]': function () {
                this.connect();
            },
            'click .disconnect-link > a': function () {
                this.disconnect();

                return false;
            },

            'change .enable-panel': function (e) {
                var panelName = $(e.currentTarget).attr('name').replace('Enabled','');
                this.togglePanel(panelName);
            }
        },

        data: function () {
            return {
                integration: this.integration,
                helpText: this.helpText,
                isConnected: this.isConnected,
                fields: this.fieldList,
                panels: this.activeProducts,
            };
        },

        setup: function () {
            this.integration = this.options.integration;
            this.id = this.options.id;
            this.helpText = false;

            if (this.getLanguage().has(this.integration, 'help', 'ExternalAccount')) {
                this.helpText = this.translate(this.integration, 'help', 'ExternalAccount');
            }

            this.fieldList = [];
            this.dataFieldList = [];
            this.activeProducts = [];

            this.fields =  {
                enabled: {
                    type: 'bool'
                }
            };

            this.model = new Model();
            this.model.id = this.id;
            this.model.name = 'ExternalAccount';
            this.model.urlRoot = 'ExternalAccount';

            this.model.defs = {};

            var products = this.getMetadata().get('integrations.Google.products');

            products = Espo.Utils.clone(products);

            var version = this.getConfig().get('version') || '';

            function cmp (a, b) {
                var pa = a.split('.');
                var pb = b.split('.');

                for (var i = 0; i < 3; i++) {
                    var na = Number(pa[i]);
                    var nb = Number(pb[i]);

                    if (na > nb) return 1;
                    if (nb > na) return -1;

                    if (!isNaN(na) && isNaN(nb)) return 1;
                    if (isNaN(na) && !isNaN(nb)) return -1;
                }

                return 0;
            };

            if (version === 'dev' || version === '@@version' || cmp(version, '5.9.2') >= 0) {
                this.noGmail = true;
            }

            this.wait(true);

            for (let key in products) {
                if (products[key]) {
                    var productScope = key.charAt(0).toUpperCase() + key.slice(1);

                    var isActive = this.getAcl().check(productScope);

                    if (isActive || productScope === 'Gmail') {
                        this.activeProducts.push(key);

                        var viewName = "google:views/google/panels/" +
                                Espo.Utils.camelCaseToHyphen(key.charAt(0).toUpperCase() + key.slice(1));

                        this.createView(key, viewName, {
                            el: '.panel-'+key,
                            id: this.id,
                            model: this.model,
                        }, function (view) {
                            this.fieldList.concat(view.fieldList);
                        }.bind(this));
                    }
                }
            }

            for (let i in this.activeProducts) {
                this.fields[this.activeProducts[i] + 'Enabled'] = {type:'bool', default:false};
            }

            this.model.defs.fields = this.fields;
            this.model.populateDefaults();

            for (let i in this.fields) {
                this.createFieldView(this.fields[i].type, this.fields[i].view || null, i, false);
            }

            this.listenToOnce(this.model, 'sync', () => {
                Espo.Ajax.getRequest('ExternalAccount/action/getOAuth2Info?id=' + this.id)
                    .then(response => {
                        this.clientId = response.clientId;
                        this.redirectUri = response.redirectUri;

                        if (response.isConnected) {
                            this.setConnected();
                        }

                        this.wait(false);
                    });
            });

            this.model.fetch();
        },

        afterRender: function () {
            if (!this.model.get('enabled')) {
                this.$el.find('.data-panel').addClass('hidden');
            }

            if (this.isConnected) {
                this.$el.find('.data-panel-connected').removeClass('hidden');
            }
            else {
                this.$el.find('.data-panel-connected').addClass('hidden');
            }

            for (var i in this.activeProducts) {
                if (!this.model.get(this.activeProducts[i] + "Enabled")) {
                    this.hidePanel(this.activeProducts[i]);
                }
            }

            if (this.skipGmail) {
                this.hideGmail();
            }

            this.listenTo(this.model, 'change:enabled', function () {
                if (this.model.get('enabled')) {
                    this.$el.find('.data-panel').removeClass('hidden');
                }
                else {
                    this.$el.find('.data-panel').addClass('hidden');
                }
            }, this);
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

        save: function () {
            this.fieldList.forEach(function (field) {
                if (field === 'gmailEnabled' && this.skipGmail) {
                    return;
                }

                var view = this.getView(field);

                if (view.el === undefined) {
                    this.model.unset(field);
                }
                else if (!view.readOnly) {
                    view.fetchToModel();
                }
            }, this);

            var notValid = false;

            if (this.model.get('enabled')) {

                this.fieldList.forEach(function (field) {
                    notValid = this.getView(field).validate() || notValid;
                }, this);
            }

            for (let key in this.activeProducts) {
                var product = this.activeProducts[key];

                if (this.model.get(product + 'Enabled')) {
                    try {
                        notValid |= this.getView(product).validate();
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }

            if (notValid) {
                this.notify('Not valid', 'error');

                return;
            }

            this.listenToOnce(this.model, 'sync', function () {
                this.notify('Saved', 'success');

                if (!this.model.get('enabled')) {
                    this.setNotConnected();
                }
            }, this);

            this.model.unset("accessToken");
            this.model.unset("refreshToken");
            this.model.unset("tokenType");

            this.notify('Saving...');
            this.model.save();
        },

        popup: function (options, callback) {
            options.windowName = options.windowName || 'ConnectWithOAuth';
            options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=400';
            options.callback = options.callback || function() {window.location.reload();};

            var self = this;

            var path = options.path;

            var arr = [];
            var params = (options.params || {});

            for (var name in params) {
                if (params[name]) {
                    arr.push(name + '=' + encodeURI(params[name]));
                }
            }
            path += '?' + arr.join('&');

            var parseUrl = function (str) {
                var code = null;
                var error = null;

                str = str.substr(str.indexOf('?') + 1, str.length);

                str.split('&').forEach(function (part) {
                    var arr = part.split('=');
                    var name = decodeURI(arr[0]);
                    var value = decodeURI(arr[1] || '');

                    if (name === 'code') {
                        code = value;
                    }

                    if (name === 'error') {
                        error = value;
                    }
                }, this);

                if (code) {
                    return {
                        code: code,
                    };
                } else if (error) {
                    return {
                        error: error,
                    };
                }
            };

            var popup = window.open(path, options.windowName, options.windowOptions);

            var interval = window.setInterval(function () {
                if (popup.closed) {
                    window.clearInterval(interval);
                }
                else {
                    var res = parseUrl(popup.location.href.toString());

                    if (res) {
                        callback.call(self, res);
                        popup.close();
                        window.clearInterval(interval);
                    }
                }
            }, 500);
        },

        connect: function () {
            this.notify('Please wait...');
            this.popup({
                path: this.getMetadata().get('integrations.' + this.integration + '.params.endpoint'),
                params: {
                    client_id: this.clientId,
                    redirect_uri: this.redirectUri,
                    scope: this.getMetadata().get('integrations.' + this.integration + '.params.scope'),
                    response_type: 'code',
                    access_type: 'offline',
                    approval_prompt: 'force',
                }
            }, function (res) {
                if (res.error) {
                    this.notify(false);

                    return;
                }

                if (res.code) {
                    this.$el.find('[data-action="connect"]').addClass('disabled');

                    Espo.Ajax
                        .postRequest('ExternalAccount/action/authorizationCode', {
                            id: this.id,
                            code: res.code,
                        })
                        .then(response => {
                            this.notify(false);

                            if (response === true) {
                                this.setConnected();
                            }
                            else {
                                this.setNotConnected();
                            }

                            this.$el.find('[data-action="connect"]').removeClass('disabled');
                        })
                        .catch(() => {
                            this.$el.find('[data-action="connect"]').removeClass('disabled');
                        });

                } else {
                    this.notify('Error occurred', 'error');
                }
            });
        },

        disconnect: function () {
            this.confirm(this.translate('disconnectConfirmation', 'messages', 'ExternalAccount'), function () {
                this.model.set("accessToken", null);
                this.model.set("refreshToken", null);
                this.model.set("tokenType", null);
                this.model.set("enabled", false);

                this.model.set('gmailEnabled', false); // for bc
                this.model.set('gmailEmailAddress', null); // for bc


                this.listenToOnce(this.model, 'sync', function () {
                this.notify('Saved', 'success');
                    this.setNotConnected();
                }, this);

                this.notify('Saving...');
                this.model.save();

            }, this);
        },

        setConnected: function () {
            this.isConnected = true;

            this.$el.find('[data-action="connect"]').addClass('hidden');;
            this.$el.find('.connected-label').removeClass('hidden');
            this.$el.find('.data-panel-connected').removeClass('hidden');
            this.$el.find('.disconnect-link').removeClass('hidden');

            var hasAnyPanel = false;

            if (!this.model.get('gmailEnabled') && this.noGmail) {
                delete this.activeProducts['gmail'];

                this.skipGmail = true;

                if (this.isRendered()) {
                    this.hideGmail();
                }
            }

            for (let key in this.activeProducts) {
                var product = this.activeProducts[key];
                var view = this.getView(product) || false;

                if (view) {
                    view.setConnected();
                }

                hasAnyPanel |= !view.isBlocked || false;
            }

            if (!hasAnyPanel) {
                this.$el.find('.no-panels').removeClass('hidden');
            } else {
                this.$el.find('.no-panels').addClass('hidden');
            }
        },

        setNotConnected: function () {
            this.isConnected = false;

            this.$el.find('[data-action="connect"]').removeClass('hidden');;
            this.$el.find('.connected-label').addClass('hidden');
            this.$el.find('.data-panel-connected').addClass('hidden');
            this.$el.find('.disconnect-link').addClass('hidden');

            for (let key in this.activeProducts) {
                var product = this.activeProducts[key];

                try{
                    this.getView(product).setNotConnected();
                }
                catch(err) {
                    // Handle error(s) here
                }
            }
        },

        hideGmail: function () {
            this.$el.find('.panel[data-panel-name="gmail"]').addClass('hidden');;
        },

        hideField: function (field) {
             this.$el.find('.cell-' + field).addClass('hidden');
        },

        showField: function (field) {
            this.$el.find('.cell-' + field).removeClass('hidden');
        },

        hidePanel: function (panel) {
            this.$el.find('.panel-' + panel + ' .panel-body').addClass('hidden');
        },

        showPanel: function (panel) {
            this.$el.find('.panel-' + panel + ' .panel-body').removeClass('hidden');
        },

        togglePanel: function (panel) {
            if (this.$el.find('.panel-' + panel + ' .panel-body').hasClass('hidden')) {
                this.showPanel(panel);
            } else {
                this.hidePanel(panel);
            }
        },
    });
});
