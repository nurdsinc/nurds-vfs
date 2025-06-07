<?php

if (!str_starts_with(php_sapi_name(), 'cli')) {
    exit("This script can only be run from the command line.\n");
}

// Base directory for tenants
$tenantBaseDir = '/var/www/html/data';

/**
 * Get all valid tenant folders that contain a config.php file.
 *
 * @param string $baseDir
 * @return array
 */
function getAllTenants(string $baseDir): array
{
    $tenants = [];
    foreach (scandir($baseDir) as $folder) {
        if ($folder === '.' || $folder === '..') {
            continue;
        }
        $tenantPath = "$baseDir/$folder";
        if (is_dir($tenantPath) && file_exists("$tenantPath/config.php")) {
            $tenants[] = $folder;
        }
    }
    return $tenants;
}

// Check arguments
if ($argc < 3) {
    exit("Usage: php update_all_tenants.php <key> <value>\n");
}

$key = $argv[1];
$value = $argv[2];

// Retrieve all tenants
$tenants = getAllTenants($tenantBaseDir);

if (empty($tenants)) {
    exit("No valid tenants found in the data directory.\n");
}

echo "Found tenants: " . implode(', ', $tenants) . "\n";

foreach ($tenants as $tenant) {
    echo "\nProcessing tenant: $tenant\n";

    // Call update_config.php for each tenant
    $command = escapeshellcmd("php update_config.php $tenant $key $value");
    passthru($command, $result);

    if ($result !== 0) {
        echo "Error processing tenant: $tenant\n";
    }
}

echo "\nAll tenants processed.\n";