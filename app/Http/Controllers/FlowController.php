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

    public function __construct()
    {
        $this->apiUrl = env('FLOW_API_URL', 'https://sandbox.flow.cl/api/payment/create');
        $this->apiKey = env('FLOW_API_KEY');
        $this->secret = env('FLOW_SECRET');
        $this->commerceId = env('FLOW_COMMERCE_ID');

        if (!$this->apiKey || !$this->secret || !$this->commerceId) {
            throw new \Exception("Faltan credenciales de Flow en el archivo .env");
        }
    }

    public function pagar(Request $request)
    {
        $amount = 10000;
        $order = uniqid();

        $data = [
            'apiKey'          => $this->apiKey,
            'commerceOrder'   => $order,
            'subject'         => 'Pago de prueba',
            'currency'        => 'CLP',
            'amount'          => $amount,
            'email'           => 'cliente@correo.com',
            'urlConfirmation' => route('flow.confirmacion'),
            'urlReturn'       => route('flow.retorno'),
        ];

        ksort($data);
        $data['s'] = hash_hmac('sha256', http_build_query($data), $this->secret);

        $response = Http::asForm()->post($this->apiUrl, $data);

        if ($response->successful() && isset($response['url'])) {
            return redirect($response['url']);
        }

        Log::error('Error al conectar con Flow', ['response' => $response->body()]);

        return response()->json([
            'error' => 'No se pudo conectar con Flow',
            'detalle' => $response->json()
        ], 500);
    }

    public function confirmacion(Request $request)
    {
        // Flow hace POST aquí después del pago (debe validarse el hash si se usa en producción)
        Log::info('Confirmación Flow', $request->all());

        return response('OK', 200);
    }

    public function retorno(Request $request)
    {
        // Aquí podrías mostrar resultado al cliente según status
        return view('flow.exito', [
            'status' => $request->input('status', 'desconocido'),
            'order' => $request->input('commerceOrder')
        ]);
    }
}
