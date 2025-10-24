<?php                                                                                                                                                                                            
               
namespace App\Http\Controllers;

use App\Models\PembelianB;
use App\Models\PembelianA;
use App\Models\StokAksesoris;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Milon\Barcode\Facades\DNS1D;


class PembelianBController extends Controller
{
    public function index()
    {
        $pembelianB = PembelianB::with(['pembelianA.aksesoris', 'user'])->get();
    
        // Ambil nama user dari masing-masing pembelianB
        foreach ($pembelianB as $item) {
            $item->user_name = $item->user->name; // Menambahkan field user_name untuk setiap item
        }
    
        return response()->json($pembelianB);
    }
    

   
    public function store(Request $request)
    {
        $request->validate([
            'pembelian_a_id' => 'required|exists:pembelian_aksesoris_a,id',
            'user_id' => 'required|exists:users,id',
            'jumlah_terverifikasi' => 'required|integer',
           
        ]);

        $pembelianA = PembelianA::findOrFail($request->pembelian_a_id);
        
        $status = $request->jumlah_terverifikasi == $pembelianA->jumlah ? 'valid' :'invalid';


        $pembelianB = PembelianB::create([
            'pembelian_a_id'=>$request->pembelian_a_id,
            'user_id'=>$request->user_id,
            'jumlah_terverifikasi' => $request->jumlah_terverifikasi,
            'status_verifikasi' => $status,
        ]);

        if ($status === 'valid'){
            $this->generateBarcodeForPembelianB($pembelianB);
        }

        return response()->json($pembelianB, 201);
    }

    private function generateBarcodeForPembelianB($pembelianB)
    {
        // Ambil data aksesoris terkait dari pembelian B
        $aksesoris = $pembelianB->pembelianA->aksesoris; // asumsi relasi sudah ada
    
        for ($i = 0; $i < $pembelianB->jumlah_terverifikasi; $i++) {
            // Generate barcode unik untuk tiap item aksesoris
            $barcode = 'barcode-' . uniqid();
    
            // Simpan stok aksesoris dengan barcode yang telah di-generate
            StokAksesoris::create([
                'pembelian_aksesoris_b_id' => $pembelianB->id,
                'aksesoris_id' => $aksesoris->id,
                'barcode' => $barcode,
                'status' => 'tersedia',
            ]);
        }
    }

        public function downloadBarcodes($id)
    {
        $pembelianB = PembelianB::with(['stokAksesoris', 'pembelianA.aksesoris'])->findOrFail($id);

        // Cek apakah sudah pernah didownload
        if ($pembelianB->barcode_downloaded) {
            return response()->json(['message' => 'Barcode sudah pernah didownload.'], 403);
        }

        $barcodes = $pembelianB->stokAksesoris;

        // Generate PDF dari view
        $pdf = Pdf::loadView('pdf.barcode_stok_aksesoris', [
            'pembelianB' => $pembelianB,
            'barcodes' => $barcodes
        ]);

        // Tandai bahwa barcode sudah didownload
        $pembelianB->update(['barcode_downloaded' => true]);

        return $pdf->download('barcode_aksesoris_' . $pembelianB->id . '.pdf');
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
