<?php
namespace Espo\Modules\Nurds\Hooks\Lead;

use Espo\Core\Hook\Hook\BeforeSave;
use Espo\ORM\Entity;
use Espo\ORM\Repository\Option\SaveOptions;
use Espo\Core\Utils\Config;
use Espo\Entities\User as UserEntity;
use Espo\Core\Exceptions\Forbidden;
use Espo\Modules\Nurds\Tools\Requests\HttpClient;
use Exception;
use Espo\Core\Exceptions\BadRequest;
use Espo\Core\Utils\Log;




class LookupProperty implements BeforeSave
{
    private Config $config;
    private UserEntity $user;
    private HttpClient $httpClient;
    private Log $log;

    public function __construct(Config $config, UserEntity $user, HttpClient $httpClient, Log $log)
    {
        $this->config = $config;
        $this->user = $user;
        $this->httpClient = $httpClient;
        $this->log = $log;
    }

    public function beforeSave(Entity $entity, SaveOptions $options): void
    {

        $addons = $this->config->get('addons');
        $addonList = array_map('trim', explode(',', $addons));

        $propertyLookup = false;
        if (in_array('property_lookup', $addonList)) {
            $propertyLookup = true;
        }

        if($propertyLookup == true){
            //testing phone number
            $phoneNumberData[] = (object)[
                'phoneNumber' => '+14782221234',
                'type' => 'Mobile',
                'primary' => true,
            ];

            //$entity->set('phoneNumberData', $phoneNumberData);

            $apn = $entity->get('apn');
            $firstName = $entity->get('firstName');
            $lastName = $entity->get('lastName');
            $street = $entity->get('addressStreet');
            $city = $entity->get('addressCity');
            $state = $entity->get('addressState');
            $postalCode = $entity->get('addressPostalCode');

            //If a record was created and has an address, but no APN or name then do a property lookup if the addon is enabled.
            if($apn == "" && $firstName == "" && $lastName == "" && $street != "" && $postalCode != ""){
                $method = "POST";
                $contentType = "application/json";
                $url = "https://app.nurds.com/api/v1/property/lookup";
                
                $headers = [
                    'Accept: application/json',
                    "content-type: {$contentType}",
                ];

                $body = [
                    "freeform" => "{$street}, {$city} {$state} {$postalCode}",
                ];


                // Loop until there is no "next" link
                $options = [
                    'method'  => $method,
                    'url'     => $url,
                    'headers' => $headers,
                    'timeout' => 30,
                    'body'    => $body,
                    'jsonDecode'=> false,
                ];

                // Request the current page
                $responseData = $this->httpClient->request($options);
                $responseData = json_decode($responseData);

                // Check if the decoding was successful
                if ($responseData === null) {
                    $responseJson = json_encode($responseData);
                    $this->log->error("Property Address: BadJSON [$responseJson].");
                    throw new BadRequest("Invalid Address JSON");
                }

                // Check if nurds app id is found
                if (!$responseData->apn) {
                    $responseJson = json_encode($responseData);
                    $this->log->error("Property Lookup: APN [$responseJson].");
                    throw new BadRequest("Invalid APN for Address");
                }

                // Check if content is found
                if (!$responseData->raw_data->PropertyAddress->MAK) {
                    $responseJson = json_encode($responseData);
                    $this->log->error("Property Address: MAK [$responseJson].");
                    throw new BadRequest("Invalid Address ID");
                }

                $isEntity = $responseData->is_entity_owner;

                if($isEntity == true){//it is a company
                    $entity->set('accountName', $responseData->raw_data->PrimaryOwner->Name1Full);
                }else{//it is a person
                    //Set Name
                    $entity->set('firstName', $responseData->raw_data->PrimaryOwner->Name1First);
                    $entity->set('middleName', $responseData->raw_data->PrimaryOwner->Name1Middle);
                    $entity->set('lastName', $responseData->raw_data->PrimaryOwner->Name1Last);
                }

                //Spouse
                $entity->set('firstNameSpouse', $responseData->raw_data->PrimaryOwner->Name2First);
                $entity->set('middleNameSpouse', $responseData->raw_data->PrimaryOwner->Name2Middle);
                $entity->set('lastNameSpouse', $responseData->raw_data->PrimaryOwner->Name2Last);


                //Save Updated Address
                $entity->set('apn', $responseData->apn);

                //Save Updated Address
                $entity->set('apn', $responseData->apn);
                $entity->set('addressStreet', $responseData->street);
                $entity->set('addressCity', $responseData->city);
                $entity->set('addressState', $responseData->state);
                $entity->set('addressPostalCode', $responseData->postal_code);

                //Save Mailing Address
                $entity->set('mailingAddressStreet', $responseData->raw_data->OwnerAddress->Address);
                $entity->set('mailingAddressCity', $responseData->raw_data->OwnerAddress->City);
                $entity->set('mailingAddressState', $responseData->raw_data->OwnerAddress->State);
                $entity->set('mailingAddressPostalCode', $responseData->raw_data->OwnerAddress->Zip);

                //Sale Inforomation
                $entity->set('saleDate', $responseData->raw_data->SaleInfo->DeedLastSaleDate);
                $entity->set('deedDate', $responseData->raw_data->SaleInfo->DeedLastSaleDate);
                $entity->set('cashValue', $responseData->cash_value);
                $entity->set('salePrice', $responseData->last_sale_price);
                $entity->set('subdivisionName', $responseData->subdivision);
            }

        }
    }
}