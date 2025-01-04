<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SpkCmt;
use App\Models\Penjahit;
use App\Models\Warna;
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
            'warna' => 'required|array',
            'warna.*.nama_warna' => 'required|string|max:50',
            'warna.*.qty' => 'required|integer|min:1',
        ]);
    
        // Hitung total jumlah produk
        $jumlahProduk = collect($validated['warna'])->sum('qty');
    
        // Tambahkan jumlah_produk ke dalam data yang akan disimpan
        $validated['jumlah_produk'] = $jumlahProduk;
    
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

        // Tambahkan jumlah_produk ke dalam data yang akan diperbarui
        $validated['jumlah_produk'] = $jumlahProduk;

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
    

}
