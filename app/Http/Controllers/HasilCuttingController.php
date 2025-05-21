<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Http\Request;
use App\Models\SpkCutting;
use App\Models\HasilCutting;
use App\Models\HasilMarkeran;
use App\Models\MarkeranProduk;
use App\Models\HasilCuttingBahan;
use App\Models\SpkCuttingBahan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;




class HasilCuttingController extends Controller
{
    public function index()
    {
        $data = HasilCutting::with('spkCutting.produk', 'spkCutting.tukangCutting', 'markeran')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'spk_cutting_id' => $item->spk_cutting_id,
                'nomor_seri' => $item->nomor_seri,
                'foto_komponen' => $item->foto_komponen,
                'jumlah_komponen' => $item->jumlah_komponen,
                'updated_at' => $item->updated_at,
                'created_at' => $item->created_at,
                'nama_produk' => $item->spkCutting->produk->nama_produk ?? null,
                'produk_id' => $item->spkCutting->produk->id ?? null,
                'gambar_produk' => $item->spkCutting->produk->gambar_produk ?? null,
                'nama_tukang_cutting' => $item->spkCutting->tukangCutting->nama_tukang_cutting ?? null,
                'markeran' => $item->markeran->map(function ($m) {
                        return [
                            'id' => $m->id,
                            'nama_komponen' => $m->nama_komponen,
                            'total_panjang' => $m->total_panjang,
                            'jumlah_hasil' => $m->jumlah_hasil,
                            'berat_per_pcs' => $m->berat_per_pcs,
                            'status_perbandingan' =>  $m->status_perbandingan,
                        ];
                    }),
                ];
            });

        return response()->json($data);
    }


    public function store(Request $request)
    {
    try {
        $validated = $request->validate([
            'spk_cutting_id' => 'required|exists:spk_cutting,id',
            'nomor_seri' => 'required|string|max:255',
            'foto_komponen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:15000',
            'jumlah_komponen' => 'required|integer|min:1|max:255',
            'hasil_markeran' => 'nullable|array',
            'hasil_markeran.*.nama_komponen' => 'required|string',
            'hasil_markeran.*.total_panjang' => 'required|numeric|min:0',
            'hasil_markeran.*.jumlah_hasil' => 'required|integer|min:1',
            
            'hasil_bahan' => 'nullable|array',
            'hasil_bahan.*.spk_cutting_bahan_id' => 'required|exists:spk_cutting_bahan,id',
            'hasil_bahan.*.berat' => 'nullable|numeric|min:0',
            'hasil_bahan.*.hasil' => 'nullable|integer|min:0',
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validasi gagal di store HasilCuttingController', [
            'errors' => $e->errors(),
            'input' => $request->all()
        ]);

        return response()->json([
            'message' => 'Validasi gagal',
            'errors' => $e->errors(),
        ], 422);
    }

    DB::beginTransaction();
    try {
        // Upload foto jika ada
        if ($request->hasFile('foto_komponen')) {
            $path = $request->file('foto_komponen')->store('foto_komponen', 'public');
            $validated['foto_komponen'] = $path;
        }

        // Simpan hasil cutting
        $hasil = HasilCutting::create($validated);

        $statusList = [];

        // Simpan hasil markeran (actual) jika ada
        if ($request->has('hasil_markeran')) {
            // Cari produk_id dari spk_cutting
            $spkCutting = SpkCutting::with('produk')->find($validated['spk_cutting_id']);
            $produkId = $spkCutting->produk_id;

          foreach ($request->hasil_markeran as $markeran) {
            $berat_per_pcs = $markeran['total_panjang'] / $markeran['jumlah_hasil'];

            $markeranStandar = MarkeranProduk::where('produk_id', $produkId)
                ->where('nama_komponen', $markeran['nama_komponen'])
                ->first();

            if ($markeranStandar) {
                if ($berat_per_pcs > $markeranStandar->berat_per_pcs) {
                    $status = 'lebih berat';
                } elseif ($berat_per_pcs < $markeranStandar->berat_per_pcs) {
                    $status = 'lebih ringan';
                } else {
                    $status = 'sama';
                }
            } else {
                $status = 'belum ada';
            }

    // ⬅️ Tambahkan baris ini
    $statusList[] = $status;

    HasilMarkeran::create([
        'hasil_cutting_id' => $hasil->id,
        'nama_komponen' => $markeran['nama_komponen'],
        'total_panjang' => $markeran['total_panjang'],
        'jumlah_hasil' => $markeran['jumlah_hasil'],
        'berat_per_pcs' => $berat_per_pcs,
        'status_perbandingan' => $status,
    ]);
}

       
           // Hitung status agregat berdasarkan mayoritas
            $statusCount = array_count_values($statusList);

            // Ambil status terbanyak
            arsort($statusCount); // urutkan berdasarkan jumlah terbanyak
            $mostFrequentStatus = array_key_first($statusCount);

            // Cek jika ada dua status dengan jumlah sama banyak (draw)
            $jumlahTerbanyak = reset($statusCount);
            $jumlahSama = count(array_filter($statusCount, fn($val) => $val === $jumlahTerbanyak));

            if ($jumlahSama > 1) {
                $statusAgregat = 'campuran';
            } else {
                $statusAgregat = $mostFrequentStatus;
            }


            // Simpan status agregat ke hasil_cutting
            $hasil->update([
                'status_perbandingan_agregat' => $statusAgregat
            ]);
        }
        // Simpan hasil bahan jika ada
        if ($request->has('hasil_bahan')) {
            foreach ($request->hasil_bahan as $index => $bahan) {
                try {
                    HasilCuttingBahan::create([
                        'hasil_cutting_id' => $hasil->id,
                        'spk_cutting_bahan_id' => $bahan['spk_cutting_bahan_id'],
                        'berat' => $bahan['berat'] ?? null,
                        'hasil' => $bahan['hasil'] ?? null,
                    ]);
                } catch (\Exception $e) {
                    throw new \Exception("Gagal menyimpan hasil_bahan index ke-{$index}: " . $e->getMessage());
                }
            }
        }



        DB::commit();

        return response()->json([
            'message' => 'Hasil cutting dan markeran berhasil disimpan.',
            'data' => $hasil->load('markeran', 'bahan')
        ], \Illuminate\Http\Response::HTTP_CREATED);

        } catch (\Exception $e) {
            DB::rollBack();

           return response()->json([
        'message' => 'Gagal menyimpan data',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'input_hasil_bahan' => $request->hasil_bahan // debug input
    ], 500);

        }

    }
}