<?php

namespace App\Http\Controllers;


use App\Models\Hutang;
use App\Models\SpkCmt;
use Illuminate\Http\Request;

class HutangController extends Controller
{
    
    public function index()
    {
        
        $hutangs = Hutang::with('spk')->get(); // Mengambil semua hutang beserta relasi SPK
        return response()->json([
            'success' => true,
            'data' => $hutangs,
        ]);
    }

    
    public function create()
    {
       // Ambil data SPK untuk memilih penjahit
       $spks = SpkCmt::all();
       return response()->json([
           'success' => true,
           'spks' =>  $spks
       ]);
    }

   
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_spk' => 'required|exists:spk_cmt,id_spk',
            'jumlah_hutang' => 'required|numeric|min:1',
            'status_pembayaran' => 'required|in:belum lunas,lunas,dibayar sebagian',
            'tanggal_jatuh_tempo' => 'required|date',
            'tanggal_hutang' => 'required|date',
        ]);

        // Menyimpan data Hutang
        $hutang = Hutang::create($validated); // Simpan hutang dan tangkap data hutang yang baru disimpan

         return response()->json([
            'success' => true,
            'message' => 'hutang berhasil disimpan!',
            'data' => $hutang
        ], 201);

    }

    
    public function show($id)
    {
        $hutang = Hutang::with('spk')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $hutang,
        ]);
    }

   
    public function edit($id)
    {
        $hutang = Hutang::findOrFail($id); // Mengambil data hutang berdasarkan id
        $spks = SpkCmt::all(); // Ambil data SPK untuk memilih penjahit
        return response()->json([
            'success' => true,
            'hutang' => $hutang, // Mengembalikan data hutang
            'spks' => $spks // Mengembalikan data SPK
        ]);
    }

   
    public function update(Request $request, $id)
    {
         // Validasi inputan
         $validated = $request->validate([
            'id_spk' => 'required|exists:spk_cmt,id_spk',
            'jumlah_hutang' => 'required|numeric|min:1',
            'status_pembayaran' => 'required|in:belum lunas,lunas,dibayar sebagian',
            'tanggal_jatuh_tempo' => 'required|date',
            'tanggal_hutang' => 'required|date',
        ]);

        // Mencari dan memperbarui hutang
        $hutang = Hutang::findOrFail($id);
        $hutang->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'hutang berhasil diperbarui!',
            'data' => $hutang
        ]);
    }

   
    public function destroy($id)
    {
        $hutang = Hutang::findOrFail($id);
        $hutang->delete();

        return response()->json([
            'success' => true,
            'message' => 'hutang berhasil dihapus!'
        ]);
    }
}
