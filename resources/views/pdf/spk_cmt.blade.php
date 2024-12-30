<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPK CMT PDF</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }

        h1 {
            text-align: center;
            color: #4CAF50;
            margin-bottom: 10px;
        }

        .header {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .header p {
            margin: 5px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        table th, table td {
            padding: 12px 15px;
            text-align: left;
        }

        table th {
            background-color: #4CAF50;
            color: white;
            text-transform: uppercase;
        }

        table tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        table tr:hover {
            background-color: #eafaf1;
        }

        .details {
            margin: 20px 0;
            background-color: #fff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .details p {
            margin: 5px 0;
            font-size: 14px;
        }

        .details strong {
            color: #4CAF50;
        }
    </style>
</head>
<body>
    <h1>SPK CMT Report</h1>

    <div class="header">
        <p><strong>Nomor SPK:</strong> {{ $spk->id_spk }}</p>
        <p><strong>Produk:</strong> {{ $spk->nama_produk }}</p>
        <p><strong>Jumlah Produk:</strong> {{ $spk->jumlah_produk }}</p>
        <p><strong>Deadline:</strong> {{ \Carbon\Carbon::parse($spk->deadline)->format('d M Y') }}</p>
        <p><strong>Tanggal SPK:</strong> {{ \Carbon\Carbon::parse($spk->tgl_spk)->format('d M Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Field</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Nomor Seri</strong></td>
                <td>{{ $spk->nomor_seri ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Keterangan</strong></td>
                <td>{{ $spk->keterangan ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Tanggal Ambil</strong></td>
                <td>{{ $spk->tanggal_ambil ? \Carbon\Carbon::parse($spk->tanggal_ambil)->format('d M Y') : 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Catatan</strong></td>
                <td>{{ $spk->catatan ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Markeran</strong></td>
                <td>{{ $spk->markeran ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Aksesoris</strong></td>
                <td>{{ $spk->aksesoris ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Handtag</strong></td>
                <td>{{ $spk->handtag ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Merek</strong></td>
                <td>{{ $spk->merek ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Gambar</strong></td>
                <td>{{ $spk->merek ?? 'N/A' }}</td>
            </tr>
        </tbody>
    </table>

    <div class="details">
        <h3>Penjahit Details</h3>
        <p><strong>Nama Penjahit:</strong> {{ $spk->penjahit->nama_penjahit }}</p>
        <p><strong>Alamat Penjahit:</strong> {{ $spk->penjahit->alamat ?? 'N/A' }}</p>
    </div>

    
</body>
</html>
