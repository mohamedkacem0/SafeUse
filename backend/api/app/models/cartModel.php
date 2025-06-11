<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class CartModel {
    private static function baseUploadsUrl(): string {
        return 'https://safeuse-lkde.onrender.com/uploads/productos/';
    }

    private static function isAbsolute(string $path): bool {
        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://');
    }
    public static function getByUser(int $userId): array {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT ci.product_id,
                    ci.quantity,
                    p.Nombre,
                    p.Precio,
                    img.url_imagen
             FROM cart_items ci
             JOIN productos p ON ci.product_id = p.ID_Producto
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
            $stmtStock = $pdo->prepare('SELECT Stock FROM productos WHERE ID_Producto = :pid FOR UPDATE'); // Lock row for update
            $stmtStock->execute(['pid' => $productId]);
            $productStock = $stmtStock->fetchColumn();

            if ($productStock === false) {
                throw new \Exception("Product not found.");
            }
            $stmtCartQty = $pdo->prepare('SELECT quantity FROM cart_items WHERE user_id = :uid AND product_id = :pid');
            $stmtCartQty->execute(['uid' => $userId, 'pid' => $productId]);
            $currentCartQty = (int)$stmtCartQty->fetchColumn(); 
            if ((int)$productStock < $qty) { 
                throw new \Exception("Not enough stock available for the quantity requested to add.");
            }
            $stmtUpdateStock = $pdo->prepare('UPDATE productos SET Stock = Stock - :qty WHERE ID_Producto = :pid');
            $stmtUpdateStock->execute(['qty' => $qty, 'pid' => $productId]);

            $stmtCart = $pdo->prepare(
                'INSERT INTO cart_items (user_id, product_id, quantity)
                 VALUES (:uid, :pid, :insert_qty)
                 ON DUPLICATE KEY UPDATE quantity = quantity + :update_qty'
            );
            $stmtCart->execute(['uid' => $userId, 'pid' => $productId, 'insert_qty' => $qty, 'update_qty' => $qty]);

            $pdo->commit();
            return true;
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e; 
        }
    }

    public static function updateItem(int $userId, int $productId, int $newQty): bool {
        $pdo = DB::getInstance()->conn();

        if ($newQty <= 0) {
            return self::removeItem($userId, $productId);
        }

        try {
            $pdo->beginTransaction();
            $stmtCartQty = $pdo->prepare('SELECT quantity FROM cart_items WHERE user_id = :uid AND product_id = :pid');
            $stmtCartQty->execute(['uid' => $userId, 'pid' => $productId]);
            $currentCartQty = (int)$stmtCartQty->fetchColumn();

            if ($currentCartQty === 0) {
                $pdo->rollBack();
                throw new \Exception("Item not found in cart to update.");
            }

            $qtyDifference = $newQty - $currentCartQty;

            if ($qtyDifference > 0) { 
                $stmtStock = $pdo->prepare('SELECT Stock FROM productos WHERE ID_Producto = :pid FOR UPDATE');
                $stmtStock->execute(['pid' => $productId]);
                $productStock = (int)$stmtStock->fetchColumn();

                if ($productStock < $qtyDifference) {
                    throw new \Exception("Not enough stock to increase quantity.");
                }
                $stmtUpdateStock = $pdo->prepare('UPDATE productos SET Stock = Stock - :diff WHERE ID_Producto = :pid');
                $stmtUpdateStock->execute(['diff' => $qtyDifference, 'pid' => $productId]);
            } elseif ($qtyDifference < 0) { 
                $stmtUpdateStock = $pdo->prepare('UPDATE productos SET Stock = Stock + :diff WHERE ID_Producto = :pid');
                $stmtUpdateStock->execute(['diff' => abs($qtyDifference), 'pid' => $productId]);
            }
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

        $stmtCartQty = $pdo->prepare('SELECT quantity FROM cart_items WHERE user_id = :uid AND product_id = :pid');
        $stmtCartQty->execute(['uid' => $userId, 'pid' => $productId]);
        $result = $stmtCartQty->fetch(PDO::FETCH_ASSOC);
        $currentCartQty = $result ? (int)$result['quantity'] : 0;

        if ($currentCartQty > 0) {
            $stmtUpdateStock = $pdo->prepare('UPDATE productos SET Stock = Stock + :qty WHERE ID_Producto = :pid');
            $stmtUpdateStock->execute(['qty' => $currentCartQty, 'pid' => $productId]);
        }

        $stmtDeleteCart = $pdo->prepare('DELETE FROM cart_items WHERE user_id = :uid AND product_id = :pid');
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
    public static function clearCartForOrder(int $userId): bool {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare('DELETE FROM cart_items WHERE user_id = :uid');
            $stmt->execute(['uid' => $userId]);
            return $stmt->rowCount() >= 0; 
        } catch (\PDOException $e) {
            throw new \Exception("Database error while clearing cart: " . $e->getMessage());
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
