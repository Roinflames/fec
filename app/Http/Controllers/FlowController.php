<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlowController extends Controller
{
    private $apiUrl;
    private $apiKey;
    private $secret;
    private $commerceId;
    private $subject;
    private $currency;
    private $testEmail;

    public function __construct()
    {
        $this->apiUrl     = env('FLOW_API_URL', 'https://sandbox.flow.cl/api/payment/create');
        $this->apiKey     = env('FLOW_API_KEY');
        $this->secret     = env('FLOW_SECRET');
        $this->commerceId = env('FLOW_COMMERCE_ID');
        $this->subject    = env('FLOW_SUBJECT', 'Pago Ferremas');
        $this->currency   = env('FLOW_CURRENCY', 'CLP');
        $this->testEmail  = env('FLOW_TEST_EMAIL', 'cliente@correo.cl');

        if (!$this->apiKey || !$this->secret || !$this->commerceId) {
            throw new \Exception("Faltan credenciales de Flow en el archivo .env");
        }
    }

    public function pagar(Request $request)
    {
        $amount = 10000; // Puedes pasar esto por parámetro si es variable
        $order  = uniqid('orden_');

        $data = [
            'apiKey'          => $this->apiKey,
            'commerceOrder'   => $order,
            'subject'         => $this->subject,
            'currency'        => $this->currency,
            'amount'          => $amount,
            'email'           => $this->testEmail,
            'urlConfirmation' => route('flow.confirmacion'),
            'urlReturn'       => route('flow.retorno'),
        ];

        // Ordenar y firmar
        ksort($data);
        $data['s'] = hash_hmac('sha256', http_build_query($data), $this->secret);

        // Enviar a Flow
        $response = Http::asForm()->post($this->apiUrl, $data);

        if ($response->successful() && isset($response['url'])) {
            return redirect($response['url']);
        }

        Log::error('Error al conectar con Flow', ['response' => $response->body()]);

        return response()->json([
            'error'   => 'No se pudo conectar con Flow',
            'detalle' => $response->json()
        ], 500);
    }

    public function confirmacion(Request $request)
    {
        Log::info('Confirmación Flow', $request->all());

        return response('OK', 200);
    }

    public function retorno(Request $request)
    {
        return view('flow.exito', [
            'status' => $request->input('status', 'desconocido'),
            'order'  => $request->input('commerceOrder')
        ]);
    }
}
