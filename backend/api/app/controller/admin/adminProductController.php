<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminProductModel;
use App\Core\Response;

class AdminProductController
{
    private static $baseUploadPath = __DIR__ . '/../../../../../uploads/productos/';

    public static function index(): void
    {
        $products = AdminProductModel::getAll();
        Response::json($products);
    }

    public static function show(int $id): void
    {
        $product = AdminProductModel::getById($id);
        if ($product) {
            Response::json($product);
        } else {
            Response::json(['error' => 'Producto no encontrado'], 404);
        }
    }

    public static function store(): void
    {
        $data = $_POST;

        if (empty($data['Nombre']) || !isset($data['Precio']) || !isset($data['Stock']) || !isset($data['Descripcion'])) {
            Response::json(['error' => 'Faltan datos requeridos.'], 400);
            return;
        }

        $productId = AdminProductModel::create($data, []);
        if (!$productId) {
            Response::json(['error' => 'Error al crear el producto.'], 500);
            return;
        }

        $savedImageFilenames = [];
        if (!empty($_FILES['imagenes']['name'][0])) {
            $savedImageFilenames = self::handleImageUploads($productId, $_FILES['imagenes']);
            if ($savedImageFilenames === false) {
                Response::json(['error' => 'Error al procesar las imágenes.'], 500);
                return;
            }
        }

        if (!empty($savedImageFilenames)) {
            AdminProductModel::update($productId, $data, $savedImageFilenames);
        }

        $newProduct = AdminProductModel::getById($productId);
        Response::json(['message' => 'Producto creado con éxito', 'product' => $newProduct], 201);
    }

    public static function update(int $id): void
    {
        $data = $_POST;
        $newImageFilenames = null;

        if (isset($_FILES['imagenes']['name']) && !empty($_FILES['imagenes']['name'][0])) {
            $newImageFilenames = self::handleImageUploads($id, $_FILES['imagenes']);
            if ($newImageFilenames === false) {
                Response::json(['error' => 'Error al procesar las nuevas imágenes.'], 500);
                return;
            }
        }

        $success = AdminProductModel::update($id, $data, $newImageFilenames);
        if ($success) {
            $updatedProduct = AdminProductModel::getById($id);
            Response::json(['message' => 'Producto actualizado con éxito', 'product' => $updatedProduct]);
        } else {
            Response::json(['error' => 'Error al actualizar el producto.'], 500);
        }
    }

    public static function destroy(int $id): void
    {
        $success = AdminProductModel::delete($id);
        if ($success) {
            Response::json(['message' => 'Producto eliminado con éxito']);
        } else {
            Response::json(['error' => 'Error al eliminar el producto.'], 500);
        }
    }

    private static function handleImageUploads(int $productId, array $files): array|false
    {
        $savedFilenames = [];
        $productImageDir = rtrim(self::$baseUploadPath, '/') . '/p' . $productId . '/';

        if (!is_dir($productImageDir)) {
            if (!mkdir($productImageDir, 0777, true)) {
                error_log("Failed to create directory: " . $productImageDir);
                return false;
            }
        }

        foreach ($files['tmp_name'] as $key => $tmp_name) {
            if (empty($tmp_name) || $files['error'][$key] !== UPLOAD_ERR_OK) {
                continue;
            }

            $fileName = basename($files['name'][$key]);
            $newFileName = uniqid() . '_' . $fileName;
            $destination = $productImageDir . $newFileName;

            if (move_uploaded_file($tmp_name, $destination)) {
                $savedFilenames[] = $newFileName;
            } else {
                error_log("Failed to move uploaded file to: " . $destination);
                return false;
            }
        }

        return $savedFilenames;
    }
}
