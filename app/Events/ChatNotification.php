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

    public function __construct(SpkChat $chat)
    {
        $this->chat = $chat;
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
}
