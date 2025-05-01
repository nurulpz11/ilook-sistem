<!DOCTYPE html>
<html>
<head>
    <title>Barcode Aksesoris</title>
    <style>
        .barcode {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
        }
        img {
            /* Menambahkan ukuran untuk barcode */
            width: 150px;  /* Mengubah lebar barcode */
            height: auto;  /* Menjaga proporsi tinggi gambar */
        }
    </style>
</head>
<body>
    <h2>Daftar Barcode - {{ $pembelianB->pembelianA->aksesoris->nama_aksesoris }}</h2>

    @foreach($barcodes as $stok)
        <div class="barcode">
            <p>{{ $stok->barcode }}</p>
            <!-- Menyesuaikan ukuran barcode -->
            <img src="data:image/png;base64,{{ DNS1D::getBarcodePNG($stok->barcode, 'C128', 2, 50) }}" alt="barcode" />
        </div>
    @endforeach
</body>
</html>
