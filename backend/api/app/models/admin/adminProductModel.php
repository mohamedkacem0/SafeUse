<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;

class AdminProductModel
{
    private static $uploadsDir = __DIR__ . '/../../../../uploads/productos/';

    /**
     * Get all products for the admin panel.
     * Potentially less detailed than public view or includes admin-specific info.
     */
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

        // Process images: split string into array and prepend base path if needed
        foreach ($products as &$product) {
            if (!empty($product['imagenes'])) {
                $imageFilenames = explode(';', $product['imagenes']); // These are raw filenames, e.g., "img1.jpg"
                // Construct a web-accessible path for the primary image
                $product['Imagen_Principal'] = 'uploads/productos/p' . $product['ID_Producto'] . '/' . $imageFilenames[0];
                // Provide the list of raw filenames for admin editing purposes
                $product['imagenes_list'] = $imageFilenames;
            } else {
                $product['Imagen_Principal'] = null; // Or a default placeholder image
                $product['imagenes_list'] = [];
            }
        }
        return $products;
    }

    /**
     * Get a single product by its ID, including all its images.
     */
    public static function getById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare("SELECT * FROM productos WHERE ID_Producto = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            return null;
        }

        $stmt_imgs = $pdo->prepare("SELECT url_imagen, numero_imagen FROM imagenes_producto WHERE ID_Producto = ? ORDER BY numero_imagen");
        $stmt_imgs->execute([$id]);
        $product['imagenes'] = $stmt_imgs->fetchAll(PDO::FETCH_ASSOC);
        return $product;
    }

    /**
     * Create a new product.
     * $data should include 'Nombre', 'Precio', 'Stock', 'Descripcion'.
     * $imageFilenames is an array of filenames for the product's images (e.g., ['img1.jpg', 'img2.png']).
     * The controller is responsible for moving uploaded files to the correct product-specific directory.
     */
    public static function create(array $data, array $imageFilenames = []): ?int
    {
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            $sql = "INSERT INTO productos (Nombre, Precio, Stock, Descripcion, Fecha_Creacion) VALUES (?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['Nombre'], 
                $data['Precio'], 
                $data['Stock'], 
                $data['Descripcion']
            ]);
            $productId = (int)$pdo->lastInsertId();

            if ($productId && !empty($imageFilenames)) {
                $imgSql = "INSERT INTO imagenes_producto (ID_Producto, url_imagen, numero_imagen) VALUES (?, ?, ?)";
                $imgStmt = $pdo->prepare($imgSql);
                foreach ($imageFilenames as $index => $filename) {
                    // $filename is expected to be just the name, e.g., "image1.webp"
                    // The controller is responsible for having placed the file in the correct product-specific directory.
                    $imgStmt->execute([$productId, $filename, $index + 1]);
                }
            }

            $pdo->commit();
            return $productId;
        } catch (\Exception $e) {
            $pdo->rollBack();
            // Log error $e->getMessage()
            return null;
        }
    }

    /**
     * Update an existing product.
     * $data can include 'Nombre', 'Precio', 'Stock', 'Descripcion'.
     * $newImageFilenames (optional) is an array of new filenames. 
     * If null, images are not changed. 
     * If an empty array, all existing images are removed.
     * If a non-empty array, existing images are replaced with the new set.
     * The controller is responsible for moving uploaded files to the correct product-specific directory.
     */
    public static function update(int $id, array $data, ?array $newImageFilenames = null): bool
    {
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            $sql = "UPDATE productos SET Nombre = ?, Precio = ?, Stock = ?, Descripcion = ? WHERE ID_Producto = ?";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([
                $data['Nombre'], 
                $data['Precio'], 
                $data['Stock'], 
                $data['Descripcion'], 
                $id
            ]);

            // If $newImageFilenames is not null, it means an image update operation is intended.
            if ($newImageFilenames !== null) {
                // 1. Get current image filenames from DB to delete their physical files.
                $oldImgQuery = $pdo->prepare("SELECT url_imagen FROM imagenes_producto WHERE ID_Producto = ?");
                $oldImgQuery->execute([$id]);
                $oldPhysicalFiles = $oldImgQuery->fetchAll(PDO::FETCH_COLUMN);

                // 2. Delete old physical image files from the server.
                $productImageDir = self::$uploadsDir . 'p' . $id . '/';
                if (!empty($oldPhysicalFiles)) {
                    foreach ($oldPhysicalFiles as $oldFile) {
                        $filePath = $productImageDir . $oldFile;
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                    }
                }

                // 3. Delete all old image records from DB for this product.
                $delImgStmt = $pdo->prepare("DELETE FROM imagenes_producto WHERE ID_Producto = ?");
                $delImgStmt->execute([$id]);

                // 4. Insert new image records (if any are provided in $newImageFilenames).
                // The controller is responsible for ensuring these new files are already in $productImageDir.
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
            // Log error $e->getMessage()
            return false;
        }
    }

    /**
     * Delete a product by its ID.
     * This should also handle deleting associated images from DB and filesystem.
     */
    public static function delete(int $id): bool
    {
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            // 1. Get image filenames before deleting from DB to delete files later
            $imgQuery = $pdo->prepare("SELECT url_imagen FROM imagenes_producto WHERE ID_Producto = ?");
            $imgQuery->execute([$id]);
            $imagesToDelete = $imgQuery->fetchAll(PDO::FETCH_COLUMN);

            // 2. Delete from imagenes_producto
            $stmt_imgs = $pdo->prepare("DELETE FROM imagenes_producto WHERE ID_Producto = ?");
            $stmt_imgs->execute([$id]);

            // 3. Delete from productos
            $stmt_prod = $pdo->prepare("DELETE FROM productos WHERE ID_Producto = ?");
            $success = $stmt_prod->execute([$id]);

            if ($success) {
                // 4. Delete actual image files
                $productImageDir = self::$uploadsDir . 'p' . $id . '/';
                foreach ($imagesToDelete as $imageFile) {
                    $filePath = $productImageDir . $imageFile; // Assumes $imageFile already has extension
                    if (file_exists($filePath)) {
                        unlink($filePath);
                    }
                }
                // Attempt to remove the product's image directory if it's empty
                if (is_dir($productImageDir) && count(scandir($productImageDir)) == 2) { // . and ..
                    rmdir($productImageDir);
                }
            }

            $pdo->commit();
            return $success;
        } catch (\Exception $e) {
            $pdo->rollBack();
            // Log error $e->getMessage()
            error_log('Error deleting product ' . $id . ': ' . $e->getMessage());
            return false;
        }
    }
}
