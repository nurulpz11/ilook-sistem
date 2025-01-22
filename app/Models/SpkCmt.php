<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SpkCmt extends Model
{
    use HasFactory;
    protected $table = 'spk_cmt'; // Nama tabel
    protected $primaryKey = 'id_spk'; // Primary key
    protected $appends = ['waktu_pengerjaan'];

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
        'waktu_pengerjaan_terakhir',
        'sisa_hari_terakhir',
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

    public function logStatus()
    {
        return $this->hasMany(LogStatus::class, 'id_spk', 'id_spk');
    }


    public function pengiriman()
    {
        return $this->hasMany(Pengiriman::class, 'id_spk', 'id_spk');
    }

    public function getWaktuPengerjaanAttribute()
    {
        // Pastikan tanggal ambil ada
        if (!$this->tanggal_ambil) {
            return null; // Jika belum ada tanggal ambil, return null
        }
    
        $tanggalMulai = Carbon::parse($this->tanggal_ambil);
    
        // Jika dianggap selesai, gunakan updated_at; jika belum, gunakan now()
        $tanggalSelesai = now(); // Ganti $this->updated_at

    
        // Hitung selisih hari
        return $tanggalMulai->diffInDays($tanggalSelesai);
    }
    public function getStatusWithColorAttribute()
    {
        if (in_array($this->status, ['In Progress', 'Pending'])) {
            $waktuPengerjaan = $this->waktu_pengerjaan; // Ambil waktu pengerjaan
    
            if ($waktuPengerjaan <= 7) {
                return [
                    'status' => $this->status,
                    'color' => 'red', // Minggu pertama
                ];
            } elseif ($waktuPengerjaan > 7 && $waktuPengerjaan <= 14) {
                return [
                    'status' => $this->status,
                    'color' => 'blue', // Minggu kedua
                ];
            } else {
                return [
                    'status' => $this->status,
                    'color' => 'green', // Di luar minggu kedua
                ];
            }
        }
    
        return [
            'status' => $this->status,
            'color' => 'gray', // Default untuk status lain
        ];
    }
    
    // Di model SpkCmt
    public function getTotalBarangDikirimAttribute()
    {
        return $this->pengiriman()->sum('total_barang_dikirim');
    }

    public function setStatus($newStatus)
    {
        // Simpan nilai terakhir jika status berubah menjadi Pending
        if ($newStatus === 'Pending') {
            $this->sisa_hari_terakhir = $this->getSisaHariAttribute();
            $this->waktu_pengerjaan_terakhir = $this->getWaktuPengerjaanAttribute();
        }
    
        // Ubah status
        $this->status = $newStatus;
    
        // Simpan perubahan ke database
        $this->save();
    }
    public function getSisaHariAttribute()
{
    if ($this->status === 'Pending') {
        \Log::info('Status Pending - Mengembalikan sisa_hari_terakhir', [
            'sisa_hari_terakhir' => $this->sisa_hari_terakhir,
        ]);
        return $this->sisa_hari_terakhir; // Jika status "Pending", gunakan nilai terakhir
    }

    if (!$this->deadline) {
        \Log::info('Deadline tidak ada - Mengembalikan null');
        return null; // Jika tidak ada deadline, return null
    }

    $deadline = Carbon::parse($this->deadline);

    // Menggunakan isPast() dan diffInDays()
    $sisaHari = $deadline->isPast() ? 0 : $deadline->diffInDays(now());

    \Log::info('Menghitung sisa_hari', [
        'deadline' => $this->deadline,
        'tanggalSekarang' => now(),
        'sisaHari' => $sisaHari,
    ]);

    return $sisaHari;
}






}