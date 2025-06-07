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

define('advanced:views/report/detail', 'views/detail', function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            var version = this.getConfig().get('version') || '';
            var arr = version.split('.');

            if (
                version === 'dev' || arr.length > 2 && parseInt(arr[0]) * 100 + parseInt(arr[1]) >= 506 ||
                version === '@@version'
            ) {
                var iconHtml;
                if (~['Grid', 'JointGrid'].indexOf(this.model.get('type'))) {
                    iconHtml = '<span class="fas fa-chart-bar"></span> ';
                } else {
                    iconHtml = '';
                }

                this.addMenuItem('buttons', {
                    action: 'show',
                    link: '#Report/show/' + this.model.id,
                    html: iconHtml + this.translate('Results View', 'labels', 'Report'),
                });
            }
        },

        actionShow: function () {
            var options = {
                id: this.model.id,
                model: this.model
            };

            var rootUrl = this.options.rootUrl || this.options.params.rootUrl;
            if (rootUrl) {
                options.rootUrl = rootUrl;
            }

            this.getRouter().navigate('#Report/show/' + this.model.id, {trigger: false});
            this.getRouter().dispatch('Report', 'show', options);
        },

    });
});
