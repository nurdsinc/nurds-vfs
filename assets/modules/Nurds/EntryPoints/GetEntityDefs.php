<?php

namespace Espo\Modules\Nurds\EntryPoints;

use Espo\Core\EntryPoint\EntryPoint;
use Espo\Core\EntryPoint\Traits\NoAuth;
use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Utils\Metadata;
use Espo\Core\AclManager;
use Espo\Core\Acl\Table;
use Espo\Entities\User;
use Espo\Core\ORM\EntityManager;


class GetEntityDefs implements EntryPoint
{
    use NoAuth;

    public function __construct(
        private Metadata $metadata,
        private AclManager $aclManager,
        private User $user,
        private EntityManager $entityManager
    ) {
        $this->entityManager = $entityManager;
        $this->metadata = $metadata;
        $this->aclManager = $aclManager;
        $this->user = $user;
    }

    public function run(Request $request, Response $response): void
    {
        $apiKey = $request->getHeader('x-api-key');
        if (!$apiKey) {
            header('Content-Type: application/json');
            $response->setStatus(401);
            $response->getBody()->write(json_encode(['error' => 'Missing API key'], JSON_PRETTY_PRINT));
            return;
        }

         // Look up user by a custom field `apiKey` (you must create this field for User or use an alternative)
        $user = $this->entityManager
            ->getRDBRepository(User::ENTITY_TYPE) // No ACL
            ->where(['apiKey' => $apiKey])
            ->findOne();

        if (!$user) {
            header('Content-Type: application/json');
            $response->setStatus(403);
            $response->getBody()->write(json_encode(['error' => 'Invalid API key'], JSON_PRETTY_PRINT));
            return;
        }

        $entityName = $request->getQueryParam('entity') ?? 'Lead';

        // Check access
        if (!$this->aclManager->check($user, $entityName, Table::ACTION_READ)) {
            header('Content-Type: application/json');
            $response->setStatus(403);
            $response->getBody()->write(json_encode([
                'error' => "Access denied for entity: $entityName"
            ], JSON_PRETTY_PRINT));
            return;
        }

        $entityDefs = $this->metadata->get("entityDefs.$entityName");

        if (!$entityDefs) {
            header('Content-Type: application/json');
            $response->setStatus(404);
            $response->getBody()->write(json_encode([
                'error' => "EntityDefs not found for entity: $entityName"
            ], JSON_PRETTY_PRINT));
            return;
        }

        header('Content-Type: application/json');
        echo json_encode($entityDefs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}