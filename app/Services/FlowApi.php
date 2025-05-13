<?php

namespace App\Services;

use GuzzleHttp\Client;

class FlowApi
{
    protected $apiKey;
    protected $secretKey;
    protected $apiUrl;
    protected $client;

    public function __construct(array $config)
    {
        $this->apiKey    = $config['apiKey'];
        $this->secretKey = $config['secretKey'];
        $this->apiUrl    = $config['url'];
        $this->client    = new Client();
    }

    public function send($endpoint, array $params)
    {
        $params['apiKey'] = $this->apiKey;
        ksort($params);
        $params['s'] = hash_hmac('sha256', http_build_query($params), $this->secretKey);

        $response = $this->client->post($this->apiUrl . '/' . $endpoint, [
            'form_params' => $params,
        ]);

        return json_decode($response->getBody(), true);
    }
}
