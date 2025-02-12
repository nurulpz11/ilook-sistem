<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpkChat extends Model
{
    use HasFactory;

    protected $fillable = ['id_spk', 'user_id', 'message'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function spk()
    {
        return $this->belongsTo(SpkCmt::class, 'id_spk', 'id_spk'); // Sesuaikan jika perlu
    }
    
}
