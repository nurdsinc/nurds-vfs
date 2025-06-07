<?php 

namespace Espo\nurds\Custom\Tools\DigitalOcean;

use Espo\Core\Utils\Log;
use Espo\nurds\Custom\Tools\Nurds\HttpClient;
use Espo\Core\Utils\Config;
class Domains
{
    
    public function __construct(
        private Log $log,
        private Config $config,
        private HttpClient $httpClient,
    ) {}

    public function logRequest($request, $response): void
    {
        try {

            // Directly encode the response if it's not iterable
            $responseData = json_encode($response);

            // Check if $response is iterable
            if (is_iterable($response)) {
                // Convert to an array if it is iterable
                $responseData = json_encode(iterator_to_array($response));
            }
    
            $this->log->debug("Digital Ocean Log: $responseData", [
                'request' => $request
            ]);
        } catch (\Exception $e) {
            // Log an error if something goes wrong
            $this->log->error("Error logging Digital Ocean response: " . $e->getMessage(), [
                'request' => $request
            ]);
        }
    }

    /**
     * Get a list of domains from DigitalOcean.
     */
    public function getDomains($request,$response): array
    {
        $token = $this->config->get('digitalOceanToken');
        $url = $this->config->get('digitalOceanUrl');

        $headers = [
            'Accept: application/json',
            "Authorization: Bearer {$token}",
        ];

        // Start with the first page
        $nextUrl = "{$url}/domains?per_page=100&page=1";

        $domains = [];
        $domainNames = [];

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

            // Merge domains from the current page into $domains
            if (!empty($pageResponse['domains']) && is_array($pageResponse['domains'])) {
                $domains = array_merge($domains, $pageResponse['domains']);
            }

            // If 'links' or 'pages' or 'next' is missing/empty, this ends the loop
            $nextUrl = $pageResponse['links']->pages->next ?? null;
        }

        //Add back in the totals
        $domains['meta']['total'] = $pageResponse['meta']->total;
        // foreach($domains as $names){
        //     $domainNames[] = $names->name;
        // }

        // $response = json_encode($domainNames);
        // $this->log->debug("Digital Ocean Domain List: $response", [
        //     'request' => $request,
        // ]);

        // $response will be an array if JSON decoding is on (default).
        // Return it or process further as you wish.
        return $domains;
    }


}
