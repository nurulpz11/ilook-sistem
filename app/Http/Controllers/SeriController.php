<?php

namespace App\Http\Controllers;

use App\Models\Seri;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;

class SeriController extends Controller
{
   public function index()
{
    $seri = Seri::all();

    $data = $seri->map(function ($item) {
        $svg = QrCode::format('svg')->size(200)->generate($item->nomor_seri);
        $item->qr_svg_base64 = base64_encode($svg);
        return $item;
    });

    return response()->json($data);
}

    public function store(Request $request)
    {
        $request->validate([
            'nomor_seri' => 'required|unique:seri,nomor_seri',
        ]);

        return Seri::create([
            'nomor_seri' => $request->nomor_seri
        ]);
    }

   public function show($id)
    {
        $seri = Seri::findOrFail($id);

     $svg = QrCode::format('svg')->size(300)->generate($seri->nomor_seri);
     $svgBase64 = base64_encode($svg);

        return response()->json([
            'seri' => $seri,
            'qr_svg_base64' => $svgBase64
        ]);
    }
  public function download($id)
{
    $seri = Seri::findOrFail($id);

    $svg = QrCode::format('svg')->size(200)->generate($seri->nomor_seri);

    $cleanName = 'qr_' . preg_replace('/[^A-Za-z0-9_\-]/', '', $seri->nomor_seri) . '.svg';

    return response()->stream(function () use ($svg) {
        echo $svg;
    }, 200, [
        "Content-Type" => "image/svg+xml",
        "Content-Disposition" => "attachment; filename=\"qr.svg\"",
        "Cache-Control" => "no-cache, no-store, must-revalidate",
        "Pragma" => "no-cache",
        "Expires" => "0",
    ]);
}





}
