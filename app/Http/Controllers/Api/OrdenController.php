<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrito;
use App\Models\Orden;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrdenController extends Controller
{
    /**
     * Crear una orden desde el carrito y redirigir a Flow.
     */
    public function crearOrdenDesdeCarrito()
    {
        $usuario = Auth::user();
        $carrito = $usuario->carrito()->with('productos')->first();

        if (!$carrito || $carrito->productos->isEmpty()) {
            return response()->json(['message' => 'Carrito vacío'], 400);
        }

        // Crear la orden vacía
        $orden = $usuario->ordenes()->create([
            'estado' => 'pendiente',
            'total'  => 0
        ]);

        $total = 0;

        foreach ($carrito->productos as $producto) {
            $subtotal = $producto->precio * $producto->pivot->cantidad;

            $orden->productos()->attach($producto->id, [
                'cantidad'        => $producto->pivot->cantidad,
                'precio_unitario' => $producto->precio,
                'subtotal'        => $subtotal,
            ]);

            $total += $subtotal;
        }

        // Actualizar total en la orden
        $orden->update(['total' => $total]);

        // Vaciar el carrito
        $carrito->productos()->detach();

        // Instanciar Flow
        $flow = new \Flow\FlowApi([
            "apiKey"    => config('services.flow.api_key'),
            "secretKey" => config('services.flow.secret_key'),
            "url"       => config('services.flow.api_url'),
        ]);

        $response = $flow->send("payment/create", [
            "commerceOrder" => $orden->id,
            "subject"       => "Pago Ferremas",
            "currency"      => "CLP",
            "amount"        => $total,
            "email"         => $usuario->email,
            "urlReturn"     => config('services.flow.return_url'),
            "urlCallback"   => url('/api/flow/callback'),
        ]);

        return response()->json([
            'message'   => 'Orden creada',
            'orden_id'  => $orden->id,
            'url_pago'  => $response['url']
        ]);
    }

    /**
     * Callback de Flow para actualizar estado de orden.
     */
    public function flowCallback(Request $request)
    {
        $datos = $request->all();
        Log::info('Callback recibido de Flow', $datos);

        // Validación básica
        if (!isset($datos['commerceOrder'], $datos['status'], $datos['s'])) {
            return response('Datos incompletos', 400);
        }

        // Verificar firma
        $firmaLocal = hash_hmac(
            'sha256',
            http_build_query(collect($datos)->except('s')->sort()->toArray()),
            config('services.flow.secret_key') // asegúrate de usar el mismo nombre que en config/services.php
        );

        if (!hash_equals($firmaLocal, $datos['s'])) {
            Log::warning('Firma inválida en callback de Flow');
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
