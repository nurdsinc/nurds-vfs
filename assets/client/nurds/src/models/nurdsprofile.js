define('nurds:models/nurdsprofile', ['model'], function (Dep) {

    return Dep.extend({

        name: 'NurdsProfile',
        entityType: 'NurdsProfile',
        urlRoot: 'NurdsProfile',

        /**
         * Get dashlet options.
         *
         * @param {string} id A dashlet ID.
         * @returns {Object|null}
         */
        getDashletOptions: function (id) {
            var value = this.get('dashletsOptions') || {};
            return value[id] || null;
        },

        /**
         * Whether a user is portal.
         *
         * @returns {boolean}
         */
        isPortal: function () {
            return this.get('isPortalUser');
        }

    });

});