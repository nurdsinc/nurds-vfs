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

define('advanced:views/workflow/fields/scheduling', ['views/fields/varchar'], function (Dep) {

    let noCronstrue = false;

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            if (this.isEditMode() || this.isDetailMode()) {
                this.wait(this.loadCronstrue());
            }
        },

        loadCronstrue: function () {
            if (noCronstrue) {
                this.Cronstrue = null;

                return Promise.resolve();
            }

            return new Promise(resolve => {
                Espo.loader.requirePromise('lib!cronstrue')
                    .then(Cronstrue => {
                        this.Cronstrue = Cronstrue;

                        this.listenTo(this.model, 'change:' + this.name, () => this.showText());

                        resolve();
                    })
                    .catch(() => {
                        noCronstrue = true;
                        this.Cronstrue = null;

                        resolve();
                    });
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.isEditMode() || this.isDetailMode()) {
                let $text = this.$text = $('<div class="small text-success"/>');

                this.$el.append($text);
                this.showText();
            }
        },

        showText: function () {
            if (!this.$text || !this.$text.length) {
                return;
            }

            if (!this.Cronstrue) {
                return;
            }

            const exp = this.model.get(this.name);

            if (!exp) {
                this.$text.text('');

                return;
            }

            if (exp === '* * * * *') {
                this.$text.text(this.translate('As often as possible', 'labels', 'ScheduledJob'));

                return;
            }

            let locale = 'en';
            const localeList = Object.keys(this.Cronstrue.default.locales);
            const language = this.getLanguage().name;

            let text;

            if (localeList.includes(language)) {
                locale = language;
            }
            else if (localeList.includes(language.split('_')[0])) {
                locale = language.split('_')[0];
            }

            try {
                text = this.Cronstrue.toString(exp, {
                    use24HourTimeFormat: !this.getDateTime().hasMeridian(),
                    locale: locale,
                });

            }
            catch (e) {
                text = this.translate('Not valid');
            }

            this.$text.text(text);
        },
    });
});
