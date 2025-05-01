<?php

namespace App\Http\Controllers;


use App\Models\Hutang;
use App\Models\Penjahit;
use App\Models\Pengiriman;
use App\Models\HistoryHutang;
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

    public function tambahHutang(Request $request)
{
    $request->validate([
        'id_penjahit' => 'required|exists:penjahit_cmt,id_penjahit',
        'jumlah_hutang' => 'required|numeric|min:0',
        'jenis_hutang' => 'required|string',
        'potongan_per_minggu' => 'nullable|numeric|min:0',
        'is_potongan_persen' => 'required|boolean',
        'persentase_potongan' => 'nullable|numeric|min:0|max:100',
    ]);


      // Pastikan hanya satu jenis potongan yang diisi
      if ($request->is_potongan_persen && is_null($request->persentase_potongan)) {
        return response()->json(['message' => 'Persentase potongan harus diisi'], 400);
    }
    if (!$request->is_potongan_persen && is_null($request->potongan_per_minggu)) {
        return response()->json(['message' => 'Potongan tetap harus diisi'], 400);
    }


    $hutang = Hutang::create([
        'id_penjahit' => $request->id_penjahit,
        'jumlah_hutang' => $request->jumlah_hutang,
        'status_pembayaran' => 'belum lunas',
        'tanggal_hutang' => now(),
        'jenis_hutang' => $request->jenis_hutang,
        'potongan_per_minggu' => $request->potongan_per_minggu,
        'is_potongan_persen' => $request->is_potongan_persen,
        'persentase_potongan' => $request->is_potongan_persen ? $request->persentase_potongan : null,
    
    ]);
    HistoryHutang::create([
        'id_hutang' => $hutang->id_hutang,
        'jenis_perubahan' => 'penambahan', // HARUS sesuai dengan ENUM di migrasi
        'tanggal_perubahan' => now(),
        'jumlah_hutang' => $hutang->jumlah_hutang,
        'perubahan_hutang' => $request->jumlah_hutang,
    ]);
    

    return response()->json([
        'success' => true,
        'message' => 'hutang berhasil ditambahkan!',
        'data' => $hutang
    ], 201);

}

public function tambahHutangLama(Request $request, $id_hutang)
{
    $request->validate([
        'perubahan_hutang' => 'required|numeric|min:0', // Nilai hutang yang mau ditambahkan
    ]);

    // Ambil hutang yang sudah ada
    $hutang = Hutang::findOrFail($id_hutang);

    // Update jumlah hutang dengan nilai yang ditambahkan
    $hutang->jumlah_hutang += $request->perubahan_hutang;
    $hutang->save();

    // Simpan perubahan ke history_hutang
    HistoryHutang::create([
        'id_hutang' => $hutang->id_hutang,
        'jenis_perubahan' => 'penambahan', // ENUM di database
        'tanggal_perubahan' => now(),
        'jumlah_hutang' => $hutang->jumlah_hutang, // Total hutang setelah ditambah
        'perubahan_hutang' => $request->perubahan_hutang, // Hutang yang baru ditambahkan
    ]);

    return response()->json(['message' => 'Hutang berhasil ditambahkan']);
}

private function kurangiHutangManually($id_hutang, $jumlah_pengurangan)
{
    $hutang = Hutang::findOrFail($id_hutang);

    if ($hutang->jumlah_hutang < $jumlah_pengurangan) {
        return response()->json(['message' => 'Jumlah pengurangan melebihi hutang yang ada'], 400);
    }

    $hutang->jumlah_hutang -= $jumlah_pengurangan;
    $hutang->save();

    HistoryHutang::create([
        'id_hutang' => $hutang->id_hutang,
        'jenis_perubahan' => 'pengurangan',
        'tanggal_perubahan' => now(),
        'jumlah_hutang' => $hutang->jumlah_hutang,
        'perubahan_hutang' => $jumlah_pengurangan,
    ]);
}


public function getHistoryByHutangId(Request $request, $id_hutang)
{
    // Ambil parameter jenis_perubahan dari request
    $jenisPerubahan = $request->query('jenis_perubahan');

    // Query dasar
    $query = HistoryHutang::where('id_hutang', $id_hutang)->orderBy('tanggal_perubahan', 'desc');

    // Jika ada filter jenis_perubahan, tambahkan ke query
    if ($jenisPerubahan) {
        $query->where('jenis_perubahan', $jenisPerubahan);
    }

    $history = $query->get();

    if ($history->isEmpty()) {
        return response()->json(['message' => 'History hutang tidak ditemukan'], 404);
    }

    return response()->json($history);
}


public function hitungPotongan($id_hutang)
{
    $hutang = Hutang::findOrFail($id_hutang);

    // Jika potongan berdasarkan persen
    if ($hutang->is_potongan_persen) {
        // Ambil total bayar dari tabel pengiriman dalam seminggu terakhir
        $totalBayar = Pengiriman::whereHas('spk', function ($query) use ($hutang) {
            $query->where('id_penjahit', $hutang->id_penjahit);
        })->whereBetween('tanggal_pengiriman', [now()->startOfWeek(), now()->endOfWeek()])
          ->sum('total_bayar');
        

        // Hitung potongan berdasarkan persentase
        $potongan = ($hutang->persentase_potongan / 100) * $totalBayar;
    } else {
        // Jika potongan tidak berdasarkan persen, gunakan nilai tetap
        $potongan = $hutang->potongan_per_minggu;
    }

    return response()->json([
        'id_hutang' => $hutang->id_hutang,
        'total_bayar' =>  $totalBayar,
        'potongan' => round($potongan, 2),
    ]);
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