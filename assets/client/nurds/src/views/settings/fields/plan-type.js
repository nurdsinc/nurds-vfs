define('nurds:views/settings/fields/plan-type', ['views/fields/enum'], function (Dep) {

    return Dep.extend({

        setupOptions: function () {
            if (this.getUser().isSuperAdmin()) {
                this.params.options = this.getMetadata().get(['app', 'planTypes', 'plans']) || [];
            } else {
                this.params.options = [];
            }
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.$el.find('label').text(this.translate('planType', 'labels', 'Settings'));
        },

        translate: function (key, scope, module) {
            return this.getLanguage().translate(key, scope, module);
        }
    });
});