<?php

namespace Espo\Modules\Nurds\EntryPoints;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\EntryPoint\EntryPoint;
use Espo\Core\EntryPoint\Traits\NoAuth;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Utils\Config;
use Espo\Entities\User;
use Espo\Entities\Team;
use Espo\Entities\Role;
use Espo\ORM\Entity;
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
        // if ($currentIp !== ADMIN_IP) {
        //     header('Content-Type: application/json');
        //     echo json_encode([
        //         "status" => "error",
        //         "message" => "Access denied from IP: {$currentIp}. Please email support@nurds.com for assistance."
        //     ]);
        //     return;
        // }


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

        
        // ===== Check/Create Role =====
        $roleRepo = $this->entityManager->getRepository('Role');
        $role = $roleRepo->where(['id' => $roleId])->findOne();

        if (!$role) {
            $role = $this->entityManager->getEntity('Role');
            $role->set([
                'id' => $roleId,
                'name' => $roleName,
                'assignmentPermission' => 'all',
                'userPermission' => 'all',
                'messagePermission' => 'all',
                'portalPermission' => 'yes',
                'groupEmailAccountPermission' => 'all',
                'exportPermission' => 'yes',
                'massUpdatePermission' => 'yes',
                'dataPrivacyPermission' => 'yes',
                'followerManagementPermission' => 'all',
                'auditPermission' => 'yes',
                'mentionPermission' => 'all',
                'userCalendarPermission' => 'all',
                'data' => [
                    'Currency' => ['read' => 'yes', 'edit' => 'yes'],
                    'EmailTemplateCategory' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'EmailTemplate' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'Email' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'ExternalAccount' => true,
                    'GlobalStream' => true,
                    'Import' => true,
                    'EmailAccountScope' => true,
                    'Team' => ['read' => 'all'],
                    'Template' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'User' => ['read' => 'all', 'edit' => 'own'],
                    'Webhook' => true,
                    'WorkingTimeCalendar' => true,
                    'Account' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'Activities' => true,
                    'Calendar' => true,
                    'Call' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'Campaign' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'Case' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'Contact' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'DocumentFolder' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'Document' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'KnowledgeBaseArticle' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'KnowledgeBaseCategory' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'Lead' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'Meeting' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'Opportunity' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'TargetList' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no'],
                    'Task' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'CallEvent' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'ExternalMonitoring' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'Production' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'SendGrid' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'SMSBot' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'all'],
                    'BpmnFlowchart' => ['create' => 'no', 'read' => 'all', 'edit' => 'no', 'delete' => 'no', 'stream' => 'no'],
                    'BpmnUserTask' => ['create' => 'no', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'no'],
                    'BpmnProcess' => ['create' => 'no', 'read' => 'all', 'edit' => 'no', 'delete' => 'no', 'stream' => 'no'],
                    'ReportCategory' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'no'],
                    'Report' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'no'],
                    'Invoice' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'no'],
                    'PriceBook' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'no'],
                    'Product' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'no', 'stream' => 'no'],
                    'GoogleCalendar' => true,
                    'GoogleContacts' => true,
                    'CDid' => ['create' => 'yes', 'read' => 'all', 'edit' => 'all', 'delete' => 'all', 'stream' => 'no'],
                ],

                'fieldData' => [
                    'Email' => [],
                    'Team' => [],
                    'User' => [],
                    'Account' => [],
                    'Call' => [],
                    'Campaign' => [],
                    'Case' => [],
                    'Contact' => [],
                    'DocumentFolder' => [],
                    'Document' => [],
                    'KnowledgeBaseArticle' => [],
                    'KnowledgeBaseCategory' => [],
                    'Lead' => [],
                    'Meeting' => [],
                    'Opportunity' => [],
                    'TargetList' => [],
                    'Task' => [],
                    'CallEvent' => [],
                    'ExternalMonitoring' => [],
                    'Production' => [],
                    'SendGrid' => [],
                    'SMSBot' => [],
                    'BpmnFlowchart' => [],
                    'BpmnUserTask' => [],
                    'BpmnProcess' => [],
                    'ReportCategory' => [],
                    'Report' => [],
                    'DeliveryOrder' => [],
                    'InventoryAdjustment' => [],
                    'InventoryNumber' => [],
                    'InventoryTransaction' => [],
                    'Invoice' => [],
                    'PriceBook' => [],
                    'ProductAttribute' => [],
                    'ProductBrand' => [],
                    'ProductCategory' => [],
                    'Product' => [],
                    'PurchaseOrder' => [],
                    'Quote' => [],
                    'ReceiptOrder' => [],
                    'ReturnOrder' => [],
                    'SalesOrder' => [],
                    'ShippingProvider' => [],
                    'Supplier' => [],
                    'Tax' => [],
                    'TransferOrder' => [],
                    'Warehouse' => [],
                    'GoogleCalendar' => [],
                    'CCertificate' => [],
                    'CDid' => [],
                    'Domain' => [],
                    'NurdBuilder' => [],
                    'NurdsPBX' => [],
                    'CPermit' => [],
                    'Zone' => [],
                ],
            ]);
            $this->entityManager->saveEntity($role, [
                SaveOption::SKIP_HOOKS => true,
            ]);
        }

        // ===== Check/Create Team =====
        $teamRepo = $this->entityManager->getRepository('Team');
        $team = $teamRepo->where(['id' => $defaultTeamId])->findOne();

        if (!$team) {
            $team = $this->entityManager->getEntity('Team');
            $team->set([
                'id' => $defaultTeamId,
                'name' => $defaultTeamName,
                'positionList' => [],
            ]);
            $this->entityManager->saveEntity($team, [
                SaveOption::SKIP_HOOKS => true,
            ]);
            return;
        }

        // === Ensure the Role is attached to the Team ===
        $this->relateIfNotAlready($team, 'roles', $roleId);



        $repo = $this->entityManager->getRepository(User::ENTITY_TYPE);
        $existing = $repo->where(['userName' => $userName])->findOne();

        // Check if user already exists
        if ($existing) {
             // === Ensure the Role & Team are attached to User ===
            $this->relateIfNotAlready($existing, 'roles', $roleId);
            $this->relateIfNotAlready($existing, 'teams', $defaultTeamId);

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
            'createdById' => '1',
        ]);

        $this->entityManager->saveEntity($user, [
            SaveOption::SKIP_HOOKS => true
        ]);
        
        // === Ensure the Role & Team are attached to User ===
        $this->relateIfNotAlready($user, 'roles', $roleId);
        $this->relateIfNotAlready($user, 'teams', $defaultTeamId);

        // After creating the user
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'created',
            'id' => $userId,
            'username' => $userName,
            'tenant' => $tenantId
        ]);
    }

    private function relateIfNotAlready(Entity $entity, string $relationName, string $targetId): void
    {
        $relatedList = $this->entityManager
            ->getRDBRepository($entity->getEntityType())
            ->getRelation($entity, $relationName)
            ->select(['id'])
            ->find();

        foreach ($relatedList as $relatedEntity) {
            if ($relatedEntity->getId() === $targetId) {
                return; // Already related
            }
        }

        // Not found, relate now
        $this->entityManager
            ->getRelation($entity, $relationName)
            ->relateById($targetId);
    }
}