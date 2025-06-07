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

define('advanced:controllers/report', ['controllers/record'], function (Dep) {

    return Dep.extend({

        create: function (options) {
            options = options || {};

            var hasAttributes = !!options.attributes;

            options.attributes = options.attributes || {};

            if ('type' in options) {
                options.attributes.type = options.type;
            } else if (!options.attributes.type) {
                options.attributes.type = 'Grid';
            }

            if ('entityType' in options) {
                options.attributes.entityType = options.entityType;
            } else {
                if (!hasAttributes && options.attributes.type !== 'JointGrid') {
                    throw new Espo.Exceptions.NotFound();
                }
            }

            if ('categoryId' in options) {
                options.attributes.categoryId = options.categoryId;
            }

            if ('categoryName' in options) {
                options.attributes.categoryName = options.categoryName;
            }

            Dep.prototype.create.call(this, options);
        },

        actionShow: function (options) {
            var id = options.id;

            if (!id) {
                throw new Espo.Exceptions.NotFound("No report id.");
            }

            var createView = model =>{
                var view = this.getViewName('result');

                this.main(view, {
                    scope: this.name,
                    model: model,
                    returnUrl: options.returnUrl,
                    returnDispatchParams: options.returnDispatchParams,
                    params: options,
                });
            };

            var model = options.model;

            if (model && model.id && model.get('type') && model.get('groupBy')) {
                createView(model);

                this.showLoadingNotification();

                model.fetch().then(() => {
                    this.hideLoadingNotification();
                });

                this.listenToOnce(this.baseController, 'action', () => {
                    model.abortLastFetch();
                });

                return;
            }

            this.getModel().then(model =>{
                model.id = id;

                this.showLoadingNotification();

                model.fetch({main: true}).then(() => {
                    createView(model);
                });

                this.listenToOnce(this.baseController, 'action', () => {
                    model.abortLastFetch();
                });
            });
        },
    });
});
