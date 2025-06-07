<?php

namespace Espo\Modules\Nurds\EntryPoints;

use Espo\Entities\User;
use Espo\Modules\Crm\Tools\Campaign\LogService;
use Espo\Modules\Nurds\Tools\Requests\HttpClient;
use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\EntryPoint\EntryPoint;
use Espo\Core\EntryPoint\Traits\NoAuth;
use Espo\Core\Exceptions\BadRequest;
use Espo\Core\Exceptions\NotFound;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Utils\Config;
use Espo\Core\ORM\Repository\Option\SaveOption;
use DateTime;
use DateTimeZone;

class LogCalls implements EntryPoint
{
    use NoAuth;

    public function __construct(
        private EntityManager $entityManager,
        private LogService $service,
        private User $user,
        private HttpClient $httpClient,
        private Config $config,
    ) {}

    private function isJson($string) {
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }

    /**
     * @throws BadRequest
     * @throws NotFound
     */
    public function run(Request $request, Response $response): void
    {

        $uuid = $request->getQueryParam('uuid');

        if (!$uuid || !is_string($uuid)) {
            throw new BadRequest("No uuid.");
        }

        if ($uuid == 'testing') {// using this for load balancer
            echo "Testing Success";
            return;
        }

        $apiKey = $this->config->get('webhookApi');
        $tokenId = $this->config->get('webhookToken');
        $url = "https://webhook.nurds.com/token/{$tokenId}/requests?query=uuid:\"{$uuid}\"";

        $headers = [
            'Accept: application/json',
            "api-key: {$apiKey}",
        ];


        // Loop until there is no "next" link
        $options = [
            'method'  => 'GET',
            'url'     => $url,
            'headers' => $headers,
            'timeout' => 30,
        ];

        // Request the current page
        $responseData = $this->httpClient->request($options);

        // Check if the decoding was successful
        if ($responseData === null) {
            throw new BadRequest("Invalid JSON");
        }

        // Check if nurds app id is found
        if (!$responseData['data']) {
            throw new BadRequest("Invalid Data");
        }

        // Check if content is found
        if (!$responseData['data']['0']->content) {
            throw new BadRequest("Invalid Content");
        }

        $contentJson = $responseData['data']['0']->content; 
        $content = json_decode($contentJson,true);

        // Prepare the data to create a new CallEvent record
        $callEventData = [];

        // Check if the keys exist and add them to the data array
        if (isset($content['api_token'])) {
            $callEventData['apiToken'] = $content['api_token'];
        }
        // Check if content is found
        if (!$content['api_token']) {
            throw new BadRequest("Invalid Nurds App Id");
        }

        $tenant = $content['api_token'];
        // Set the tenant environment variable
        putenv("CRON_NURDS_ID=$tenant");
        $_ENV['CRON_NURDS_ID'] = $tenant;

        
        $callEventData['uuid'] = $uuid;

        if (isset($content['method'])) {
            $callEventData['method'] = $content['method'];
        }

        if (isset($content['params']['connection_name'])) {
            $callEventData['connectionName'] = $content['params']['connection_name'];
        }

        if (isset($content['params']['extension'])) {
            $callEventData['extension'] = $content['params']['extension'];
        }

        if (isset($content['params']['user_id'])) {
            $callEventData['extUserId'] = $content['params']['user_id'];
        }

        if (isset($content['params']['connection_id'])) {
            $callEventData['connectionId'] = $content['params']['connection_id'];
        }

        if (isset($content['params']['domain'])) {
            $callEventData['domain'] = $content['params']['domain'];
        }

        if (isset($content['params']['call_start'])) {
            $callEventData['callStart'] = $content['params']['call_start'];

            $timestamp = $content['params']['call_start'];;
            $timestampInSeconds = $timestamp / 1000;
            $date = new DateTime("@$timestampInSeconds");  // @ sign indicates Unix timestamp
            //$date->setTimezone(new DateTimeZone('America/Phoenix'));
            $formattedDate = $date
            ->setTimezone(new DateTimeZone('America/Phoenix'))
            ->format('m/d/Y @ h:i:s A T');

            $dateStart = $date
            ->setTimezone(new DateTimeZone('UTC'))
            ->format('Y-m-d H:i:s');

            $callEventData['dateStart'] = $dateStart;
        }

        if (isset($content['params']['call_end'])) {
            $callEventData['callEnd'] = $content['params']['call_end'];

            $timestamp = $content['params']['call_end'];;
            $timestampInSeconds = $timestamp / 1000;
            $date = new DateTime("@$timestampInSeconds");  // @ sign indicates Unix timestamp

            $dateEnd = $date
            ->setTimezone(new DateTimeZone('UTC'))
            ->format('Y-m-d H:i:s');

            $callEventData['dateEnd'] = $dateEnd;
        }

        if (isset($content['params']['activity_type'])) {
            $callEventData['activityType'] = $content['params']['activity_type'];
            $callEventData['name'] = 'New '.$content['params']['activity_type'].' call from: '.$content['params']['caller_number'].' to: '.$content['params']['called_number'].' ('.$formattedDate.')';
        }


        if (isset($content['params']['called_number'])) {
            $callEventData['calledNumber'] = $content['params']['called_number'];
        }

        if (isset($content['params']['caller_number'])) {
            $callEventData['callerNumber'] = $content['params']['caller_number'];
        }

        if (isset($content['params']['call_id'])) {
            $callEventData['extCallId'] = $content['params']['call_id'];
            $callId = $content['params']['call_id'];

            $select = ['id','extCallId'];  
            $callRecord = $this->entityManager
                ->getRDBRepository('CallEvent')
                ->select($select)
                ->where(['extCallId' => $callId])
                ->findOne();
        }

        if (isset($content['params']['call_recording_url'])) {
            $callEventData['callRecordingUrl'] = $content['params']['call_recording_url'];
        }

        if (isset($content['params']['call_duration'])) {
            $callEventData['duration'] = $content['params']['call_duration'];
        }

        if (isset($content['params']['connection_name'])) {
            $callEventData['connectionName'] = $content['params']['connection_name'];
            //If the value of connection name is json then replace it with a hard coded text
            if ($this->isJson($content['params']['connection_name'])) {
                $callEventData['connectionName'] = "pbx.nurds.com";
            }
        }

        
        // Create and save the CallEvent record
        $callEvent = $this->entityManager->getNewEntity('CallEvent');
        if($callRecord){
            $callEvent = $callRecord;
        }
        $callEvent->set($callEventData);
        $this->entityManager->saveEntity($callEvent, [
            // Prevent `user` service being loaded by hooks.
            //SaveOption::SKIP_HOOKS => true,
            //SaveOption::KEEP_NEW => true,
            //SaveOption::KEEP_DIRTY => true,
        ]);

        $callEventId = $callEvent->getId(); 

        $json['id'] = $callEventId;
        $json['status'] = "success";

        if($callRecord){
            $json['id'] =  $callRecord->getId(); 
            $json['status'] = "updated";
        }

        header('Content-Type: application/json');
        echo json_encode($json, JSON_PRETTY_PRINT);
    }
}
