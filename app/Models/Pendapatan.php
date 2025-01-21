<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pendapatan extends Model
{
    use HasFactory;
    protected $table = 'pendapatan';
    protected $primaryKey = 'id_pendapatan';

    protected $fillable = [
        'id_penjahit',
        'periode_awal',
        'periode_akhir',
        'total_pendapatan',
        'total_claim',
        'total_refund_claim',
        'total_cashbon',
        'total_hutang',
        'handtag',
        'transportasi',
        'total_transfer',
    ];

    // Relasi ke Penjahit
    public function penjahit()
    {
        return $this->belongsTo(Penjahit::class, 'id_penjahit', 'id_penjahit');
    }

    public function pengiriman()
    {
        return $this->hasMany(Pengiriman::class, 'id_penjahit', 'id_penjahit');
    }

}
