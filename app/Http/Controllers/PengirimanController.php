<?php

namespace App\Http\Controllers;

use App\Models\Pengiriman;
use App\Models\PengirimanWarna;
use App\Models\Warna; // Menambahkan import untuk model Warna
use App\Models\SpkCmt;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class PengirimanController extends Controller
{
    public function index(Request $request)
    {
        $idPenjahit = $request->query('id_penjahit');
        $sortBy = $request->query('sortBy', 'created_at'); 
        $sortOrder = $request->query('sortOrder', 'desc');
        $allData = $request->query('allData');
        $namaProduk = $request->query('nama_produk');

        // Query utama dengan relasi yang benar
     $query = Pengiriman::with([
    'warna',
    'spk' => function ($q) {
        $q->select('id_spk', 'tgl_spk', 'jumlah_produk', 'total_harga', 'deadline', 'id_penjahit', 'id_produk');
    },
    'spk.penjahit' => function ($q) {
        $q->select('id_penjahit', 'nama_penjahit');
    },
    'spk.produk' => function ($q) {
        $q->select('id', 'nama_produk', 'kategori_produk');
    }
]);

    
        // Filter berdasarkan id_penjahit
        $query->when($idPenjahit, function ($q) use ($idPenjahit) {
            $q->whereHas('spk.penjahit', function ($subQuery) use ($idPenjahit) {
                $subQuery->where('id_penjahit', $idPenjahit);
            });
        });
        
        // Filter berdasarkan nama produk
        $query->when($namaProduk, function ($q) use ($namaProduk) {
            $q->whereHas('spk.produk', function ($subQuery) use ($namaProduk) {
                $subQuery->where('nama_produk', 'like', "%$namaProduk%");
            });
        });
        
        $query->orderBy($sortBy, $sortOrder);
        

    
        // Ambil semua data atau gunakan pagination
        $pengiriman = $allData == 'true' ? $query->get() : $query->paginate(10);
    
        // Transform data pengiriman
        $pengiriman->transform(function ($pengiriman) {
            $sisaBarangPerWarna = [];
        
            foreach ($pengiriman->warna as $warna) {
                $warnaData = Warna::where('id_spk', $pengiriman->id_spk)
                    ->where('nama_warna', $warna->warna)
                    ->first();
        
                if ($warnaData) {
                    $totalSudahDikirim = PengirimanWarna::whereHas('pengiriman', function ($query) use ($pengiriman) {
                        $query->where('id_spk', $pengiriman->id_spk);
                    })
                    ->where('warna', $warna->warna)
                    ->sum('jumlah_dikirim');
        
                    $sisaBarangPerWarna[$warna->warna] = $warnaData->qty - $totalSudahDikirim;
                }
            }
        
            return [
                'id_pengiriman' => $pengiriman->id_pengiriman,
                'id_spk' => $pengiriman->id_spk,
                'tanggal_pengiriman' => $pengiriman->tanggal_pengiriman,
                'total_barang_dikirim' => $pengiriman->warna->sum('jumlah_dikirim'),
                'sisa_barang' => $pengiriman->sisa_barang,
                'total_bayar' => $pengiriman->total_bayar,
                'status_verifikasi' => $pengiriman->status_verifikasi,
                'claim' => $pengiriman->claim,
                'refund_claim' => $pengiriman->refund_claim,
                'sisa_barang_per_warna' => $sisaBarangPerWarna,
                'nama_produk' => $pengiriman->spk->produk->nama_produk ?? null,
                'kategori_produk' => $pengiriman->spk->produk->kategori_produk ?? null,
                'nama_penjahit' => $pengiriman->spk->penjahit->nama_penjahit ?? null,
                
                'warna' => $pengiriman->warna->map(function ($warna) {
                    return [
                        'warna' => $warna->warna,
                        'jumlah_dikirim' => $warna->jumlah_dikirim
                    ];
                })
            ];
        });
        
    
        return response()->json($pengiriman, 200);

    }
    

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_spk' => 'required|exists:spk_cmt,id_spk',
            'tanggal_pengiriman' => 'required|date',
            'warna' => 'required|array',
            'warna.*.warna' => 'required|string|max:50',
            'warna.*.jumlah_dikirim' => 'required|integer|min:0',
            'foto_nota' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Validasi foto
            'status_verifikasi' => 'nullable|string|in:pending,valid,invalid', // Validasi status
        ]);
    
        // Ambil data SPK
        $spk = SpkCmt::findOrFail($validated['id_spk']);
        
        // Ambil stok awal dari tabel warna
        $warnaSpk = Warna::where('id_spk', $validated['id_spk'])->get();
    
        // Hitung jumlah barang yang sudah dikirim per warna
        $pengirimanSebelumnya = PengirimanWarna::whereHas('pengiriman', function ($query) use ($validated) {
            $query->where('id_spk', $validated['id_spk']);
        })->get();
    
        $sudahDikirimPerWarna = $pengirimanSebelumnya->groupBy('warna')->map(function ($group) {
            return $group->sum('jumlah_dikirim');
        });
    
        $sisaBarangPerWarna = [];
        $totalClaim = 0;
        $totalRefundClaim = 0;
    
        foreach ($validated['warna'] as $warnaInput) {
            $warnaSpkItem = $warnaInput['warna'];
            $jumlahDikirim = $warnaInput['jumlah_dikirim'];
    
            $warnaData = $warnaSpk->where('nama_warna', $warnaSpkItem)->first();
            if (!$warnaData) {
                return response()->json(['error' => "Warna $warnaSpkItem tidak ditemukan untuk SPK ini"], 400);
            }
    
            $stokAwal = $warnaData->qty;
            $totalSudahDikirim = $sudahDikirimPerWarna[$warnaSpkItem] ?? 0;
            $sisaBarang = $stokAwal - $totalSudahDikirim;
    
            if ($jumlahDikirim > $sisaBarang) {
                return response()->json([
                    'error' => "Jumlah barang dikirim untuk warna $warnaSpkItem melebihi sisa yang tersedia. Sisa: $sisaBarang pcs"
                ], 400);
            }
    
            $sisaBarangPerWarna[$warnaSpkItem] = $sisaBarang - $jumlahDikirim;
        }
    
        // Hitung total barang dikirim
        $totalBarangDikirim = collect($validated['warna'])->sum('jumlah_dikirim');
    
        // Hitung total bayar berdasarkan harga per jasa
        $totalBayar = $totalBarangDikirim * $spk->harga_per_jasa;
    
        // Hitung claim
        $claim = 0;
        if (array_sum($sisaBarangPerWarna) > 0) {
            $claim = array_sum($sisaBarangPerWarna) * $spk->harga_per_barang;
            $totalClaim += $claim;
        }
    
        // Hitung refund claim berdasarkan pengiriman sebelumnya
        $refundClaim = Pengiriman::where('id_spk', $validated['id_spk'])
            ->latest()
            ->value('claim') ?? 0;
        $totalRefundClaim += $refundClaim;
    
        // **Proses Upload Foto Nota**
        $fotoNotaPath = null;
        if ($request->hasFile('foto_nota')) {
            $fotoNotaPath = $request->file('foto_nota')->store('nota_pengiriman', 'public');
        }
    
        // **Simpan data pengiriman**
        $pengiriman = Pengiriman::create([
            'id_spk' => $validated['id_spk'],
            'tanggal_pengiriman' => $validated['tanggal_pengiriman'],
            'total_barang_dikirim' => $totalBarangDikirim,
            'sisa_barang' => array_sum($sisaBarangPerWarna),
            'total_bayar' => $totalBayar,
            'claim' => $totalClaim,
            'refund_claim' => $totalRefundClaim,
            'foto_nota' => $fotoNotaPath, // Simpan path foto nota
            'status_verifikasi' => $validated['status_verifikasi'] ?? 'pending', // Default pending
        ]);
    
        // **Simpan detail pengiriman_warna**
        foreach ($validated['warna'] as $warna) {
            PengirimanWarna::create([
                'id_pengiriman' => $pengiriman->id_pengiriman,
                'warna' => $warna['warna'],
                'jumlah_dikirim' => $warna['jumlah_dikirim'],
                'sisa_barang_per_warna' => $sisaBarangPerWarna[$warna['warna']],
            ]);
        }
    
        // **Update SPK jika sisa barang 0**
        if (array_sum($sisaBarangPerWarna) === 0) {
            $spk->update([
                'status' => 'Completed',
                'waktu_pengerjaan_terakhir' => $spk->getWaktuPengerjaanAttribute(),
                'sisa_hari_terakhir' => $spk->getSisaHariAttribute(),
            ]);
        }
    
        // **Respons dengan data terbaru**
        return response()->json([
            'message' => 'Pengiriman berhasil dibuat!',
            'data' => array_merge($pengiriman->toArray(), [
                'harga_per_barang' => $spk->harga_per_barang,
                'sisa_barang_per_warna' => $sisaBarangPerWarna,
                'warna' => $pengiriman->warna,
            ]),
        ], 201);
    }

    public function storePetugasBawah(Request $request)
{
    $validated = $request->validate([
        'id_spk' => 'required|exists:spk_cmt,id_spk',
        'tanggal_pengiriman' => 'required|date',
        'total_barang_dikirim' => 'required|integer|min:1',
        'foto_nota' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    // Upload foto nota jika ada
    $fotoNotaPath = null;
    if ($request->hasFile('foto_nota')) {
        $fotoNotaPath = $request->file('foto_nota')->store('nota_pengiriman', 'public');
    }

        $spk = SpkCmt::findOrFail($validated['id_spk']);
    $warnaSpk = Warna::where('id_spk', $validated['id_spk'])->get();

    // Hitung total barang yang tersisa dalam SPK
    $totalBarangSisa = $warnaSpk->sum('qty') - Pengiriman::where('id_spk', $validated['id_spk'])->sum('total_barang_dikirim');

    if ($validated['total_barang_dikirim'] > $totalBarangSisa) {
        return response()->json(['error' => 'Jumlah barang dikirim melebihi sisa produk yang tersedia.'], 400);
    }

        // Simpan data pengiriman dengan status 'pending' (menunggu input petugas atas)
    $pengiriman = Pengiriman::create([
        'id_spk' => $validated['id_spk'],
        'tanggal_pengiriman' => $validated['tanggal_pengiriman'],
        'total_barang_dikirim' => $validated['total_barang_dikirim'],
        'foto_nota' => $fotoNotaPath,
        'status_verifikasi' => 'pending', // Status default
        'sisa_barang' => null,
    ]);

    return response()->json([
        'message' => 'Pengiriman berhasil disimpan. Menunggu input dari petugas atas.',
        'data' => $pengiriman,
    ], 201);
}



public function updatePetugasAtas(Request $request, $id_pengiriman)
{
    $validated = $request->validate([
        'warna' => 'required|array',
        'warna.*.warna' => 'required|string|max:50',
        'warna.*.jumlah_dikirim' => 'required|integer|min:0',
    ]);

    $pengiriman = Pengiriman::findOrFail($id_pengiriman);
    $spk = SpkCmt::findOrFail($pengiriman->id_spk);
    $warnaSpk = Warna::where('id_spk', $pengiriman->id_spk)->get();

    $pengirimanSebelumnya = PengirimanWarna::whereHas('pengiriman', function ($query) use ($pengiriman) {
        $query->where('id_spk', $pengiriman->id_spk);
    })->where('id_pengiriman', '!=', $pengiriman->id_pengiriman)->get();

    $sudahDikirimPerWarna = $pengirimanSebelumnya->groupBy('warna')->map(function ($group) {
        return $group->sum('jumlah_dikirim');
    });

    $totalDikirimPetugasAtas = collect($validated['warna'])->sum('jumlah_dikirim');


    if ($totalDikirimPetugasAtas !== $pengiriman->total_barang_dikirim) {
        return response()->json(['error' => 'Jumlah yang dikirim tidak sesuai.'], 400);
    }
    
    $statusVerifikasi = $totalDikirimPetugasAtas === $pengiriman->total_barang_dikirim ? 'valid' : 'invalid';
    $sisaBarangPerWarna = [];
    foreach ($validated['warna'] as $warnaData) {
        $warnaSpkItem = $warnaData['warna'];
        $jumlahDikirim = $warnaData['jumlah_dikirim'];
    
        $warnaDataSpk = $warnaSpk->where('nama_warna', $warnaSpkItem)->first();
        if (!$warnaDataSpk) {
            return response()->json(['error' => "Warna $warnaSpkItem tidak ditemukan untuk SPK ini"], 400);
        }
    
        $stokAwal = $warnaDataSpk->qty;
        $totalSudahDikirim = $sudahDikirimPerWarna[$warnaSpkItem] ?? 0;
        $sisaBarang = max(0, $stokAwal - ($totalSudahDikirim + $jumlahDikirim));
        \Log::info("Warna: $warnaSpkItem | Stok Awal: $stokAwal | Total Sudah Dikirim: $totalSudahDikirim | Jumlah Dikirim: $jumlahDikirim | Sisa Barang: $sisaBarang");

        if ($sisaBarang < 0) {
            return response()->json([
                'error' => "Jumlah barang dikirim untuk warna $warnaSpkItem melebihi stok yang tersedia."
            ], 400);
        }
    
        PengirimanWarna::updateOrCreate(
            ['id_pengiriman' => $pengiriman->id_pengiriman, 'warna' => $warnaSpkItem],
            ['jumlah_dikirim' => $jumlahDikirim, 'sisa_barang_per_warna' => $sisaBarang]
        );
        \Log::info("Data Pengiriman Warna Disimpan: ", ['id_pengiriman' => $pengiriman->id_pengiriman, 'warna' => $warnaSpkItem, 'sisa_barang_per_warna' => $sisaBarang]);

        $sisaBarangPerWarna[$warnaSpkItem] = $sisaBarang;
    }
    

    // Hitung total bayar
    $totalBayar = $totalDikirimPetugasAtas * $spk->harga_per_jasa;

    // Hitung claim
    $claim = array_sum($sisaBarangPerWarna) > 0 ? array_sum($sisaBarangPerWarna) * $spk->harga_per_barang : 0;

    // Hitung refund claim berdasarkan pengiriman sebelumnya
    $pengirimanSebelumnya = Pengiriman::where('id_spk', $pengiriman->id_spk)
    ->where('id_pengiriman', '<', $pengiriman->id_pengiriman) // Hanya pengiriman sebelumnya
    ->orderBy('id_pengiriman', 'desc') // Ambil yang terbaru sebelum ini
    ->first(); // Ambil satu data terakhir sebelum yang sekarang

$refundClaim = $pengirimanSebelumnya ? $pengirimanSebelumnya->claim : 0;


    $updated = $pengiriman->update([
        'status_verifikasi' => $statusVerifikasi,
        'sisa_barang' => array_sum($sisaBarangPerWarna),
        'total_bayar' => $totalBayar,
        'claim' => $claim,
        'refund_claim' => $refundClaim,
    ]);
    
    \Log::info('Update Pengiriman:', ['updated' => $updated, 'data' => $pengiriman->toArray()]);
    

    return response()->json([
        'message' => 'Data pengiriman telah diperbarui oleh petugas atas.',
        'data' => array_merge($pengiriman->toArray(), ['sisa_barang_per_warna' => $sisaBarangPerWarna]),
        'sisa_barang_per_warna' => $sisaBarangPerWarna,
        'total_bayar' => $totalBayar,
        'claim' => $claim,
        'refund_claim' => $refundClaim
    ], 200);
}



}