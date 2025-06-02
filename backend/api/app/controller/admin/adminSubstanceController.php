<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminSubstanceModel;
use App\Core\Response;

class AdminSubstanceController {
    /**
     * Añade una nueva sustancia. Requiere autenticación de administrador.
     * Espera datos multipart/form-data: Nombre, Titulo, Formula (texto) e Imagen (archivo).
     */
    public static function addSubstance(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido. Se esperaba POST.'], 405);
            return;
        }

        // Autenticación y autorización de administrador
        session_start();
        if (!isset($_SESSION['user']) || $_SESSION['user']['Tipo_Usuario'] !== 'admin') {
            Response::json(['error' => 'Acceso no autorizado. Se requieren privilegios de administrador.'], 403);
            return;
        }

        // Recoger datos del formulario para 'sustancias'
        $nombre = trim($_POST['Nombre'] ?? ''); // Clave 'Nombre' con mayúscula inicial
        $titulo = trim($_POST['Titulo'] ?? ''); // Clave 'Titulo' con mayúscula inicial
        $formula = trim($_POST['Formula'] ?? ''); // Clave 'Formula' con mayúscula inicial
        // La imagen se maneja por separado

        // Recoger datos del formulario para 'detalles_sustancia'
        $descripcion = trim($_POST['descripcion'] ?? '');
        $metodos_consumo = trim($_POST['metodos_consumo'] ?? '');
        $efectos_deseados = trim($_POST['efectos_deseados'] ?? '');
        $composicion = trim($_POST['composicion'] ?? '');
        $riesgos = trim($_POST['riesgos'] ?? '');
        $interaccion_otras_sustancias = trim($_POST['interaccion_otras_sustancias'] ?? '');
        $reduccion_riesgos = trim($_POST['reduccion_riesgos'] ?? '');
        $legislacion = trim($_POST['legislacion'] ?? '');

        // Validar campos obligatorios (excepto imagen que se valida después)
        if (empty($nombre) || empty($titulo) || empty($formula)) {
            Response::json(['error' => 'Nombre, título y fórmula son campos obligatorios para la sustancia.'], 400);
            return;
        }

        // Manejo de la subida del archivo
        $nombreSustancia = trim($_POST['Nombre']); // Usado para el nombre de la carpeta y el campo Nombre de la sustancia

        // Recoger datos del formulario para 'detalles_sustancia' (opcionales, default a string vacío)
        $descripcion = trim($_POST['descripcion'] ?? '');
        $metodos_consumo = trim($_POST['metodos_consumo'] ?? '');
        $efectos_deseados = trim($_POST['efectos_deseados'] ?? '');
        $composicion = trim($_POST['composicion'] ?? '');
        $riesgos = trim($_POST['riesgos'] ?? '');
        $interaccion_otras_sustancias = trim($_POST['interaccion_otras_sustancias'] ?? '');
        $reduccion_riesgos = trim($_POST['reduccion_riesgos'] ?? '');
        $legislacion = trim($_POST['legislacion'] ?? '');

        $file = $_FILES['Imagen'];
        $imagePathForDb = '';

