<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarritoController;
use App\Http\Controllers\Api\OrdenController;

Route::apiResource('productos', ProductoController::class);

Route::get('/debug-productos', function () {
    return \App\Models\Producto::all();
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/user',    [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Carrito
    Route::prefix('carrito')->group(function () {
        Route::get('/',        [CarritoController::class, 'index']);
        Route::post('/add',    [CarritoController::class, 'add']);
        Route::post('/remove', [CarritoController::class, 'remove']);
        Route::post('/clear',  [CarritoController::class, 'clear']);
    });

    // Órdenes
    Route::post('/orden/crear', [OrdenController::class, 'crearOrdenDesdeCarrito']);
});

// Callback de Flow (no requiere token, es llamado externo)
Route::post('/flow/callback', [OrdenController::class, 'flowCallback']);
