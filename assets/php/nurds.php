<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

header("Access-Control-Allow-Origin: https://temr.dev");

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace('_', '-', substr($key, 5));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
}

// Get the host from the server
$host = $_SERVER['HTTP_HOST'] ?? null;

if ($host === null) {
    // Handle missing host, e.g., set a default or log an error
    $host = 'localhost'; // Replace with your default
}

// Function to extract and sanitize the subdomain
function extractSubdomain($host) {
    // Match subdomains that precede crm.nurds.dev or crm.nurds.com
    if (preg_match('/^([a-z0-9-]+)\.crm\.nurds\.(dev|com)$/i', $host, $matches)) {
        // Sanitize the subdomain by removing invalid characters and lowercasing it
        return strtolower(preg_replace('/[^a-z0-9-]/i', '', $matches[1]));
    }
    return null; // No valid subdomain found
}

//Need to set IP address
// Function to get the client's IP address
function getClientIp() {
    $ipAddress = '';

    // Check for common headers that might contain the client's IP address
    $headers = [
        'HTTP_X_FORWARDED_FOR',
        'HTTP_CLIENT_IP',
        'HTTP_X_REAL_IP',
        'HTTP_CF_CONNECTING_IP', // Cloudflare
        'HTTP_X_FORWARDED',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'HTTP_X_CLUSTER_CLIENT_IP',
        'HTTP_VIA',
        'REMOTE_ADDR'
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            // Some headers might contain multiple IPs (client IP + proxy IPs)
            $ipList = explode(',', $_SERVER[$header]);
            $ipAddress = trim(end($ipList)); // Use the last IP address in the list
            break;
        }
    }

    return $ipAddress;
}

// Set the REMOTE_ADDR to the client's actual IP address
$_SERVER['REMOTE_ADDR'] = getClientIp();

//ADMIN IP
$adminIp = '104.238.140.99';
define('ADMIN_IP', $adminIp);

//TODO need to setup a check for nurds-id and make sure it is valid
//TODO need to find a place to put a username check and make sure said username can login to nurds-id

// Fetch all headers
$headers = getallheaders();

// Set a default nurds-id
$nurdsId = 'nurds';

// Check if 'Nurds-App-Id' is present in the headers
if ((!isset($headers['Nurds-App-Id']) || empty($headers['Nurds-App-Id'])) && $host !== 'localhost') {
    // Set a default Nurds-App-Id header
    $headers['Nurds-App-Id'] = $nurdsId;    
}



/**
 * Convert a string to lowercase and replace spaces and plus signs with dashes.
 *
 * @param string $string The input string.
 * @return string The transformed string.
 */
function transformString($string) {
    // Replace spaces and plus signs with dashes before transforming
    return str_replace([' ', '+'], '-', strtolower($string));
}

// Start the session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}


if (isset($_COOKIE['nurds-id'])) {
    $nurdsId = $_COOKIE['nurds-id'];

    //check if cookie has changed without updating the session to match.
    if (isset($_SESSION['nurds-id']) && $nurdsId != $_SESSION['nurds-id']) {
        $nurdsId = $_SESSION['nurds-id'];
        setcookie('nurds-id', $nurdsId, -1, '/');
    }

    //Only set session if logged in.
    if(isset($_COOKIE['auth-token'])){
        $_SESSION['nurds-id'] = $nurdsId;
    }
    // Add a Nurds-App-Id header
    $headers['Nurds-App-Id'] = $nurdsId;
}

// Get the nurds-id from the command line arguments
if (getenv('CRON_NURDS_ID')) {
    $nurdsId = getenv('CRON_NURDS_ID');

    // Add a Nurds-App-Id header
    $headers['Nurds-App-Id'] = $nurdsId;
}

// Check if the cookie 'nurds-id' is set and equals 'TENANT'
if (isset($_GET['nurds-id']) && isset($_GET['code'])) {
    $nurdsId = $_GET['nurds-id'];
    $nurdsId = transformString($nurdsId);
    setcookie('nurds-id', $nurdsId, -1, '/');

    // Add a Nurds-App-Id header
    $headers['Nurds-App-Id'] = $nurdsId;

    //clear out the nurds-id session
    if (isset($_SESSION['nurds-id'])) {
        $_SESSION['nurds-id'] = $nurdsId;
    }
}

