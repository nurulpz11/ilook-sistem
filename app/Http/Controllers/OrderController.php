<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function showByTracking($trackingNumber)
    {
        $order = Order::with('items')
            ->where('tracking_number', $trackingNumber)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        return response()->json($order);
    }
    public function validateScan(Request $request, $trackingNumber)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.sku' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $order = Order::with('items')
            ->where('tracking_number', $trackingNumber)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }
        if ($order->status === 'packed') {
        return response()->json([
            'message' => 'Order ini sudah berstatus packed dan tidak bisa divalidasi ulang.'
        ], 422);
    }

        // Validasi SKU & qty
        $expectedItems = $order->items->keyBy('sku');
        foreach ($request->items as $scannedItem) {
            $sku = $scannedItem['sku'];
            $qty = $scannedItem['quantity'];

            if (!isset($expectedItems[$sku])) {
                return response()->json([
                    'message' => "SKU {$sku} tidak ada dalam order"
                ], 422);
            }

            if ($expectedItems[$sku]->quantity != $qty) {
                return response()->json([
                    'message' => "Quantity SKU {$sku} tidak cocok. Diharapkan {$expectedItems[$sku]->quantity}, tapi scan {$qty}"
                ], 422);
            }
        }

        // Jika semua valid → update status order
       $order->status = 'packed';
       $order->save();

        // Simpan log scan ke tabel order_logs
        OrderLog::create([
            'order_id'     => $order->id,
            'action'       => 'scan_validasi',
            'performed_by' => Auth::user()->name ?? 'System', // ambil dari token user
            'notes'        => 'Order berhasil discan dan divalidasi',
        ]);
                return response()->json([
            'message' => 'Order berhasil divalidasi & ditandai packed',
            'order' => $order
        ]);
    }

    public function getAllLogs()
    {
        $logs = OrderLog::with(['order' => function ($q) {
            $q->select('id', 'order_number', 'tracking_number', 'status', 'total_amount')
              ->withCount('items as total_items');
        }])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($logs);
    }
    

public function getSummaryReport(Request $request)
{
    $startDate = $request->input('start_date')
        ? \Carbon\Carbon::parse($request->input('start_date'))->startOfDay()
        : now()->startOfDay();

    $endDate = $request->input('end_date')
        ? \Carbon\Carbon::parse($request->input('end_date'))->endOfDay()
        : now()->endOfDay();

    $action = $request->input('action');

    $query = DB::table('order_logs')
        ->join('order', 'order.id', '=', 'order_logs.order_id')
        ->join('order_items', 'order_items.order_id', '=', 'order.id')
        ->selectRaw('
            COUNT(DISTINCT order.id) as total_order,
            SUM(order_items.quantity) as total_items,
            SUM(order.total_amount) as total_amount
        ')
        ->whereBetween('order_logs.created_at', [$startDate, $endDate]);
      
    if ($action) {
        $query->where('order_logs.action', $action);
    }

    $report = $query->get();

    return response()->json([
        'message' => 'Summary report berhasil diambil',
        'filters' => [
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'action' => $action ?? 'Semua',
        ],
        'data' => $report
    ]);
}


}
