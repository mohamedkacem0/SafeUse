<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminProductModel;
use App\Core\Response;

class AdminProductController
{
    private static $baseUploadPath = __DIR__ . '/../../../../../uploads/productos/'; // Adjusted path to root uploads
    
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
        $data = $_POST; // Expecting form-data

        if (empty($data['Nombre']) || !isset($data['Precio']) || !isset($data['Stock']) || !isset($data['Descripcion'])) {
            Response::json(['error' => 'Faltan datos requeridos del producto (Nombre, Precio, Stock, Descripcion).'], 400);
            return;
        }

        // 1. Create product entry (without images first to get ID)
        $productId = AdminProductModel::create($data, []); // Pass empty array for imageFilenames

        if (!$productId) {
            Response::json(['error' => 'Error al crear el producto (fase inicial).'], 500);
            return;
        }

        // 2. Handle image uploads if any
        $savedImageFilenames = [];
        if (!empty($_FILES['imagenes']['name'][0])) { // Check if any files were actually uploaded
            $savedImageFilenames = self::handleImageUploads($productId, $_FILES['imagenes']);
            if ($savedImageFilenames === false) { // Critical error during upload
                // Log this error, product created but images failed.
                // Depending on policy, might consider deleting the product entry if images are mandatory.
                Response::json(['error' => 'Producto creado, pero ocurrió un error al procesar las imágenes.'], 500);
                return;
            }
        }

        // 3. If images were processed and saved, update the product to associate them.
        if (!empty($savedImageFilenames)) {
            // The model's update method will associate these new filenames.
            // $data is passed again to ensure all product details are consistent.
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
        $data = $_POST; // Expecting form-data

        if (empty($data['Nombre']) || !isset($data['Precio']) || !isset($data['Stock']) || !isset($data['Descripcion'])) {
            Response::json(['error' => 'Faltan datos requeridos del producto para actualizar (Nombre, Precio, Stock, Descripcion).'], 400);
            return;
        }

        $newImageFilenames = null; // Default: no change to images

        // Check if client wants to clear all images
        if (isset($data['clear_images']) && ($data['clear_images'] === 'true' || $data['clear_images'] === true || $data['clear_images'] === 1 || $data['clear_images'] === '1')) {
            $newImageFilenames = []; // Signal to model to remove all images
        } 
        // Else, check if new images are being uploaded to replace/add
        // Ensure 'name' is an array and the first element is not an empty string. $_FILES['imagenes']['error'][0] != UPLOAD_ERR_NO_FILE is more robust.
        elseif (isset($_FILES['imagenes']['name']) && is_array($_FILES['imagenes']['name']) && !empty($_FILES['imagenes']['name'][0])) {
            $processedFilenames = self::handleImageUploads($id, $_FILES['imagenes']);
            if ($processedFilenames === false) { // Critical error during new image processing
                Response::json(['error' => 'Error al procesar las nuevas imágenes.'], 500);
                return;
            }
            // If $processedFilenames is an empty array, it means files were sent but none were valid/processed.
            // In this case, we still want to pass an empty array to the model if the intent was to replace.
            // However, if the intent was to add and all failed, it's different. 
            // For simplicity, if any files are in $_FILES, we assume intent to replace/set, so $processedFilenames is used.
            $newImageFilenames = $processedFilenames; 
        }

        // $newImageFilenames will be:
        // null: if no 'clear_images' flag and no new files uploaded (model keeps existing images).
        // []: if 'clear_images' was true (model deletes all existing images).
        // ['file1.webp', ...]: if new images were uploaded (model replaces existing with these; could be an empty array if all uploads failed but files were present).

        $success = AdminProductModel::update($id, $data, $newImageFilenames);

        if ($success) {
            Response::json(['message' => 'Producto actualizado con éxito']);
        } else {
            // The model's update itself might return false if $id not found, or DB error.
            Response::json(['error' => 'Error al actualizar el producto o producto no encontrado.'], 500);
        }
    }

    public static function destroy(int $id): void
    {
        // The model's delete method already handles deleting image files from the server.
        $success = AdminProductModel::delete($id);
        if ($success) {
            Response::json(['message' => 'Producto eliminado con éxito']);
        } else {
            Response::json(['error' => 'Error al eliminar el producto o producto no encontrado'], 500);
        }
    }

    /**
     * Helper function to manage file uploads for products.
     * This is a basic example and needs robust error handling and security checks.
     */
    private static function handleImageUploads(int $productId, array $filesInput): array|false
    {
        $savedFilenames = [];
        $productImageDir = rtrim(self::$baseUploadPath, '/') . '/p' . $productId . '/';

        if (!is_dir($productImageDir)) {
            if (!mkdir($productImageDir, 0755, true)) {
                error_log("Failed to create directory: " . $productImageDir);
                return false; // Critical error: cannot create directory
            }
        }

        // $filesInput is expected to be like $_FILES['imagenes']
        $fileCount = 0;
        if (isset($filesInput['name']) && is_array($filesInput['name'])) {
            $fileCount = count($filesInput['name']);
        } elseif (isset($filesInput['name']) && !is_array($filesInput['name']) && $filesInput['error'] !== UPLOAD_ERR_NO_FILE) {
            // Handle single file upload case if form field name doesn't end with []
            $fileCount = 1;
            // Normalize single file structure to look like multi-file for loop consistency
            foreach (['name', 'type', 'tmp_name', 'error', 'size'] as $key) {
                $filesInput[$key] = [$filesInput[$key]];
            }
        }
        
        if ($fileCount === 0 && isset($filesInput['error']) && $filesInput['error'] === UPLOAD_ERR_NO_FILE) {
            return []; // No files uploaded, which is not an error itself.
        }

        for ($i = 0; $i < $fileCount; $i++) {
            // Check if file was uploaded via HTTP POST
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
                if(empty($safeOriginalName)) $safeOriginalName = 'image'; // Default if filename becomes empty
                $newFilename = uniqid($safeOriginalName . '-', true) . '.webp'; // More unique
                $destination = $productImageDir . $newFilename;

                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']; // Source types we can convert or accept
                if (!in_array($originalExtension, $allowedExtensions)) {
                    error_log("Skipping file due to unsupported extension: " . $originalName);
                    continue;
                }
                
                $image = null;
                if ($originalExtension === 'webp') { // If already webp, just move
                    if (move_uploaded_file($tmpName, $destination)) {
                        $savedFilenames[] = $newFilename; // Assuming $newFilename is used even for original webp for consistency
                    } else {
                        error_log("Failed to move original WebP image: " . $originalName);
                    }
                    continue; // Next file
                }

                switch ($originalExtension) {
                    case 'jpg':
                    case 'jpeg':
                        $image = @imagecreatefromjpeg($tmpName);
                        break;
                    case 'png':
                        $image = @imagecreatefrompng($tmpName);
                        if ($image) {
                            @imagepalettetotruecolor($image); // Ensure true color for WebP conversion
                            @imagealphablending($image, true); // Enable alpha blending
                            @imagesavealpha($image, true);    // Save alpha channel information
                        }
                        break;
                    case 'gif':
                        $image = @imagecreatefromgif($tmpName);
                        break;
                }

                if ($image) {
                    if (@imagewebp($image, $destination, 80)) { // Quality 80
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
        return $savedFilenames; // Return array of successfully saved filenames (could be empty)
    }
}
