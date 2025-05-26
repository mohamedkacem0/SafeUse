<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class ShopModel
{
    /** Cambia esto si mueves tu proyecto a otra carpeta o dominio */
    private static function baseUrl(): string
    {
        return 'http://localhost/tfg/SafeUse/';
    }

    /** Devuelve todos los productos */
    public static function getAll(): array
    {
        // ⭐ MISMA FORMA DE OBTENER EL PDO QUE EN SubstanceModel
        $pdo  = DB::getInstance()->conn();
        $stmt = $pdo->query('SELECT * FROM Productos');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $base = self::baseUrl();
        foreach ($rows as &$row) {
            // Añade el prefijo solo si aún no es URL absoluta
            if (!empty($row['Imagen_Principal']) && !self::isAbsolute($row['Imagen_Principal'])) {
                $row['Imagen_Principal'] = $base . ltrim($row['Imagen_Principal'], '/');
            }
        }
        return $rows;
    }

    /** Devuelve un producto por su ID (incluye su galería) */
    public static function getById(int $id): ?array
    {
        $pdo  = DB::getInstance()->conn();

        // Producto principal
        $stmt = $pdo->prepare('SELECT * FROM Productos WHERE ID_Producto = ?');
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            return null;
        }

        // Imágenes secundarias
        $stmt = $pdo->prepare('SELECT Ruta_Imagen FROM ImagenesProducto WHERE ID_Producto = ?');
        $stmt->execute([$id]);
        $images = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $base = self::baseUrl();

        if (!empty($product['Imagen_Principal']) && !self::isAbsolute($product['Imagen_Principal'])) {
            $product['Imagen_Principal'] = $base . ltrim($product['Imagen_Principal'], '/');
        }

        $product['galeria'] = array_map(function (string $p) use ($base) {
            return self::isAbsolute($p) ? $p : $base . ltrim($p, '/');
        }, $images);

        return $product;
    }

    /** Helper pequeño para detectar si ya es URL absoluta */
    private static function isAbsolute(string $path): bool
    {
        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://');
    }
}
