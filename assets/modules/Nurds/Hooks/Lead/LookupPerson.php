<?php

namespace Espo\Modules\Nurds\Hooks\Lead;

use Espo\Core\Hook\Hook\BeforeSave;
use Espo\ORM\Entity;
use Espo\ORM\Repository\Option\SaveOptions;
use Espo\Core\Utils\Config;
use Espo\Entities\User as UserEntity;
use Espo\Core\Utils\Log;
use Espo\Modules\Nurds\Tools\Lookup\Person;

class LookupPerson implements BeforeSave
{
    private Config $config;
    private UserEntity $user;
    private Person $lookupPerson;
    private Log $log;

    public function __construct(
        Config $config,
        UserEntity $user,
        Person $lookupPerson,
        Log $log
    ) {
        $this->config = $config;
        $this->user = $user;
        $this->lookupPerson = $lookupPerson;
        $this->log = $log;
    }

    public function beforeSave(Entity $entity, SaveOptions $options): void
    {
        $addons = $this->config->get('addons');
        $addonList = array_map('trim', explode(',', $addons));

        if (!in_array('person_lookup', $addonList)) {
            $this->log->info("Person Lookup skipped — addon not enabled.");
            return;
        }

        if (!$entity->get('lookupPerson')) {
            return;
        }

        if ($entity->isAttributeChanged('lookupPerson') && $entity->get('lookupPerson') === true) {
            try {
                $this->lookupPerson->handle($entity);
            } catch (\Throwable $e) {
                $this->log->error("LookupPerson failed: " . $e->getMessage());
            }
        }
    }
}