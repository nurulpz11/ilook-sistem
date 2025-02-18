<?php

namespace App\Http\Controllers;

use App\Events\ChatNotification;
use App\Events\ChatSent;
use App\Models\SpkChat;
use App\Models\SpkCmt;
use App\Models\SpkChatInvite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

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
            'id_spk' => 'required|exists:spk_cmt,id_spk',
            'message' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'video' => 'nullable|file|mimes:mp4,mov,mkv,avi,wmv|max:15240',
            'vn' => 'nullable|file|mimes:mp3,wav,ogg,webm|max:10240',
        ]);
        
        // Pastikan minimal salah satu ada
        if (!$request->has('message') && !$request->hasFile('image') && !$request->hasFile('video') && !$request->hasFile('vn')) {

            return response()->json(['error' => 'Either message, image, or video is required.'], 422);
        }
        

        // Jika user adalah staff, cek apakah diundang ke SPK
        if ($user->hasRole('staff')) {
            $isInvited = SpkChatInvite::where('staff_id', $user->id)
                                    ->where('spk_id', $request->id_spk)
                                    ->exists();

            if (!$isInvited) {
                return response()->json(['error' => 'Access denied. Staff must be invited to this SPK.'], 403);
            }
        }
        
            // Buat pesan baru
            $chat = new SpkChat();
            $chat->message = $request->message ?? null; // Bisa kosong jika hanya gambar
            $chat->id_spk = $request->id_spk;
            $chat->user_id = $user->id;

            $chat->message = $request->message ?? '';
            // Jika ada gambar, simpan dan ambil URL
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('chat_images', 'public');
                $chat->image_url = URL::to(Storage::url($path));
            }
            if ($request->hasFile('video')) {
                $path = $request->file('video')->store('chat_videos', 'public');
                $chat->video_url = URL::to(Storage::url($path)); // Lebih simpel dan konsisten
            }
            if ($request->hasFile('vn')) {
                $path = $request->file('vn')->store('chat_vn', 'public');
                $chat->vn_url = URL::to(Storage::url($path)); // Lebih simpel dan konsisten
            }

            $chat->save();

            // Broadcast event ke Pusher agar real-time
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
