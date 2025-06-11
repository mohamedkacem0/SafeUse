<?php
namespace App\Models;

use App\Core\DB;
use PDO;
use PDOException;

class OrderModel {
    private static function baseUploadsUrl(): string
    {
        return 'https://safeuse-lkde.onrender.com/uploads/productos/';
    }
    private static function isAbsolute(string $path): bool
    {
        return str_starts_with($path, 'http://')
            || str_starts_with($path, 'https://');
    }
    public static function create(int $userId, string $direccionEntrega, string $estadoPedido, float $precioTotalPedido, PDO $pdo): int|false {
        $sql = "INSERT INTO pedidos (ID_Usuario, Fecha_Pedido, Estado_Pedido, Direccion_entrega, precio_total) 
                VALUES (:user_id, NOW(), :estado_pedido, :direccion_entrega, :precio_total_pedido)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':estado_pedido', $estadoPedido, PDO::PARAM_STR);
            $stmt->bindParam(':direccion_entrega', $direccionEntrega, PDO::PARAM_STR);
            $stmt->bindParam(':precio_total_pedido', $precioTotalPedido);
            
            $stmt->execute();
            return (int)$pdo->lastInsertId();
        } catch (PDOException $e) {
            return false;
        }
    }
    public static function addDetail(int $idPedido, int $idProducto, int $cantidad, float $precioUnitario, float $precioTotal, PDO $pdo): bool {
        $sql = "INSERT INTO detalles_pedido (ID_Pedido, ID_Producto, Cantidad, Precio_Unitario, Precio_total)
                VALUES (:id_pedido, :id_producto, :cantidad, :precio_unitario, :precio_total)";
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':id_pedido', $idPedido, PDO::PARAM_INT);
            $stmt->bindParam(':id_producto', $idProducto, PDO::PARAM_INT);
            $stmt->bindParam(':cantidad', $cantidad, PDO::PARAM_INT);
            $stmt->bindParam(':precio_unitario', $precioUnitario);
            $stmt->bindParam(':precio_total', $precioTotal);

            return $stmt->execute();
        } catch (PDOException $e) {
            return false;
        }
    }
    public static function getOrdersByUserId(int $userId): array {
        $pdo = DB::getInstance()->conn();
        $ordersData = [];

        $sqlOrders = "SELECT ID_Pedido, Fecha_Pedido, Estado_Pedido, Direccion_entrega, precio_total AS Total_Pedido 
                  FROM pedidos 
                  WHERE ID_Usuario = :user_id 
                  ORDER BY Fecha_Pedido DESC, ID_Pedido DESC";
        
        $stmtOrders = $pdo->prepare($sqlOrders);
        $stmtOrders->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtOrders->execute();
        $mainOrders = $stmtOrders->fetchAll(PDO::FETCH_ASSOC);

        if (empty($mainOrders)) {
            return []; 
        }
        $sqlDetails = "SELECT dp.ID_Producto, dp.Cantidad, dp.Precio_Unitario, dp.Precio_total, 
                              p.Nombre as NombreProducto, ip.url_imagen as ImagenProducto
                       FROM detalles_pedido dp
                       JOIN productos p ON dp.ID_Producto = p.ID_Producto
                       LEFT JOIN imagenes_producto ip ON p.ID_Producto = ip.ID_Producto AND ip.numero_imagen = 1
                       WHERE dp.ID_Pedido = :id_pedido";
        $stmtDetails = $pdo->prepare($sqlDetails);

        foreach ($mainOrders as $order) {
            $stmtDetails->bindParam(':id_pedido', $order['ID_Pedido'], PDO::PARAM_INT);
            $stmtDetails->execute();
            $detailsRaw = $stmtDetails->fetchAll(PDO::FETCH_ASSOC);
            $detailsProcessed = [];
            $uploadsBase = self::baseUploadsUrl();

            foreach ($detailsRaw as $detail) {
                $processedDetail = $detail;
                if (!empty($processedDetail['ImagenProducto']) && !self::isAbsolute($processedDetail['ImagenProducto'])) {
                    // Construct the path: base_url + p<ID_Producto> + / + <url_imagen_from_db> + .webp
                    $imagePath = $uploadsBase . 'p' . $processedDetail['ID_Producto'] . '/' . ltrim($processedDetail['ImagenProducto'], '/') . '.webp';
                    $processedDetail['ImagenProducto'] = $imagePath;
                } elseif (empty($processedDetail['ImagenProducto'])) {
                    $processedDetail['ImagenProducto'] = null; 
                }
                $detailsProcessed[] = $processedDetail;
            }
            
            $currentOrder = $order; 
            $currentOrder['detalles'] = $detailsProcessed;
            
            $ordersData[] = $currentOrder;
        }

        return $ordersData;
    }
}
