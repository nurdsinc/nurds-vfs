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

        $currentIp = $_SERVER['REMOTE_ADDR'];
        // Confirm VPN
        if ($currentIp !== ADMIN_IP) {
            header('Content-Type: application/json');
            echo json_encode([
                "status" => "error",
                "message" => "Access denied from IP: {$currentIp}. Please email support@nurds.com for assistance."
            ]);
            return;
        }


        $userName = 'nurds_api';
        $userId = '66eb297573629225e';
        $apiKey = '3915c6038184cd6f107c4da4984f8e99';

        $defaultTeamId = '66eb2898c0fdf41e6';
        $defaultTeamName = 'Admin';

        $roleId = '66eb28fae803acb78';
        $roleName = 'Admin';

        $pdo = $this->entityManager->getPDO();

        // Check if the deleted user exists
        $stmt = $pdo->prepare("SELECT * FROM user WHERE user_name = :userName LIMIT 1");
        $stmt->execute(['userName' => $userName]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($row && $row['deleted']) {
            // Undelete the user
            $undeleteStmt = $pdo->prepare("UPDATE user SET deleted = 0 WHERE id = :id");
            $undeleteStmt->execute(['id' => $row['id']]);
        }

        $repo = $this->entityManager->getRepository(User::ENTITY_TYPE);
        $existing = $repo->where(['userName' => $userName])->findOne();

        // Check if user already exists
        if ($existing) {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'exists',
                'id' => $existing->getId(),
                'appId' => TENANT,
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
            'apiKey' => $apiKey,
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