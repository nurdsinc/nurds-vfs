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

define('google:views/inbound-email/panels/gmail', 'view', function (Dep) {

    return Dep.extend({

        template: 'google:inbound-email/panels/gmail',

        data: function () {
            var data = {};

            return data;
        },

        events: {
            'click [data-action="connect"]': 'actionConnect',
            'click [data-action="disconnect"]': 'actionDisconnect',
        },

        setup: function () {
            this.isLoaded = false;

            this.id = this.model.id;

            Espo.Ajax
                .postRequest('GoogleGmail/action/ping', {
                    id: this.id,
                    entityType: this.model.entityType,
                })
                .then(response =>  {
                    this.clientId = response.clientId;
                    this.redirectUri = response.redirectUri;

                    if (response.isConnected) {
                        this.setConnected();
                    } else {
                        this.setNotConnected();
                    }
                });
        },

        setConnected: function () {
            this.isLoaded = true;
            this.isConnected = true;

            this.reRender();
        },

        setNotConnected: function () {
            this.isLoaded = true;
            this.isConnected = false;

            this.reRender();
        },

        actionConnect: function () {
            this.popup({
                path: this.getMetadata().get(['integrations', 'Google', 'params', 'endpoint']),
                params: {
                    client_id: this.clientId,
                    redirect_uri: this.redirectUri,
                    scope: this.getMetadata().get(['integrations', 'Google', 'params', 'scopeGmail']),
                    response_type: 'code',
                    access_type: 'offline',
                    approval_prompt: 'force',
                }
            }, function (res) {
                if (res.error) {
                    Espo.Ui.notify(false);

                    return;
                }

                if (res.code) {
                    this.$el.find('[data-action="connect"]').addClass('disabled');

                    Espo.Ui.notify(this.translate('pleaseWait', 'messages'));

                    Espo.Ajax
                        .postRequest('GoogleGmail/action/connect', {
                            id: this.id,
                            code: res.code,
                            entityType: this.model.entityType,
                        })
                        .then(response => {
                            this.notify(false);

                            if (response === true) {
                                this.setConnected();
                            } else {
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

        actionDisconnect: function () {
            this.confirm(this.translate('disconnectConfirmation', 'messages', 'ExternalAccount'), () => {
                this.$el.find('[data-action="disconnect"]').addClass('disabled');
                this.$el.find('[data-action="connect"]').addClass('disabled');

                Espo.Ajax
                    .postRequest('GoogleGmail/action/disconnect', {
                        id: this.id,
                        entityType: this.model.entityType,
                    })
                    .then(() => {
                        this.setNotConnected();

                        this.$el.find('[data-action="disconnect"]').removeClass('disabled');
                        this.$el.find('[data-action="connect"]').removeClass('disabled');
                    })
                    .catch(() => {
                        this.$el.find('[data-action="disconnect"]').removeClass('disabled');
                        this.$el.find('[data-action="connect"]').removeClass('disabled');
                    });
            });
        },

        popup: function (options, callback) {
            options.windowName = options.windowName || 'ConnectWithOAuth';
            options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=600';
            options.callback = options.callback || function(){ window.location.reload(); };

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

                    if (name == 'code') {
                        code = value;
                    }
                    if (name == 'error') {
                        error = value;
                    }
                }, this);

                if (code) {
                    return {
                        code: code,
                    }
                } else if (error) {
                    return {
                        error: error,
                    }
                }
            }

            var popup = window.open(path, options.windowName, options.windowOptions);

            var interval = window.setInterval(function () {
                if (popup.closed) {
                    window.clearInterval(interval);
                } else {
                    var res = parseUrl(popup.location.href.toString());
                    if (res) {
                        callback.call(self, res);
                        popup.close();
                        window.clearInterval(interval);
                    }
                }
            }, 500);
        },

    });
});
