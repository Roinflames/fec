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
    /**
     * Crear una orden desde el carrito y redirigir a Flow.
     */
    // public function crearOrdenDesdeCarrito()
    // {
    //     $usuario = Auth::user();
    //     $carrito = $usuario->carrito()->with('productos')->first();

    //     if (!$carrito || $carrito->productos->isEmpty()) {
    //         return response()->json(['message' => 'Carrito vacío'], 400);
    //     }

    //     // Crear orden inicial
    //     $orden = $usuario->ordenes()->create([
    //         'estado' => 'pendiente',
    //         'total' => 0
    //     ]);

    //     $total = 0;

    //     foreach ($carrito->productos as $producto) {
    //         $subtotal = $producto->precio * $producto->pivot->cantidad;

    //         $orden->productos()->attach($producto->id, [
    //             'cantidad' => $producto->pivot->cantidad,
    //             'precio_unitario' => $producto->precio,
    //             'subtotal' => $subtotal,
    //         ]);

    //         $total += $subtotal;
    //     }

    //     // Actualizar total
    //     $orden->update(['total' => $total]);

    //     // Vaciar carrito
    //     $carrito->productos()->detach();

    //     // Preparar credenciales fijas (en duro)
    //     $apiKey = '1F522BCF-2CB5-45F9-8EA4-8016C933L426';
    //     $secretKey = '8d7c176d79c7811e3406cab4edb699914d6341ce';
    //     $subject = 'Pago de prueba desde Laravel';
    //     $currency = 'CLP';
    //     $email = $usuario->email;
    //     $urlReturn = 'https://comunidadvirtual.cl/retorno.php';
    //     $urlCallback = 'https://comunidadvirtual.cl/notificacion.php';
    //     $commerceOrder = $orden->id;

    //     // Crear string para la firma
    //     $message =
    //         'amount=' . $total .
    //         '&apiKey=' . $apiKey .
    //         '&commerceOrder=' . $commerceOrder .
    //         '&currency=' . $currency .
    //         '&email=' . $email .
    //         '&subject=' . $subject .
    //         '&urlConfirmation=' . $urlCallback .
    //         '&urlReturn=' . $urlReturn;

    //     $signature = hash_hmac('sha256', $message, $secretKey);

    //     $params = [
    //         'apiKey' => $apiKey,
    //         'commerceOrder' => $commerceOrder,
    //         'subject' => $subject,
    //         'currency' => $currency,
    //         'amount' => $total,
    //         'email' => $email,
    //         'urlReturn' => $urlReturn,
    //         'urlConfirmation' => $urlCallback,
    //         's' => $signature,
    //     ];

    //     try {
    //         $client = new Client();
    //         $response = $client->post('https://sandbox.flow.cl/api/payment/create', [
    //             'form_params' => $params,
    //         ]);

    //         $data = json_decode($response->getBody(), true);

    //         return response()->json([
    //             'message' => 'Orden creada',
    //             'orden_id' => $orden->id,
    //             'url_pago' => $data['url'] . '?token=' . $data['token'],
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Error al crear pago con Flow: ' . $e->getMessage());
    //         return response()->json(['message' => 'Error al conectar con Flow'], 500);
    //     }
    //     Log::info('Respuesta de Flow:', $response);

    // }

    public function crearOrdenDesdeCarrito()
    {
        $usuario = Auth::user();
        $carrito = $usuario->carrito()->with('productos')->first();

        if (!$carrito || $carrito->productos->isEmpty()) {
            return response()->json(['message' => 'Carrito vacío'], 400);
        }

        // Crear orden inicial
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

        // Vaciar carrito
        $carrito->productos()->detach();

        // === Flow ===
        $apiKey = '1F522BCF-2CB5-45F9-8EA4-8016C933L426';
        $secretKey = '8d7c176d79c7811e3406cab4edb699914d6341ce';
        $subject = 'Pago de prueba desde Laravel';
        $currency = 'CLP';
        $email = $usuario->email;
        $urlReturn = 'https://comunidadvirtual.cl/retorno.php';
        $urlCallback = 'https://comunidadvirtual.cl/notificacion.php';
        $commerceOrder = $orden->id;
        $amount = (string) intval($total); // ✅ importante: entero como string

        // Crear firma
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
            $client = new \GuzzleHttp\Client();
            $response = $client->post('https://sandbox.flow.cl/api/payment/create', [
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

    /**
     * Callback de Flow (confirmación de pago).
     */
    public function flowCallback(Request $request)
    {
        $datos = $request->all();
        Log::info('Callback recibido de Flow', $datos);

        if (!isset($datos['commerceOrder'], $datos['status'], $datos['s'])) {
            return response('Datos incompletos', 400);
        }

        $secretKey = '8d7c176d79c7811e3406cab4edb699914d6341ce';
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
