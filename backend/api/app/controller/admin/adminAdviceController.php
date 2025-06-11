<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminAdviceModel;
use App\Core\Response;

class AdminAdviceController
{
    public static function index(): void
    {
        session_start();
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }

        $all = AdminAdviceModel::fetchAll();
        if ($all === null) {
            Response::json(['error' => 'Error al obtener consejos'], 500);
            return;
        }

        Response::json(['advice' => $all], 200);
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
        if (!$id || $id <= 0) {
            Response::json(['error' => 'ID inválido'], 400);
            return;
        }

        $deleted = AdminAdviceModel::deleteById($id);
        if ($deleted) {
            Response::json(['success' => true], 200);
        } else {
            Response::json(['error' => 'No se pudo eliminar o no existe'], 404);
        }
    }
    public static function update(): void
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
        if (!$id || $id <= 0) {
            Response::json(['error' => 'ID inválido'], 400);
            return;
        }

        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        if (!is_array($data)
            || !isset($data['title'], $data['description'], $data['stage'])
        ) {
            Response::json(['error' => 'Datos inválidos.'], 400);
            return;
        }
        $toUpdate = [
            'title'       => trim($data['title']),
            'description' => trim($data['description']),
            'articulo'    => isset($data['articulo']) ? trim($data['articulo']) : null,
            'stage'       => trim($data['stage']),
        ];

        $updated = AdminAdviceModel::updateById($id, $toUpdate);
        if ($updated) {
            Response::json(['success' => true], 200);
        } else {
            Response::json(['error' => 'No se pudo actualizar o no existe'], 404);
        }
    }
    public static function store(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        session_start();
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }

        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        if (!is_array($data)
            || !isset($data['title'], $data['description'], $data['stage'])
        ) {
            Response::json(['error' => 'Datos inválidos.'], 400);
            return;
        }

        $toInsert = [
            'title'       => trim($data['title']),
            'description' => trim($data['description']),
            'articulo'    => isset($data['articulo']) ? trim($data['articulo']) : null,
            'stage'       => trim($data['stage']),
        ];

        $newId = AdminAdviceModel::create($toInsert);
        if ($newId !== null) {
            Response::json(['success' => true, 'ID_Advice' => $newId], 201);
        } else {
            Response::json(['error' => 'No se pudo crear el consejo'], 500);
        }
    }
}
