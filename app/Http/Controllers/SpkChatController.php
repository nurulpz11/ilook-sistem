<?php

namespace App\Http\Controllers;

use App\Events\ChatNotification;
use App\Events\ChatSent;
use App\Models\SpkChat;
use App\Models\SpkCmt;
use App\Models\SpkChatInvite;
use Illuminate\Http\Request;

class SpkChatController extends Controller
{
    public function index($spkId){

        $user = auth()->user();

        if ($user->hasRole('staff')) {
            $isInvited = SpkChatInvite::where('staff_id', $user->id)
                                      ->where('spk_id', $spkId)
                                      ->exists();
    
            if (!$isInvited) {
                return response()->json(['error' => 'Access denied. Staff must be invited to this SPK.'], 403);
            }
        }

        return response()->json(SpkChat::where('id_spk', $spkId)->with('user')->get());
    }

    public function sendMessage(Request $request){
        $user = auth()->user();
        
        // Validasi request
    $request->validate([
        'message' => 'required|string',
        'id_spk' => 'required|exists:spk_cmt,id_spk',
    ]);

    // Jika user adalah staff, cek apakah diundang ke SPK
    if ($user->hasRole('staff')) {
        $isInvited = SpkChatInvite::where('staff_id', $user->id)
                                  ->where('spk_id', $request->id_spk)
                                  ->exists();

        if (!$isInvited) {
            return response()->json(['error' => 'Access denied. Staff must be invited to this SPK.'], 403);
        }
    }
    
        // Simpan pesan ke database
        $chat = SpkChat::create([
            'message' => $request->message,
            'id_spk' => $request->id_spk,
           'user_id' => $user->id, 
        ]);
        broadcast(new ChatSent($chat))->toOthers();
        
        broadcast(new ChatNotification($chat))->toOthers();

     

        // Kembalikan response JSON
        return response()->json([
            'success' => true,
            'message' => 'Chat berhasil dikirim',
            'data' => $chat
        ], 201);
    }

    public function checkInvitation($spkId)
{
    $user = auth()->user();

    // Hanya role staff yang perlu dicek
    if ($user->hasRole('staff')) {
        $isInvited = SpkChatInvite::where('staff_id', $user->id)
                                  ->where('spk_id', $spkId)
                                  ->exists();

        if ($isInvited) {
            return response()->json(['invited' => true, 'message' => 'Staff is invited to this SPK'], 200);
        } else {
            return response()->json(['invited' => false, 'message' => 'Staff is not invited to this SPK'], 403);
        }
    }

    // Jika bukan staff, otomatis bisa mengakses
    return response()->json(['invited' => true, 'message' => 'Role does not require invitation'], 200);
}

    
}