        if ($file['error'] === UPLOAD_ERR_OK) {
            $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $maxFileSize = 5 * 1024 * 1024; // 5 MB

            if (!in_array($file['type'], $allowedMimes)) {
                Response::json(['error' => 'Tipo de archivo no permitido. Solo JPG, PNG, GIF, WEBP.'], 400);
                return;
            }

            if ($file['size'] > $maxFileSize) {
                Response::json(['error' => 'El archivo es demasiado grande. Máximo 5MB.'], 400);
                return;
            }

            // Sanitizar nombre de sustancia para la carpeta y nombre de archivo
            $substanceFolderName = strtolower(preg_replace('/[^a-zA-Z0-9_-]+/', '', str_replace(' ', '_', $nombreSustancia)));
            $originalFileName = basename($file['name']);
            $sanitizedFileName = preg_replace('/[^a-zA-Z0-9._-]+/', '', $originalFileName);
            
            // Evitar nombres de archivo vacíos después de sanitizar
            if (empty($sanitizedFileName)) {
                $sanitizedFileName = 'image.' . pathinfo($originalFileName, PATHINFO_EXTENSION);
            }

            // Definir la ruta base de subidas relativa al DOCUMENT_ROOT del servidor
            // Asegúrate de que esta ruta sea correcta para tu estructura de XAMPP
            // Ejemplo: C:/xampp/htdocs/TFG/SafeUse/uploads/sustancias/
            $baseUploadDir = $_SERVER['DOCUMENT_ROOT'] . '/TFG/SafeUse/uploads/sustancias/';
            $targetDir = $baseUploadDir . $substanceFolderName . '/';

            if (!is_dir($targetDir)) {
                if (!mkdir($targetDir, 0777, true)) {
                    Response::json(['error' => 'No se pudo crear el directorio para la sustancia: ' . $targetDir], 500);
                    return;
                }
            }

            $targetFilePath = $targetDir . $sanitizedFileName;
            
            // Para evitar sobrescribir, podrías añadir un timestamp o un identificador único al nombre del archivo si es necesario
            // $targetFilePath = $targetDir . time() . '_' . $sanitizedFileName;

            if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
                // Ruta a guardar en la BD, relativa a la raíz del proyecto web
                $imagePathForDb = 'uploads/sustancias/' . $substanceFolderName . '/' . $sanitizedFileName;
            } else {
                Response::json(['error' => 'Error al mover el archivo subido.'], 500);
                return;
            }
        } else {
            Response::json(['error' => 'Error en la subida del archivo: ' . $file['error']], 400);
            return;
        }

        // Sanear datos de texto
        $sanitizedData = [
            'Nombre'  => filter_var($nombreSustancia, FILTER_SANITIZE_FULL_SPECIAL_CHARS), // $nombreSustancia ya tiene trim($_POST['Nombre'])
            'Imagen'  => $imagePathForDb, 
            'Titulo'  => filter_var(trim($_POST['Titulo'] ?? ''), FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'Formula' => filter_var(trim($_POST['Formula'] ?? ''), FILTER_SANITIZE_FULL_SPECIAL_CHARS),

            // Campos para la tabla 'detalles_sustancia'
            'descripcion'                  => filter_var($descripcion, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'metodos_consumo'              => filter_var($metodos_consumo, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'efectos_deseados'             => filter_var($efectos_deseados, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'composicion'                  => filter_var($composicion, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'riesgos'                      => filter_var($riesgos, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'interaccion_otras_sustancias' => filter_var($interaccion_otras_sustancias, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'reduccion_riesgos'            => filter_var($reduccion_riesgos, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'legislacion'                  => filter_var($legislacion, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
        ];

        $substanceId = AdminSubstanceModel::createSubstance($sanitizedData);

        if ($substanceId) {
            Response::json(['success' => true, 'message' => 'Sustancia añadida correctamente.', 'substanceId' => $substanceId], 201);
        } else {
            Response::json(['error' => 'No se pudo añadir la sustancia a la base de datos.'], 500);
        }
    }

    public static function updateSubstance(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido. Se esperaba POST.'], 405);
            return;
        }

        session_start();
        if (!isset($_SESSION['user']) || $_SESSION['user']['Tipo_Usuario'] !== 'admin') {
            Response::json(['error' => 'Acceso no autorizado.'], 403);
            return;
        }

        // Validar que los datos necesarios están presentes
        $requiredFields = ['ID_Sustancia', 'Nombre', 'Titulo', 'Formula'];
        foreach ($requiredFields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                Response::json(['error' => "El campo '$field' es obligatorio."], 400);
                return;
            }
        }
        
        $id = (int)$_POST['ID_Sustancia'];
        if ($id <= 0) {
            Response::json(['error' => 'ID de sustancia inválido.'], 400);
            return;
        }

        $data = [
            'Nombre' => $_POST['Nombre'],
            'Titulo' => $_POST['Titulo'],
            'Formula' => $_POST['Formula'],
            'descripcion' => $_POST['descripcion'] ?? null,
            'metodos_consumo' => $_POST['metodos_consumo'] ?? null,
            'efectos_deseados' => $_POST['efectos_deseados'] ?? null,
            'composicion' => $_POST['composicion'] ?? null,
            'riesgos' => $_POST['riesgos'] ?? null,
            'interaccion_otras_sustancias' => $_POST['interaccion_otras_sustancias'] ?? null,
            'reduccion_riesgos' => $_POST['reduccion_riesgos'] ?? null,
            'legislacion' => $_POST['legislacion'] ?? null,
        ];

        $imageFile = isset($_FILES['Imagen']) && $_FILES['Imagen']['error'] !== UPLOAD_ERR_NO_FILE ? $_FILES['Imagen'] : null;

        if (AdminSubstanceModel::updateSubstance($id, $data, $imageFile)) {
            Response::json(['success' => true, 'message' => 'Sustancia actualizada correctamente.'], 200);
        } else {
            Response::json(['error' => 'No se pudo actualizar la sustancia.'], 500);
        }
    }

    public static function listBasic(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::json(['error' => 'Método no permitido. Se esperaba GET.'], 405);
            return;
        }
        session_start();
        if (!isset($_SESSION['user']) || $_SESSION['user']['Tipo_Usuario'] !== 'admin') {
            Response::json(['error' => 'Acceso no autorizado.'], 403);
            return;
        }

        $substances = AdminSubstanceModel::getAllBasic();
        if ($substances !== false) {
            $prefixToRemove = 'uploads/sustancias/';
            foreach ($substances as &$substance) {
                if (isset($substance['Imagen']) && strpos($substance['Imagen'], $prefixToRemove) === 0) {
                    $substance['Imagen'] = substr($substance['Imagen'], strlen($prefixToRemove));
                }
            }
            unset($substance); // Romper la referencia del último elemento
            Response::json($substances, 200);
        } else {
            Response::json(['error' => 'No se pudieron obtener las sustancias básicas.'], 500);
        }
    }

    public static function listDetails(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::json(['error' => 'Método no permitido. Se esperaba GET.'], 405);
            return;
        }
        session_start();
        if (!isset($_SESSION['user']) || $_SESSION['user']['Tipo_Usuario'] !== 'admin') {
            Response::json(['error' => 'Acceso no autorizado.'], 403);
            return;
        }

        $details = AdminSubstanceModel::getAllDetails();
        if ($details !== false) {
            Response::json($details, 200);
        } else {
            Response::json(['error' => 'No se pudieron obtener los detalles de las sustancias.'], 500);
        }
    }

    // Aquí se podrían añadir otros métodos para el CRUD de sustancias (updateSubstance, deleteSubstance, getAllSubstancesAdmin, etc.)
}
