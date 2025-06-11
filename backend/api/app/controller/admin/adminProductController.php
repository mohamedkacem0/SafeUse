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
            Response::json(['error' => 'Faltan datos requeridos del producto (Nombre, Precio, Stock, Descripcion).'], 400);
            return;
        }

        $productId = AdminProductModel::create($data, []); 
        if (!$productId) {
            Response::json(['error' => 'Error al crear el producto (fase inicial).'], 500);
            return;
        }
        $savedImageFilenames = [];
        if (!empty($_FILES['imagenes']['name'][0])) { 
            $savedImageFilenames = self::handleImageUploads($productId, $_FILES['imagenes']);
            if ($savedImageFilenames === false) { 
                Response::json(['error' => 'Producto creado, pero ocurrió un error al procesar las imágenes.'], 500);
                return;
            }
        }

        if (!empty($savedImageFilenames)) {
            $updateSuccess = AdminProductModel::update($productId, $data, $savedImageFilenames);
            if (!$updateSuccess) {
                Response::json(['error' => 'Producto creado, pero falló la asociación de imágenes.'], 500);
                return;
            }
        }
        
        Response::json(['message' => 'Producto creado con éxito', 'ID_Producto' => $productId, 'imagenes_cargadas' => $savedImageFilenames], 201);
    }

    public static function update(int $id): void
    {
        $data = $_POST; 

        if (empty($data['Nombre']) || !isset($data['Precio']) || !isset($data['Stock']) || !isset($data['Descripcion'])) {
            Response::json(['error' => 'Faltan datos requeridos del producto para actualizar (Nombre, Precio, Stock, Descripcion).'], 400);
            return;
        }

        $newImageFilenames = null; 
        if (isset($data['clear_images']) && ($data['clear_images'] === 'true' || $data['clear_images'] === true || $data['clear_images'] === 1 || $data['clear_images'] === '1')) {
            $newImageFilenames = []; 
        } 
        elseif (isset($_FILES['imagenes']['name']) && is_array($_FILES['imagenes']['name']) && !empty($_FILES['imagenes']['name'][0])) {
            $processedFilenames = self::handleImageUploads($id, $_FILES['imagenes']);
            if ($processedFilenames === false) { 
                Response::json(['error' => 'Error al procesar las nuevas imágenes.'], 500);
                return;
            }
            $newImageFilenames = $processedFilenames; 
        }
        $success = AdminProductModel::update($id, $data, $newImageFilenames);

        if ($success) {
            Response::json(['message' => 'Producto actualizado con éxito']);
        } else {
            Response::json(['error' => 'Error al actualizar el producto o producto no encontrado.'], 500);
        }
    }

    public static function destroy(int $id): void
    {
        $success = AdminProductModel::delete($id);
        if ($success) {
            Response::json(['message' => 'Producto eliminado con éxito']);
        } else {
            Response::json(['error' => 'Error al eliminar el producto o producto no encontrado'], 500);
        }
    }
    private static function handleImageUploads(int $productId, array $filesInput): array|false
    {
        $savedFilenames = [];
        $productImageDir = rtrim(self::$baseUploadPath, '/') . '/p' . $productId . '/';

        if (!is_dir($productImageDir)) {
            if (!mkdir($productImageDir, 0777, true)) {
                error_log("Failed to create directory: " . $productImageDir);
                return false;
            }
        }

        $fileCount = 0;
        if (isset($filesInput['name']) && is_array($filesInput['name'])) {
            $fileCount = count($filesInput['name']);
        } elseif (isset($filesInput['name']) && !is_array($filesInput['name']) && $filesInput['error'] !== UPLOAD_ERR_NO_FILE) {
            $fileCount = 1;
            foreach (['name', 'type', 'tmp_name', 'error', 'size'] as $key) {
                $filesInput[$key] = [$filesInput[$key]];
            }
        }
        
        if ($fileCount === 0 && isset($filesInput['error']) && $filesInput['error'] === UPLOAD_ERR_NO_FILE) {
            return [];  }

        for ($i = 0; $i < $fileCount; $i++) {
            if (!isset($filesInput['tmp_name'][$i]) || !is_uploaded_file($filesInput['tmp_name'][$i])) {
                if ($filesInput['error'][$i] !== UPLOAD_ERR_NO_FILE) {
                     error_log("Skipping file (not a valid upload or no file): " . ($filesInput['name'][$i] ?? 'N/A'));
                }
                continue;
            }

            if ($filesInput['error'][$i] === UPLOAD_ERR_OK) {
                $tmpName = $filesInput['tmp_name'][$i];
                $originalName = basename($filesInput['name'][$i]);
                $originalExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

                $safeOriginalName = preg_replace("/[^a-zA-Z0-9._-]/", "", pathinfo($originalName, PATHINFO_FILENAME));
                if(empty($safeOriginalName)) $safeOriginalName = 'image';
                $newFilename = uniqid($safeOriginalName . '-', true) . '.webp'; 
                $destination = $productImageDir . $newFilename;

                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']; 
                if (!in_array($originalExtension, $allowedExtensions)) {
                    error_log("Skipping file due to unsupported extension: " . $originalName);
                    continue;
                }
                
                $image = null;
                if ($originalExtension === 'webp') { 
                    if (move_uploaded_file($tmpName, $destination)) {
                        $savedFilenames[] = $newFilename; 
                    } else {
                        error_log("Failed to move original WebP image: " . $originalName);
                    }
                    continue; 
                }

                switch ($originalExtension) {
                    case 'jpg':
                    case 'jpeg':
                        $image = @imagecreatefromjpeg($tmpName);
                        break;
                    case 'png':
                        $image = @imagecreatefrompng($tmpName);
                        if ($image) {
                            @imagepalettetotruecolor($image); 
                            @imagealphablending($image, true);
                            @imagesavealpha($image, true);   
                        }
                        break;
                    case 'gif':
                        $image = @imagecreatefromgif($tmpName);
                        break;
                }

                if ($image) {
                    if (@imagewebp($image, $destination, 80)) { 
                        $savedFilenames[] = $newFilename;
                    } else {
                        error_log("Failed to convert or save WebP image: " . $newFilename . " from " . $originalName . " to " . $destination);
                    }
                    @imagedestroy($image);
                } else {
                    error_log("Failed to create image resource from: " . $originalName . " (extension: " . $originalExtension . ")");
                }

            } elseif ($filesInput['error'][$i] !== UPLOAD_ERR_NO_FILE) {
                error_log("Upload error for file " . ($filesInput['name'][$i] ?? 'unknown') . ": " . $filesInput['error'][$i]);
            }
        }
        return $savedFilenames;
    }
}
