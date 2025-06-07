<?php 

namespace Espo\nurds\Custom\Hooks\Account;

use \Espo\ORM\Entity;
use Espo\Core\Utils\Log;


class ModuleHook
{
    private Log $log;

    public static $order = 1;

    public function __construct(
        Log $log
    ) {
        $this->log = $log;
    }

    public function beforeSave(Entity $entity)
    {

        // Check if the 'module' field exists and is not empty
        if (!$entity->has('cModules') || empty($entity->get('cModules'))) {
            return; // Exit if 'module' field does not exist or is empty
        }

        // Check if the 'module' field has changed
        if (!$entity->isAttributeChanged('cModules')) {
            return; // Exit if the 'module' field has not changed
        }

        // Check if the 'appId' field exists and is not null
        if (!$entity->has('appId') || empty($entity->get('appId'))) {
            return; // Exit if the 'module' field has not changed
        }

        // Check if 'modules' field exists and is not empty
        // modules is a checklist of the extensions available to be installed
        if ($entity->has('cModules')) {
            $modules = $entity->get('cModules');
            $tenant = $entity->get('appId');

            $processedArray = [];

            // Loop through each module in the checklist
            foreach ($modules as $module) {
                // Build the command to execute the shell script
                $permissionCommand = "chmod +x /var/www/html/install_module.sh";
                $command = "/var/www/html/install_module.sh $tenant $module";
            
                // Execute the command
                $output = [];
                $returnVar = 0;
                exec($permissionCommand);
                exec($command, $output, $returnVar);
            
                // Handle script output and status
                if ($returnVar !== 0) {
                    // Log or display the error message
                    $errorMessage = implode("\n", $output);
                    $logMessage = "Error: Script failed with the following output:\n$errorMessage";
                    $this->log->debug($logMessage);

                    // Optionally: handle specific errors based on the output
                    if (strpos($errorMessage, "Zip file") !== false) {
                        $logMessage = "\nHint: Check if the zip file exists and is in the correct location.";
                        $this->log->debug($logMessage);
                    } elseif (strpos($errorMessage, "Tenant") !== false) {
                        $logMessage = "\nHint: Verify that the tenant directory exists in the data folder.";
                        $this->log->debug($logMessage);
                    }
                    throw new Error('Check Logs, Module did not install: ' . $module);
                } else {
                    // Log or display the success message
                    $successMessage = implode("\n", $output);
                    $logMessage = "Success: Script executed successfully:\n$successMessage";
                    $this->log->debug($logMessage);
                }
            }

            // Encode the processed array
            //$encodedProcessedArray = json_encode($processedArray);

            // Set the encoded value to the 'description' field
            //$entity->set('description', $encodedProcessedArray);
        }
    }
}