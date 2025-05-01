<?php

namespace App\Http\Controllers;


use App\Models\StokAksesoris;
use App\Models\PembelianB;
use App\Models\Aksesoris;
use Illuminate\Http\Request;

class StokAksesorisController extends Controller
{
    
    public function index()
    {
        $stok = StokAksesoris::all();
        return response()->json($stok);
    }

    public function showByPembelianB($id)
    {
        $stok = StokAksesoris::where('pembelian_aksesoris_b_id', $id)->get();
    
        return response()->json($stok);
    }
    
    public function store(Request $request)
    {
        //
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
