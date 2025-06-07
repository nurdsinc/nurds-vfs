<?php

namespace Espo\nurds\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Exceptions\Forbidden;
use Espo\nurds\Custom\Tools\NurdsPBX\Tenants;
use Espo\Core\ORM\Repository\Option\SaveOption;

use stdClass;

class NurdsPBX extends \Espo\Core\Templates\Controllers\Company
{
    protected function checkAccess(): bool
    {
        return $this->user->isAdmin();
    }

    public function getActionList(Request $request, Response $response): stdClass
    {
        $actionList = parent::getActionList($request, $response);

        if ($this->user->isSuperAdmin()) {
            //Grab List of tenants and log it.
            $tenants = $this->injectableFactory->create(Tenants::class)->getTenants($request, $actionList);
            // $this->injectableFactory->create(Tenants::class)->logRequest($request, $tenants);
            if($tenants['status'] != 'success'){
                return $actionList;
            }

            foreach($tenants['data'] as $tenant){
                $name = $tenant->name;
                $tenantJsonData = json_encode($tenant);

                // Access 'allow_recordings', 'disable_trunks_prefix', and 'restricted_cid' from the 'settings' object
                $allowRecordings = (isset($tenant->settings->allow_recordings) && $tenant->settings->allow_recordings === 'yes') ? true : false;
                $disableTrunksPrefix = (isset($tenant->settings->disable_trunks_prefix) && $tenant->settings->disable_trunks_prefix === 'yes') ? true : false;
                $restrictedCid = (isset($tenant->settings->restricted_cid) && $tenant->settings->restricted_cid === 'enabled') ? true : false;

                // Make sure there is not already a record with a matching url
                $select = ['id', 'name'];   
                $record = $this->entityManager
                    ->getRDBRepository('NurdsPBX')
                    ->select($select)
                    ->where(['name' => $name])
                    ->findOne();

                $data['name'] = $name;
                $data['json'] = $tenantJsonData;
                $data['tenantId'] = $tenant->tenant_id;
                $data['description'] = $tenant->description;
                $data['path'] = $tenant->path;
                $data['prefix'] = $tenant->prefix;
                $data['enabled'] = $tenant->enabled;

                // Access the settings object for these variables
                // Convert the comma-separated string into an array for 'addons'
                $data['addons'] = isset($tenant->settings->addons) && $tenant->settings->addons !== '' ? explode(',', $tenant->settings->addons) : [];
                $data['allowedOutboundRoutes'] = isset($tenant->settings->allowed_outbound_routes) && $tenant->settings->allowed_outbound_routes !== '' ? explode(',', $tenant->settings->allowed_outbound_routes) : [];
                $data['allowedTenantTrunks'] = isset($tenant->settings->allowed_tenant_trunks) && $tenant->settings->allowed_tenant_trunks !== '' ? $tenant->settings->allowed_tenant_trunks : null;
                $data['callsLimit'] = isset($tenant->settings->calls_limit) && $tenant->settings->calls_limit !== '' ? $tenant->settings->calls_limit : null;
                $data['cidName'] = isset($tenant->settings->cid_name) && $tenant->settings->cid_name !== '' ? $tenant->settings->cid_name : null;
                $data['conferences'] = isset($tenant->settings->conferences) && $tenant->settings->conferences !== '' ? $tenant->settings->conferences : null;
                $data['emergencyTrunks'] = isset($tenant->settings->emergency_trunks) && $tenant->settings->emergency_trunks !== '' ? $tenant->settings->emergency_trunks : null;
                $data['extensions'] = isset($tenant->settings->extensions) && $tenant->settings->extensions !== '' ? $tenant->settings->extensions : null;
                $data['inboundCallsLimit'] = isset($tenant->settings->inbound_calls_limit) && $tenant->settings->inbound_calls_limit !== '' ? $tenant->settings->inbound_calls_limit : null;
                $data['ivrs'] = isset($tenant->settings->ivrs) && $tenant->settings->ivrs !== '' ? $tenant->settings->ivrs : null;
                $data['outboundProfiles'] = isset($tenant->settings->outbound_profiles) && $tenant->settings->outbound_profiles !== '' ? $tenant->settings->outbound_profiles : null;
                $data['parkingLots'] = isset($tenant->settings->parking_lots) && $tenant->settings->parking_lots !== '' ? $tenant->settings->parking_lots : null;
                $data['queues'] = isset($tenant->settings->queues) && $tenant->settings->queues !== '' ? $tenant->settings->queues : null;
                $data['timezone'] = isset($tenant->settings->timezone) && $tenant->settings->timezone !== '' ? $tenant->settings->timezone : null;
                $data['trunks'] = isset($tenant->settings->trunks) && $tenant->settings->trunks !== '' ? $tenant->settings->trunks : null;
                $data['vpbxDevices'] = isset($tenant->settings->vpbx_devices) && $tenant->settings->vpbx_devices !== '' ? $tenant->settings->vpbx_devices : null;
                $data['cidNumber'] = isset($tenant->settings->cid_number) && $tenant->settings->cid_number !== '' ? $tenant->settings->cid_number : null;

                // Use previously processed $allowRecordings, $disableTrunksPrefix, $restrictedCid
                $data['allowRecordings'] = $allowRecordings;
                $data['disableTrunksPrefix'] = $disableTrunksPrefix;
                $data['restrictedCid'] = $restrictedCid;


                //log $data
                $this->injectableFactory->create(Tenants::class)->logRequest($request, $data);     

                if(empty(array_filter($actionList->list, fn($item) => $item->name === $name))){
                    //Create record
                    $record = $this->entityManager->getNewEntity('NurdsPBX');
                }
                $record->set($data);

                $this->entityManager->saveEntity($record, [
                    // Prevent `user` service being loaded by hooks.
                    SaveOption::SKIP_HOOKS => true,
                    SaveOption::KEEP_NEW => true,
                    //SaveOption::KEEP_DIRTY => true,
                ]);

                $actionList = parent::getActionList($request, $response);
                    
            }    
            
            $this->injectableFactory->create(Tenants::class)->logRequest($request, $actionList);
        }

        return $actionList;
    }
}
