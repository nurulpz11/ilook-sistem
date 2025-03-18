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
use App\Http\Controllers\SpkChatController;
use App\Http\Controllers\SpkChatInvite;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProdukController;

Route::get('/spk-cmt/{id}/download-pdf', [SpkCmtController::class, 'downloadPdf']);
Route::get('/spk-cmt/{id}/download-staff-pdf', [SpkCmtController::class, 'downloadStaffPdf'])->name('spk.downloadStaffPdf');
Route::post('/register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
   
Route::apiResource('penjahit', PenjahitController::class);
Route::get('/spkcmt', [SpkCmtController::class, 'index']); 
Route::get('/spkcmt/{spkcmt}', [SpkCmtController::class, 'show']); 


Route::middleware(['auth:api', 'role:supervisor|super-admin'])->group(function () {
    Route::post('/spk/{spkId}/invite-staff/{staffId}', [StaffController::class, 'inviteStaff']);

    Route::get('/spk/{spkId}/check-invitation', [SpkChatController::class, 'checkInvitation']);
    Route::get('/spk/{spkId}/check-invite', [SpkChatController::class, 'checkInvite']);
    Route::get('/spk/{spkId}/staff-list', [StaffController::class, 'getStaffList']);

});


    Route::middleware('role:super-admin|supervisor|staff|owner|penjahit')->group(function () {

        Route::apiResource('produk', ProdukController::class);

        Route::post('/spkcmt', [SpkCmtController::class, 'store']);
        Route::put('/spkcmt/{spkcmt}', [SpkCmtController::class, 'update']);
        Route::patch('/spkcmt/{spkcmt}', [SpkCmtController::class, 'update']);
        Route::delete('/spkcmt/{spkcmt}', [SpkCmtController::class, 'destroy']);
        Route::get('/spk-chats/{spkId}', [SpkChatController::class, 'index']);   
        Route::post('/send-message', [SpkChatController::class, 'sendMessage']);
        Route::post('/invite-staff/{staffId}', [StaffController::class, 'inviteStaff']);
        Route::get('/kemampuan-cmt', [SpkCmtController::class, 'getKemampuanCmt']);

        Route::get('/spk-chats/{chatId}/messages', [SpkChatController::class, 'getChatMessages']);
        Route::post('/spk-chats/{chatId}/mark-as-read', [SpkChatController::class, 'markAsRead']);

        Route::get('/spk-chats/{chatId}/readers', [SpkChatController::class, 'getChatReaders']);

        Route::get('/notifications', [NotificationController::class, 'getNotifications']);
        Route::get('/notifications/unread', [NotificationController::class, 'getUnreadNotifications']);
        Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead']);
        Route::get('/kinerja-cmt/kategori-count', [SpkCmtController::class, 'getKategoriCount']);
        Route::get('/kinerja-cmt/kategori-count-by-penjahit', [SpkCmtController::class, 'getKategoriCountByPenjahit']);
        Route::get('/debug-deadlines', [SpkCmtController::class, 'debugDeadlines']);
        Route::get('/kinerja-cmt', [SpkCmtController::class, 'getKinerjaCmt']);
        Route::resource('spkcmt.warna', WarnaController::class)->shallow();
        Route::put('/spk/{id}/deadline', [SpkCmtController::class, 'updateDeadline']);
        Route::get('/log-deadlines', [SpkCmtController::class, 'getAllLogDeadlines']);
        Route::get('/spk/{id}/log-deadline', [SpkCmtController::class, 'getLogDeadline']);
        Route::get('/log-status', [SpkCmtController::class, 'getAllLogStatus']);
        Route::put('/spk/{id}/status', [SpkCmtController::class, 'updateStatus']);
        Route::get('/spk/{id}/log-status', [SpkCmtController::class, 'getLogStatus']);
        Route::get('/spk-cmt/{id}/warna', [SpkCmtController::class, 'getWarna']);


        Route::post('/pengiriman', [PengirimanController::class, 'store']);
        Route::get('/pengiriman', [PengirimanController::class, 'index']);
        Route::get('/pengiriman/{id}', [PengirimanController::class, 'show']);
        Route::post('/pengiriman/petugas-bawah', [PengirimanController::class, 'storePetugasBawah']);
        Route::put('/pengiriman/petugas-atas/{id_pengiriman}', [PengirimanController::class, 'updatePetugasAtas']);



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
        Route::get('/pendapatan/{id}/download-nota', [PendapatanController::class, 'downloadNota']);
        Route::get('/penjahit-list', [PendapatanController::class, 'getPenjahitList']);
        
        Route::resource('laporancmt', LaporanCmtController::class);
      
     
    });

   
});
