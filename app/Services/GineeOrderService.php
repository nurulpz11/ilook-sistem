<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use App\Helpers\GineeSignature;
use App\Models\SyncLog;

class GineeOrderService
{
    public function syncRecentOrders(): array
    {
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '1024M');

        $accessKey = env('GINEE_ACCESS_KEY');
        $secretKey = env('GINEE_SECRET_KEY');
        $country   = env('GINEE_COUNTRY', 'ID');
        $host      = env('GINEE_API_HOST', 'https://api.ginee.com');

        $endpointList  = '/openapi/order/v2/list-order';
        $endpointBatch = '/openapi/order/v1/batch-get';

        $signatureList = str_replace(["\r", "\n"], '', GineeSignature::generate('POST', $endpointList, $secretKey));
        $headersList = [
            'Content-Type' => 'application/json',
            'X-Advai-Country' => $country,
            'Authorization' => $accessKey . ':' . $signatureList
        ];

        // Ambil waktu terakhir sync (default mundur 1 hari kalau belum ada)
        $syncLog = SyncLog::firstOrCreate(['type' => 'orders'], [
            'last_sync_at' => now()->subDay()
        ]);

        $since = $syncLog->last_sync_at->toIso8601String();
        $to = now()->toIso8601String();

        $totalProcessed = 0;
        $newCount = 0;
        $updatedCount = 0;

        $nextCursor = null;
        $page = 1;

        do {
            $bodyList = [
                'lastUpdateSince' => $since,
                'lastUpdateTo'    => $to,
                'orderStatus'     => 'READY_TO_SHIP',
                'size'            => 100,
            ];

            if ($nextCursor) {
                $bodyList['nextCursor'] = $nextCursor;
            }

            $listResponse = Http::timeout(90)
                ->withHeaders($headersList)
                ->post($host . $endpointList, $bodyList);

            $responseData = $listResponse->json();
            $listData = $responseData['data']['content'] ?? [];
            $hasMore = $responseData['data']['more'] ?? false;
            $nextCursor = $responseData['data']['nextCursor'] ?? null;

            dump("Tanggal {$since} s/d {$to} | Page {$page} -> dapat " . count($listData) . " order | more: " . ($hasMore ? 'yes' : 'no'));

            if (!empty($listData)) {
                $this->saveOrderBatch($listData, $endpointBatch, $accessKey, $secretKey, $country, $host, $newCount, $updatedCount, $totalProcessed);
            }

            $page++;
            sleep(1);
        } while ($hasMore);

        // Update waktu terakhir sync ke sekarang
        $syncLog->update(['last_sync_at' => now()]);

        return [
            'totalProcessed' => $totalProcessed,
            'new' => $newCount,
            'updated' => $updatedCount,
        ];

    }

    private function saveOrderBatch($listData, $endpointBatch, $accessKey, $secretKey, $country, $host, &$newCount, &$updatedCount, &$totalProcessed)
    {
        // ambil orderId
        $orderIds = collect($listData)->pluck('orderId')->filter()->unique()->values()->toArray();
        $chunks = array_chunk($orderIds, 20);

        foreach ($chunks as $chunk) {
            $signatureBatch = str_replace(["\r", "\n"], '', GineeSignature::generate('POST', $endpointBatch, $secretKey));
            $headersBatch = [
                'Content-Type' => 'application/json',
                'X-Advai-Country' => $country,
                'Authorization' => $accessKey . ':' . $signatureBatch
            ];

            $bodyBatch = [
                'orderIds' => $chunk,
                'historicalData' => false
            ];

            $batchResponse = Http::timeout(90)->withHeaders($headersBatch)->post($host . $endpointBatch, $bodyBatch);
            $batchData = $batchResponse->json()['data'] ?? [];

            foreach ($batchData as $order) {
                $trackingNumber =
                    $order['trackingNumber']
                    ?? ($order['fulfillmentInfo']['trackingNumber'] ?? null)
                    ?? ($order['fulfillmentInfoList'][0]['trackingNumber'] ?? null)
                    ?? ($order['logisticsInfos'][0]['logisticsTrackingNumber'] ?? null)
                    ?? ($order['logisticInfoList'][0]['trackingNumber'] ?? null);

                $updateData = [
                    'platform'        => $order['channel'] ?? null,
                    'customer_name'   => $order['customerInfo']['name'] ?? null,
                    'customer_phone'  => $order['customerInfo']['mobile'] ?? null,
                    'total_amount'    => $order['paymentInfo']['totalAmount'] ?? 0,
                    'status'          => $order['orderStatus'] ?? null,
                    'order_date'      => isset($order['createAt']) ? Carbon::parse($order['createAt'])->format('Y-m-d H:i:s') : null,
                    'total_qty'       => $order['totalQuantity'] ?? (isset($order['items']) ? collect($order['items'])->sum('quantity') : 0),
                ];

                if (!empty($trackingNumber)) {
                    $updateData['tracking_number'] = $trackingNumber;
                }

                $orderModel = Order::updateOrCreate(
                    ['order_number' => $order['externalOrderSn'] ?? null],
                    $updateData
                );

                if (!empty($order['items'])) {
                    foreach ($order['items'] as $item) {
                        OrderItem::updateOrCreate(
                            [
                                'order_id' => $orderModel->id,
                                'sku' => $item['sku'] ?? null,
                            ],
                            [
                                'product_name' => $item['productName'] ?? null,
                                'quantity'     => $item['quantity'] ?? 0,
                                'price'        => $item['price'] ?? 0,
                                'image'        => $item['productImageUrl'] ?? null,
                            ]
                        );
                    }
                }

                if ($orderModel->wasRecentlyCreated) $newCount++;
                else $updatedCount++;

                $totalProcessed++;
            }

            sleep(1);
        }
    }
}
