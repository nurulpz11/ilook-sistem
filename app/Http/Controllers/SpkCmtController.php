<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SpkCmt;
use App\Models\Penjahit;
use App\Models\Warna;
use App\Models\LogDeadline;
use PDF;


class SpkCmtController extends Controller
{
    // Menampilkan semua SPK
    public function index()
    {
        $spk = SpkCmt::with('warna')->get();
        
        // Mengembalikan response dengan data SPK dan warna
        return response()->json($spk);
    }

    // Menampilkan form untuk membuat SPK baru (untuk React, ini bisa digantikan dengan form di frontend)
    public function create()
    {
        $penjahits = Penjahit::all();
        return response()->json($penjahits); // Mengembalikan data penjahit untuk digunakan di frontend
    }

    // Menyimpan SPK baru
    public function store(Request $request)
{
    $validated = $request->validate([
        'nama_produk' => 'required|string|max:100',
        'deadline' => 'required|date',
        'id_penjahit' => 'required|exists:penjahit_cmt,id_penjahit',
        'keterangan' => 'nullable|string',
        'tgl_spk' => 'required|date',
        'status' => 'required|string|in:Pending,In Progress,Completed',
        'nomor_seri' => 'nullable|string',
        'gambar_produk' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:15000',
        'tanggal_ambil' => 'nullable|date',
        'catatan' => 'nullable|string',
        'markeran' => 'nullable|string',
        'aksesoris' => 'nullable|string',
        'handtag' => 'nullable|string',
        'merek' => 'nullable|string',
        'harga_per_barang' => 'required|numeric',
        'harga_per_jasa' => 'required|numeric',
        'warna' => 'required|array',
        'warna.*.nama_warna' => 'required|string|max:50',
        'warna.*.qty' => 'required|integer|min:1',
    ]);

    // Hitung total jumlah produk
    $jumlahProduk = collect($validated['warna'])->sum('qty');
    $validated['jumlah_produk'] = $jumlahProduk;

    // Hitung total harga
    $totalHarga = $validated['harga_per_barang'] * $jumlahProduk;
    $validated['total_harga'] = $totalHarga;

    // Jika ada file gambar, unggah dan simpan path-nya
    if ($request->hasFile('gambar_produk')) {
        $file = $request->file('gambar_produk');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('public/images', $fileName);
        $validated['gambar_produk'] = 'images/' . $fileName;
    }

    // Membuat SPK baru
    $spk = SpkCmt::create($validated);

    // Simpan warna ke dalam tabel warna
    foreach ($validated['warna'] as $warna) {
        Warna::create([
            'id_spk' => $spk->id_spk,
            'nama_warna' => $warna['nama_warna'],
            'qty' => $warna['qty'],
        ]);
    }

    return response()->json(['message' => 'SPK dan Warna berhasil dibuat!', 'data' => $spk], 201);
}

    // Menampilkan SPK berdasarkan ID
    public function show($id)
    {
        $spk = SpkCmt::findOrFail($id);
        return response()->json($spk); // Mengembalikan data SPK berdasarkan ID
    }

    // Menampilkan form untuk mengedit SPK (untuk React, ini bisa digantikan dengan form di frontend)
    public function edit($id)
    {
        $spk = SpkCmt::findOrFail($id);
        $penjahits = Penjahit::all();
        return response()->json(['spk' => $spk, 'penjahits' => $penjahits]); // Mengembalikan data SPK dan penjahit
    }

