<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use App\Models\SpkChat;
use App\Models\SpkChatInvite;

class ChatNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chat;
    public $socketId; 
    public $allowedUsers;

    // app/Events/ChatNotification.php
    public function __construct(SpkChat $chat, $socketId = null)
    {
        $this->chat = $chat->load('user'); 
        $this->socketId = $socketId; 
        
        // Ambil semua user yang boleh dapat notifikasi
        $this->allowedUsers = SpkChatInvite::where('spk_id', $chat->id_spk)
                                          ->pluck('staff_id') // Ambil ID staff yang diundang
                                          ->toArray();
    }

    public function broadcastOn()
{
    \Log::info("Broadcasting chat notification for SPK: " . $this->chat->id_spk);
    return new Channel('spk-chat-notification.' . $this->chat->id_spk);
}


    public function broadcastAs()
 {
        return 'chat.notification';
 }
 public function broadcastWith()
{
    return [
        'chat' => $this->chat,
        'allowed_users' => $this->allowedUsers, // Kirim daftar user yang diundang
    ];
}


}
