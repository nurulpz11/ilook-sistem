<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cashboan extends Model
{
    use HasFactory;

    protected $table = 'cashboan'; 
    protected $primaryKey = 'id_cashboan';

    protected $fillable = [
        'id_spk',
        'jumlah_cashboan',
        'status_pembayaran',
        'tanggal_jatuh_tempo',
        'tanggal_cashboan',
    ];

    // Relasi dengan model SPK (SpkCmt)
    public function spk()
    {
        return $this->belongsTo(SpkCmt::class, 'id_spk');
    }

    public function logPembayaran()
    {
        return $this->hasMany(LogPembayaranCashboan::class, 'id_cashboan');
    }
}
