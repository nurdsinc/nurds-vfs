<?php

namespace Espo\Modules\Nurds\EntryPoints;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\EntryPoint\EntryPoint;
use Espo\Core\EntryPoint\Traits\NoAuth;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Utils\Config;
use Espo\Entities\User;
use Espo\Core\ORM\Repository\Option\SaveOption;

class InjectApiUser implements EntryPoint
{
    use NoAuth;

    public function __construct(
        private EntityManager $entityManager,
        private Config $config,
    ) {}

    public function run(Request $request, Response $response): void
    {
        $appId = $request->getQueryParam('appId');

        // Validate appId
        if (!$appId || !is_string($appId)) {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Missing or invalid appId parameter.'
            ]);
            return;
        }

        $tenantId = strtolower($appId);
        $dataFolderPath = '/var/www/html/data';
        $tenantFolderPath = $dataFolderPath . '/' . $tenantId;

        // Validate tenant folder
        if (!is_dir($tenantFolderPath)) {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => "Tenant data folder does not exist: /data/{$tenantId}"
            ]);
            return;
        }

        // Set global variable
        putenv("TENANT={$tenantId}");
        $_ENV['TENANT'] = $tenantId;

        $userName = 'nurds_api';
        $userId = '66eb297573629225e';

        $defaultTeamId = '66eb2898c0fdf41e6';
        $defaultTeamName = 'Admin';

        $roleId = '66eb28fae803acb78';
        $roleName = 'Admin';

        $repo = $this->entityManager->getRepository(User::ENTITY_TYPE);

        $existing = $repo->where(['userName' => $userName])->findOne();

        // Check if user already exists
        if ($existing) {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'exists',
                'id' => $existing->getId(),
                'tenant' => $tenantId,
                'env' => getenv(),
            ]);
            return;
        }

        $user = $this->entityManager->getEntity(User::ENTITY_TYPE);
        $user->set([
            'id' => $userId,
            'type' => 'api',
            'isActive' => true,
            'userName' => $userName,
            'lastName' => $userName,
            'authMethod' => 'ApiKey',
            'defaultTeamId' => $defaultTeamId,
            'defaultTeamName' => $defaultTeamName,
            'teamsIds' => [$defaultTeamId],
            'teamsNames' => [$defaultTeamId => $defaultTeamName],
            'teamsColumns' => [$defaultTeamId => ['role' => null]],
            'rolesIds' => [$roleId],
            'rolesNames' => [$roleId => $roleName],
            'createdById' => '1',
        ]);

        $this->entityManager->saveEntity($user, [
            SaveOption::SKIP_HOOKS => true
        ]);

        // After creating the user
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'created',
            'id' => $userId,
            'username' => $userName,
            'tenant' => $tenantId
        ]);
    }
}