<?php

namespace Espo\Modules\Nurds\Classes\Acl\User;

use Espo\Entities\Import;
use Espo\Entities\User;
use Espo\ORM\Entity;
use Espo\Core\Acl\AccessEntityDeleteChecker;
use Espo\Core\Acl\AccessEntityReadChecker;
use Espo\Core\Acl\ScopeData;

/**
 * @implements AccessEntityReadChecker<Import>
 * @implements AccessEntityDeleteChecker<Import>
 */
class AccessEntityChecker implements AccessEntityReadChecker, AccessEntityDeleteChecker
{
    public function check(User $user, ScopeData $data): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if(TENANT != "demo"){
            return true;
        }
        return $data->isTrue();
    }

    public function checkRead(User $user, ScopeData $data): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if(TENANT != "demo"){
            return true;
        }

        return $data->isTrue();
    }

    public function checkDelete(User $user, ScopeData $data): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if(TENANT != "demo"){
            return false;
        }

        return $data->isTrue();
    }

    public function checkEntityRead(User $user, Entity $entity, ScopeData $data): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if(TENANT != "demo"){
            return true;
        }

        if ($user->getId() === $entity->get('createdById')) {
            return true;
        }

        return false;
    }

    public function checkEntityDelete(User $user, Entity $entity, ScopeData $data): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->getId() === $entity->get('createdById')) {
            return true;
        }

        return false;
    }
}