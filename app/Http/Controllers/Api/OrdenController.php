<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrito;
use App\Models\Orden;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class OrdenController extends Controller
{
    public function crearOrdenDesdeCarrito(Request $request)
    {
        $user = Auth::user();
        $carrito = Carrito::where('user_id', $user->id)->with('producto')->get();

        if ($carrito->isEmpty()) {
            return response()->json(['error' => 'El carrito está vacío'], 400);
        }

        DB::beginTransaction();
        try {
            $total = $carrito->sum(fn($item) => $item->cantidad * $item->producto->precio);

            $orden = Orden::create([
                'user_id' => $user->id,
                'total' => $total,
                'estado' => 'pendiente'
            ]);

            foreach ($carrito as $item) {
                $orden->productos()->attach($item->producto_id, [
                    'cantidad' => $item->cantidad,
                    'precio_unitario' => $item->producto->precio
                ]);
            }

            $carrito->each->delete();

            DB::commit();
            return response()->json(['orden_id' => $orden->id, 'total' => $total, 'commerceOrder' => $orden->id]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear la orden', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'No se pudo crear la orden'], 500);
        }
    }

    public function flowCallback(Request $request)
    {
        $datos = $request->all();
        Log::info('Callback recibido de Flow', $datos);

        if (!isset($datos['commerceOrder'], $datos['status'], $datos['s'])) {
            return response('Datos incompletos', 400);
        }

        $secret = env('FLOW_SECRET');
        $firma_local = hash_hmac('sha256', http_build_query(collect($datos)->except('s')->sort()->toArray()), $secret);

        if (!hash_equals($firma_local, $datos['s'])) {
            Log::warning('Firma inválida en callback de Flow');
            return response('Firma inválida', 403);
        }

        $orden = Orden::find($datos['commerceOrder']);

        if (!$orden) {
            return response('Orden no encontrada', 404);
        }

        $orden->estado = $datos['status'] === 'AUTHORIZED' ? 'pagado' : 'fallido';
        $orden->flow_order_id = $datos['flowOrder'];
        $orden->save();

        return response('OK', 200);
    }
}