    // Memperbarui SPK yang sudah ada
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_produk' => 'required|string|max:100',
            'deadline' => 'required|date',
            'id_penjahit' => 'required|exists:penjahit_cmt,id_penjahit',
            'keterangan' => 'nullable|string',
            'tgl_spk' => 'required|date',
            'status' => 'required|string|in:Pending,In Progress,Completed',
            'nomor_seri' => 'nullable|string',
            'gambar_produk' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tanggal_ambil' => 'nullable|date',
            'catatan' => 'nullable|string',
            'markeran' => 'nullable|string',
            'aksesoris' => 'nullable|string',
            'handtag' => 'nullable|string',
            'merek' => 'nullable|string',
            'warna' => 'required|array',
            'warna.*.id_warna' => 'nullable|integer|exists:warna,id_warna',
            'warna.*.nama_warna' => 'required|string|max:50',
            'warna.*.qty' => 'required|integer|min:1',
        ]);
    
        $spk = SpkCmt::findOrFail($id);


       // Hitung total jumlah produk
        $jumlahProduk = collect($validated['warna'])->sum('qty');
        $validated['jumlah_produk'] = $jumlahProduk;

        // Hitung total harga
        if (isset($validated['harga_per_barang'])) {
            $validated['total_harga'] = $validated['harga_per_barang'] * $jumlahProduk;
        }

            // Jika ada file gambar baru, unggah dan simpan path-nya
            if ($request->hasFile('gambar_produk')) {
                $file = $request->file('gambar_produk');
                // Debugging untuk memastikan file diterima
                \Log::info('Nama file: ' . $file->getClientOriginalName());
                \Log::info('Mime type: ' . $file->getMimeType());
                // Simpan file
                $path = $file->store('images', 'public');
                // Debugging untuk memastikan path penyimpanan
                \Log::info('File disimpan di: ' . $path);
                \Log::debug("Request Method: " . $request->method());
                \Log::debug("Request URL: " . $request->url());
                \Log::debug("All Request Data: ", $request->all()); // Menamp
                $validated['gambar_produk'] = $path;
            }
            

        $spk->update($validated);

            // Perbarui atau tambahkan warna
            foreach ($validated['warna'] as $warna) {
                if (isset($warna['id_warna'])) {
                    // Update warna yang sudah ada
                    $existingWarna = Warna::find($warna['id_warna']);
                    $existingWarna->update([
                        'nama_warna' => $warna['nama_warna'],
                        'qty' => $warna['qty'],
                    ]);
                } else {
                    // Buat warna baru
                    Warna::create([
                        'id_spk' => $spk->id_spk,
                        'nama_warna' => $warna['nama_warna'],
                        'qty' => $warna['qty'],
                    ]);
                }
            }

        return response()->json(['message' => 'SPK dan Warna berhasil diperbarui!', 'data' => $spk]);
    }

    // Menghapus SPK
    public function destroy($id)
    {
        $spk = SpkCmt::findOrFail($id);
        $spk->delete();

        return response()->json(['message' => 'SPK berhasil dihapus!']);
    }


    public function downloadPdf($id)
    {
        // Ambil data SPK dengan relasi penjahit
        $spk = SpkCmt::with('penjahit')->find($id);
    
        if (!$spk) {
            return response()->json(['error' => 'SPK not found'], 404);
        }
    
        // Render view 'pdf.spk_cmt' dan kirim data
        $pdf = PDF::loadView('pdf.spk_cmt', compact('spk'));
    
        // Return file PDF
        return $pdf->download('spk_cmt.pdf');
        }
        
        public function downloadStaffPdf($id)
        {
        // Ambil data SPK dengan relasi penjahit
        $spk = SpkCmt::with('penjahit')->find($id);

        if (!$spk) {
            return response()->json(['error' => 'SPK not found'], 404);
        }

        // Render view 'pdf.spk_cmt_staff' dan kirim data
        $pdf = PDF::loadView('pdf.spk_cmt_staff', compact('spk'));

        // Return file PDF
        return $pdf->download('spk_cmt_staff.pdf');
        }


    
    public function updateDeadline(Request $request, $id)
    {
        $validated = $request->validate([
            'deadline' => ['required', 'date'],
            'keterangan' => ['required', 'string', 'max:255'],
        ]);
    
        $spk = SpkCmt::findOrFail($id);
        $deadlineLama = $spk->deadline;
    
        if ($spk->deadline != $validated['deadline']) {
            $spk->update(['deadline' => $validated['deadline']]);
    
            LogDeadline::create([
                'id_spk' => $spk->id_spk,
                'deadline_lama' => $deadlineLama,
                'deadline_baru' => $validated['deadline'],
                'tanggal_aktivitas' => now(),
                'keterangan' => $validated['keterangan'],
            ]);
        }
    
       // Kembalikan response dengan data SPK yang sudah diperbarui
    return response()->json([
        'message' => 'Deadline berhasil diperbarui',
        'data' => [
            'deadline' => $request->deadline,
            'keterangan' => $request->keterangan,
            'spk' => $spk,  // Menambahkan data SPK yang diperbarui
        ]
    ]);
    }
    
    public function getLogDeadline($id)
    {
        $logs = LogDeadline::where('id_spk', $id)
            ->orderBy('tanggal_aktivitas', 'desc')
            ->get();
        return response()->json($logs);
    }

    // SpkController.php
    public function getWarna($id)
    {
        // Ambil SPK berdasarkan ID
        $spk = SpkCmt::find($id);

        if (!$spk) {
            return response()->json(['message' => 'SPK not found'], 404);
        }

        // Ambil warna terkait dengan SPK ini
        $warna = $spk->warna; // Pastikan relasi 'warna' sudah didefinisikan dengan benar di model SpkCmt

        return response()->json(['warna' => $warna]);
    }



}
