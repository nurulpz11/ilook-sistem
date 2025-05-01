<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPerubahanHutangToHutang extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('hutang', function (Blueprint $table) {
            $table->decimal('perubahan_hutang', 15, 2)->nullable()->after('jumlah_hutang');
        });
    }
    

    public function down()
    {
        Schema::table('hutang', function (Blueprint $table) {
            $table->dropColumn('perubahan_hutang');
        });
    }
}
