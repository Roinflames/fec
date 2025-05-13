<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FlowController;

// Ruta principal
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Rutas protegidas por autenticación
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Rutas de Flow (pueden estar fuera del grupo auth si quieres acceso público)
Route::post('/pagar', [FlowController::class, 'pagar'])->name('flow.pagar');
Route::post('/confirmacion', [FlowController::class, 'confirmacion'])->name('flow.confirmacion');
Route::get('/retorno', [FlowController::class, 'retorno'])->name('flow.retorno');

// Incluir archivos de rutas adicionales
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';



