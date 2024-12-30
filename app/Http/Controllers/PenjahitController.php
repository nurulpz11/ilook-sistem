<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Penjahit;

class PenjahitController extends Controller
{
    // Menampilkan semua penjahit
    public function index()
    {
        $penjahits = Penjahit::all();
        return response()->json($penjahits); // Mengembalikan data penjahit dalam format JSON
    }

    // Menampilkan form untuk membuat penjahit baru (untuk React, ini bisa digantikan dengan form di frontend)
    public function create()
    {
        return response()->json(['message' => 'Use the frontend to create a new penjahit.']); // Pesan bahwa form di frontend
    }

   // Menyimpan Penjahit baru
   public function store(Request $request)
   {
       // Validasi input data
       $validated = $request->validate([
           'nama_penjahit' => 'required|string|max:100',
           'kontak' => 'required|string|max:100',
           'alamat' => 'required|string',
       ]);

       // Membuat penjahit baru
       $penjahit = Penjahit::create($validated);

       // Mengembalikan response dengan data penjahit yang baru
       return response()->json($penjahit, 201);
   }


    // Menampilkan penjahit berdasarkan ID
    public function show($id)
    {
        $penjahit = Penjahit::findOrFail($id);
        return response()->json($penjahit); // Mengembalikan data penjahit berdasarkan ID
    }

    // Menampilkan form untuk mengedit penjahit (untuk React, ini bisa digantikan dengan form di frontend)
    public function edit($id)
    {
        $penjahit = Penjahit::findOrFail($id);
        return response()->json($penjahit); // Mengembalikan data penjahit yang akan diedit
    }

    // Memperbarui penjahit yang sudah ada
    public function update(Request $request, $id) {
        $data = $request->all(); 
    $validated = $request->validate([
        'nama_penjahit' => 'required|string|max:100',
        'kontak' => 'required|string|max:100',
        'alamat' => 'required|string',
    ]);

    \Log::debug("Validated Data: ", $validated);

    // Melanjutkan logika update
    $penjahit = Penjahit::findOrFail($id);
    $penjahit->update($validated);

    return response()->json(['message' => 'Penjahit berhasil diperbarui!', 'data' => $penjahit]);
}

}
