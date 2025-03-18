<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    use HasFactory;
    protected $table = 'produk';

    
    protected $fillable = [
        'nama_produk',
        'kategori_produk',
        'gambar_produk',
        'jenis_produk'

    ];

    public static function getKategoriOptions()
    {
        return ['Urgent', 'Normal']; 
    }
    public static function getJenisOptions()
    {
        return ['Gamis', 'Kaos', 'Celana']; 
    }
    
}
