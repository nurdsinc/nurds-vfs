<?php

namespace Espo\Modules\Nurds\Tools\Requests;


use Espo\Core\Utils\Log;
use Espo\Core\Utils\Json;
use Espo\Core\Utils\JsonException;
use RuntimeException;
use stdClass;

/**
 * A generic HTTP Client tool for cURL requests.
 * 
 * Usage example:
 * 
 *   $response = $this->httpClient->request([
 *       'method'  => 'POST',
 *       'url'     => 'https://example.com/api/items',
 *       'headers' => [
 *           'Authorization: Bearer <TOKEN>',
 *           'Content-Type: application/json',
 *       ],
 *       'body'    => ['name' => 'New Item'],
 *       'timeout' => 20,
 *   ]);
 */
class HttpClient extends \Espo\Core\Templates\Services\Base
{
    private const DEFAULT_TIMEOUT = 30;

    /**
     * Inject Log into the constructor
     */
    public function __construct(
        private Log $log
    ) {}

    /**
     * Make an HTTP request (GET, POST, PATCH, PUT, DELETE, etc.).
     *
     * @param array $options {
     *     @var string   $method    The HTTP method (GET, POST, PATCH, PUT, DELETE, etc.).
     *     @var string   $url       The request URL.
     *     @var array    $headers   (Optional) Array of headers, e.g. ['Accept: application/json'].
     *     @var mixed    $body      (Optional) The request body. If it's an array/object and 'Content-Type' is
     *                              'application/json', it will be JSON-encoded.
     *     @var int      $timeout   (Optional) Request timeout in seconds.
     *     @var bool     $jsonDecode (Optional) Whether to auto-decode a JSON response. Default: true.
     * }
     *
     * @return array|string The parsed JSON (array) if $jsonDecode is true and the response is valid JSON;
     *                      or the raw string response otherwise.
     *
     * @throws RuntimeException On cURL or HTTP errors (4xx, 5xx) or if JSON decoding fails (when $jsonDecode = true).
     */
    public function request(array $options)
    {
        $method     = strtoupper($options['method'] ?? 'GET');
        $url        = $options['url']     ?? '';
        $headers    = $options['headers'] ?? [];
        $body       = $options['body']    ?? null;
        $timeout    = $options['timeout'] ?? self::DEFAULT_TIMEOUT;
        $jsonDecode = $options['jsonDecode'] ?? true;

        if (!$url) {
            $this->log->error('No URL specified for HTTP request.');
            throw new RuntimeException('URL is required.');
        }

        // Build cURL
        $curl = curl_init();

        // If it’s a GET request, we can append query params if $body is an array.
        if ($method === 'GET' && is_array($body) && !empty($body)) {
            $queryString = http_build_query($body);
            $url .= (strpos($url, '?') === false ? '?' : '&') . $queryString;
            $body = null;
        }

        // If the Content-Type is JSON and $body is array or object, JSON-encode it.
        if ($this->hasJsonContentType($headers) && (is_array($body) || is_object($body))) {
            $body = json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $errorMsg = 'Failed to JSON-encode the request body.';
                $this->log->error($errorMsg);
                throw new RuntimeException($errorMsg);
            }
        }

        $curlOptions = [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING       => '',
            CURLOPT_MAXREDIRS      => 10,
            CURLOPT_TIMEOUT        => $timeout,
            CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_PROTOCOLS      => CURLPROTO_HTTP | CURLPROTO_HTTPS,
        ];

        // For POST, PATCH, PUT, DELETE, etc., set the body if it’s not null
        if ($method !== 'GET' && !is_null($body)) {
            // For form data, you might need `http_build_query($body)`, if not JSON.
            $curlOptions[CURLOPT_POSTFIELDS] = $body;
        }

        curl_setopt_array($curl, $curlOptions);

        // Execute
        $response = curl_exec($curl);
        $error    = curl_error($curl);
        $status   = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        curl_close($curl);

        // cURL connection issues
        if ($response === false || $error) {
            $errorMsg = sprintf('HTTP request failed: %s', $error ?: 'Unknown error');
            $this->log->error($errorMsg);
            throw new RuntimeException($errorMsg);
        }

        // If we consider 4xx or 5xx as errors, handle them
        if ($status >= 400) {
            $this->log->error($this->composeLogMessage(
                "HTTP request returned an error status code.",
                $status,
                $response
            ));
            throw new RuntimeException("Request returned status code $status.");
        }

        // If JSON decoding is requested
        if ($jsonDecode) {
            try {
                $decoded = Json::decode($response);

                // If you prefer an associative array, do: (array) or pass `true` as a param to decode
                if ($decoded instanceof stdClass) {
                    $decoded = (array) $decoded;
                }
                return $decoded;
            } catch (JsonException) {
                $this->log->error($this->composeLogMessage(
                    'Invalid JSON response.',
                    $status,
                    $response
                ));
                throw new RuntimeException('JSON parse error.');
            }
        }

        // Otherwise, return raw response
        return $response;
    }

    /**
     * Helper to check if headers indicate JSON content-type.
     */
    private function hasJsonContentType(array $headers): bool
    {
        foreach ($headers as $header) {
            if (stripos($header, 'Content-Type: application/json') !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Helper to compose uniform log messages.
     */
    private function composeLogMessage(string $message, int $status, string $response): string
    {
        return sprintf(
            '%s Status: %d. Response: %s',
            $message,
            $status,
            $response
        );
    }
}