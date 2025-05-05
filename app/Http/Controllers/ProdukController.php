<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProdukController extends Controller
{
    
   
    public function index(Request $request)
    {
        // Ambil filter dari query parameter
        $kategoriProduk = $request->query('kategori_produk');
        $sortBy = $request->query('sortBy', 'created_at');
        $sortOrder = $request->query('sortOrder', 'desc');
    
        // Query awal
        $query = Produk::query();
    
        // Filter kategori produk
        $query->when($kategoriProduk, fn($q) => $q->where('kategori_produk', $kategoriProduk));
    
        // Sorting hasil query
        $query->orderBy($sortBy, $sortOrder);
    
        // Ambil semua data
        $produk = $query->get();
    
        // Mapping data sebelum dikembalikan
        $produk->transform(function ($item) {
            $item->gambar_produk = asset('storage/' . $item->gambar_produk);
            return $item;
        });
    
        return response()->json(['data' => $produk], Response::HTTP_OK);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kategori_produk' => 'required|string|max:255',
            'gambar_produk' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:15000',
            'jenis_produk' => 'required|string|max:255',

        ]);
    
        // Jika ada file gambar, unggah dan simpan path-nya
        if ($request->hasFile('gambar_produk')) {
            $file = $request->file('gambar_produk');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('public/images', $fileName);
            $validated['gambar_produk'] = 'images/' . $fileName;
        }
    
        $produk = Produk::create($validated);
    
        return response()->json($produk, Response::HTTP_CREATED);
    }
    
  
    public function show(Produk $produk)
    {
        return response()->json($produk, Response::HTTP_OK);
    }

   
 public function update(Request $request, Produk $produk)
{
    $validated = $request->validate([
        'nama_produk' => 'required|string|max:255',
        'kategori_produk' => 'required|string|max:255',
        'jenis_produk' => 'required|string|max:255',
        'gambar_produk' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:15000',
    ]);

    if ($request->hasFile('gambar_produk')) {
        $validated['gambar_produk'] = $request->file('gambar_produk')->store('produk', 'public');
    }

    $produk->update($validated);

    return response()->json($produk, Response::HTTP_OK);
}

    

    
    public function destroy(Produk $produk)
    {
        $produk->delete();
        return response()->json(['message' => 'Produk berhasil dihapus'], Response::HTTP_OK);
    }
}
