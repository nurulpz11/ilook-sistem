<?php

namespace App\Http\Controllers;

use App\Models\Pengiriman;
use App\Models\PengirimanWarna;
use App\Models\Warna; // Menambahkan import untuk model Warna
use App\Models\SpkCmt;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PengirimanController extends Controller
{

     // Menampilkan semua penjahit
     public function index()
     {
         $pengiriman = Pengiriman::with(['warna', 'spk.penjahit'])
             ->get()
             ->map(function ($pengiriman) {
                 // Hitung sisa barang per warna
                 $sisaBarangPerWarna = [];
                 foreach ($pengiriman->warna as $warna) {
                     $warnaData = Warna::where('id_spk', $pengiriman->id_spk)
                         ->where('nama_warna', $warna->warna)
                         ->first();
     
                     if ($warnaData) {
                         $totalSudahDikirim = PengirimanWarna::whereHas('pengiriman', function ($query) use ($pengiriman) {
                             $query->where('id_spk', $pengiriman->id_spk);
                         })
                         ->where('warna', $warna->warna)
                         ->sum('jumlah_dikirim');
     
                         $sisaBarang = $warnaData->qty - $totalSudahDikirim;
                         $sisaBarangPerWarna[$warna->warna] = $sisaBarang;
                     }
                 }
     
                 // Tambahkan properti nama_penjahit
                 $pengiriman->sisa_barang_per_warna = $sisaBarangPerWarna;
                 $pengiriman->nama_penjahit = $pengiriman->spk->penjahit->nama_penjahit ?? null;
     
                 return $pengiriman;
             });
     
         return response()->json(['data' => $pengiriman]);
     }
     

public function store(Request $request)
{
    $validated = $request->validate([
        'id_spk' => 'required|exists:spk_cmt,id_spk',
        'tanggal_pengiriman' => 'required|date',
        'warna' => 'required|array',
        'warna.*.warna' => 'required|string|max:50',
        'warna.*.jumlah_dikirim' => 'required|integer|min:0',
    ]);

    // Ambil data SPK
    $spk = SpkCmt::findOrFail($validated['id_spk']);
    
    // Ambil stok awal dari tabel warna
    $warnaSpk = Warna::where('id_spk', $validated['id_spk'])->get();

    // Hitung jumlah barang yang sudah dikirim per warna
    $pengirimanSebelumnya = PengirimanWarna::whereHas('pengiriman', function ($query) use ($validated) {
        $query->where('id_spk', $validated['id_spk']);
    })->get();

    $sudahDikirimPerWarna = $pengirimanSebelumnya->groupBy('warna')->map(function ($group) {
        return $group->sum('jumlah_dikirim');
    });

    $sisaBarangPerWarna = [];
    $totalBayarSebelumnya = 0;
    $totalClaim = 0;
    $totalRefundClaim = 0;

    Log::info('stokAwal semua warna:', [$warnaSpk]);

    foreach ($validated['warna'] as $warnaInput) {
        $warnaSpkItem = $warnaInput['warna'];
        $jumlahDikirim = $warnaInput['jumlah_dikirim'];

        // Ambil stok awal dari tabel warna
        $warnaData = $warnaSpk->where('nama_warna', $warnaSpkItem)->first();

        if (!$warnaData) {
            return response()->json(['error' => "Warna $warnaSpkItem tidak ditemukan untuk SPK ini"], 400);
        }

        $stokAwal = $warnaData->qty;
        $totalSudahDikirim = $sudahDikirimPerWarna[$warnaSpkItem] ?? 0;

        // Hitung sisa barang setelah pengiriman baru
        $sisaBarang = $stokAwal - $totalSudahDikirim;

        if ($jumlahDikirim > $sisaBarang) {
            return response()->json([
                'error' => "Jumlah barang dikirim untuk warna $warnaSpkItem melebihi sisa yang tersedia. Sisa: $sisaBarang pcs"
            ], 400);
        }

      
      
        $sisaBarangPerWarna[$warnaSpkItem] = $sisaBarang - $jumlahDikirim;
            }

            // Hitung total barang dikirim
            $totalBarangDikirim = collect($validated['warna'])->sum('jumlah_dikirim');

            // Ambil semua pengiriman sebelumnya untuk menghitung total bayar sebelumnya
            $pengirimanSebelumnya = Pengiriman::where('id_spk', $validated['id_spk'])->get();
            $totalBayarSebelumnya = $pengirimanSebelumnya->sum('total_bayar');

            // Hitung total bayar berdasarkan logika baru
            $jumlahPengiriman = $pengirimanSebelumnya->count() + 1; // Termasuk pengiriman sekarang
            $sisaBarangTotal = array_sum($sisaBarangPerWarna);

            
            $totalBayar = ($totalBarangDikirim * $spk->harga_per_jasa);
        
              // Hitung claim untuk warna
            $claim = 0;
            Log::info('sisaBarang:', [$sisaBarangTotal]); // Log nilai sisaBarang
            Log::info('harga_per_barang:', [$spk->harga_per_barang]); // Log nilai harga_per_barang
            
            if ($sisaBarang > 0) {
                $claim = $sisaBarangTotal * $spk->harga_per_barang;
                Log::info('Claim Calculated:', [$claim]); // Log hasil claim
                $totalClaim += $claim;
                Log::info('Total Claim Akumulasi:', [$totalClaim]);

            }
            // Hitung refund claim jika ada (hanya untuk pengiriman setelah pengiriman pertama)
          // Hitung refund claim berdasarkan pengiriman sebelumnya
            $refundClaim = 0;
            $pengirimanSebelumnya = Pengiriman::where('id_spk', $validated['id_spk'])
                ->orderBy('created_at', 'desc') // Ambil pengiriman terakhir
                ->first();

            if ($pengirimanSebelumnya) {
                // Refund claim adalah nilai claim dari pengiriman sebelumnya
                $refundClaim = $pengirimanSebelumnya->claim;
                Log::info('Refund Claim Berdasarkan Pengiriman Sebelumnya:', [$refundClaim]);
            }

            $totalRefundClaim += $refundClaim;
            Log::info('Total Refund Claim Akumulasi:', [$totalRefundClaim]);

            // Simpan data pengiriman
            $pengiriman = Pengiriman::create([
                'id_spk' => $validated['id_spk'],
                'tanggal_pengiriman' => $validated['tanggal_pengiriman'],
                'total_barang_dikirim' => $totalBarangDikirim,
                'sisa_barang' => $sisaBarangTotal,
                'total_bayar' => $totalBayar,
                'claim' => $totalClaim,  // Simpan total claim di pengiriman
                'refund_claim' => $totalRefundClaim,  // Simpan total refund_claim di pengiriman
            ]);
            

            // Simpan detail pengiriman_warna
            foreach ($validated['warna'] as $warna) {
                PengirimanWarna::create([
                    'id_pengiriman' => $pengiriman->id_pengiriman,
                    'warna' => $warna['warna'],
                    'jumlah_dikirim' => $warna['jumlah_dikirim'],
                    'sisa_barang_per_warna' => $sisaBarangPerWarna[$warna['warna']], // Simpan sisa barang
                ]);
            }
            Log::info('Sisa Barang Total:', ['sisa_barang_total' => $sisaBarangTotal]);

            if ((int) $sisaBarangTotal === 0) {
                $spk->update(['status' => 'Completed']);
                Log::info('Status SPK diperbarui menjadi Completed', ['id_spk' => $spk->id_spk]);
            }
            

            // Respons dengan `sisa_barang_per_warna`
            return response()->json([
                'message' => 'Pengiriman berhasil dibuat!',
                'data' => array_merge($pengiriman->toArray(), [
                    'harga_per_barang' => $spk->harga_per_barang, // Menambahkan harga_per_barang
                    'sisa_barang_per_warna' => $sisaBarangPerWarna,
                    'warna' => $pengiriman->warna,
                ]),
                'total_bayar_sebelumnya' => $totalBayarSebelumnya,
                'total_harga_spk' => $spk->total_harga,
            ], 201);

            
        } 

    }     