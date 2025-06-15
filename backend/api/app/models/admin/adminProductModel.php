<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;

class AdminProductModel
{
    private static $uploadsDir = __DIR__ . '/../../../../uploads/productos/';

    public static function getAll(): array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->query(
            "SELECT p.*, GROUP_CONCAT(ip.url_imagen SEPARATOR ';') as imagenes 
             FROM productos p 
             LEFT JOIN imagenes_producto ip ON p.ID_Producto = ip.ID_Producto 
             GROUP BY p.ID_Producto 
             ORDER BY p.ID_Producto DESC"
        );
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($products as &$product) {
            $product['ID_Producto'] = (int)$product['ID_Producto'];
            $product['Precio'] = (float)$product['Precio'];
            $product['Stock'] = (int)$product['Stock'];
            if (!empty($product['imagenes'])) {
                $imageFilenames = explode(';', $product['imagenes']);
                $product['Imagen_Principal'] = 'uploads/productos/p' . $product['ID_Producto'] . '/' . $imageFilenames[0];
                $product['imagenes_list'] = $imageFilenames;
            } else {
                $product['Imagen_Principal'] = null;
                $product['imagenes_list'] = [];
            }
        }
        return $products;
    }

    public static function getById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare("SELECT * FROM productos WHERE ID_Producto = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            return null;
        }

        $product['ID_Producto'] = (int)$product['ID_Producto'];
        $product['Precio'] = (float)$product['Precio'];
        $product['Stock'] = (int)$product['Stock'];

        $stmt_imgs = $pdo->prepare("SELECT url_imagen, numero_imagen FROM imagenes_producto WHERE ID_Producto = ? ORDER BY numero_imagen");
        $stmt_imgs->execute([$id]);
        $product['imagenes'] = $stmt_imgs->fetchAll(PDO::FETCH_ASSOC);
        return $product;
    }

    public static function create(array $data, array $imageFilenames = []): ?int
    {
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            $sql = "INSERT INTO productos (Nombre, Precio, Stock, Descripcion, Fecha_Creacion) VALUES (?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['Nombre'], $data['Precio'], $data['Stock'], $data['Descripcion']]);
            $productId = (int)$pdo->lastInsertId();

            if ($productId && !empty($imageFilenames)) {
                $imgSql = "INSERT INTO imagenes_producto (ID_Producto, url_imagen, numero_imagen) VALUES (?, ?, ?)";
                $imgStmt = $pdo->prepare($imgSql);
                foreach ($imageFilenames as $index => $filename) {
                    $imgStmt->execute([$productId, $filename, $index + 1]);
                }
            }

            $pdo->commit();
            return $productId;
        } catch (\Exception $e) {
            $pdo->rollBack();
            return null;
        }
    }

    public static function update(int $id, array $data, ?array $newImageFilenames = null): bool
    {
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            $sql = "UPDATE productos SET Nombre = ?, Precio = ?, Stock = ?, Descripcion = ? WHERE ID_Producto = ?";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([$data['Nombre'], $data['Precio'], $data['Stock'], $data['Descripcion'], $id]);

            if ($newImageFilenames !== null) {
                $oldImgQuery = $pdo->prepare("SELECT url_imagen FROM imagenes_producto WHERE ID_Producto = ?");
                $oldImgQuery->execute([$id]);
                $oldPhysicalFiles = $oldImgQuery->fetchAll(PDO::FETCH_COLUMN);
                $productImageDir = self::$uploadsDir . 'p' . $id . '/';
                if (!empty($oldPhysicalFiles)) {
                    foreach ($oldPhysicalFiles as $oldFile) {
                        $filePath = $productImageDir . $oldFile;
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                    }
                }

                $delImgStmt = $pdo->prepare("DELETE FROM imagenes_producto WHERE ID_Producto = ?");
                $delImgStmt->execute([$id]);

                if (!empty($newImageFilenames)) {
                    $imgSql = "INSERT INTO imagenes_producto (ID_Producto, url_imagen, numero_imagen) VALUES (?, ?, ?)";
                    $imgStmt = $pdo->prepare($imgSql);
                    foreach ($newImageFilenames as $index => $filename) {
                        $imgStmt->execute([$id, $filename, $index + 1]);
                    }
                }
            }
            
            $pdo->commit();
            return $success;
        } catch (\Exception $e) {
            $pdo->rollBack();
            return false;
        }
    }

    public static function delete(int $id): bool
    {
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            $imgQuery = $pdo->prepare("SELECT url_imagen FROM imagenes_producto WHERE ID_Producto = ?");
            $imgQuery->execute([$id]);
            $imagesToDelete = $imgQuery->fetchAll(PDO::FETCH_COLUMN);

            $stmt_imgs = $pdo->prepare("DELETE FROM imagenes_producto WHERE ID_Producto = ?");
            $stmt_imgs->execute([$id]);

            $stmt_prod = $pdo->prepare("DELETE FROM productos WHERE ID_Producto = ?");
            $success = $stmt_prod->execute([$id]);

            if ($success) {
                $productImageDir = self::$uploadsDir . 'p' . $id . '/';
                foreach ($imagesToDelete as $imageFile) {
                    $filePath = $productImageDir . $imageFile;
                    if (file_exists($filePath)) {
                        unlink($filePath);
                    }
                }
                if (is_dir($productImageDir) && count(scandir($productImageDir)) == 2) { // Directory is empty
                    rmdir($productImageDir);
                }
            }

            $pdo->commit();
            return $success;
        } catch (\Exception $e) {
            $pdo->rollBack();
            error_log('Error deleting product ' . $id . ': ' . $e->getMessage());
            return false;
        }
    }
}
