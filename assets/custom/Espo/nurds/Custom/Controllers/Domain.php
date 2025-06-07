<?php

namespace Espo\nurds\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Exceptions\Forbidden;
use Espo\nurds\Custom\Tools\DigitalOcean\Domains;
use Espo\nurds\Custom\Tools\DigitalOcean\Zones;
use Espo\Core\ORM\Repository\Option\SaveOption;

use stdClass;

class Domain extends \Espo\Core\Templates\Controllers\BasePlus
{
    protected function checkAccess(): bool
    {
        return $this->user->isAdmin();
    }

    public function getActionList(Request $request, Response $response): stdClass
    {
        $actionList = parent::getActionList($request, $response);

        if ($this->user->isSuperAdmin()) {
            //Grab List of domains and log it.
            $domains = $this->injectableFactory->create(Domains::class)->getDomains($request, $actionList);
            $metaTotal = $domains['meta']['total'];

            if($actionList->total != $metaTotal){
                foreach($domains as $names){
                    $name = $names->name;
                    //make sure there is not already a record with a matching url
                    $select = ['id', 'name'];   
                    $record = $this->entityManager
                        ->getRDBRepository('Domain')
                        ->select($select)
                        ->where(['url' => $name])
                        ->findOne();

                    if(!$record && $name != ''){
                        $data['name'] = $name;
                        $data['url'] = $name;
                        $data['status'] = 'Third Party';
                        $data['digitalOcean'] = true;
                    
            
                        if(empty(array_filter($actionList->list, fn($item) => $item->name === $recordTest))){
                            //Create a test record
                            $record = $this->entityManager->getNewEntity('Domain');
            
                            $record->set($data);
            
                            $this->entityManager->saveEntity($record, [
                                // Prevent `user` service being loaded by hooks.
                                SaveOption::SKIP_HOOKS => true,
                                SaveOption::KEEP_NEW => true,
                            ]);
            
                            $actionList = parent::getActionList($request, $response);
                        }
                    }
                }
                
                //$this->injectableFactory->create(Domains::class)->logRequest($request, $actionList);
    
            }
            
            //$this->injectableFactory->create(Domains::class)->logRequest($request, $actionList);
        }

        return $actionList;
    }

    public function getActionRead(Request $request, Response $response): stdClass
    {
        if (!$this->user->isAdmin()) {
            throw new Forbidden();
        }

        $domainRead = parent::getActionRead($request, $response);
        $domain = $domainRead->name;
        $domainId = $domainRead->id;
        $digitalOcean = $domainRead->digitalOcean;
        
        //$this->injectableFactory->create(Domains::class)->logRequest($request, $domainId);

        if ($this->user->isSuperAdmin() && $digitalOcean) {
            $domainRecord = $this->entityManager->getEntity('Domain', $domainId);

            // Fetch list of zones
            $zones = $this->injectableFactory->create(Zones::class)->getZones($domain);
            $metaTotal = $zones['meta']->total;

            $zonesList = [];
            $zoneRecords = $this->entityManager
                ->getRDBRepository('Domain')
                ->getRelation($domainRecord, 'zones')
                ->select(['id', 'zoneId', 'name', 'type', 'data', 'priority', 'port', 'ttl', 'weight', 'flags', 'tag'])
                ->where(['zoneId!=' => null])
                ->find();

            // Convert database records to an array for comparison
            foreach ($zoneRecords as $zone) {
                $zonesList[$zone->get('zoneId')] = [
                    'id' => $zone->get('id'),
                    'zoneId' => $zone->get('zoneId'),
                    'name' => $zone->get('name'),
                    'type' => $zone->get('type'),
                    'data' => $zone->get('data'),
                    'priority' => $zone->get('priority'),
                    'port' => $zone->get('port'),
                    'ttl' => $zone->get('ttl'),
                    'weight' => $zone->get('weight'),
                    'flags' => $zone->get('flags'),
                    'tag' => $zone->get('tag'),
                ];
            }

            //if ($domainRead->total != $metaTotal) {
                foreach ($zones['zoneRecords'] as $recordData) {
                    $zoneId = $recordData->id;
                    $recordId = $zonesList[$zoneId]['id'];
                    
                    // Prepare the data from external source
                    $zoneData = [
                        'zoneId' => $zoneId,
                        'name' => $recordData->name,
                        'type' => $recordData->type,
                        'data' => $recordData->data,
                        'priority' => $recordData->priority,
                        'port' => $recordData->port,
                        'ttl' => $recordData->ttl,
                        'weight' => $recordData->weight,
                        'flags' => $recordData->flags,
                        'tag' => $recordData->tag,
                        'status' => 'Active',
                        'domainId' => $domainId,
                        'domainName' => $domain,
                    ];

                    if (isset($zonesList[$zoneId])) {
                        // Compare existing record with incoming data
                        $existingData = $zonesList[$zoneId];
                        unset($existingData['id']); // Remove 'id' key from existing data
                        
                        if ($existingData !== $zoneData) {
                            // Update if there are differences
                            $record = $this->entityManager->getEntity('Zone', $recordId);
                            $record->set($zoneData);

                            $this->entityManager->saveEntity($record, [
                                SaveOption::SKIP_HOOKS => true,
                                SaveOption::KEEP_NEW => true,
                            ]);
                        }
                        
                        // Remove from $zonesList to track handled records
                        unset($zonesList[$zoneId]);
                    } else {
                        
                        // Create a new record if it does not exist
                        $record = $this->entityManager->getNewEntity('Zone');
                        $record->set($zoneData);

                        $this->entityManager->saveEntity($record, [
                            SaveOption::SKIP_HOOKS => true,
                            SaveOption::KEEP_NEW => true,
                        ]);
                    }
                    
                }

                // Any remaining records in $zonesList are not in the external data, and can be removed or marked inactive
                foreach ($zonesList as $remainingZoneId => $remainingZoneData) {
                    $record = $this->entityManager->getEntity('Zone', $remainingZoneData['id']);
                    $set['status'] = 'Error';
                    $set['error'] = 'Record no longer exists!';
                    $record->set('status', 'Inactive');

                    $this->entityManager->saveEntity($record, [
                        SaveOption::SKIP_HOOKS => true,
                        SaveOption::KEEP_NEW => true,
                    ]);
                }
            //}

            // Log the request and final zones data
            //$this->injectableFactory->create(Zones::class)->logRequest($request, $zones);
        }
        
        return $domainRead;
    }
}
