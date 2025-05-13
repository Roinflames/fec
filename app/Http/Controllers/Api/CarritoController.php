<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Carrito;
use App\Models\Producto;
use Illuminate\Support\Facades\Auth;

class CarritoController extends Controller
{
    /**
     * Mostrar los productos en el carrito del usuario autenticado.
     */
    public function index()
    {
        $carrito = Auth::user()->carrito;

        if (!$carrito) {
            return response()->json(['productos' => []]);
        }

        $carrito->load('productos');

        $productos = $carrito->productos->map(function ($producto) {
            return [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'precio' => $producto->precio,
                'cantidad' => $producto->pivot->cantidad,
                'subtotal' => $producto->precio * $producto->pivot->cantidad,
            ];
        });

        return response()->json([
            'productos' => $productos,
            'total' => $productos->sum('subtotal'),
        ]);
    }

    /**
     * Agregar un producto al carrito del usuario.
     */
    public function add(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'cantidad'    => 'required|integer|min:1',
        ]);

        $usuario = Auth::user();
        $carrito = $usuario->carrito()->firstOrCreate([]);

        $productoId = $request->producto_id;
        $cantidad = $request->cantidad;

        // Verifica si ya existe el producto en el carrito
        $actual = $carrito->productos()->where('producto_id', $productoId)->first();
        if ($actual) {
            $cantidad += $actual->pivot->cantidad;
        }

        $carrito->productos()->syncWithoutDetaching([
            $productoId => ['cantidad' => $cantidad],
        ]);

        return response()->json(['message' => 'Producto agregado al carrito']);
    }

    /**
     * Eliminar un producto específico del carrito.
     */
    public function remove(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
        ]);

        $usuario = Auth::user();
        $carrito = $usuario->carrito;

        if (!$carrito) {
            return response()->json(['message' => 'Carrito vacío'], 404);
        }

        $carrito->productos()->detach($request->producto_id);

        return response()->json(['message' => 'Producto eliminado del carrito']);
    }

    /**
     * Vaciar el carrito completo.
     */
    public function clear()
    {
        $usuario = Auth::user();
        $carrito = $usuario->carrito;

        if ($carrito) {
            $carrito->productos()->detach();
        }

        return response()->json(['message' => 'Carrito vaciado']);
    }
}
