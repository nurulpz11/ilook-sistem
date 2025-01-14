<?php

namespace App\Http\Controllers;

use App\Models\Cashboan;
use App\Models\SpkCmt;
use Illuminate\Http\Request;

class CashboanController extends Controller
{
    // Menampilkan semua data Cashboan
    public function index()
    {
        $cashboans = Cashboan::with('spk')->get(); // Mengambil semua cashboan beserta relasi SPK
        return response()->json([
            'success' => true,
            'data' => $cashboans,
        ]);
    }

    // Menampilkan form untuk membuat Cashboan baru
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
            'jumlah_cashboan' => 'required|numeric|min:1',
            'status_pembayaran' => 'required|in:belum lunas,lunas,dibayar sebagian',
            'tanggal_jatuh_tempo' => 'required|date',
            'tanggal_cashboan' => 'required|date',
        ]);

        // Menyimpan data Cashboan
        $cashboan = Cashboan::create($validated); // Simpan cashboan dan tangkap data cashboan yang baru disimpan

         return response()->json([
            'success' => true,
            'message' => ' cashboan berhasil disimpan!',
            'data' => $cashboan
        ], 201);

    }
    // Menampilkan form untuk mengedit Cashboan
    public function edit($id)
    {
        $cashboan = Cashboan::findOrFail($id); // Mengambil data cashboan berdasarkan id
        $spks = SpkCmt::all(); // Ambil data SPK untuk memilih penjahit
        return response()->json([
            'success' => true,
            'cashboan' => $cashboan, // Mengembalikan data cashboan
            'spks' => $spks // Mengembalikan data SPK
        ]);
    }

    // Memperbarui data Cashboan
    public function update(Request $request, $id)
    {
        // Validasi inputan
        $validated = $request->validate([
            'id_spk' => 'required|exists:spk_cmt,id_spk',
            'jumlah_cashboan' => 'required|numeric|min:1',
            'status_pembayaran' => 'required|in:belum lunas,lunas,dibayar sebagian',
            'tanggal_jatuh_tempo' => 'required|date',
            'tanggal_cashboan' => 'required|date',
        ]);

        // Mencari dan memperbarui cashboan
        $cashboan = Cashboan::findOrFail($id);
        $cashboan->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'cashboan berhasil diperbarui!',
            'data' => $cashboan
        ]);
    }

    // Menghapus data Cashboan
    public function destroy($id)
    {
        $cashboan = Cashboan::findOrFail($id);
        $cashboan->delete();

        return response()->json([
            'success' => true,
            'message' => 'cashboan berhasil dihapus!'
        ]);
    }
}