$apiUri = false;
if (isset($_SERVER['REQUEST_URI']) && $host !== 'localhost') {
    $requestUri = $_SERVER['REQUEST_URI'];
    if (strpos($requestUri, needle: '/api/v1') !== false) {
        // /api/v1 is in the REQUEST_URI
        
        // Check if the 'nurds-app-id' header is present
        if (isset($headers['Nurds-App-Id'])) {
            $nurdsId = transformString($headers['Nurds-App-Id']);
        } else {
            //TODO Need to verify the nurds-app-id is valid
            //Make sure the header nurds-app-id is passed else show an error message
            $response['status'] = 'error';
            $response['message'] = 'Missing Header nurds-app-id';
            //$response['server'] = $_SERVER;

            // Set content type to JSON
            header('Content-Type: application/json');
            http_response_code(403);
            // Output the JSON response
            echo json_encode($response);
            exit();
        }
        $apiUri = true;
    } 
} 


//echo "<pre>";
//print_r($_SESSION);
//echo "</pre>";
// Check if the cookie 'nurds-id' is set and equals 'TENANT'
if (isset($_GET['logout'])) {
    unset($_SESSION['install']); 
    unset($_SESSION['redirect']);
    unset($_SESSION['planType']);
    unset($_SESSION['payload']);
    unset($_SESSION['payloadserialized']);
    header('Location: /');
    exit();
}

// Prepare to install new tenant system
if (isset($_GET['tenant'])) {
    $nurdsId = $_GET['tenant'];
    $nurdsId = transformString($nurdsId);
    setcookie('nurds-id', $nurdsId, -1, '/');
    $_SESSION['nurds-id'] = $nurdsId;
    header('Location: /');
    exit();
}

// Extract the subdomain if present
//ex tenant.crm.nurds.dev
$subdomain = extractSubdomain($host);

// If a valid subdomain exists, set it as the $nurdsId
if ($subdomain !== null) {
    $nurdsId = $subdomain; // Transform the subdomain before assigning
    $headers['Nurds-App-Id'] = $nurdsId;  
    setcookie('nurds-id', $nurdsId, -1, '/'); // Update the cookie with the new tenant ID
    $_SESSION['nurds-id'] = $nurdsId; // Update the session with the new tenant ID
}

// Path to the config.php file
$configPath = "data/{$nurdsId}/config.php";

// Check if the config file exists
if (file_exists($configPath)) {
    // Read the content of the config.php file as plain text
    $configContent = file_get_contents($configPath);
    
    // Define a regular expression to find the siteUrl assignment in the array
    $pattern = '/\s*\'siteUrl\'\s*=>\s*(\'|")([^\'"]+)(\'|")\s*,/';
    
    // Check if the siteUrl exists and matches the pattern
    if (preg_match($pattern, $configContent, $matches)) {
        $siteUrl = $matches[2]; // Get the current siteUrl
        
        // Check if the siteUrl contains 'nurds.com' or 'nurds.dev' and starts with 'http://'
        if ((strpos($siteUrl, 'nurds.com') !== false || strpos($siteUrl, 'nurds.dev') !== false) && strpos($siteUrl, 'http://') === 0) {
            // Update the URL to use 'https'
            $updatedSiteUrl = 'https://' . substr($siteUrl, 7); // Remove 'http://' and replace with 'https://'
            
            // Replace the old siteUrl with the updated one in the content
            $updatedConfigContent = preg_replace($pattern, "\n  'siteUrl' => '{$updatedSiteUrl}',", $configContent);
            
            // Write the updated content back to the file
            file_put_contents($configPath, $updatedConfigContent);
            
        }
    }
}

$tenantConfigPath = "data/{$nurdsId}/config-internal.php";
$isInstalled = true; // Default to true

