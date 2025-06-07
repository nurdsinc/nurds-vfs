define('nurds:handlers/login/oidc', ['handlers/login', 'js-base64'], function (LoginHandler, Base64) {
    /**
     * OIDC Login Handler
     * Extends the LoginHandler to implement custom OIDC login handling.
     */
    class OidcLoginHandler extends LoginHandler {
        /**
         * Handles the OIDC login process.
         * Called on 'Sign in' button click.
         * @override
         * @return {Promise<Object.<string, string>>} Resolved with headers to be sent to the `App/user` endpoint.
         */
        process() {
            return new Promise((resolve, reject) => {
                Espo.Ajax.getRequest('Oidc/authorizationData')
                    .then(data => {
                        const state = (Math.random() + 1).toString(36).substring(4);
                        const nonce = (Math.random() + 1).toString(36).substring(4);

                        // Store state and nonce in a cookie without `Secure` and `HttpOnly` flags for now
                        document.cookie = `oidcState=${state}; path=/`;
                        document.cookie = `oidcNonce=${nonce}; path=/`;
                        
                        //Changing the redirectUri to be the current URL you are on.
                        // Get the current URL components
                        const currentUrl = window.location;
                        const host = currentUrl.host; 

                        // Construct the redirect URI using the current protocol and host
                        const redirectUri = `https://${host}/oauth-callback.php`;
                        const params = {
                            client_id: data.clientId,
                            redirect_uri: redirectUri,
                            response_type: 'code',
                            scope: data.scopes.join(' '),
                            state: state,
                            nonce: nonce,
                            prompt: data.prompt,
                        };

                        if (data.maxAge || data.maxAge === 0) {
                            params.max_age = data.maxAge;
                        }

                        if (data.claims) {
                            params.claims = data.claims;
                        }

                        const url = `${data.endpoint}?${Object.entries(params)
                            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                            .join('&')}`;

                        // Redirect the user to the constructed URL
                        window.location.href = url;

                        // Resolve to prevent errors if the redirect fails
                        resolve();
                    })
                    .catch(error => {
                        Espo.Ui.error('Failed to retrieve authorization data.');
                        reject(error);
                    });
            });
        }
    }

    return OidcLoginHandler;
});