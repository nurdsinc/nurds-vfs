<?php 

namespace Espo\nurds\Custom\Hooks\Domain;

use \Espo\ORM\Entity;


class DigitalOceanHook
{
    public static $order = 4;

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
		$digitalOceanResponse = $entity->get('digitalOceanResponse');
		if($entity->get('digitalOcean') == true && $digitalOceanResponse == ""){
			$token = getenv('DO_AUTH_TOKEN');
			$domain = $entity->get('name');
			
			$baseUrl = "https://api.digitalocean.com/v2/";
			$domainMethod = "domains";
			$createDomainUrl = $baseUrl.$domainMethod;
			
			$domainArray['name'] = $domain;
			$jsonDomainArray = json_encode($domainArray);
			
			$createDomain = $this->runCurl($createDomainUrl,$token,$type="POST",$jsonDomainArray);
			
			$jsonCreateDomain = $createDomain['json'];
			if($createDomain['header'] != "201 Created"){
				$jsonCreateDomain = json_encode($createDomain['header']);
			}
			$entity->set('digitalOceanResponse',$jsonCreateDomain);
		}
    }

}