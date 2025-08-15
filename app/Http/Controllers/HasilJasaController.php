<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HasilJasa;
use App\Models\SpkJasa;

class HasilJasaController extends Controller
{
   public function index()
{
    $data = HasilJasa::with([
        'spkJasa:id,tukang_jasa_id,spk_cutting_id', // perlu spk_cutting_id agar produk bisa nyambung
        'spkJasa.tukangJasa:id,nama',
        'spkJasa.produk' => function ($query) {
            $query->select('produk.id', 'nama_produk'); // nama_produk sesuai kolom di tabel produk
        }
    ])->get();

    return response()->json($data);
}  



    public function store(Request $request)
    {
        $validated = $request->validate([
            'spk_jasa_id'    => 'required|exists:spk_jasa,id',
            'tanggal'        => 'required|date',
            'jumlah_hasil'   => 'required|integer|min:1',
            
            
        ]);

        // Ambil data SPK Jasa untuk dapatkan harga per pcs
        $spkJasa = SpkJasa::findOrFail($validated['spk_jasa_id']);

        // Hitung total pendapatan
        $hargaPerPcs = $spkJasa->harga_per_pcs ?? 0;
        $totalPendapatan = $validated['jumlah_hasil'] * $hargaPerPcs;

        $validated['total_pendapatan'] = $totalPendapatan;


          // Simpan file KTP jika ada
        if ($request->hasFile('bukti_transfer')) {
            $validated['bukti_transfer'] = $request->file('bukti_transfer')->store('ktp_jasa', 'public');
            \Log::info('📸 KTP berhasil disimpan ', ['path' => $validated['ktp']]);
        }

        $hasil = HasilJasa::create($validated);

        return response()->json([
            'message' => 'Hasil Jasa berhasil ditambahkan.',
            'data' => $hasil
        ], 201);
    }
}
