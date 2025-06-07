<?php
namespace Espo\Modules\Nurds\Hooks\Account;

use Espo\Core\Hook\Hook\BeforeSave;
use Espo\ORM\Entity;
use Espo\ORM\Repository\Option\SaveOptions;
use Espo\Core\Exceptions\Forbidden;
use Espo\Modules\Nurds\Tools\Requests\HttpClient;
use Exception;
use Espo\Core\Exceptions\BadRequest;
use Espo\Tools\AppSecret\SecretProvider;
use Espo\Core\Utils\Log;



class GroupCheck implements BeforeSave
{
    private SecretProvider $secretProvider;
    private HttpClient $httpClient;
    private Log $log;

    public function __construct(
        SecretProvider $secretProvider,
        HttpClient $httpClient,
        Log $log
    ) {
        $this->secretProvider = $secretProvider;
        $this->httpClient = $httpClient;
        $this->log = $log;
    }

    public function beforeSave(Entity $entity, SaveOptions $options): void
    {
        if (!$entity->has('appId') || empty($entity->get('appId'))) {
            return;
        }

        if ($entity->has('groupId') && !empty($entity->get('groupId'))) {
            $isAppIdChanged = $entity->isAttributeChanged('appId');
            $isPackageChanged = $entity->isAttributeChanged('package');
        
            if ($isAppIdChanged || $isPackageChanged) {
                $token = $this->getToken();
                $this->updateGroup($entity->get('groupId'), $token, $entity);
            }
        
            return;
        }

        $appId = $entity->get('appId');

        try {
            $token = $this->getToken();

            $groupPk = $this->findExistingGroup($appId, $token);

            if (!$groupPk) {
                $groupPk = $this->createGroup($appId, $token, $entity);
                $this->log->info("Created new group for appId: $appId → $groupPk");
            } else {
                $this->log->info("Found existing group for appId: $appId → $groupPk");
            }

            if ($groupPk) {
                $entity->set('groupId', $groupPk);
            }
        } catch (\Throwable $e) {
            $message = $e->getMessage();
        
            if (str_contains(strtolower($message), 'timed out')) {
                $this->log->error("GroupCheck timeout for appId {$appId}: {$message}");
                throw new BadRequest("GroupCheck failed: Timeout while reaching auth server.");
            }
        
            $this->log->error("GroupCheck failed for appId {$appId}: {$message}");
            throw new BadRequest("GroupCheck failed: {$message}");
        }
    }

    private function getToken(): string
    {
        $token = $this->secretProvider->get('nurdsAuthToken');
        if (empty($token)) {
            throw new \RuntimeException('Missing AppSecret: nurdsAuthToken');
        }
        return $token;
    }

    private function findExistingGroup(string $appId, string $token): ?string
    {
        $url = "https://auth1.nurds.com/api/v3/core/groups/";

        $response = $this->httpClient->request([
            'method'  => 'GET',
            'url' => $url . '?' . http_build_query([
                'include_users' => 'false',
                'ordering' => 'name',
                'page' => 1,
                'page_size' => 20,
                'search' => $appId
            ]),
            'headers' => [
                "Authorization: Bearer {$token}",
                "Accept: application/json"
            ],
            'jsonDecode' => false,
        ]);

        $response = json_decode($response, true);

        if (!is_array($response['results'] ?? null)) {
            return null;
        }

        foreach ($response['results'] as $group) {
            if (($group['parent_name'] ?? null) === 'Tenants') {
                return $group['pk'] ?? null;
            }
        }

        return null;
    }

    private function createGroup(string $appId, string $token, Entity $entity): ?string
    {
        $url = 'https://auth1.nurds.com/api/v3/core/groups/';

        $planType = $entity->get('package') ?? 'Enterprise';

        $response = $this->httpClient->request([
            'method' => 'POST',
            'url'    => $url,
            'headers' => [
                "Authorization: Bearer {$token}",
                "Content-Type: application/json",
                "Accept: application/json"
            ],
            'body' => [
                'name' => $appId,
                'is_superuser' => false,
                'parent' => '93510835-7341-4fae-950c-3c44d5d8a183',
                'users' => [],
                'attributes' => [
                    'plan_type' => $planType
                ],
                'roles' => []
            ],
            'jsonDecode' => false,
        ]);

        $response = json_decode($response, true);

        return $response['pk'] ?? null;
    }

    private function updateGroup(string $groupId, string $token, Entity $entity): void
    {
        $url = "https://auth1.nurds.com/api/v3/core/groups/{$groupId}/";

        $planType = $entity->get('package') ?? 'Enterprise';
        $appId = $entity->get('appId');

        $this->httpClient->request([
            'method' => 'PATCH',
            'url'    => $url . '?include_users=false',
            'headers' => [
                "Authorization: Bearer {$token}",
                "Content-Type: application/json",
                "Accept: application/json"
            ],
            'body' => [
                'name' => $appId,
                'is_superuser' => false,
                'parent' => '93510835-7341-4fae-950c-3c44d5d8a183',
                'attributes' => [
                    'plan_type' => $planType
                ],
                'roles' => []
            ],
            'jsonDecode' => false,
        ]);

        $this->log->info("Updated group {$groupId} with appId {$appId} and plan_type {$planType}");
    }
}