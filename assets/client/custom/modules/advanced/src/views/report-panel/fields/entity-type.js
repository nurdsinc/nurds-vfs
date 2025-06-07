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

define('advanced:views/report-panel/fields/entity-type', ['views/fields/entity-type'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            var scopes = this.scopesMetadataDefs = this.getMetadata().get('scopes');

            this.params.options = Object.keys(scopes).filter(scope => {
                if (this.checkAvailability(scope)) {
                    return true;
                }
            });

            this.params.options.push('Team');

            this.params.options.sort((v1, v2) => {
                 return this.translate(v1, 'scopeNames').localeCompare(this.translate(v2, 'scopeNames'));
            });

            this.params.options.unshift('');
        }
    });
});
