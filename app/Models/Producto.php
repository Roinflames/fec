<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Producto extends Model
{
    protected $fillable = ['nombre', 'descripcion', 'precio', 'stock'];

    /**
     * Relación: este producto está en muchos carritos.
     */
    public function carritos(): BelongsToMany
    {
        return $this->belongsToMany(Carrito::class, 'carrito_producto')
                    ->withPivot('cantidad')
                    ->withTimestamps();
    }

    /**
     * Relación: este producto ha sido incluido en muchas órdenes.
     */
    public function ordenes(): BelongsToMany
    {
        return $this->belongsToMany(Orden::class, 'orden_producto')
                    ->withPivot('cantidad', 'precio_unitario')
                    ->withTimestamps();
    }
}
