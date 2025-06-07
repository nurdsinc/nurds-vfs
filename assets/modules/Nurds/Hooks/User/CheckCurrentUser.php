<?php
namespace Espo\Modules\Nurds\Hooks\User;

use Espo\Core\Hook\Hook\BeforeSave;
use Espo\ORM\Entity;
use Espo\ORM\Repository\Option\SaveOptions;
use Espo\Core\Utils\Config;
use Espo\Entities\User as UserEntity;
use Espo\Core\Exceptions\Forbidden;

class CheckCurrentUser implements BeforeSave
{
    private Config $config;
    private UserEntity $user;

    public function __construct(Config $config, UserEntity $user)
    {
        $this->config = $config;
        $this->user = $user;
    }

    public function beforeSave(Entity $entity, SaveOptions $options): void
    {
        // Get the current user's IP address
        $currentIp = $_SERVER['REMOTE_ADDR'];
        $type = $entity->get('type');

        if($type != 'portal'){//Only apply to regular users
            // Check if the IP address is not the allowed one
            if ($currentIp !== ADMIN_IP) {
                throw new Forbidden("Access denied from IP: {$currentIp}");
            }

            // Check if the entity is new (being created)
            if ($entity->isNew()) {
                // Get the current user
                $currentUser = $this->user;

                // Allow only Super Admins to create new users
                if (!$currentUser->isSuperAdmin()) {
                    //throw new Forbidden("Only Super Admins can create new users.");
                }
            }
        }
    }
}