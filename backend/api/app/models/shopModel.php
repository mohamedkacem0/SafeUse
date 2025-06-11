<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class ShopModel
{ 
    private static function baseUploadsUrl(): string
    {
        return 'https://safeuse-lkde.onrender.com/uploads/productos/';
    }
    public static function getAll(): array
    {
        $pdo = DB::getInstance()->conn();
        $products = $pdo
            ->query('SELECT * FROM productos')
            ->fetchAll(PDO::FETCH_ASSOC);
        $images = $pdo
            ->query('SELECT ID_Producto, numero_imagen, url_imagen FROM imagenes_producto ORDER BY ID_Producto, numero_imagen')
            ->fetchAll(PDO::FETCH_ASSOC);
        $mapImgs = [];
        foreach ($images as $img) {
            $mapImgs[(int)$img['ID_Producto']][] = $img;
        }

        $uploadsBase = self::baseUploadsUrl();
        $out = [];
        foreach ($products as $prod) {
            $pid = (int)$prod['ID_Producto'];
            $imgs = $mapImgs[$pid] ?? [];

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
    public static function getById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();

        $stmt = $pdo->prepare('SELECT * FROM productos WHERE ID_Producto = ?');
        $stmt->execute([$id]);
        $prod = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$prod) {
            return null;
        }
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

    private static function isAbsolute(string $path): bool
    {
        return str_starts_with($path, 'http://')
            || str_starts_with($path, 'https://');
    }
}
