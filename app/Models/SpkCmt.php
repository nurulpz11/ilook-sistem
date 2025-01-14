<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpkCmt extends Model
{
    use HasFactory;
    protected $table = 'spk_cmt'; // Nama tabel
    protected $primaryKey = 'id_spk'; // Primary key

    protected $fillable = [
        'tgl_spk',
        'nama_produk',
        'jumlah_produk',
        'deadline',
        'id_penjahit',
        'keterangan',
        'status',
        'nomor_seri', 
        'gambar_produk', 
        'tanggal_ambil', 
        'catatan', 
        'markeran', 
        'aksesoris', 
        'handtag', 
        'merek',
        'harga_per_barang',
        'total_harga',
        'harga_per_jasa',
    ];
   
    public function getTotalHargaAttribute()
    {
        return $this->harga_per_barang * $this->jumlah_produk;
    }
    
    // Relasi ke tabel penjahit
    public function penjahit()
    {
        return $this->belongsTo(Penjahit::class, 'id_penjahit');
    }


    // Relasi ke tabel warna (One-to-Many)
    public function warna()
    {
        return $this->hasMany(Warna::class, 'id_spk', 'id_spk');
    }
    public function logDeadlines()
{
    return $this->hasMany(LogDeadline::class, 'id_spk');
}

}