<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MarkeranProduk;
use App\Models\Produk;

class MarkeranProdukController extends Controller
{
    public function index()
    {
        $data = MarkeranProduk::with('produk')->get();
        return response()->json($data);
    }
   public function store(Request $request)
{
    $validated = $request->validate([
        'produk_id' => 'required|exists:produk,id',
        'nama_komponen' => 'required|string|max:255',
        'total_panjang' => 'required|numeric|min:0',
        'jumlah_hasil' => 'required|integer|min:1',
    ]);

    // Hitung berat_per_pcs otomatis
    $berat_per_pcs = $validated['total_panjang'] / $validated['jumlah_hasil'];

    $markeran = MarkeranProduk::create([
        'produk_id' => $validated['produk_id'],
        'nama_komponen' => $validated['nama_komponen'],
        'total_panjang' => $validated['total_panjang'],
        'jumlah_hasil' => $validated['jumlah_hasil'],
        'berat_per_pcs' => $berat_per_pcs,
    ]);

    return response()->json([
        'message' => 'Markeran produk berhasil disimpan.',
        'data' => $markeran
    ], 201);
}

}