// Check if the config file exists and parse it
if (file_exists($tenantConfigPath)) {
    $config = include $tenantConfigPath;

    // Validate the config structure and check 'isInstalled'
    if (is_array($config) && isset($config['isInstalled']) && $config['isInstalled'] === false) {
        $isInstalled = false;
    }
}

// Check conditions
if ($host !== 'localhost' && ($_SERVER['REMOTE_ADDR'] !== ADMIN_IP && (!is_dir("data/{$nurdsId}") || !$isInstalled))) {
    // Tenant does not exist or is not installed
    header('Content-Type: application/json');
    echo json_encode(['error' => 'App ID does not exist or is not installed.','appId' => $nurdsId]);
    exit;
}

// Redirect to /install if the data folder for the nurdsId does not exist
//TODO need to create logic to unset the redirect session when needed
if (!is_dir("data/{$nurdsId}") && !isset($_SESSION['redirect'])) {

    
    $_SESSION['redirect'] = true;
    header('Location: /install');
    exit();
}


// Optionally, set it as a response header to ensure it's visible in requests
if (isset($headers['Nurds-App-Id']) && !empty($headers['Nurds-App-Id'])) {
    header("Nurds-App-Id: {$headers['Nurds-App-Id']}");
}

define('TENANT', $nurdsId);


if(isset($_GET['destroy'])){
    session_destroy();
    
    echo '<pre>';
    echo 'SESSIONS have been destroyed! ';
    echo '<a href="/install">Try Install Again</a>';
    echo '</pre>';

    exit();
}

// Check if the session array is not empty
if (!empty($_SESSION['install']) && empty($_SESSION['install']['host-name']) && empty($_SESSION['install']['name'])) {
    if($_SESSION['install']['action'] != 'step3' && $_SESSION['install']['action'] != 'step4'){
        require_once "nurds-vultr.php";
        
        $vultrApiKey = "SBXTH2UIZZFMP7Y4MLCAHVT7RGARPOBLLEWQ";
        $vultrHost = "";
        $vultrPort = "";
        $vultrHostName = "";
        $vultrDatabaseName = TENANT."_db";
        $vultrDBPassword = null;
        $vultrLabel = "NurdsCRM";
        $vultrDBManager = new VultrDatabaseManager($vultrApiKey);
        $vultrAdditionalParams = [
            // Add additional parameters required for database creation
        ];

        //Create a new DB Instance with user/password or confirm they exist and return the password.
        $vultrMainDB = $vultrDBManager->checkDatabaseByLabel($vultrLabel);
        if($vultrMainDB['id']){
            $vultrHost = $vultrMainDB['host'];
            $vultrPort = $vultrMainDB['port'];
            $vultrHostName = $vultrHost.":".$vultrPort;

            $vultrDbsExist = $vultrDBManager->checkAndCreateDatabase($vultrMainDB['id'], $vultrDatabaseName);
            if($vultrDbsExist){
                $vultrCreateUser = $vultrDBManager->checkAndCreateUser($vultrMainDB['id'], $vultrDatabaseName, TENANT);
                if($vultrCreateUser['password']){
                    $vultrDBPassword = $vultrCreateUser['password'];
                }
            }
        }       

        $_SESSION['install']['host-name'] = $vultrHostName;
        $_SESSION['install']['db-platform'] = 'Mysql';
        $_SESSION['install']['db-name'] = $vultrDatabaseName;
        $_SESSION['install']['db-user-name'] = TENANT;
        $_SESSION['install']['db-user-password'] = $vultrDBPassword;
        $_SESSION['install']['user-name'] = TENANT;
        $_SESSION['install']['user-pass'] = $vultrDBPassword;
        $_SESSION['install']['user-confirm-pass'] = $vultrDBPassword;
    }
}

if(empty($_SESSION['install']['db-user-password']) && !empty($_SESSION['install']) && !$apiUri){
    echo '<pre>';
    echo 'DB USER ('.TENANT.') NOT FOUND. Please try again or manually create! ';
    echo '<a href="/install/?destroy=yes">Clear Session!</a>';
    echo '</pre>';
    exit();
}