<?php

namespace App\Listeners;

use App\Events\ChatSent;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Notifications\ChatNotification; // Jika Anda memiliki notifikasi untuk dikirim
use Illuminate\Support\Facades\Notification;

class SendChatNotification implements ShouldQueue
{
    

    public function handle(ChatSent $event)
    {
        $spk = $event->chat->spk;
    
        if (!$spk) {
            Log::error('SPK_CMT not found for Chat ID: ' . $event->chat->id_spk);
            return;
        }
    
        if (!$spk->users || $spk->users->isEmpty()) {
            Log::warning('No users found for SPK_CMT ID: ' . $spk->id_spk);
            return;
        }
    
        Notification::send($spk->users, new ChatNotification($event->chat));
    }
}
