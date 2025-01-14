<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hutang extends Model
{
    use HasFactory;
    protected $table = 'hutang';
    protected $primaryKey = 'id_hutang';

    protected $fillable = [
        'id_spk',
        'jumlah_hutang',
        'status_pembayaran',
        'tanggal_jatuh_tempo',
        'tanggal_hutang',
    ];

    // Relasi ke tabel SPK
    public function spk()
    {
        return $this->belongsTo(SpkCmt::class, 'id_spk');
    }
}
