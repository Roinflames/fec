<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrito;
use App\Models\Orden;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;

class OrdenController extends Controller
{
    public function crearOrdenDesdeCarrito()
    {
        $usuario = Auth::user();
        $carrito = $usuario->carrito()->with('productos')->first();

        if (!$carrito || $carrito->productos->isEmpty()) {
            return response()->json(['message' => 'Carrito vacío'], 400);
        }

        $orden = $usuario->ordenes()->create([
            'estado' => 'pendiente',
            'total' => 0
        ]);

        $total = 0;

        foreach ($carrito->productos as $producto) {
            $subtotal = $producto->precio * $producto->pivot->cantidad;

            $orden->productos()->attach($producto->id, [
                'cantidad' => $producto->pivot->cantidad,
                'precio_unitario' => $producto->precio,
                'subtotal' => $subtotal,
            ]);

            $total += $subtotal;
        }

        $orden->update(['total' => $total]);
        $carrito->productos()->detach();

        // === Flow desde .env ===
        $apiKey = env('FLOW_API_KEY');
        $secretKey = env('FLOW_SECRET');
        $subject = env('FLOW_SUBJECT', 'Pago desde Laravel');
        $currency = env('FLOW_CURRENCY', 'CLP');
        $email = $usuario->email;
        $urlReturn = env('FLOW_RETURN_URL');
        $urlCallback = env('FLOW_CONFIRMATION_URL');
        $commerceOrder = $orden->id;
        $amount = (string) intval($total);

        $message =
            'amount=' . $amount .
            '&apiKey=' . $apiKey .
            '&commerceOrder=' . $commerceOrder .
            '&currency=' . $currency .
            '&email=' . $email .
            '&subject=' . $subject .
            '&urlConfirmation=' . $urlCallback .
            '&urlReturn=' . $urlReturn;

        $signature = hash_hmac('sha256', $message, $secretKey);

        $params = [
            'apiKey' => $apiKey,
            'commerceOrder' => $commerceOrder,
            'subject' => $subject,
            'currency' => $currency,
            'amount' => $amount,
            'email' => $email,
            'urlReturn' => $urlReturn,
            'urlConfirmation' => $urlCallback,
            's' => $signature,
        ];

        try {
            $client = new Client();
            $response = $client->post(env('FLOW_API_URL'), [
                'form_params' => $params,
            ]);

            $data = json_decode($response->getBody(), true);

            Log::info('Respuesta de Flow', ['response' => $data]);

            return response()->json([
                'message' => 'Orden creada',
                'orden_id' => $orden->id,
                'url_pago' => $data['url'] . '?token=' . $data['token'],
            ]);
        } catch (\Exception $e) {
            Log::error('Error al crear pago con Flow', [
                'exception' => $e->getMessage(),
                'params' => $params,
            ]);
            return response()->json(['message' => 'Error al conectar con Flow'], 500);
        }
    }

    public function flowCallback(Request $request)
    {
        $datos = $request->all();
        Log::info('Callback recibido de Flow', $datos);

        if (!isset($datos['commerceOrder'], $datos['status'], $datos['s'])) {
            return response('Datos incompletos', 400);
        }

        $secretKey = env('FLOW_SECRET');
        $firmaLocal = hash_hmac(
            'sha256',
            http_build_query(collect($datos)->except('s')->sort()->toArray()),
            $secretKey
        );

        if (!hash_equals($firmaLocal, $datos['s'])) {
            Log::warning('Firma inválida en callback');
            return response('Firma inválida', 403);
        }

        $orden = Orden::find($datos['commerceOrder']);
        if (!$orden) {
            return response('Orden no encontrada', 404);
        }

        $orden->estado = $datos['status'] === 'AUTHORIZED' ? 'pagado' : 'fallido';
        $orden->flow_order_id = $datos['flowOrder'] ?? null;
        $orden->save();

        return response('OK', 200);
    }
}
