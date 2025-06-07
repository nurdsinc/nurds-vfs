define('nurds:nurds-helper', ['models/user'], function (Dep) {
    
    function getRestrictedUrls(planType) {
        const plans = {
            free: [
                '#Workflow',
                '#Import',
                '#BpmnFlowchart',
                '#BpmnProcess',
                '#BpmnUserTask',
                '#Admin/portals',
                '#Admin/portalUsers',
                '#Admin/portalRoles',
                '#Admin/systemRequirements',
                '#Admin/extensions',
                '#Admin/upgrade',
                '#Admin/authentication',
                '#Admin/authLog',
                '#Admin/authTokens',
                '#Admin/jobsSettings',
                '#Admin/leadCapture',
                '#Admin/labelManager',
                '#ScheduledJob',
                '#Admin/jobs',
                '#Admin/apiUsers',
                '#ReportFilter',
                '#ReportPanel',
                '#Admin/sms',
                '#Admin/authenticationProviders',
                '#Admin/outboundEmails',
                '#ExternalAccount',
                '#Admin/integrations',
                '#Admin/layouts',
                '#Admin/layoutSets',
                '#Admin/templateManager',
                '#Admin/dashboardTemplates',
                '#Admin/import',
                '#Admin/entityManager',
                '#Admin/formulaSandbox'
            ],
            team: [
                '#Admin/integrations',
                '#Admin/outboundEmails',
                '#ExternalAccount',
            ],
            pro: [
                '#Admin/layouts',
                '#Admin/layoutSets',
                '#Admin/dashboardTemplates',
                '#Workflow',
                '#Import',
                '#Admin/import',
                '#Admin/formulaSandbox'
            ],
            enterprise: [
                '#Admin/apiUsers',
                '#Admin/entityManager',
                '#Admin/portals',
                '#Admin/portalUsers',
                '#Admin/portalRoles',
                '#BpmnFlowchart',
                '#BpmnProcess',
                '#BpmnUserTask',
                '#ReportFilter',
                '#ReportPanel',
                '#Admin/leadCapture',
                '#Admin/labelManager',
            ]
        };
    
        // Start with the Free plan's restricted URLs
        let restrictedUrls = [...plans.free];
    
        // Remove restrictions that are included in higher plans
        if (planType === 'enterprise') {
            restrictedUrls = restrictedUrls.filter(url => 
                !plans.enterprise.includes(url) &&
                !plans.pro.includes(url) &&
                !plans.team.includes(url)
            );
        } else if (planType === 'pro') {
            restrictedUrls = restrictedUrls.filter(url => 
                !plans.pro.includes(url) &&
                !plans.team.includes(url)
            );
        } else if (planType === 'team') {
            restrictedUrls = restrictedUrls.filter(url => 
                !plans.team.includes(url)
            );
        }
    
        // Call the function to update labels and set new hrefs only for plans lower than the required level
        updateLabelsBasedOnPlan(planType, restrictedUrls, plans);
    
        return restrictedUrls;
    }

    function removeSectionByTitle(title, planType) {
        const restrictedSections = getRestrictedUrls(planType);
        const h4Elements = document.querySelectorAll('.admin-tables-container h4');

        h4Elements.forEach((h4) => {
            if (h4.textContent.trim() === title) {
                const section = h4.closest('.admin-content-section');
                if (section) {
                    const trElements = section.querySelectorAll('tr.admin-content-row');

                    let shouldRemoveSection = true;

                    trElements.forEach((tr) => {
                        const aElement = tr.querySelector('a');
                        if (aElement && restrictedSections.includes(aElement.getAttribute('href'))) {
                            tr.remove();
                        } else {
                            shouldRemoveSection = false; // Don't remove the section if there's any non-restricted URL
                        }
                    });

                    if (shouldRemoveSection) {
                        section.remove();
                    }
                }
            }
        });
    }

    function removeRowsByText(texts, planType) {
        const restrictedSections = getRestrictedUrls(planType);
        const trElements = document.querySelectorAll('.admin-tables-container tr.admin-content-row');

        trElements.forEach((tr) => {
            const aElement = tr.querySelector('a');
            if (aElement && texts.includes(aElement.textContent.trim())) {
                if (restrictedSections.includes(aElement.getAttribute('href'))) {
                    tr.remove();
                }
            }
        });
    }

    function updateLabelsBasedOnPlan(currentPlan, restrictedUrls, plans) {
        const planOrder = ['free', 'team', 'pro', 'enterprise'];
    
        restrictedUrls.forEach((url) => {
            const labelElement = document.querySelector(`a[href="${url}"]`);
            
            if (labelElement) {
                let requiredPlan = '';
    
                // Determine the minimum plan that includes the feature
                if (plans.enterprise.includes(url)) {
                    requiredPlan = 'Enterprise';
                } else if (plans.pro.includes(url)) {
                    requiredPlan = 'Pro';
                } else if (plans.team.includes(url)) {
                    requiredPlan = 'Team';
                }
    
                // Only update the label if the current plan is lower than the required plan
                if (planOrder.indexOf(currentPlan) < planOrder.indexOf(requiredPlan.toLowerCase())) {
                    // Update the href attribute
                    labelElement.setAttribute('href', `https://nurds.com/${requiredPlan.toLowerCase()}`);
                    labelElement.setAttribute('target', '_blank'); // Opens in a new tab
                    
                    // Handle cases where the text might be inside a specific span
                    const fullLabelElement = labelElement.querySelector('.full-label');
                    if (fullLabelElement) {
                        fullLabelElement.textContent = fullLabelElement.textContent.trim() + ` (${requiredPlan}+)`;
                    } else {
                        // If .full-label doesn't exist, update the textContent directly within the <a> tag
                        labelElement.textContent = labelElement.textContent.trim() + ` (${requiredPlan}+)`;
                    }
                } else if (currentPlan === 'free') {
                    labelElement.closest('li, tr').remove(); // Remove the item entirely for the Free plan
                }
            }
        });
    }

    function checkAndRedirect(userType, planType) {
        const restrictedUrls = getRestrictedUrls(planType);
        if (userType !== 'super-admin' && restrictedUrls.includes(window.location.hash)) {
            window.location.href = '/';
            alert('You do not have access to this feature. (' + window.location.hash + ')');
        }
    }

    function initializeRemoval() {
        const authToken = localStorage.getItem('espo-user-auth');
        if (!authToken) {
            //console.error('Authorization token not found in local storage');
            return;
        }
  
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${authToken}`);

        const nurdsId = document.cookie.split('; ').find(row => row.startsWith('nurds-id='))?.split('=')[1] || sessionStorage.getItem('nurds-id');
        if (nurdsId) {
            headers.append('nurd-app-id', nurdsId);
        }

        //Check and see if usertype is already set if not then set it.
        if (window.userType === undefined || window.planType === undefined) {
            fetchUserAndApplyRemovals();
        } else {
            // Check for restricted URLs every 500ms
            const intervalId = setInterval(() => {
                // const planType = 'free'; // Fetch or define your planType here
                if (checkForRestrictedUrls(getRestrictedUrls(window.planType))) { 
                    clearInterval(intervalId); // Stop checking once a restricted element is found
                }
            }, 500);

            // Reapply removals on DOM content loaded
            document.addEventListener('DOMContentLoaded', () => applyRemovals(window.userType, window.planType));

            // Reapply removals on hash change
            window.addEventListener('hashchange', () => applyRemovals(window.userType, window.planType));

            // Use a mutation observer to watch for changes in the #Admin section
            const observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && location.hash === '#Admin') {
                        applyRemovals(window.userType, window.planType);
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }
        
        function applyRemovals(userType, planType) {
            if (userType !== 'super-admin') {
                if (location.hash === '#Admin') {
                    //removeSectionByTitle('Customization', planType);
                    //removeSectionByTitle('Workflows', planType);
                    //removeSectionByTitle('Misc', planType);
                    //removeSectionByTitle('Business Process Management', planType);
                    //removeSectionByTitle('Portal', planType);
                    removeRowsByText([
                        'System Requirements',
                        'Extensions',
                        'Upgrade',
                        'Authentication',
                        'Auth Log',
                        'Auth Tokens',
                        // 'Integrations',
                        'Job Settings',
                        // 'API Users',
                        // 'Report Filters',
                        // 'Report Panels',
                        'SMS',
                        'Authentication Providers',
                        // 'Entity Manager',
                        // 'Layout Manager',
                        'Scheduled Jobs',
                        // 'Outbound Emails',
                        // 'Import',
                        // 'Label Manager',
                        // 'Layout Sets',
                        // 'Lead Capture',
                        // 'Dashboard Templates',
                        'Jobs',
                        // 'Template Manager',
                        // 'Formula Sandbox',
                    ], planType);
                }
            } else {
                // console.log('User is a super admin. No sections or rows will be removed.');
            }
            checkAndRedirect(userType, planType);
        }

        function checkForRestrictedUrls(restrictedUrls) {
            for (const url of restrictedUrls) {
                const restrictedElement = document.querySelector(`a[href="${url}"]`);
                if (restrictedElement) {
                    // Apply removals immediately
                    fetchUserAndApplyRemovals();
                    return true; // Element found
                }
            }
            return false; // No restricted elements found
        }

        function fetchUserAndApplyRemovals() {
            if(window.userType === undefined || window.planType === undefined) {
                fetch('/api/v1/App/user', {
                    method: 'GET',
                    headers: headers,
                    credentials: 'include' // Ensures cookies are included in the request
                })
                .then(response => response.json())
                .then(data => {
                    const userType = (data.user.type).toLowerCase();
                    window.userType = userType;

                    fetch('/api/v1/Settings', {
                        method: 'GET',
                        headers: headers,
                        credentials: 'include'
                    })
                    .then(response => response.json())
                    .then(settingsData => {
                        const planType = (settingsData.planType || 'free').toLowerCase(); 
                        window.planType = planType;


                        // Apply removals immediately
                        applyRemovals(userType, planType);


                    })
                    .catch(error => {
                        //console.error('Error fetching settings data:', error);
                    });
                })
                .catch(error => console.error('Error fetching user data:', error));
            }
        }

    }

    function monitorAuthToken() {
        // Check for changes in the local storage
        window.addEventListener('storage', (event) => {
            if (event.key === 'espo-user-auth' && event.newValue) {
                // If auth token is added, reinitialize removal
                initializeRemoval();
            }
        });

        // Check for changes in cookies
        setInterval(() => {
            const authToken = localStorage.getItem('espo-user-auth');
            if (authToken && !document.cookie.includes('espo-user-auth')) {
                // If auth token is in local storage but not in cookies, reinitialize removal
                initializeRemoval();
            }
        }, 1000);
    }

    function addTextAfterLogo() {
        // Select the div with the class "navbar-logo-container"
        const navbarLogoContainer = document.querySelector(".side-menu-button");

        if (navbarLogoContainer) { 
            // Check if the next sibling is already the div we're planning to add
            if (!navbarLogoContainer.nextSibling || !navbarLogoContainer.nextSibling.classList?.contains("custom-div")) {
                
                // Function to get a cookie by name
                function getCookieValue(name) {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop().split(';').shift();
                    return null; // Return null if the cookie does not exist
                }
                
                // Create a new div element
                const newDiv = document.createElement("div");
                const nurdsId = getCookieValue("nurds-id").toUpperCase();

                // Add a class or content to the new div
                newDiv.className = "nurds-id";
                newDiv.textContent = `NID: ${nurdsId || "Unknown"}`;

                // Insert the new div after the navbar logo container
                navbarLogoContainer.insertAdjacentElement("afterend", newDiv);
            }
        } 

        // Update the height of the navbar-header
        const navbarHeader = document.querySelector('.navbar-header');
        
        if (navbarHeader) {
            // Only apply height change if the screen width matches the media query
            const updateHeight = () => {
                if (window.matchMedia('(min-width: 768px)').matches) {
                    navbarHeader.style.height = '75px';
                } 
                if (window.matchMedia('(max-width: 767px)').matches) {
                    //navbarHeader.style.height = '39px';
                } 
            };

            // Run the updateHeight function initially and on resize
            updateHeight();
            window.addEventListener('resize', updateHeight);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector(".navbar-header")) {
                //console.log(".navbar-header detected. Stopping observer.");
                addTextAfterLogo();
                obs.disconnect(); // Stop observing once `.navbar-header` is found
            }
        });
    
        observer.observe(document.body, {
            childList: true, // Observe direct child changes
            subtree: true,  // Observe all descendants
        });

        addTextAfterLogo();
        initializeRemoval();
        monitorAuthToken();
    });

    /* NURDS AUTH */
    function monitorCookie(name, callback, interval = 500) {
        const checkInterval = setInterval(() => {
            const cookies = document.cookie.split(';').map(cookie => cookie.trim());
            const targetCookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
    
            if (targetCookie) {
                clearInterval(checkInterval); // Stop monitoring
                const value = targetCookie.split('=')[1]; // Get the cookie's value
                callback(value);
            }
        }, interval);
    } 
    
    monitorCookie('nurds-oauth-code', (code) => {
        (async () => {
            document.body.innerHTML = '';

            // Read cookies
            const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
                const [name, value] = cookie.split("=");
                acc[name] = value;
                return acc;
            }, {});
            
            const nurdsId = cookies["nurds-id"] || null; // Replace "nurds-id" with the actual cookie name
            const state = cookies["oidcState"] || null;
            const nonce = cookies["oidcNonce"] || null;
    
            if (!nurdsId || !code) {
                console.error("Missing 'nurds-id' or 'nurds-oauth-code' in cookies.");
                return;
            }
    
            // Unset cookies by setting them to expire in the past
            document.cookie = "oidcState=; Max-Age=0; path=/";
            document.cookie = "oidcNonce=; Max-Age=0; path=/";
            document.cookie = "auth-token-secret=; Max-Age=0; path=/";
            document.cookie = "auth-token=; Max-Age=0; path=/";
            document.cookie = 'nurds-oauth-code=; Max-Age=0; path=/';

            // Validate state
            if (!state || state !== cookies["oidcState"]) {
                console.error("State mismatch or missing.");
                window.location.href = "/?error=state-mismatch";
                return;
            }
    
            const encodedAuth = btoa(`**oidc:${code}`);
            const headers = {
                "Espo-Authorization": encodedAuth,
                "Authorization": `Basic ${encodedAuth}`,
                "X-Oidc-Authorization-Nonce": nonce || "",
                "Espo-Authorization-By-Token": "false",
                "Espo-Authorization-Create-Token-Secret": "true",
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Nurds-App-Id": nurdsId || ""// Replace with your tenant value
            };
    
            const protocol = "https";
            const host = window.location.hostname;
            const basePath = "/api/v1";
            const endPoint = "/App/user";
            const url = `${protocol}://${host}${basePath}${endPoint}`;
    
            try {
                // Perform the GET request
                const response = await fetch(url, {
                    method: "GET",
                    headers: headers
                });
    
                // Extract headers and response body
                const responseHeaders = response.headers;
                const responseBody = await response.json();
    
                // Check for status code
                if (!response.ok) {
                    console.error("Request failed:", responseBody);
                    window.location.reload();
                    return;
                }
    
                // Handle `Set-Cookie` headers
                responseHeaders.forEach((value, key) => {
                    if (key.toLowerCase() === "set-cookie") {
                        document.cookie = value; // Automatically sets the cookie in the browser
                    }
                });
    
                // Extract token and save to `localStorage`
                const authToken = responseBody.user?.token || null;
                if (authToken) {
                    localStorage.setItem("espo-user-auth", btoa(`${responseBody.user.userName}:${authToken}`));
    
                    // Also set a cookie for `auth-token`
                    document.cookie = `auth-token=${authToken}; path=/; secure; httponly; samesite=Lax; max-age=${60 * 15}`;
                }
    
                //console.log("Response Body:", responseBody);
                
                Espo.Ui.success('Login Successful. Reloading now...');
                window.location.reload();
                
            } catch (error) {
                Espo.Ui.error('Error during request.', error);
                console.error("Error during request:", error);
                window.location.reload();
            }
        })();
           
    });
    /* END NURDS AUTH*/

    return {
        initializeRemoval: initializeRemoval
    };
});