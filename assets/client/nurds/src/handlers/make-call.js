define('nurds:handlers/make-call', ['underscore', 'bullbone', 'view', 'views/modal'], function (_, Bullbone, Dep) {
    /**
     * @module nurds:handlers/make-call
     */

    /**
     * @class
     * @name Class
     * @memberOf module:nurds:handlers/make-call
     */
    const Handler = function (view) {
        /** @type {module:views/detail.Class} */
        this.view = view;
    };

    _.extend(Handler.prototype, /** @lends module:nurds:handlers/make-call.Class# */ {

        process: function () {
            console.log("✅ Nurds PBX Handler Initialized");

            // Attach global click event for phone numbers
            $(document)
                .off('click', 'a[data-action="dial"], a[href^="tel:"]') // 🔥 Remove previous event bindings
                .on('click', 'a[data-action="dial"], a[href^="tel:"]', this.actionDialPopUp.bind(this)); // ✅ Reattach only once
        },

        actionDialPopUp: function (event) {
            event.preventDefault(); // Prevent default phone dialer

            let phoneNumber = $(event.currentTarget).attr('href') || $(event.currentTarget).data('phone-number');

            if (!phoneNumber) {
                console.warn("⚠️ No phone number found for dialing action.");
                return;
            }

            phoneNumber = phoneNumber.replace(/^tel:/, ''); // Extract phone number

            console.log("📞 Dial Click Detected: ", phoneNumber);

            // Ensure `this.viewList` exists before calling `createView`
            if (!this.view.viewList) {
                this.view.viewList = {};
            }

            var actionData = {
                "phoneNumber": phoneNumber,
                "line": "+14048000815",
                "entityName": this.view.model ? this.view.model.get('name') : 'Unknown',
                "entityId": this.view.model ? this.view.model.id : 'Unknown'
            };
            
            this.view.createView('callingPoPUpSelect', 'views/modal', {
                scope: this.view.scope,
                templateContent: `<select id="select-caller-id" data-name="select-caller-id" class="form-control main-element"><option value="${actionData.line}">${actionData.line}</option></select>`,
                headerText: 'Select Outbound Caller Id',
                backdrop: true,
                message: 'Select ',
                className: 'voip-select-number',
                data: actionData,
                buttonList: [{
                    name: 'call-multiple',
                    label: this.view.translate('Call')+ ': ' + actionData.phoneNumber,
                    style: 'danger',
                    onClick: function (dialog) {
                        let fromNumber = $('#select-caller-id').val();
                        let toPhoneNumber = $('#toPhoneNumber').val();
                        let toLine = $('#toLine').val();
                        let entityName = $('#toEntityName').val();
                        let entityId = $('#toEntityId').val();

                        let actionData = {
                            "phoneNumber": toPhoneNumber,
                            "line": toLine,
                            "entityName": entityName,
                            "entityId": entityId,
                            "fromNumber": fromNumber
                        };

                        console.log("📞 Making Call:", actionData);

                        $.ajax({
                            type: 'POST',
                            contentType: 'application/json',
                            timeout: 90000,
                            dataType: 'json',
                            url: 'VoipEvent/action/Dial',
                            data: JSON.stringify(actionData)
                        }).done(function () {
                            console.log("✅ Call initiated successfully.");
                        });

                        dialog.close();
                    }
                }, {
                    name: 'close',
                    label: this.view.translate('Close'),
                    onClick: function (dialog) {
                        dialog.close();
                    }
                }],
            }, function (view) {
                if (!view) {
                    console.error("❌ Failed to create `callingPoPUpSelect` view.");
                    return;
                }

                view.render();

                let toPhoneNumber = view.options.data.phoneNumber;
                let toLine = view.options.data.line;
                let entityName = view.options.data.entityName;
                let entityId = view.options.data.entityId;

                $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    timeout: 90000,
                    dataType: 'json',
                    url: 'VoipEvent/action/getUserCustomPhone',
                    data: JSON.stringify({ "phoneNumber": toPhoneNumber })
                }).done(function (data) {
                    let selectNums = data.map(item => `<option value="${item.phone}">${item.phone}</option>`).join('');
                    $('#select-caller-id').append(selectNums);
                });

                $('.voip-select-number .modal-body').append(`
                    <input type="hidden" id="toPhoneNumber" value="${toPhoneNumber}" />
                    <input type="hidden" id="toLine" value="${toLine}" />
                    <input type="hidden" id="toEntityName" value="${entityName}" />
                    <input type="hidden" id="toEntityId" value="${entityId}" />
                `);
            });
        }
    });

    _.extend(Handler.prototype, Backbone.Events);

    return Handler;
});