<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminContactModel;
use App\Core\Response;

class AdminContactController
{
    /**
     * Maneja PUT /api/contact/{id} (o PUT /api/contact?id={id})
     * Actualiza el campo "checked" (0 o 1) para una submission concreta.
     * Responde con JSON { success: true } o { error: "mensaje" } y el código HTTP adecuado.
     */
    public static function updateChecked(): void
    {
        // 1) Solo permitimos PUT
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        session_start();
        // 2) Validamos que sea un admin
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }

        // 3) Obtenemos el ID_Submission de dos maneras:
        //    a) Desde query string: ?id=123
        $id = isset($_GET['id']) ? (int) $_GET['id'] : null;

        //    b) Si no vino por $_GET['id'], lo intentamos extraer de la propia URI:
        //       Ejemplo de URI: /api/contact/123
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

        // 4) Leemos el cuerpo de la petición y decodificamos JSON
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

        // 5) Llamamos al modelo para actualizar en BD
        $updated = AdminContactModel::updateChecked($id, $newChecked);
        if ($updated) {
            Response::json(['success' => true], 200);
        } else {
            // Puede significar que la fila no existía (rowCount=0) o que hubo otro fallo
            Response::json(['error' => 'No se pudo actualizar el estado o la fila no existe'], 404);
        }
    }

    /**
     * (Opcional) GET /api/admin/contact
     * Devuelve todas las submissions de contacto (para listado en panel admin).
     */
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

    /**
     * DELETE /api/admin/contact/{id} o /api/admin/contact?id={id}
     * Elimina una submission de contacto por ID.
     * Responde con JSON { success: true } o { error: "mensaje" } y el código HTTP adecuado.
     */
    public static function destroy(): void
    {
        // Solo permitimos DELETE
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        session_start();
        // Validamos que sea un admin
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }

        // Obtenemos el ID de la submission a eliminar
        $id = isset($_GET['id']) ? (int) $_GET['id'] : null;

        // Si no vino por query, intentamos extraerlo de la URI
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

        // Llamamos al modelo para eliminar
        $deleted = AdminContactModel::deleteById($id);
        if ($deleted) {
            Response::json(['success' => true], 200);
        } else {
            Response::json(['error' => 'No se pudo eliminar o la fila no existe'], 404);
        }
    }
}
