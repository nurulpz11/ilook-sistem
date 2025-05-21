<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpkCutting extends Model
{
    use HasFactory;
    protected $table = 'spk_cutting';

    
    protected $fillable = [
        'id_spk_cutting',
        'produk_id',
        'tanggal_batas_kirim',
        'keterangan',
        'harga_jasa',
        'satuan_harga',
        'harga_per_pcs',
        'tukang_cutting_id'

    ];
      public function produk()
    {
        return $this->belongsTo(Produk::class);
    }
    public function bagian()
    {
        return $this->hasMany(SpkCuttingBagian::class);
    }
    public function tukangCutting()
    {
        return $this->belongsTo(TukangCutting::class);
    }
    public function hasilCutting()
    {
        return $this->hasMany(HasilCutting::class);
    }


}
