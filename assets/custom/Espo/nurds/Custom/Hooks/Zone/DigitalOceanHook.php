<?php 

namespace Espo\nurds\Custom\Hooks\Zone;

use \Espo\ORM\Entity;
use Espo\Core\Utils\Log;


class DigitalOceanHook
{
	private Log $log;

    public static $order = 1;

	public function __construct(
        Log $log
    ) {
        $this->log = $log;
    }

    //This function is used to get, pull, and update information from the CRM
	public function runCurl($url,$auth,$type="GET",$jsonArray=""){

		$ch = curl_init($url);  
		$returnHeaders = [];                                                                    
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $type);

		//$headers[] = "X-Api-Key:".$auth;//use with the API Key
		$headers[] = "Authorization: Bearer ".$auth;//use with username and password
		$headers[] = "Content-Type: application/json";

		if ($type == "POST" || $type == "PUT") {
			curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonArray);
			$headers[] = "Content-Lenght: ".strlen($jsonArray);
		}                                                             
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); // On dev server only!                                                                     
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);    
		// this function is called by curl for each header received
		curl_setopt($ch, CURLOPT_HEADERFUNCTION,//Get Return Headers to confirm Authentication
			function($curl, $header) use (&$returnHeaders){
				$len = strlen($header);
				$header = explode('HTTP/1.1 ', $header, 2);
				if (count($header) < 2) // ignore invalid headers
					return $len;

				$returnHeaders['response'] = trim($header[1]);

				return $len;
			}
		);

		$result = curl_exec($ch);
		$return['header'] = $returnHeaders['response'];
		$return['json'] = $result;

		return $return;
	}
          
    public function beforeSave(Entity $entity)
    {
        //$entity->set('description', 'Hello World');
		$zoneType = $entity->get('type');
		$name = $entity->get('name');
		$data = $entity->get('data');
		$priority = $entity->get('priority');
		if($priority == ""){$priority = null;}
		$port = $entity->get('port');
		if($port == ""){$port = null;}
		$ttl = $entity->get('ttl');
		$weight = $entity->get('weight');
		if($weight == ""){$weight = null;}
		$flags = $entity->get('flags');
		if($flags == ""){$flags = null;}
		$tag = $entity->get('tag');
		if($tag == ""){$tag = null;}
		
		$zoneRecord['name'] = $name;
		$zoneRecord['type'] = $zoneType;
		$zoneRecord['data'] = $data;
		$zoneRecord['priority'] = $priority;
		$zoneRecord['port'] = $port;
		$zoneRecord['ttl'] = $ttl;
		$zoneRecord['weight'] = $weight;
		$zoneRecord['flags'] = $flags;
		$zoneRecord['tag'] = $tag;
		
						
		if($zoneType == "MX" || $zoneType == "CNAME" || $zoneType == "NS"){
			//MX | CNAME Requires a Dot be appended to Data.
			$zoneRecord['data'].= ".";
		}
		
		if($zoneType == "A"){//In case a domain is put in place of an IP swap it for the IP registered to the domain.
			// Validate ip
			if (filter_var($data, FILTER_VALIDATE_IP) === FALSE) {
				$ip = gethostbyname($data);
				$zoneRecord['data'] = $ip;
				$entity->set('data',$ip);
				$entity->set('description',$data);
			} 
			
		}

		$jsonZoneRecord = json_encode($zoneRecord);
		$entity->set('jsonSent',$jsonZoneRecord);
		
		$getDomain = $entity->get('domain');
		$domain = $getDomain->get('name');
		$digitalOcean = $getDomain->get('digitalOcean');
    	$digitalOceanResponse = $getDomain->get('digitalOceanResponse');
		
		$token = "73831aa2b7a2c8bbb73394a39611c661d5fa68281a8a6cd444d610b69bd032dc";
		$baseUrl = "https://api.digitalocean.com/v2/";
		
		//If there is no Zone ID Attached then mark the status as Pending
		if($entity->get('zoneId') == ""){$entity->set('status','Pending');}
		
		if($digitalOcean == true){
			$entity->set('error','');
			if($entity->get('zoneId') == "" && $entity->get('update') == false){//Create Zone Record
				$domainMethod = "domains/".$domain."/records";
				$createZoneUrl = $baseUrl.$domainMethod;

				$record = $this->runCurl($createZoneUrl,$token,$type="POST",$jsonZoneRecord);

				$jsonData = json_decode($record['json']);
				$zoneId = $jsonData->domain_record->id;
				$entity->set('zoneId',$zoneId);
				$entity->set('status','Active');//If it found a Zone Id then it is an active record
			}elseif($entity->get('update') == false){//Update Zone Record
				$zoneId = $entity->get('zoneId');
				$domainMethod = "domains/".$domain."/records/".$zoneId;
				$updateZoneUrl = $baseUrl.$domainMethod;
				
				$record = $this->runCurl($updateZoneUrl,$token,$type="PUT",$jsonZoneRecord);
			}else{//GET the zone record
				$zoneId = $entity->get('zoneId');
				$domainMethod = "domains/".$domain."/records/".$zoneId;
				$getZoneUrl = $baseUrl.$domainMethod;
				
				$record = $this->runCurl($getZoneUrl,$token,$type="GET",$jsonArray="");
				
				$jsonData = json_decode($record['json']);
				$zoneType = $jsonData->domain_record->type;
				$name = $jsonData->domain_record->name;
				$data = $jsonData->domain_record->data;
				$priority = $jsonData->domain_record->priority;
				$port = $jsonData->domain_record->port;
				$ttl = $jsonData->domain_record->ttl;
				$weight = $jsonData->domain_record->weight;
				$flags = $jsonData->domain_record->flags;
				$tag = $jsonData->domain_record->tag;
				
				$entity->set('type',$zoneType);
				$entity->set('name',$name);
				$entity->set('data',$data);
				$entity->set('priority',$priority);
				$entity->set('port',$port);
				$entity->set('ttl',$ttl);
				$entity->set('weight',$weight);
				$entity->set('flags',$flags);
				$entity->set('tag',$tag);
				
				$entity->set('update',false);
			}
			
			$jsonRecord = $record['json'];
			$status = "Active";
			if($record['header'] != "201 Created" && $record['header'] != "200 OK"){
				$jsonRecord = json_encode($record['header']);
				$message = $record['json'];
				$message = json_decode($message);
				$message = $message->message;
				if($message != ""){				
					$entity->set('error',$message);
					$status = "Error";
				}
			}
			$entity->set('zoneResults',$jsonRecord);
			$entity->set('status',$status);
		}
	}

    public function beforeRemove(Entity $entity)
    {

		//$this->log->debug('Running Before Remove on Zone');
		// Check if DigitalOcean integration is enabled
		$domainEntity = $entity->get('domain');
		if (!$domainEntity || !$domainEntity->get('digitalOcean')) {
			return; // Skip if DigitalOcean is not enabled
		}
	
        // Check if the entity is active and has a zoneId
        if ($entity->get('status') === 'Active' && $entity->get('zoneId')) {
            $zoneId = $entity->get('zoneId');
            $domain = $entity->get('domain')->get('name');
            $token = "73831aa2b7a2c8bbb73394a39611c661d5fa68281a8a6cd444d610b69bd032dc";
            $baseUrl = "https://api.digitalocean.com/v2/";

            // Construct the URL to delete the DNS record
            $deleteZoneUrl = $baseUrl . "domains/" . $domain . "/records/" . $zoneId;

			//$errorMessage = implode("\n", $output);
			$logMessage = "Zone URL:\n$deleteZoneUrl";
			//$this->log->debug($logMessage);

            // Execute the DELETE request
            $response = $this->runCurl($deleteZoneUrl, $token, "DELETE");

            // Check response status
            $header = $response['header'];
            if ($header !== "204 No Content") {
                $message = "Failed to delete DNS record on DigitalOcean. Response: " . $response['json'];
                throw new \Exception($message);
            }
        }
    }
}