<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class CartModel {
    /** Base URL para subir imágenes de productos */
    private static function baseUploadsUrl(): string {
        return 'http://localhost/tfg/SafeUse/uploads/productos/';
    }

    private static function isAbsolute(string $path): bool {
        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://');
    }

    /**
     * Devuelve los items del carrito de un usuario,
     * incluyendo la URL normalizada de la imagen principal.
     */
    public static function getByUser(int $userId): array {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT ci.product_id,
                    ci.quantity,
                    p.Nombre,
                    p.Precio,
                    img.url_imagen
             FROM cart_items ci
             JOIN Productos p ON ci.product_id = p.ID_Producto
             LEFT JOIN imagenes_producto img
               ON img.ID_Producto = p.ID_Producto AND img.numero_imagen = 1
             WHERE ci.user_id = :uid'
        );
        $stmt->execute(['uid' => $userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $out = [];
        $base = self::baseUploadsUrl();
        foreach ($rows as $r) {
            $ruta = $r['url_imagen'] ?? '';
            if ($ruta === '') {
                $imgUrl = '';
            } elseif (self::isAbsolute($ruta)) {
                $imgUrl = $ruta . '.webp';
            } else {
                $imgUrl = $base . 'p' . (int)$r['product_id'] . '/' . ltrim($ruta, '/') . '.webp';
            }
            $out[] = [
                'product_id'       => (int)$r['product_id'],
                'quantity'         => (int)$r['quantity'],
                'Nombre'           => $r['Nombre'],
                'Precio'           => (float)$r['Precio'],
                'Imagen_Principal' => $imgUrl,
            ];
        }
        return $out;
    }

    public static function addItem(int $userId, int $productId, int $qty = 1): bool {
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            // 1. Get current stock
            $stmtStock = $pdo->prepare('SELECT Stock FROM Productos WHERE ID_Producto = :pid FOR UPDATE'); // Lock row for update
            $stmtStock->execute(['pid' => $productId]);
            $productStock = $stmtStock->fetchColumn();

            if ($productStock === false) {
                throw new \Exception("Product not found.");
            }

            // 2. Check if enough stock is available for the requested quantity (considering it might be an update)
            // First, check current quantity in cart for this item, if any
            $stmtCartQty = $pdo->prepare('SELECT quantity FROM cart_items WHERE user_id = :uid AND product_id = :pid');
            $stmtCartQty->execute(['uid' => $userId, 'pid' => $productId]);
            $currentCartQty = (int)$stmtCartQty->fetchColumn(); // 0 if not in cart

            // If the item is already in the cart, the ON DUPLICATE KEY UPDATE adds to existing quantity.
            // So, we need to check if (current stock) >= (quantity to be *added* now, which is $qty)
            // If it's a new item, currentCartQty is 0, effectively checking if stock >= $qty.
            // If it's an existing item, we are adding $qty more.
            if ((int)$productStock < $qty) { // Check if the additional quantity can be covered
                throw new \Exception("Not enough stock available for the quantity requested to add.");
            }

            // 3. Decrement stock in Productos table
            $stmtUpdateStock = $pdo->prepare('UPDATE Productos SET Stock = Stock - :qty WHERE ID_Producto = :pid');
            $stmtUpdateStock->execute(['qty' => $qty, 'pid' => $productId]);

            // 4. Add/Update item in cart_items
            $stmtCart = $pdo->prepare(
                'INSERT INTO cart_items (user_id, product_id, quantity)
                 VALUES (:uid, :pid, :insert_qty)
                 ON DUPLICATE KEY UPDATE quantity = quantity + :update_qty'
            );
            // For ON DUPLICATE KEY, :insert_qty is used for new inserts, :update_qty for updates.
            // We are always adding $qty to the cart, whether new or existing.
            $stmtCart->execute(['uid' => $userId, 'pid' => $productId, 'insert_qty' => $qty, 'update_qty' => $qty]);

            $pdo->commit();
            return true;
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            // Log error: error_log($e->getMessage());
            throw $e; // Re-throw the exception to be handled by the controller
        }
    }

    public static function updateItem(int $userId, int $productId, int $newQty): bool {
        $pdo = DB::getInstance()->conn();

        if ($newQty <= 0) {
            // If new quantity is 0 or less, remove the item. removeItem will handle stock restoration.
            return self::removeItem($userId, $productId);
        }

        try {
            $pdo->beginTransaction();

            // 1. Get current quantity in cart for this item
            $stmtCartQty = $pdo->prepare('SELECT quantity FROM cart_items WHERE user_id = :uid AND product_id = :pid');
            $stmtCartQty->execute(['uid' => $userId, 'pid' => $productId]);
            $currentCartQty = (int)$stmtCartQty->fetchColumn();

            if ($currentCartQty === 0) {
                // Item not in cart, should ideally not happen if updating, but handle defensively
                $pdo->rollBack(); // No changes made yet, but good practice
                throw new \Exception("Item not found in cart to update.");
            }

            $qtyDifference = $newQty - $currentCartQty;

            if ($qtyDifference > 0) { // Increasing quantity
                // Check current stock
                $stmtStock = $pdo->prepare('SELECT Stock FROM Productos WHERE ID_Producto = :pid FOR UPDATE');
                $stmtStock->execute(['pid' => $productId]);
                $productStock = (int)$stmtStock->fetchColumn();

                if ($productStock < $qtyDifference) {
                    throw new \Exception("Not enough stock to increase quantity.");
                }
                // Decrement stock
                $stmtUpdateStock = $pdo->prepare('UPDATE Productos SET Stock = Stock - :diff WHERE ID_Producto = :pid');
                $stmtUpdateStock->execute(['diff' => $qtyDifference, 'pid' => $productId]);
            } elseif ($qtyDifference < 0) { // Decreasing quantity
                // Increment stock
                $stmtUpdateStock = $pdo->prepare('UPDATE Productos SET Stock = Stock + :diff WHERE ID_Producto = :pid');
                $stmtUpdateStock->execute(['diff' => abs($qtyDifference), 'pid' => $productId]);
            }
            // If $qtyDifference is 0, no stock change needed, just proceed to update cart quantity if different (though logic implies $newQty != $currentCartQty)

            // Update cart item quantity
            $stmtUpdateCart = $pdo->prepare(
                'UPDATE cart_items SET quantity = :qty WHERE user_id = :uid AND product_id = :pid'
            );
            $stmtUpdateCart->execute(['qty' => $newQty, 'uid' => $userId, 'pid' => $productId]);

            $pdo->commit();
            return true;
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    public static function removeItem(int $userId, int $productId): bool {
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            // 1. Get current quantity in cart for this item
            $stmtCartQty = $pdo->prepare('SELECT quantity FROM cart_items WHERE user_id = :uid AND product_id = :pid');
            $stmtCartQty->execute(['uid' => $userId, 'pid' => $productId]);
            $currentCartQty = (int)$stmtCartQty->fetchColumn();

            if ($currentCartQty > 0) {
                // 2. Increment stock in Productos table
                $stmtUpdateStock = $pdo->prepare('UPDATE Productos SET Stock = Stock + :qty WHERE ID_Producto = :pid');
                $stmtUpdateStock->execute(['qty' => $currentCartQty, 'pid' => $productId]);
            } else {
                // Item not in cart or quantity is 0, nothing to restore to stock, but proceed to ensure it's deleted if somehow present
            }

            // 3. Delete item from cart_items
            $stmtDeleteCart = $pdo->prepare(
                'DELETE FROM cart_items WHERE user_id = :uid AND product_id = :pid'
            );
            $stmtDeleteCart->execute(['uid' => $userId, 'pid' => $productId]);

            $pdo->commit();
            return true;
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    public static function getCartItemCountByUser(int $userId): int {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT SUM(quantity) as total_items FROM cart_items WHERE user_id = :uid'
        );
        $stmt->execute(['uid' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['total_items'] ?? 0);
    }
}
