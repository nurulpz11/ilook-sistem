<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengiriman extends Model
{
    use HasFactory;

    protected $table = 'pengiriman';
    protected $primaryKey = 'id_pengiriman';
    protected $fillable = [
        'id_spk',
        'tanggal_pengiriman',
        'total_barang_dikirim',
        'sisa_barang',
        'total_bayar',
        'claim',
        'refund_claim',
    ];
    // Properti virtual untuk sisa barang per warna
    protected $appends = ['sisa_barang_per_warna'];

    // Accessor untuk `sisa_barang_per_warna`
  // Model Pengiriman.php
public function getSisaBarangPerWarnaAttribute()
{
    $sisaBarangPerWarna = [];

    foreach ($this->warna as $warnaDetail) {
        $warnaData = Warna::where('id_spk', $this->id_spk)
            ->where('nama_warna', $warnaDetail->warna)
            ->first();

        if ($warnaData) {
            $sisaBarang = $warnaData->qty - $warnaDetail->jumlah_dikirim;
            $sisaBarangPerWarna[$warnaDetail->warna] = $sisaBarang;
        }
    }

    return $sisaBarangPerWarna;
}



    public function warna()
    {
        return $this->hasMany(PengirimanWarna::class, 'id_pengiriman');
    }
}
