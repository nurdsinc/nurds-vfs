<?php

namespace Espo\Modules\Nurds\Tools\Lookup;

use Espo\Core\Utils\Log;
use Espo\ORM\Entity;
use Espo\Modules\Nurds\Tools\Requests\HttpClient;
use Espo\Core\Utils\Config;

class Person
{
    protected HttpClient $httpClient;
    protected Log $log;
    protected Config $config;

    public function __construct(
        HttpClient $httpClient,
        Log $log,
        Config $config
    ) {
        $this->httpClient = $httpClient;
        $this->log = $log;
        $this->config = $config;
    }

    public function handle(Entity $entity): void
    {
        $addons = $this->config->get('addons');
        $addonList = array_map('trim', explode(',', $addons));

        if (!in_array('person_lookup', $addonList)) {
            $this->log->info("person_lookup addon not enabled — skipping.");
            return;
        }

        if (!$entity->get('lookupPerson')) {
            return;
        }

        $firstName = $entity->get('firstName');
        $lastName = $entity->get('lastName');
        $firstNameSpouse = $entity->get('firstNameSpouse');
        $lastNameSpouse = $entity->get('lastNameSpouse');
        $address = $entity->get('mailingAddressStreet') ?? $entity->get('addressStreet');
        $city = $entity->get('mailingAddressCity') ?? $entity->get('addressCity');
        $state = $entity->get('mailingAddressState') ?? $entity->get('addressState');
        $zip = $entity->get('mailingAddressPostalCode') ?? $entity->get('addressPostalCode');

        if (!$firstName || !$lastName) {
            $this->log->warning("Missing name for lookup.");
            return;
        }

        try {
            $personLookupId = $entity->get('personLookupId');

            if (empty($personLookupId)) {
                $startBody = [
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'street' => $address,
                    'city' => $city,
                    'state' => $state,
                    'zip' => $zip,
                ];

                if (!empty($firstNameSpouse)) {
                    $startBody['firstNameSpouse'] = $firstNameSpouse;
                }
                if (!empty($lastNameSpouse)) {
                    $startBody['lastNameSpouse'] = $lastNameSpouse;
                }

                $startRawResponse = $this->httpClient->request([
                    'method' => 'POST',
                    'url' => 'https://app.nurds.com/api/v1/person-lookup/start',
                    'headers' => [
                        'Accept: application/json',
                        'Content-Type: application/json',
                    ],
                    'body' => $startBody,
                    'jsonDecode' => false,
                ]);
                $startResponse = json_decode($startRawResponse, true);

                if (!empty($startResponse['jobid'])) {
                    $entity->set('personLookupId', $startResponse['jobid']);
                    $entity->set('lookupPerson', false);
                    $entity->save();
                    $this->log->info("Person lookup started: jobid {$startResponse['jobid']}");
                    return;
                }

                $this->log->error("Failed to start person lookup.");
                return;
            }

            $matchBody = [
                'firstName' => $firstName,
                'lastName' => $lastName,
                'jobid' => $personLookupId,
            ];

            if (!empty($address)) {
                $matchBody['address'] = $address;
            }
            if (!empty($firstNameSpouse)) {
                $matchBody['firstNameSpouse'] = $firstNameSpouse;
            }
            if (!empty($lastNameSpouse)) {
                $matchBody['lastNameSpouse'] = $lastNameSpouse;
            }

            $matchRawResponse = $this->httpClient->request([
                'method' => 'POST',
                'url' => 'https://app.nurds.com/api/v1/person-lookup/match',
                'headers' => [
                    'Accept: application/json',
                    'Content-Type: application/json',
                ],
                'body' => $matchBody,
                'jsonDecode' => false
            ]);
            $matchResponse = json_decode($matchRawResponse, true);

            if (!empty($matchResponse[0])) {
                $data = $matchResponse[0];

                $lastNameLower = strtolower($lastName);
                $lastNameSpouseLower = strtolower($lastNameSpouse ?? '');
                $phoneNumberData = [];

                if (!empty($data['phonenumbers'])) {
                    foreach ($data['phonenumbers'] as $p) {
                        $callerId = strtolower($p['callerid'] ?? '');
                        $typeRaw = strtolower($p['type'] ?? '');

                        $matchesCallerId = $callerId === 'wireless caller';
                        $matchesLastName = str_contains($callerId, $lastNameLower) || str_contains($callerId, $lastNameSpouseLower);

                        if (!$matchesCallerId && !$matchesLastName) {
                            continue;
                        }

                        $number = preg_replace('/\D/', '', $p['number'] ?? '');
                        if (strlen($number) === 10) {
                            $number = '+1' . $number;
                        } elseif (strlen($number) === 11 && str_starts_with($number, '1')) {
                            $number = '+' . $number;
                        } elseif (!str_starts_with($number, '+')) {
                            $number = '+' . $number;
                        }

                        $type = match ($typeRaw) {
                            'residential' => 'Home',
                            'mobile' => 'Mobile',
                            default => ucfirst($typeRaw),
                        };

                        $phoneNumberData[] = (object)[
                            'phoneNumber' => $number,
                            'type' => $type,
                            'primary' => false,
                            'optOut' => false,
                            'invalid' => false,
                        ];
                    }

                    if (!empty($phoneNumberData)) {
                        $phoneNumberData[0]->primary = true;
                        $entity->set('phoneNumberData', $phoneNumberData);
                        $entity->set('phoneNumber', $phoneNumberData[0]->phoneNumber);
                        $entity->set('phoneNumberIsOptedOut', false);
                        $entity->set('phoneNumberIsInvalid', false);
                    }
                }

                // Handle spouse numbers (only Mobile, type becomes "Mobile (Spouse)")
                $spousePhoneNumberData = [];

                if (!empty($data['phonenumbersspouse'])) {
                    foreach ($data['phonenumbersspouse'] as $p) {
                        $callerId = strtolower($p['callerid'] ?? '');
                        $typeRaw = strtolower($p['type'] ?? '');

                        $matchesCallerId = $callerId === 'wireless caller';
                        $matchesLastName = str_contains($callerId, $lastNameLower) || str_contains($callerId, $lastNameSpouseLower);

                        // Only Mobile type AND matches caller ID or last name
                        if ($typeRaw !== 'mobile' || (!$matchesCallerId && !$matchesLastName)) {
                            continue;
                        }

                        $number = preg_replace('/\D/', '', $p['number'] ?? '');
                        if (strlen($number) === 10) {
                            $number = '+1' . $number;
                        } elseif (strlen($number) === 11 && str_starts_with($number, '1')) {
                            $number = '+' . $number;
                        } elseif (!str_starts_with($number, '+')) {
                            $number = '+' . $number;
                        }

                        $spousePhoneNumberData[] = (object)[
                            'phoneNumber' => $number,
                            'type' => 'Mobile (Spouse)',
                            'primary' => false,
                            'optOut' => false,
                            'invalid' => false,
                        ];
                    }

                    if (!empty($spousePhoneNumberData)) {
                        $entity->set('phoneNumberData', array_merge($phoneNumberData, $spousePhoneNumberData));
                    }
                }

                if (!empty($data['emailaddresses'])) {
                    $emailAddressData = [];
                
                    foreach ($data['emailaddresses'] as $i => $e) {
                        $email = strtolower(trim($e['data'] ?? ''));
                        if (empty($email)) {
                            continue;
                        }
                
                        $emailAddressData[] = (object)[
                            'emailAddress' => $email,
                            'primary' => $i === 0,
                            'optOut' => false,
                            'invalid' => false,
                            'lower' => $email,
                        ];
                    }
                
                    if (!empty($emailAddressData)) {
                        $entity->set('emailAddressData', $emailAddressData);
                        $entity->set('emailAddress', $emailAddressData[0]->emailAddress);
                        $entity->set('emailAddressIsOptedOut', false);
                        $entity->set('emailAddressIsInvalid', false);
                    }
                }
                $entity->set('age', $data['age']);
                if (!empty($lastNameSpouse)) {
                    $entity->set('spouse', $data['agespouse']);
                }
                
                $entity->set('lookupPerson', false);
                $entity->save();

                $this->log->info("Person lookup match completed for {$firstName} {$lastName}.");
            } else {
                $this->log->warning("No match data found for person lookup.");
            }

        } catch (\Throwable $e) {
            $this->log->error("Person lookup failed: " . $e->getMessage());
        }
    }
}