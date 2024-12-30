<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SpkCmtController;
use App\Http\Controllers\PenjahitController;
use App\Http\Controllers\LaporanCmtController;

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
Route::resource('laporancmt', LaporanCmtController::class);
Route::apiResource('penjahit', PenjahitController::class);
Route::get('/spk-cmt/{id}/download-pdf', [SpkCmtController::class, 'downloadPdf']);

