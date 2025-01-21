<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateHutangTable extends Migration
{
    public function up()
    {
        Schema::table('hutang', function (Blueprint $table) {
            // Hapus foreign key terlebih dahulu
            $table->dropForeign(['id_spk']);

            // Hapus kolom id_spk
            $table->dropColumn('id_spk');

            // Tambahkan kolom id_penjahit
            $table->unsignedBigInteger('id_penjahit')->after('id_hutang');
            $table->foreign('id_penjahit')->references('id_penjahit')->on('penjahit')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('hutang', function (Blueprint $table) {
            // Tambahkan kembali kolom id_spk
            $table->unsignedBigInteger('id_spk')->after('id_hutang');
            $table->foreign('id_spk')->references('id_spk')->on('spk_cmt')->onDelete('cascade');

            // Hapus foreign key dan kolom id_penjahit
            $table->dropForeign(['id_penjahit']);
            $table->dropColumn('id_penjahit');
        });
    }
}
