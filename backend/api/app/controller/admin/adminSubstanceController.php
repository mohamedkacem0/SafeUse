<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminSubstanceModel;
use App\Core\Response;

class AdminSubstanceController {
   
    public static function addSubstance(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido. Se esperaba POST.'], 405);
            return;
        }

        session_start();
        if (!isset($_SESSION['user']) || $_SESSION['user']['Tipo_Usuario'] !== 'admin') {
            Response::json(['error' => 'Acceso no autorizado. Se requieren privilegios de administrador.'], 403);
            return;
        }

        $nombre = trim($_POST['Nombre'] ?? ''); 
        $titulo = trim($_POST['Titulo'] ?? ''); 
        $formula = trim($_POST['Formula'] ?? ''); 
        $descripcion = trim($_POST['descripcion'] ?? '');
        $metodos_consumo = trim($_POST['metodos_consumo'] ?? '');
        $efectos_deseados = trim($_POST['efectos_deseados'] ?? '');
        $composicion = trim($_POST['composicion'] ?? '');
        $riesgos = trim($_POST['riesgos'] ?? '');
        $interaccion_otras_sustancias = trim($_POST['interaccion_otras_sustancias'] ?? '');
        $reduccion_riesgos = trim($_POST['reduccion_riesgos'] ?? '');
        $legislacion = trim($_POST['legislacion'] ?? '');

        if (empty($nombre) || empty($titulo) || empty($formula)) {
            Response::json(['error' => 'Nombre, título y fórmula son campos obligatorios para la sustancia.'], 400);
            return;
        }
        $nombreSustancia = trim($_POST['Nombre']); 

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
            $substanceFolderName = strtolower(preg_replace('/[^a-zA-Z0-9_-]+/', '', str_replace(' ', '_', $nombreSustancia)));
            $originalFileName = basename($file['name']);
            $sanitizedFileName = preg_replace('/[^a-zA-Z0-9._-]+/', '', $originalFileName);
            
            if (empty($sanitizedFileName)) {
                $sanitizedFileName = 'image.' . pathinfo($originalFileName, PATHINFO_EXTENSION);
            }
            $baseUploadDir = $_SERVER['DOCUMENT_ROOT'] . '/tmp/uploads/sustancias/'; 
            $targetDir = $baseUploadDir . $substanceFolderName . '/';

            if (!is_dir($targetDir)) {
                if (!mkdir($targetDir, 0777, true)) {
                    Response::json(['error' => 'No se pudo crear el directorio para la sustancia: ' . $targetDir], 500);
                    return;
                }
            }

            $targetFilePath = $targetDir . $sanitizedFileName;
            
            if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
                $imagePathForDb = $substanceFolderName . '/' . $sanitizedFileName;
            } else {
                Response::json(['error' => 'Error al mover el archivo subido.'], 500);
                return;
            }
        } else {
            Response::json(['error' => 'Error en la subida del archivo: ' . $file['error']], 400);
            return;
        }
        $sanitizedData = [
            'Nombre'  => filter_var($nombreSustancia, FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'Imagen'  => $imagePathForDb, 
            'Titulo'  => filter_var(trim($_POST['Titulo'] ?? ''), FILTER_SANITIZE_FULL_SPECIAL_CHARS),
            'Formula' => filter_var(trim($_POST['Formula'] ?? ''), FILTER_SANITIZE_FULL_SPECIAL_CHARS),
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

    public static function deleteSubstance($id): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            Response::json(['error' => 'Método no permitido. Se esperaba DELETE.'], 405);
            return;
        }

        session_start();
        if (!isset($_SESSION['user']) || $_SESSION['user']['Tipo_Usuario'] !== 'admin') {
            Response::json(['error' => 'Acceso no autorizado. Se requieren privilegios de administrador.'], 403);
            return;
        }

        $substanceId = (int)$id;
        if ($substanceId <= 0) {
            Response::json(['error' => 'ID de sustancia inválido.'], 400);
            return;
        }

        if (AdminSubstanceModel::deleteById($substanceId)) {
            Response::json(['success' => true, 'message' => 'Sustancia eliminada correctamente.'], 200);
        } else {
            Response::json(['error' => 'No se pudo eliminar la sustancia.'], 500);
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
            unset($substance);
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
}
