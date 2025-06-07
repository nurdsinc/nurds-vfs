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

define('advanced:views/workflow/action-modals/execute-formula',
    ['advanced:views/workflow/action-modals/base', 'model'], function (Dep, Model) {

    return Dep.extend({

        template: 'advanced:workflow/action-modals/execute-formula',

        setup: function () {
            Dep.prototype.setup.call(this);

            var model = new Model;

            model.set('formula', this.actionData.formula || null);

            this.createView('formula', 'views/fields/formula', {
                name: 'formula',
                model: model,
                mode: this.readOnly ? 'detail' : 'edit',
                height: 200,
                el: this.getSelector() + ' .field[data-name="formula"]',
                inlineEditDisabled: true,
                targetEntityType: this.entityType,
            });
        },

        fetch: function () {
            var formulaView = this.getView('formula');

            this.actionData.formula = formulaView.fetch().formula;

            return true;
        },

    });
});
