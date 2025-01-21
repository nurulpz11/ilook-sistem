<?php

namespace App\Http\Controllers;

use App\Models\Pendapatan;
use App\Models\Pengiriman;
use App\Models\Cashboan;
use App\Models\Hutang;
use App\Models\Penjahit;
use Illuminate\Http\Request;

class PendapatanController extends Controller
{
    public function index()
    {
        $pendapatan = Pendapatan::all(); // Ambil data penjahit untuk dropdown
        return response()->json(['data' => $pendapatan]);
    }

    public function calculate(Request $request)
    {
        $request->validate([
            'id_penjahit' => 'required',
            'periode_awal' => 'required|date',
            'periode_akhir' => 'required|date',
        ]);

        $idPenjahit = $request->id_penjahit;
        $periodeAwal = $request->periode_awal;
        $periodeAkhir = $request->periode_akhir;

        // Hitung data dari tabel pengiriman
        $pengiriman = Pengiriman::join('spk_cmt', 'pengiriman.id_spk', '=', 'spk_cmt.id_spk')
            ->where('spk_cmt.id_penjahit', $idPenjahit)
            ->whereBetween('pengiriman.tanggal_pengiriman', [$periodeAwal, $periodeAkhir])
            ->selectRaw('SUM(pengiriman.total_bayar) as total_pendapatan, SUM(pengiriman.claim) as total_claim, SUM(pengiriman.refund_claim) as total_refund_claim')
            ->first();


        // Ambil semua id_spk dari pengiriman
        $idSpkList = Pengiriman::join('spk_cmt', 'pengiriman.id_spk', '=', 'spk_cmt.id_spk')
            ->where('spk_cmt.id_penjahit', $idPenjahit)
            ->whereBetween('pengiriman.tanggal_pengiriman', [$periodeAwal, $periodeAkhir])
            ->pluck('pengiriman.id_spk'); // Berikan tabel eksplisit

            // Hitung total pembayaran cashbon berdasarkan tanggal bayar
        $totalCashboan = Cashboan::whereIn('id_spk', $idSpkList)
        ->with(['logPembayaran' => function ($query) use ($periodeAwal, $periodeAkhir) {
            $query->whereBetween('tanggal_bayar', [$periodeAwal, $periodeAkhir]);
        }])
        ->get()
        ->flatMap(fn($cashboan) => $cashboan->logPembayaran)
        ->sum('jumlah_dibayar');

        // Hitung total pembayaran hutang berdasarkan tanggal bayar
    
        $totalHutang = Hutang::where('id_penjahit', $idPenjahit)
        ->with(['logPembayaran' => function ($query) use ($periodeAwal, $periodeAkhir) {
            $query->whereBetween('tanggal_bayar', [$periodeAwal, $periodeAkhir]);
        }])
        ->get()
        ->flatMap(fn($hutang) => $hutang->logPembayaran)
        ->sum('jumlah_dibayar');
    
        return response()->json([
            'total_pendapatan' => $pengiriman->total_pendapatan ?? 0,
            'total_claim' => $pengiriman->total_claim ?? 0,
            'total_refund_claim' => $pengiriman->total_refund_claim ?? 0,
            'total_cashbon' => $totalCashboan,
            'total_hutang' => $totalHutang,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_penjahit' => 'required',
            'periode_awal' => 'required|date',
            'periode_akhir' => 'required|date',
            'handtag' => 'required|numeric',
            'transportasi' => 'required|numeric',
        ]);

        $idPenjahit = $request->id_penjahit;
        $periodeAwal = $request->periode_awal;
        $periodeAkhir = $request->periode_akhir;

        // Hitung data dari tabel pengiriman
        $pengiriman = Pengiriman::join('spk_cmt', 'pengiriman.id_spk', '=', 'spk_cmt.id_spk')
            ->where('spk_cmt.id_penjahit', $idPenjahit)
            ->whereBetween('pengiriman.tanggal_pengiriman', [$periodeAwal, $periodeAkhir])
            ->selectRaw('SUM(pengiriman.total_bayar) as total_pendapatan, SUM(pengiriman.claim) as total_claim, SUM(pengiriman.refund_claim) as total_refund_claim')
            ->first();

        // Ambil semua id_spk dari pengiriman
        $idSpkList = Pengiriman::join('spk_cmt', 'pengiriman.id_spk', '=', 'spk_cmt.id_spk')
            ->where('spk_cmt.id_penjahit', $idPenjahit)
            ->whereBetween('pengiriman.tanggal_pengiriman', [$periodeAwal, $periodeAkhir])
            ->pluck('pengiriman.id_spk'); // Berikan tabel eksplisit

           // Hitung total pembayaran cashbon berdasarkan tanggal bayar
        $totalCashboan = Cashboan::whereIn('id_spk', $idSpkList)
            ->with(['logPembayaran' => function ($query) use ($periodeAwal, $periodeAkhir) {
                $query->whereBetween('tanggal_bayar', [$periodeAwal, $periodeAkhir]);
            }])
            ->get()
            ->flatMap(fn($cashboan) => $cashboan->logPembayaran)
            ->sum('jumlah_dibayar');

        // Hitung total pembayaran hutang berdasarkan tanggal bayar
        $totalHutang = Hutang::where('id_penjahit', $idPenjahit)
            ->with(['logPembayaran' => function ($query) use ($periodeAwal, $periodeAkhir) {
                $query->whereBetween('tanggal_bayar', [$periodeAwal, $periodeAkhir]);
            }])
            ->get()
            ->flatMap(fn($hutang) => $hutang->logPembayaran)
            ->sum('jumlah_dibayar');
        

        // Kalkulasi total transfer
        $handtag = $request->handtag;
        $transportasi = $request->transportasi;
        $totalTransfer = ($pengiriman->total_pendapatan ?? 0)
            + ($pengiriman->total_refund_claim ?? 0)
            - ($pengiriman->total_claim ?? 0)
            - $totalCashboan
            - $totalHutang
            - $handtag
            - $transportasi;

        // Simpan data ke tabel pendapatan
        Pendapatan::create([
            'id_penjahit' => $idPenjahit,
            'periode_awal' => $periodeAwal,
            'periode_akhir' => $periodeAkhir,
            'total_pendapatan' => $pengiriman->total_pendapatan ?? 0,
            'total_claim' => $pengiriman->total_claim ?? 0,
            'total_refund_claim' => $pengiriman->total_refund_claim ?? 0,
            'total_cashbon' => $totalCashboan,
            'total_hutang' => $totalHutang,
            'handtag' => $handtag,
            'transportasi' => $transportasi,
            'total_transfer' => $totalTransfer,
        ]);

        return response()->json([
            'message' => 'Pendapatan berhasil disimpan.',
            'data' => [
                'id_penjahit' => $idPenjahit,
                'periode_awal' => $periodeAwal,
                'periode_akhir' => $periodeAkhir,
                'total_pendapatan' => $pengiriman->total_pendapatan ?? 0,
                'total_claim' => $pengiriman->total_claim ?? 0,
                'total_refund_claim' => $pengiriman->total_refund_claim ?? 0,
                'total_cashbon' => $totalCashboan,
                'total_hutang' => $totalHutang,
                'handtag' => $handtag,
                'transportasi' => $transportasi,
                'total_transfer' => $totalTransfer,
            ],
        ]);
        
    }

    public function showPengiriman($id)
{
    // Cari pendapatan berdasarkan ID
    $pendapatan = Pendapatan::find($id);

    if (!$pendapatan) {
        return response()->json(['message' => 'Pendapatan tidak ditemukan.'], 404);
    }

    // Ambil data pengiriman terkait
    $pengiriman = Pengiriman::join('spk_cmt', 'pengiriman.id_spk', '=', 'spk_cmt.id_spk')
        ->where('spk_cmt.id_penjahit', $pendapatan->id_penjahit)
        ->whereBetween('pengiriman.tanggal_pengiriman', [$pendapatan->periode_awal, $pendapatan->periode_akhir])
        ->get();

    return response()->json([
        'pendapatan' => $pendapatan,
        'pengiriman' => $pengiriman,
    ]);
}

public function getPenjahitList()
{
    $penjahit = Penjahit::select('id_penjahit', 'nama_penjahit')->get();
    return response()->json(['data' => $penjahit]);
}


}
