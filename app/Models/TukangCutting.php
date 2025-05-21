<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TukangCutting extends Model
{
    use HasFactory;
    
    protected $table = 'tukang_cutting';

    protected $fillable = [
        'nama_tukang_cutting',
    ];

  
}
