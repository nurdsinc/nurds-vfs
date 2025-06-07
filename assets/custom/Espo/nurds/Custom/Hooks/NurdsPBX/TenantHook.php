<?php 

namespace Espo\nurds\Custom\Hooks\NurdsPBX;

use \Espo\ORM\Entity;
use Espo\Core\Utils\Log;
use Espo\Core\Exceptions\Forbidden;
use Espo\nurds\Custom\Tools\NurdsPBX\Tenants;
use Espo\Core\InjectableFactory;

class TenantHook 
{
    
    private InjectableFactory $injectableFactory;

    public function __construct(
        InjectableFactory $injectableFactory,
        Log $log
    ) {
        $this->injectableFactory = $injectableFactory;
        $this->log = $log;
    }

    public function beforeSave(Entity $entity)
    {

        $tenant = $this->injectableFactory->create(Tenants::class)->createUpdateTenant($entity,'PUT');

        if ($entity->isNew()) {
            $pass = "yes";
            if($entity->get('name') == ''){ $pass = "no";}
            if($entity->get('fullName') == ''){ $pass = "no";}
            if($entity->get('userPassword') == ''){ $pass = "no";}
            if($entity->get('emailAddress') == ''){ $pass = "no";}
            if($entity->get('startapp') == ''){ $pass = "no";}
            if($entity->get('roleId') == ''){ $pass = "no";}

            if($pass != 'yes'){
                $this->log->error("Missing required fields (name,full name, password, email, startapp, role)");
                throw new Forbidden("Missing required fields (name,full name, password, email, startapp, role)!");            
            }
            $tenant = $this->injectableFactory->create(Tenants::class)->createUpdateTenant($entity,'POST');
            
        }

        $responseData = json_encode($tenant);
        // $this->injectableFactory->create(Tenants::class)->logRequest($request, $tenants);
        if($tenant['status'] != 'success'){
            //$entity->set('json', $responseData);
            $this->log->error("Error logging Tenant response: " . $responseData);
            throw new Forbidden("Tenant not recorded! {$tenant->message}");            
        }
    }

}

