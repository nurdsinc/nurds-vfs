<?php
/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

include "../bootstrap.php";

use Espo\Core\Application;
use Espo\Core\Application\Runner\Params;
use Espo\Core\ApplicationRunners\EntryPoint;

$app = new Application();

$app->run(
    EntryPoint::class,
    Params::create()->with('entryPoint', 'oauthCallback')
);

##########################################################
# Nurds Custom Auth
##########################################################
?>

<script>
const params = new URLSearchParams(window.location.search);
let nurdsId = params.get('nurds-id');
// Sanitize and format the `nurdsId` value
if (nurdsId) {
    nurdsId = nurdsId
        .toLowerCase()                // Convert to lowercase
        .replace(/\s+/g, '_')         // Replace spaces with underscores
        .replace(/[^a-z0-9_-]/g, ''); // Remove characters that aren't letters, numbers, underscores, or hyphens
}

const code = params.get('code');
const state = params.get('state');

// Read the existing cookies into an object
const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    const [name, value] = cookie.split("=");
    acc[name] = value;
    return acc;
}, {});

const oidcNonce = cookies["oidcNonce"] || null;
const oidcState = cookies["oidcState"] || null;

// Check if all required parameters and cookies are present
if (nurdsId && code && state) {
    // Verify nonce and state
    if (state !== oidcState || !oidcNonce) {
        console.error("Nonce or State mismatch.");
        // Redirect with error
        window.location.href = "/?error=NonceMismatch";
    }

    // If verification passes, set the cookies
    const expires = new Date(Date.now() + 1 * 60 * 1000).toUTCString(); // Expires in 1 minute
    document.cookie = `nurds-oauth-code=${code}; expires=${expires}; path=/; secure; samesite=lax`;
    document.cookie = `nurds-id=${nurdsId}; path=/; secure; samesite=lax`;

    // Redirect to homepage or another route
    window.location.href = "/";
} else {
    console.error("Missing 'nurds-id', 'code', or 'state' in query parameters.");
    // Optionally handle this case (e.g., log or redirect with an error)
    window.location.href = "/?error=MissingParameters";
}

</script>
<?php
##########################################################
# END Nurds Custom Auth
##########################################################
