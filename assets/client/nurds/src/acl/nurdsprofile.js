define('nurds:acl/nurdsprofile', ['acl'], function (Acl) {

    return Acl.extend({

        checkIsOwner: function (model) {
            return this.getUser().id === model.id;
        }

    });

});