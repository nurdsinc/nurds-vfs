<?php 

namespace Espo\nurds\Custom\Tools\NurdsPBX;

use Espo\Core\Utils\Log;
use Espo\nurds\Custom\Tools\Nurds\HttpClient;
use Espo\Core\Utils\Config;
use \Espo\ORM\Entity;


class Tenants
{
    
    public function __construct(
        private Log $log,
        private Config $config,
        private HttpClient $httpClient,
    ) {}

    public function logRequest($request, $response): void
    {
        try {

            // Directly encode the response if it's not iterable
            $responseData = json_encode($response);

            // Check if $response is iterable
            if (is_iterable($response)) {
                // Convert to an array if it is iterable
                $responseData = json_encode(iterator_to_array($response));
            }
    
            $this->log->debug("NurdsPBX Log: $responseData", [
                'request' => $request
            ]);
        } catch (\Exception $e) {
            // Log an error if something goes wrong
            $this->log->error("Error logging NurdsPBX response: " . $e->getMessage(), [
                'request' => $request
            ]);
        }
    }

    /**
     * Get a list of tenants from NurdsPBX.
     */
    public function getTenants($request,$response): array
    {
        $token = $this->config->get('nurdsPBXKey');
        $url = $this->config->get('nurdsPBXUrl');

        $headers = [
            'Accept: application/json',
            "app-key: {$token}",
        ];

        // Start with the first page
        $tenantUrl = "{$url}/tenants";


        $options = [
            'method'  => 'GET',
            'url'     => $tenantUrl,
            'headers' => $headers,
            'timeout' => 30,
        ];

        // Request the current page
        $tenants = $this->httpClient->request($options);

        //Add back in the totals
        // $tenants['message'] = $response['message'];
        // $tenants['status'] = $response['status'];

        // if($response['status'] == 'success'){
        //     $tenants = $response['data'];
        //}
        

        return $tenants;
    }

    /**
     * Create new tenant in NurdsPBX.
     */
    public function createUpdateTenant(Entity $entity, $method)
    {
        $token = $this->config->get('nurdsPBXKey');
        $url = $this->config->get('nurdsPBXUrl');
        $tenantUrl = "{$url}/tenants";

        // Headers for the API request
        $headers = [
            'Accept: application/json',
            "app-key: {$token}",
            'Content-Type: application/json',  // Important for POST with JSON data
        ];


        $addons = $entity->get('addons');
        $allowedOutboundRoutes = $entity->get('allowedOutboundRoutes');
        $inboundNumbers = $entity->get('inboundNumbers');
        $sendWelcomeEmail = $entity->get('sendWelcomeEmail');
        $allowRecordings = $entity->get('allowRecordings');
        $disableTrunksPrefix = $entity->get('disableTrunksPrefix');
        $restrictedCid = $entity->get('restrictedCid');

        // Check if it's an array and then convert it to a comma-separated string
        if (is_array($addons)) {$addons = implode(',', $addons);}
        if (is_array($allowedOutboundRoutes)) {$allowedOutboundRoutes = implode(',', $allowedOutboundRoutes);}
        if (is_array($inboundNumbers)) {$inboundNumbers = implode(',', $inboundNumbers);}

        // Tenant data to be sent in the POST request body
        // Initialize the $tenantData array
        $tenantData = [];
        
        $tenantData['description'] = $entity->get('description');
        $tenantData['prefix'] = $entity->get('prefix');
        $tenantData['enabled'] = $entity->get('enabled');
        
        if($method == "POST"){
            $tenantData['send_welcome_email'] = ($sendWelcomeEmail) ? 'yes' : 'no';
            $tenantData['name'] = $entity->get('name');
            // User details
            $tenantData['user']['full_name'] = $entity->get('fullName');
            $tenantData['user']['user_password'] = $entity->get('userPassword');
            $tenantData['user']['user_email'] = $entity->get('emailAddress');
            $tenantData['user']['startapp'] = $entity->get('startapp');
            $tenantData['user']['role_id'] = $entity->get('roleId');
        }

        if($method == "PUT"){
            $tenantId = $entity->get('tenantId');
            $tenantUrl = $tenantUrl."/".$tenantId;
        }

        // Settings
        $tenantData['settings']['addons'] = $addons;
        $tenantData['settings']['allow_recordings'] = ($allowRecordings) ? 'yes' : 'no';
        $tenantData['settings']['allowed_outbound_routes'] = $allowedOutboundRoutes;
        $tenantData['settings']['allowed_tenant_trunks'] = $entity->get('allowedTenantTrunks');
        $tenantData['settings']['calls_limit'] = $entity->get('callsLimit');
        $tenantData['settings']['cid_name'] = $entity->get('cidName');
        $tenantData['settings']['cid_number'] = $entity->get('cidNumber');
        $tenantData['settings']['conferences'] = $entity->get('conferences');
        $tenantData['settings']['disable_trunks_prefix'] = ($disableTrunksPrefix) ? 'yes' : 'no';
        $tenantData['settings']['emergency_trunks'] = $entity->get('emergencyTrunks');
        $tenantData['settings']['extensions'] =  $entity->get('extensions');
        $tenantData['settings']['inbound_numbers'] = $inboundNumbers;
        //$tenantData['settings']['sms_numbers'] = [112,113,114,115,116,117,118];
        $tenantData['settings']['inbound_calls_limit'] = $entity->get('inboundCallsLimit');
        $tenantData['settings']['ivrs'] = $entity->get('ivrs');
        $tenantData['settings']['outbound_profiles'] = $entity->get('outboundProfiles');
        $tenantData['settings']['parking_lots'] = $entity->get('parkingLots');
        $tenantData['settings']['queues'] = $entity->get('queues');
        $tenantData['settings']['restricted_cid'] = ($restrictedCid) ? 'enabled' : 'disabled';
        $tenantData['settings']['timezone'] = $entity->get('timezone');
        $tenantData['settings']['trunks'] =  $entity->get('trunks');

        // Maintenance settings
        $tenantData['maintenance']['cdr_preservation'] = null;
        $tenantData['maintenance']['recordings_preservation'] = null;
        $tenantData['maintenance']['voicemail_preservation'] = null;
        $tenantData['maintenance']['recordings_clear_less_nseconds'] = 2;
        $tenantData['maintenance']['convert_recordings'] = "no";
        $tenantData['maintenance']['conversion_quality'] = 16;
        $tenantData['maintenance']['maintenance_cron'] = null;


        // Convert the data to JSON
        $jsonData = json_encode($tenantData);
        //$this->log->error("Error logging Tenant request: $jsonData");

        // POST request options
        $options = [
            'method'  => $method, //POST|PUT
            'url'     => $tenantUrl, // Endpoint for creating tenants
            'headers' => $headers,
            'body'    => $jsonData,  // Include the JSON data in the body
            'timeout' => 30,
        ];

        // Send the request and capture the response
        try {
            $response = $this->httpClient->request($options);

            // Handle the response
            return $response;
        } catch (\Exception $e) {
            // Handle any errors
            return ['error' => $e->getMessage()];
        }
    }


}
