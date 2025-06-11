<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminContactModel;
use App\Core\Response;

class AdminContactController
{
    public static function updateChecked(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        session_start();
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }
        $id = isset($_GET['id']) ? (int) $_GET['id'] : null;
        if (!$id) {
            $uri = $_SERVER['REQUEST_URI'];
            if (preg_match('#/api/contact/(\d+)#', $uri, $matches)) {
                $id = (int) $matches[1];
            }
        }

        if (!$id || $id <= 0) {
            Response::json(['error' => 'Falta o es inválido el parámetro id'], 400);
            return;
        }
        $rawBody = file_get_contents('php://input');
        $data = json_decode($rawBody, true);

        if (!is_array($data) || !isset($data['checked'])) {
            Response::json(['error' => 'Datos inválidos. Se espera { "checked": 0 o 1 }'], 400);
            return;
        }

        $newChecked = (int) $data['checked'];
        if ($newChecked !== 0 && $newChecked !== 1) {
            Response::json(['error' => 'El campo “checked” solo puede valer 0 o 1'], 400);
            return;
        }
        $updated = AdminContactModel::updateChecked($id, $newChecked);
        if ($updated) {
            Response::json(['success' => true], 200);
        } else {
            Response::json(['error' => 'No se pudo actualizar el estado o la fila no existe'], 404);
        }
    }
    public static function index(): void
    {
        session_start();
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }

        $all = AdminContactModel::fetchAll();
        if ($all === null) {
            Response::json(['error' => 'Error al obtener datos'], 500);
            return;
        }

        Response::json(['submissions' => $all], 200);
    }
    public static function destroy(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        session_start();
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }
        $id = isset($_GET['id']) ? (int) $_GET['id'] : null;
        if (!$id) {
            $uri = $_SERVER['REQUEST_URI'];
            if (preg_match('#/api/admin/contact/(\d+)#', $uri, $matches)) {
                $id = (int) $matches[1];
            }
        }

        if (!$id || $id <= 0) {
            Response::json(['error' => 'Falta o es inválido el parámetro id'], 400);
            return;
        }
        $deleted = AdminContactModel::deleteById($id);
        if ($deleted) {
            Response::json(['success' => true], 200);
        } else {
            Response::json(['error' => 'No se pudo eliminar o la fila no existe'], 404);
        }
    }
}
