<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class ShopModel
{
    /** URL base para las carpetas de subida de imágenes */
    private static function baseUploadsUrl(): string
    {
        return 'http://localhost/tfg/SafeUse/uploads/Productos/';
    }

    /**
     * Devuelve todos los Productos con:
     * - 'Imagen_Principal': primera imagen (numero_imagen=1)
     * - 'galeria': array de todas las imágenes (principal incluida en la posición 0)
     */
    public static function getAll(): array
    {
        $pdo = DB::getInstance()->conn();

        // 1) Obtener todos los Productos
        $products = $pdo
            ->query('SELECT * FROM Productos')
            ->fetchAll(PDO::FETCH_ASSOC);

        // 2) Obtener todas las imágenes ordenadas
        $images = $pdo
            ->query('SELECT ID_Producto, numero_imagen, url_imagen FROM imagenes_producto ORDER BY ID_Producto, numero_imagen')
            ->fetchAll(PDO::FETCH_ASSOC);

        // 3) Agrupar imágenes por producto
        $mapImgs = [];
        foreach ($images as $img) {
            $mapImgs[(int)$img['ID_Producto']][] = $img;
        }

        $uploadsBase = self::baseUploadsUrl();
        $out = [];

        // 4) Construir array final de Productos
        foreach ($products as $prod) {
            $pid = (int)$prod['ID_Producto'];
            $imgs = $mapImgs[$pid] ?? [];

            // Normalizar rutas y añadir extensión
            $ordered = [];
            foreach ($imgs as $img) {
                $num = (int)$img['numero_imagen'];
                $ruta = $img['url_imagen'];
                if (!self::isAbsolute($ruta)) {
                    $ruta = $uploadsBase . 'p' . $pid . '/' . ltrim($ruta, '/');
                }
                $ordered[$num] = $ruta . '.webp';
            }
            ksort($ordered);
            $gallery = array_values($ordered);

            // Definir principal como primera de la galería
            $principal = $gallery[0] ?? null;

            $out[] = [
                'ID_Producto'      => $pid,
                'Nombre'           => $prod['Nombre'],
                'Precio'           => (float)$prod['Precio'],
                'Stock'            => (int)$prod['Stock'],
                'Descripcion'      => $prod['Descripcion'],
                'Fecha_Creacion'   => $prod['Fecha_Creacion'],
                'Imagen_Principal' => $principal,
                'galeria'          => $gallery,
            ];
        }

        return $out;
    }

    /**
     * Devuelve un producto concreto con los mismos campos que getAll().
     */
    public static function getById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();

        // 1) Obtener datos del producto
        $stmt = $pdo->prepare('SELECT * FROM Productos WHERE ID_Producto = ?');
        $stmt->execute([$id]);
        $prod = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$prod) {
            return null;
        }

        // 2) Obtener imágenes del producto
        $stmt = $pdo->prepare(
            'SELECT numero_imagen, url_imagen FROM imagenes_producto WHERE ID_Producto = ? ORDER BY numero_imagen'
        );
        $stmt->execute([$id]);
        $imgs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $uploadsBase = self::baseUploadsUrl();
        $ordered = [];
        foreach ($imgs as $img) {
            $num = (int)$img['numero_imagen'];
            $ruta = $img['url_imagen'];
            if (!self::isAbsolute($ruta)) {
                $ruta = $uploadsBase . 'p' . $id . '/' . ltrim($ruta, '/');
            }
            $ordered[$num] = $ruta . '.webp';
        }
        ksort($ordered);
        $gallery = array_values($ordered);

        // Definir principal como primera de la galería
        $principal = $gallery[0] ?? null;

        return [
            'ID_Producto'      => (int)$prod['ID_Producto'],
            'Nombre'           => $prod['Nombre'],
            'Precio'           => (float)$prod['Precio'],
            'Stock'            => (int)$prod['Stock'],
            'Descripcion'      => $prod['Descripcion'],
            'Fecha_Creacion'   => $prod['Fecha_Creacion'],
            'Imagen_Principal' => $principal,
            'galeria'          => $gallery,
        ];
    }

    /** Comprueba si la ruta es ya URL absoluta */
    private static function isAbsolute(string $path): bool
    {
        return str_starts_with($path, 'http://')
            || str_starts_with($path, 'https://');
    }
}
