define('nurds:views/nurdsprofile/edit', ['views/edit'], function (Dep) {

    return Dep.extend({

        userName: '',

        setup: function () {
            Dep.prototype.setup.call(this);

            this.userName = this.model.get('name');
        },

        getHeader: function () {
            return this.buildHeaderHtml([
                $('<span>').text(this.translate('NurdsProfile')),
                $('<span>').text(this.userName),
            ]);
        },

        updatePageTitle: function () {
            let title = this.getLanguage().translate(this.scope, 'scopeNames');

            if (this.model.id !== this.getUser().id && this.userName) {
                title += ' · ' + this.userName;
            }

            this.setPageTitle(title);
        }

    });

});