<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;

class AdminOrdersModel
{
    /**
     * Obtiene todas las órdenes (cabeceras) desde la tabla `pedidos`.
     */
    public static function fetchAll(): ?array
    {
        $pdo = DB::getInstance()->conn();
        try {
            $sql = '
                SELECT
                    ID_Pedido         AS id,
                    ID_Usuario        AS user_id,
                    Precio_total      AS total,
                    Estado_Pedido     AS status,
                    Fecha_Pedido      AS created_at,
                    Direccion_entrega AS shipping_address
                FROM pedidos
                ORDER BY Fecha_Pedido DESC
            ';
            $stmt = $pdo->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log('Error en AdminOrdersModel::fetchAll: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Busca una sola orden por su ID_Pedido.
     */
    public static function findById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare('
                SELECT
                    ID_Pedido         AS id,
                    ID_Usuario        AS user_id,
                    Precio_total      AS total,
                    Estado_Pedido     AS status,
                    Fecha_Pedido      AS created_at,
                    Direccion_entrega AS shipping_address
                FROM pedidos
                WHERE ID_Pedido = :id
            ');
            $stmt->execute(['id' => $id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (\PDOException $e) {
            error_log('Error en AdminOrdersModel::findById: ' . $e->getMessage());
            return null;
        }
    }
    public static function fetchDetailsByOrderId(int $orderId): ?array
    {
        $pdo = DB::getInstance()->conn();
        try {
            $sql = '
                SELECT
                    dp.ID_Detalle       AS detail_id,
                    dp.ID_Pedido        AS order_id,
                    dp.ID_Producto      AS product_id,
                    p.Nombre            AS product_name,
                    dp.Cantidad         AS quantity,
                    dp.Precio_Unitario  AS unit_price,
                    dp.Precio_total     AS total_price
                FROM detalles_pedido dp
                JOIN productos p ON dp.ID_Producto = p.ID_Producto
                WHERE dp.ID_Pedido = :orderId
            ';
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['orderId' => $orderId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log('Error en AdminOrdersModel::fetchDetailsByOrderId: ' . $e->getMessage());
            return null;
        }
    }
    public static function updateDetail(int $detailId, int $quantity, float $unitPrice): bool
    {
        $pdo = DB::getInstance()->conn();
        $totalPrice = $quantity * $unitPrice;

        $sql = '
            UPDATE detalles_pedido
               SET Cantidad        = :quantity,
                   Precio_Unitario = :unitPrice,
                   Precio_total    = :totalPrice
             WHERE ID_Detalle      = :detailId
        ';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'quantity'   => $quantity,
            'unitPrice'  => $unitPrice,
            'totalPrice' => $totalPrice,
            'detailId'   => $detailId,
        ]);

        return true;
    }
    public static function deleteDetailsByOrderId(int $orderId): bool
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare('DELETE FROM detalles_pedido WHERE ID_Pedido = :orderId');
        $stmt->execute(['orderId' => $orderId]);
        return true;
    }
    public static function deleteById(int $id): bool
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare('DELETE FROM pedidos WHERE ID_Pedido = :id');
        $stmt->execute(['id' => $id]);
        return true;
    }
}
