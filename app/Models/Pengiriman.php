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
        'foto_nota',
        'status_verifikasi',
    ];

    protected $attributes = [
        'status_verifikasi' => 'pending', 
    ];
   
    protected $appends = ['sisa_barang_per_warna'];


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

    public static function getStatusOptions()
    {
        return ['pending', 'valid', 'invalid'];
    }

    public function setStatusVerifikasiAttribute($value)
    {
        if (!in_array($value, self::getStatusOptions())) {
            throw new \InvalidArgumentException("Status verifikasi tidak valid.");
        }
        $this->attributes['status_verifikasi'] = $value;
    }

    public function warna()
    {
        return $this->hasMany(PengirimanWarna::class, 'id_pengiriman');
    }


    public function spk()
    {
        return $this->belongsTo(SpkCmt::class, 'id_spk', 'id_spk');
    }
    
    public function pendapatan()
    {
        return $this->belongsToMany(Pendapatan::class, 'pengiriman_pendapatan', 'id_pengiriman', 'id_pendapatan');
    }
    


}
