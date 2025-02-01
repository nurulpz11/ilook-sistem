<?php

namespace App\Http\Controllers;

use App\Models\Cashboan;
use App\Models\Penjahit;
use Illuminate\Http\Request;

class CashboanController extends Controller
{
    public function index(Request $request)
    {
        // Ambil parameter query dari request
        $penjahitId = $request->query('penjahit');
    
      
        $query = Cashboan::query();
    
        // Tambahkan kondisi filter jika ada parameter `penjahit`
        if (!empty($penjahitId)) {
            $query->where('id_penjahit', $penjahitId);
        }
    
        // Eksekusi query dan dapatkan data
        $cashboan = $query->orderBy('created_at', 'desc')->paginate(11); 
    
        return response()->json ($cashboan);
    }
    

    // Menampilkan form untuk membuat Cashboan baru
    public function create()
    {
        // Ambil data SPK untuk memilih penjahit
        $penjahits = Penjahit::all();
       return response()->json([
           'success' => true,
           'penjahits' => $penjahits // Menyesuaikan dengan nama Penjahit
       ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_penjahit' => 'required|exists:penjahit_cmt,id_penjahit',
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

    public function show($id)
    {
        $cashboan = Cashboan::with('penjahit')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $cahboan,
        ]);
    }


    // Menampilkan form untuk mengedit Cashboan
    public function edit($id)
    {
        $cashboan = Cashboan::findOrFail($id); // Mengambil data cashboan berdasarkan id
        $penjahits = Penjahit::all(); // Mengambil semua Penjahit
        return response()->json([
            'success' => true,
            'cashboan' => $cashboan,
            'penjahits' => $penjahits // Menyertakan data Penjahit
        ]);
    }

    // Memperbarui data Cashboan
    public function update(Request $request, $id)
    {
        // Validasi inputan
        $validated = $request->validate([
          'id_penjahit' => 'required|exists:penjahit_cmt,id_penjahit',
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
