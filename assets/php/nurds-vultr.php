<?php
class VultrDatabaseManager {
    private $apiKey;
    private $apiUrl = 'https://api.vultr.com/v2/databases';

    public function __construct($apiKey) 
    {
        $this->apiKey = $apiKey;
    }

    private function sendRequest($url, $method = 'GET', $data = null) 
    {
        $headers = [
            "Authorization: Bearer {$this->apiKey}",
            "Content-Type: application/json"
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        if ($method == 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        }

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }

    public function listDatabases() 
    {
        return $this->sendRequest($this->apiUrl);
    }

    public function listInstanceDatabases($instanceId) 
    {
        $url = "{$this->apiUrl}/{$instanceId}/dbs";
        return $this->sendRequest($url);
    }

    public function checkInstanceDbsByName($instanceId, $databaseName) 
    {
        $databases = $this->listInstanceDatabases($instanceId);

        foreach ($databases['dbs'] as $database) {
            if ($database['name'] == $databaseName) {
                return true;
            }
        }

        return false;
    }

    public function createDatabase($instanceId, $databaseName, $additionalParams = []) 
    {
        $url = "{$this->apiUrl}/{$instanceId}/dbs";
        $data = json_encode(array_merge(["name" => $databaseName], $additionalParams));
        return $this->sendRequest($url, 'POST', $data);
    }

    public function checkDatabaseByLabel($label) 
    {
        $databases = $this->listDatabases();

        foreach ($databases['databases'] as $database) {
            if ($database['label'] == $label) {
                return $database;
            }
        }

        return null;
    }
    
    public function checkAndCreateDatabase($instanceId, $databaseName) 
    {
        $database = $this->checkInstanceDbsByName($instanceId, $databaseName);

        if ($database) {
            return "Database '$databaseName' already exists: " . print_r($database, true);
        }

        $result = $this->createDatabase($instanceId, $databaseName);
        return "Database created: " . print_r($result, true);
    }

    public function listUsers($instanceId) 
    {
        $url = "{$this->apiUrl}/{$instanceId}/users";
        return $this->sendRequest($url);
    }
    public function checkUserByUsername($instanceId, $username) 
    {
        $users = $this->listUsers($instanceId);

        foreach ($users['users'] as $user) {
            if ($user['username'] == $username) {
                return $user; // Return the user details if found
            }
        }

        return null; // Return null if the user is not found
    }
    public function createUser($instanceId, $databaseName, $username, $password = null) 
    {
        $url = "{$this->apiUrl}/{$instanceId}/users";
        $data = json_encode([
            "db_name" => $databaseName,
            "username" => $username,
        ]);
        if ($password) {
            $data["password"] = $password;
        }
        return $this->sendRequest($url, 'POST', $data);
    }

    public function checkAndCreateUser($instanceId, $databaseName, $username, $password = null) 
    {
        $user = $this->checkUserByUsername($instanceId, $username);

        if ($user) {
            return $user;
        }

        $result = $this->createUser($instanceId, $databaseName, $username, $password);
        return $result;
    }
}