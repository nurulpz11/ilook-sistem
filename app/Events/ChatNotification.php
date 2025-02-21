<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use App\Models\SpkChat;

class ChatNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chat;
    public $socketId; 

    // app/Events/ChatNotification.php
    public function __construct(SpkChat $chat, $socketId = null)
    {
        $this->chat = $chat->load('user');
        $this->chat = $chat;
        $this->socketId = $socketId; // Tangkap socket ID
        \Log::info('ChatNotification event instantiated for SPK ID: ' . $chat->id_spk);
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
    ];
}


}
