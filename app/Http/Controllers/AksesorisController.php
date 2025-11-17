<?php

namespace App\Http\Controllers;


use App\Models\Aksesoris;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AksesorisController extends Controller
{
    public function index()
    {
        $aksesoris = Aksesoris::all();
        return response()->json($aksesoris);
    }
    

   
    public function store(Request $request)
    {
        $request->validate([
           'nama_aksesoris' => 'required|string',
           'jenis_aksesoris' => 'required|string|max:255',
           'satuan' => 'required|in:' . implode(',', array_keys(Aksesoris::getSatuanAksesorisOptions())),
        ]);

        $aksesoris = Aksesoris::create($request->all());
        return response()->json($aksesoris, 201);
    }

    public function getOptions()
    {
        // Log sebelum mengembalikan data
        Log::info('Mengambil opsi aksesoris: ', [
            'jenis_aksesoris' => Aksesoris::getJenisAksesorisOptions(),
            'satuan' => Aksesoris::getSatuanAksesorisOptions(),
        ]);
    
        return response()->json([
            'jenis_aksesoris' => Aksesoris::getJenisAksesorisOptions(),
            'satuan' => Aksesoris::getSatuanAksesorisOptions(),
        ]);
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
