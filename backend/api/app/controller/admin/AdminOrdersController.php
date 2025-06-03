<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminOrdersModel;
use App\Core\Response;

class AdminOrdersController
{
    /**
     * GET /api/admin/orders
     * Devuelve todas las órdenes (pedidos) en JSON: { orders: [ … ] }
     */
    public static function index(): void
    {
        session_start();
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }

        $all = AdminOrdersModel::fetchAll();
        if ($all === null) {
            Response::json(['error' => 'Error al obtener órdenes'], 500);
            return;
        }

        Response::json(['orders' => $all], 200);
    }

    /**
     * DELETE /api/admin/orders/{id}
     * Elimina un pedido dado su ID_Pedido.
     */
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

        $deleted = AdminOrdersModel::deleteById($id);
        if ($deleted) {
            Response::json(['success' => true], 200);
        } else {
            Response::json(['error' => 'No se pudo eliminar o no existe'], 404);
        }
    }
}
