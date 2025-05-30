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

    public static function addItem(int $userId, int $productId, int $qty = 1): void {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES (:uid, :pid, :qty)
             ON DUPLICATE KEY UPDATE quantity = quantity + :qty'
        );
        $stmt->execute(['uid' => $userId, 'pid' => $productId, 'qty' => $qty]);
    }

    public static function updateItem(int $userId, int $productId, int $qty): void {
        $pdo = DB::getInstance()->conn();
        if ($qty > 0) {
            $stmt = $pdo->prepare(
                'UPDATE cart_items SET quantity = :qty 
                 WHERE user_id = :uid AND product_id = :pid'
            );
            $stmt->execute(['qty' => $qty, 'uid' => $userId, 'pid' => $productId]);
        } else {
            self::removeItem($userId, $productId);
        }
    }

    public static function removeItem(int $userId, int $productId): void {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'DELETE FROM cart_items WHERE user_id = :uid AND product_id = :pid'
        );
        $stmt->execute(['uid' => $userId, 'pid' => $productId]);
    }
}
