define('nurds:controllers/nurdsprofile', ['controllers/record', 'nurds:models/nurdsprofile'], function (Dep, NurdsProfile) {

    return Dep.extend({

        defaultAction: 'own',

        getModel: function (callback, context) {
            var model = new NurdsProfile();

            model.settings = this.getConfig();
            model.defs = this.getMetadata().get('entityDefs.NurdsProfile');

            if (callback) {
                callback.call(this, model);
            }

            return new Promise(function (resolve) {
                resolve(model);
            });
        },

        checkAccess: function (action) {
            return true;
        },

        actionOwn: function () {
            this.actionEdit({id: this.getUser().id});
        },

        actionList: function () {
            // Empty list action
        }

    });

});