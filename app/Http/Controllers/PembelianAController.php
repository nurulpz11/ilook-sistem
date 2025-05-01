<?php

namespace App\Http\Controllers;

use App\Models\PembelianA;
use Illuminate\Http\Request;

class PembelianAController extends Controller
{
  
    public function index()
    {
        $pembelianAksesoris = PembelianA::with([
            'pembelianB',
            'aksesoris:id,nama_aksesoris'
            ])->get();

        return response()->json($pembelianAksesoris);
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'user_id' =>'required|string',
            'aksesoris_id' =>'required|string',
            'jumlah' =>'required|integer',
            'harga_satuan' =>'required|numeric',
            'tanggal_pembelian' =>'required|date',
            'bukti_pembelian' => 'nullable|file|mimes:jpeg,png,pdf,jpg|max:5000'
        ]);

        $data = $request->all();

        // Menyimpan bukti pembelian jika ada
        if ($request->hasFile('bukti_pembelian')) {
            $data['bukti_pembelian'] = $request->file('bukti_pembelian')->store('bukti_pembelian', 'public');
        }

        // Menyimpan data pembelian
        $pembelianAksesoris = PembelianA::create($data);

        return response()->json($pembelianAksesoris, 201);
    }
    public function show($id)
    {
        //
    }

    
    public function update(Request $request, $id)
    {
        //
    }


    public function destroy($id)
    {
        //
    }
}
