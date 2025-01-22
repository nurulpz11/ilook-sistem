<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SpkCmt;
use App\Models\Penjahit;
use App\Models\Warna;
use App\Models\LogDeadline;
use App\Models\LogStatus;
use PDF;
use Illuminate\Validation\Rule;


class SpkCmtController extends Controller
{
    // Menampilkan semua SPK
    public function index(Request $request)
{
    // Ambil status filter dari request (jika ada)
    $statusFilter = $request->query('status');

    $query = SpkCmt::with(['warna', 'pengiriman']);
    
    // Jika ada filter status, tambahkan ke query
    if ($statusFilter) {
        $query->where('status', $statusFilter);
    }

    // Ambil data dari query dan lakukan mapping
    $spk = $query->get()->map(function ($item) {
        // Hitung sisa hari dari deadline
        $deadline = \Carbon\Carbon::parse($item->deadline);
        $item->sisa_hari = $item->sisa_hari;  // Memanggil accessor sisa_hari

        // Ambil accessor untuk status_with_color
        $item->status_with_color = $item->status_with_color;

        // Hitung total barang dikirim
        $item->total_barang_dikirim = $item->pengiriman->sum('total_barang_dikirim');

        return $item;
    });

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
        'warna.*.id_warna' => 'nullable|exists:warna,id', // Untuk warna yang sudah ada
        'warna.*.nama_warna' => 'required|string|max:50',
        'warna.*.qty' => 'required|integer|min:1',
    ]);

    $spk = SpkCmt::findOrFail($id);

    // Hitung total jumlah produk
    $jumlahProduk = collect($validated['warna'])->sum('qty');
    $validated['jumlah_produk'] = $jumlahProduk;

    // Hitung total harga
    $totalHarga = $validated['harga_per_barang'] * $jumlahProduk;
    $validated['total_harga'] = $totalHarga;

    // Jika ada file gambar baru, unggah dan simpan path-nya
    if ($request->hasFile('gambar_produk')) {
        $file = $request->file('gambar_produk');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('public/images', $fileName);
        $validated['gambar_produk'] = 'images/' . $fileName;

        // Hapus gambar lama jika ada
        if ($spk->gambar_produk) {
            \Storage::delete('public/' . $spk->gambar_produk);
        }
    }

    // Update data SPK
    $spk->update($validated);

    // Update atau tambahkan data warna
    foreach ($validated['warna'] as $warna) {
        if (isset($warna['id_warna'])) {
            // Update warna yang sudah ada
            $existingWarna = Warna::find($warna['id_warna']);
            if ($existingWarna) {
                $existingWarna->update([
                    'nama_warna' => $warna['nama_warna'],
                    'qty' => $warna['qty'],
                ]);
            }
        } else {
            // Tambahkan warna baru
            Warna::create([
                'id_spk' => $spk->id_spk,
                'nama_warna' => $warna['nama_warna'],
                'qty' => $warna['qty'],
            ]);
        }
    }

    return response()->json(['message' => 'SPK berhasil diperbarui!', 'data' => $spk], 200);
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

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['Pending', 'In Progress', 'Completed'])],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ]);
    
        $spk = SpkCmt::findOrFail($id);
        $statusLama = $spk->status;
    
        if ($spk->status !== $validated['status']) {
            $spk->setStatus($validated['status']);
            
           
            LogStatus::create([
                'id_spk' => $spk->id_spk,
                'status_lama' => $statusLama,
                'status_baru' => $validated['status'],
                'keterangan' => $validated['keterangan'] ?? null,
                'tanggal_aktivitas' => now(),
            ]);
        }
    
        return response()->json([
            'message' => 'Status berhasil diperbarui',
            'data' => [
                'status' => $spk->status,
                'keterangan' => $request->keterangan,
            ],
        ]);
    }
    
    public function getLogStatus($id)
    {
        $logs = getLogStatus::where('id_spk', $id)
            ->orderBy('tanggal_aktivitas', 'desc')
            ->get();
        return response()->json($logs);
    }
    public function getAllLogDeadlines()
    {
        // Ambil semua log deadline
        $logs = LogDeadline::orderBy('tanggal_aktivitas', 'desc')->get();

        // Kembalikan response dengan semua log deadline
        return response()->json($logs);
    }


public function debugDeadlines()
{
    $spk = SpkCmt::all()->map(function ($item) {
        $deadline = \Carbon\Carbon::parse($item->deadline);
        return [
            'id_spk' => $item->id_spk,
            'deadline' => $item->deadline,
            'now' => now()->toDateString(),
            'sisa_hari' => $deadline->isPast() ? 0 : $deadline->diffInDays(now()),
        ];
    });

    return response()->json($spk);
}

    



}
