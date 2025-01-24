<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpkCmtController;
use App\Http\Controllers\PenjahitController;
use App\Http\Controllers\LaporanCmtController;
use App\Http\Controllers\WarnaController;
use App\Http\Controllers\PengirimanController;
use App\Http\Controllers\CashboanController;
use App\Http\Controllers\LogPembayaranCashbonController;
use App\Http\Controllers\HutangController;
use App\Http\Controllers\LogPembayaranHutangController;
use App\Http\Controllers\PendapatanController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::resource('spkcmt', SpkCmtController::class);
Route::get('/kinerja-cmt/kategori-count', [SpkCmtController::class, 'getKategoriCount']);
Route::get('/kinerja-cmt/kategori-count-by-penjahit', [SpkCmtController::class, 'getKategoriCountByPenjahit']);

Route::resource('laporancmt', LaporanCmtController::class);
Route::apiResource('penjahit', PenjahitController::class);
Route::get('/debug-deadlines', [SpkCmtController::class, 'debugDeadlines']);
Route::get('/kinerja-cmt', [SpkCmtController::class, 'getKinerjaCmt']);
Route::get('/spk-cmt/{id}/download-pdf', [SpkCmtController::class, 'downloadPdf']);
Route::get('/spk-cmt/{id}/download-staff-pdf', [SpkCmtController::class, 'downloadStaffPdf'])->name('spk.downloadStaffPdf');
// Nested resource untuk warna (dalam SPK tertentu)
Route::resource('spkcmt.warna', WarnaController::class)->shallow();
Route::put('/spk/{id}/deadline', [SpkCmtController::class, 'updateDeadline']);
Route::get('/spk/{id}/log-deadline', [SpkCmtController::class, 'getLogDeadline']);
Route::get('/log-deadlines', [SpkCmtController::class, 'getAllLogDeadlines']);

Route::put('/spk/{id}/status', [SpkCmtController::class, 'updateStatus']);
Route::get('/spk/{id}/log-status', [SpkCmtController::class, 'getLogStatus']);
Route::post('/pengiriman', [PengirimanController::class, 'store']);
Route::get('/pengiriman', [PengirimanController::class, 'index']);
// Tambahkan route untuk mengambil warna berdasarkan ID SPK
Route::get('/spk-cmt/{id}/warna', [SpkCmtController::class, 'getWarna']);
// routes/api.php
Route::get('/pengiriman/{id}', [PengirimanController::class, 'show']);
Route::resource('cashboan', CashboanController::class);
Route::resource('log-pembayaran-cashboan', LogPembayaranCashbonController::class);
Route::post('/log-pembayaran-cashboan/{id_cashboan}', [LogPembayaranCashbonController::class, 'createLogPembayaran']);
Route::get('/log-pembayaran-cashboan/{id_cashboan}', [LogPembayaranCashbonController::class, 'show']);

Route::resource('hutang', HutangController::class);
Route::resource('log-pembayaran-hutang', LogPembayaranHutangController::class);
Route::post('/log-pembayaran-hutang/{id_hutang}', [LogPembayaranHutangController::class, 'createLogPembayaran']);
Route::get('/log-pembayaran-hutang/{id_hutang}', [LogPembayaranHutangController::class, 'show']);

Route::get('/pendapatan', [PendapatanController::class, 'index']); // Untuk melihat daftar pendapatan atau form
Route::post('pendapatan/calculate', [PendapatanController::class, 'calculate']);
Route::post('/pendapatan', [PendapatanController::class, 'store']);
Route::get('pendapatan/{id}/pengiriman', [PendapatanController::class, 'showPengiriman']);
Route::get('/penjahit-list', [PendapatanController::class, 'getPenjahitList']);





