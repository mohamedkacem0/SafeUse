<?php
namespace App\Models;

use App\Core\DB;
use PDO;
use PDOException;

class OrderModel {

    /** URL base para las carpetas de subida de imágenes de productos */
    private static function baseUploadsUrl(): string
    {
        // Ensure this path is correct for your setup. 
        // It should point to the directory where product images are publicly accessible.
        return 'http://localhost/tfg/SafeUse/uploads/productos/';
    }

    /** Comprueba si la ruta es ya URL absoluta */
    private static function isAbsolute(string $path): bool
    {
        return str_starts_with($path, 'http://')
            || str_starts_with($path, 'https://');
    }

    /**
     * Creates a new order in the 'pedidos' table.
     * This method should be called within a transaction managed by the controller.
     *
     * @param int $userId The ID of the user placing the order.
     * @param string $direccionEntrega The full delivery address.
     * @param string $estadoPedido The initial state of the order (e.g., 'pending_payment', 'processing').
     * @param PDO $pdo The PDO connection object (passed to ensure it's part of a transaction).
     * @return int|false The ID of the newly created order, or false on failure.
     */
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
            // Log error: error_log('Error creating order: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Adds a detail line item to an existing order in the 'detalles_pedido' table.
     * This method should be called within a transaction managed by the controller.
     *
     * @param int $idPedido The ID of the order to which this detail belongs.
     * @param int $idProducto The ID of the product.
     * @param int $cantidad The quantity of the product.
     * @param float $precioUnitario The unit price of the product at the time of order.
     * @param float $precioTotal The total price for this line item (cantidad * precioUnitario).
     * @param PDO $pdo The PDO connection object (passed to ensure it's part of a transaction).
     * @return bool True on success, false on failure.
     */
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
            // Log error: error_log('Error adding order detail: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Retrieves all orders for a specific user, including their details.
     *
     * @param int $userId The ID of the user whose orders are to be retrieved.
     * @return array An array of orders, each with its details. Returns empty array if no orders.
     * @throws \PDOException if a database error occurs.
     */
    public static function getOrdersByUserId(int $userId): array {
        $pdo = DB::getInstance()->conn();
        $ordersData = [];

        // 1. Get all main order records for the user, including the pre-calculated total price
        $sqlOrders = "SELECT ID_Pedido, Fecha_Pedido, Estado_Pedido, Direccion_entrega, precio_total AS Total_Pedido 
                      FROM pedidos 
                      WHERE ID_Usuario = :user_id 
                      ORDER BY Fecha_Pedido DESC";
        
        $stmtOrders = $pdo->prepare($sqlOrders);
        $stmtOrders->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtOrders->execute();
        $mainOrders = $stmtOrders->fetchAll(PDO::FETCH_ASSOC);

        if (empty($mainOrders)) {
            return []; // No orders found
        }

        // 2. For each order, get its details including product name and image
        // Assuming 'Productos' has 'Nombre' for product name and 'Imagen_principal' for image URL/path
        $sqlDetails = "SELECT dp.ID_Producto, dp.Cantidad, dp.Precio_Unitario, dp.Precio_total, 
                              p.Nombre as NombreProducto, ip.url_imagen as ImagenProducto
                       FROM detalles_pedido dp
                       JOIN Productos p ON dp.ID_Producto = p.ID_Producto
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
                    $processedDetail['ImagenProducto'] = null; // Ensure it's null if empty for frontend placeholder
                }
                $detailsProcessed[] = $processedDetail;
            }
            
            $currentOrder = $order; // $order already contains 'Total_Pedido' from the query
            $currentOrder['detalles'] = $detailsProcessed;
            // The Total_Pedido is now directly fetched from the 'pedidos' table, so no need to calculate it here.

            $ordersData[] = $currentOrder;
        }

        return $ordersData;
    }
}
