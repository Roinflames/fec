<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Orden extends Model
{
    protected $table = 'ordenes';

    protected $fillable = ['user_id', 'total', 'estado', 'flow_order_id'];

    /**
     * Relación: una orden pertenece a un usuario.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación: una orden tiene muchos productos (con cantidad y precio).
     */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'orden_producto')
                    ->withPivot('cantidad', 'precio_unitario')
                    ->withTimestamps();
    }
}
