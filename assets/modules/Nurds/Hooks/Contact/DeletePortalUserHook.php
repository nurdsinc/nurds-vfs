<?php 

namespace Espo\Modules\Nurds\Hooks\Contact;

use Espo\Core\Hook\Hook\BeforeRemove;
use Espo\ORM\Repository\Option\RemoveOptions;
use \Espo\ORM\Entity;
use Espo\ORM\EntityManager;
use Espo\Entities\User;
use Espo\Core\Utils\Log;


class DeletePortalUserHook implements BeforeRemove
{
    private Log $log;
    private EntityManager $entityManager;

    public static $order = 1;

    public function __construct(
        Log $log,
        EntityManager $entityManager
    ) {
        $this->log = $log;
        $this->entityManager = $entityManager;
    }

    public function beforeRemove(Entity $entity, RemoveOptions $options): void
    {

        // Check if there is a portal user attached to the contact
        // The goal is to delete the portal user if you delete the related contact.
        if (!$entity->has('portalUserId')) {
            $this->log->debug("No Portal User Found.");
            return; // Exit if 'portalUserId' field does not exist or is empty
        }

        //Get the portal user id and delete it.
        $portalUserId = $entity->get('portalUserId');
        $this->entityManager->getRDBRepository(User::ENTITY_TYPE)
                ->deleteFromDb($portalUserId);
        
        $this->log->debug("Deleting portal user [{$portalUserId}].");

    }
}