<?php

if (!str_starts_with(php_sapi_name(), 'cli')) {
    exit("This script can only be run from the command line.\n");
}

if ($argc < 4) {
    exit("Usage: php update_config.php <tenant> <key> <value>\n");
}

$tenant = $argv[1];
$key = $argv[2];
$value = $argv[3];

// Base directory for tenants
$tenantBaseDir = '/var/www/html/data';

// Validate tenant directory and config.php existence
$tenantPath = "$tenantBaseDir/$tenant";

if (!is_dir($tenantPath) || !file_exists("$tenantPath/config.php")) {
    exit("Error: Invalid tenant or missing config.php for tenant: $tenant\n");
}

// Set the tenant environment variable before including bootstrap
putenv("CRON_NURDS_ID=$tenant");
$_ENV['CRON_NURDS_ID'] = $tenant;

require "bootstrap.php";

// Initialize the application
try {
    $app = new \Espo\Core\Application();
    $app->setupSystemUser(); // Ensure the application is set up for the correct user context
    updateTenantConfig($app, $tenant, $key, $value);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

/**
 * Updates the tenant configuration.
 *
 * @param \Espo\Core\Application $app
 * @param string $tenant
 * @param string $key
 * @param string $value
 */
function updateTenantConfig($app, string $tenant, string $key, string $value): void
{
    $container = $app->getContainer();

    /** @var \Espo\Core\InjectableFactory $injectableFactory */
    $injectableFactory = $container->get('injectableFactory');
    $configWriter = $injectableFactory->create(Espo\Core\Utils\Config\ConfigWriter::class);

    // Retrieve the current configuration value
    $config = $container->get('config');
    $currentValue = $config->get($key);

    echo "Tenant: $tenant\n";
    echo "Updating key: $key\n";
    echo "Current value: $currentValue\n";

    // Update configuration if the value has changed
    if ($currentValue !== $value) {
        $configWriter->set($key, $value);
        $configWriter->save();
        echo "Updated '$key' to '$value' for tenant: $tenant.\n";
    } else {
        echo "No changes needed for '$key' in tenant: $tenant.\n";
    }
}