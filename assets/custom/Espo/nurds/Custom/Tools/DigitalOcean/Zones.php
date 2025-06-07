<?php 

namespace Espo\nurds\Custom\Tools\DigitalOcean;

use Espo\Core\Utils\Log;
use Espo\nurds\Custom\Tools\Nurds\HttpClient;
use Espo\Core\Utils\Config;

class Zones
{
    public function __construct(
        private Log $log,
        private Config $config,
        private HttpClient $httpClient,
    ) {}

    public function logRequest($domain, $response): void
    {
        $response = json_encode($response);
        //$this->log->debug("Digital Ocean Zones Log ($domain): $response");
        $this->log->debug("Digital Ocean Zone Log: $response", [
            'request' => $domain,
        ]);
    }

    /**
     * Get a list of zone records from DigitalOcean.
     */
    public function getZones($domain): array
    {
        $token = $this->config->get('digitalOceanToken');
        $url = $this->config->get('digitalOceanUrl');

        $headers = [
            'Accept: application/json',
            "Authorization: Bearer {$token}",
        ];

        // Start with the first page
        $nextUrl = "{$url}/domains/{$domain}/records?per_page=20&page=1";

        $zoneRecords = [];
        $meta = null;

        // Loop until there is no "next" link
        while (!empty($nextUrl)) {
            $options = [
                'method'  => 'GET',
                'url'     => $nextUrl,
                'headers' => $headers,
                'timeout' => 30,
            ];

            // Request the current page
            $pageResponse = $this->httpClient->request($options);

            // Merge records from the current page into $zoneRecords
            if (!empty($pageResponse['domain_records']) && is_array($pageResponse['domain_records'])) {
                $zoneRecords = array_merge($zoneRecords, $pageResponse['domain_records']);
            }

            // Store metadata for totals
            $meta = $pageResponse['meta'] ?? null;

            // If 'links' or 'pages' or 'next' is missing/empty, this ends the loop
            $nextUrl = $pageResponse['links']->pages->next ?? null;
        }

        $result = [
            'zoneRecords' => $zoneRecords,
            'meta' => $meta,
        ];

        // Log the request and response
        //$this->logRequest($domain, $result);

        // Return the collected zone records
        return $result;
    }
}