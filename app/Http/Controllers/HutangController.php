<?php

namespace App\Http\Controllers;


use App\Models\Hutang;
use App\Models\Penjahit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HutangController extends Controller
{
    
    public function index(Request $request)
{
    $penjahitId = $request->query('penjahit');
    $query = Hutang::with('penjahit')->withSum('logPembayaran', 'jumlah_dibayar');

    if (!empty($penjahitId)) {
        $query->where('id_penjahit', $penjahitId);
    }

    $hutangs = $query->orderBy('created_at', 'desc')->paginate(11);

    // Tambahkan sisa hutang ke setiap item
    $hutangs->getCollection()->transform(function ($hutang) {
        $totalDibayar = $hutang->log_pembayaran_sum_jumlah_dibayar ?? 0; // Gunakan nilai default 0 jika null
        $hutang->sisa_hutang = $hutang->jumlah_hutang - $totalDibayar;
        return $hutang;
    });

    return response()->json($hutangs);
}

    

    public function create()
    {
       // Ambil data penjahit untuk memilih penjahit
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
            'jumlah_hutang' => 'required|numeric|min:1',
            'status_pembayaran' => 'required|in:belum lunas,lunas,dibayar sebagian',
            'tanggal_jatuh_tempo' => 'required|date',
            'tanggal_hutang' => 'required|date',
             'jenis_hutang' => ['required', Rule::in(array_keys(Hutang::getJenisHutangOptions()))],
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
        $hutang = Hutang::with('penjahit')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $hutang,
        ]);
    }


    public function edit($id)
    {
        // Mengambil data Hutang dan Penjahit
        $hutang = Hutang::findOrFail($id);
        $penjahits = Penjahit::all(); // Mengambil semua Penjahit
        return response()->json([
            'success' => true,
            'hutang' => $hutang,
            'penjahits' => $penjahits // Menyertakan data Penjahit
        ]);
    }


    public function update(Request $request, $id)
    {
         // Validasi inputan
         $validated = $request->validate([
            'id_penjahit' => 'required|exists:penjahit_cmt,id_penjahit',
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