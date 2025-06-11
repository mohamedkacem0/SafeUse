<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminOrdersModel;
use App\Core\Response;
use App\Core\DB;

class AdminOrdersController
{
    public static function index(): void
    {
        session_start();
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }

        $id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($id !== null && $action === 'details') {
            $order = AdminOrdersModel::findById($id);
            if ($order === null) {
                Response::json(['error' => 'Pedido no encontrado'], 404);
                return;
            }
            $details = AdminOrdersModel::fetchDetailsByOrderId($id);
            if ($details === null) {
                Response::json(['error' => 'Error al obtener detalles'], 500);
                return;
            }
            Response::json([
                'order'   => $order,
                'details' => $details
            ], 200);
            return;
        }

        if ($id !== null && $action === null) {
            $order = AdminOrdersModel::findById($id);
            if ($order === null) {
                Response::json(['error' => 'Pedido no encontrado'], 404);
            } else {
                Response::json(['order' => $order], 200);
            }
            return;
        }

        if ($id === null) {
            $all = AdminOrdersModel::fetchAll();
            if ($all === null) {
                Response::json(['error' => 'Error al obtener pedidos'], 500);
                return;
            }
            Response::json(['orders' => $all], 200);
            return;
        }

        Response::json(['error' => 'Ruta no encontrada'], 404);
    }
    public static function updateDetail(): void
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

        $orderId  = isset($_GET['orderId']) ? (int) $_GET['orderId'] : null;
        $detailId = isset($_GET['detailId']) ? (int) $_GET['detailId'] : null;

        if (!$orderId || $orderId <= 0 || !$detailId || $detailId <= 0) {
            Response::json(['error' => 'ID de pedido o detalle inválido'], 400);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (
            !is_array($input) ||
            !isset($input['quantity']) ||
            !isset($input['unit_price'])
        ) {
            Response::json(['error' => 'Datos inválidos. Se esperan { "quantity": int, "unit_price": float }'], 400);
            return;
        }

        $quantity  = (int)$input['quantity'];
        $unitPrice = (float)$input['unit_price'];
        if ($quantity < 1 || $unitPrice < 0) {
            Response::json(['error' => 'Cantidad o precio unitario inválido'], 400);
            return;
        }
        $order = AdminOrdersModel::findById($orderId);
        if ($order === null) {
            Response::json(['error' => 'Pedido no encontrado'], 404);
            return;
        }
        try {
            AdminOrdersModel::updateDetail($detailId, $quantity, $unitPrice);
            Response::json(['success' => true], 200);
        } catch (\PDOException $e) {
            Response::json(['error' => 'Error al actualizar detalle: ' . $e->getMessage()], 500);
        }
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
            Response::json(['error' => 'ID de pedido inválido'], 400);
            return;
        }

        $existing = AdminOrdersModel::findById($id);
        if ($existing === null) {
            Response::json(['error' => 'Pedido no encontrado'], 404);
            return;
        }
        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();

            AdminOrdersModel::deleteDetailsByOrderId($id);

            AdminOrdersModel::deleteById($id);

            $pdo->commit();

            Response::json(['success' => true], 200);
        } catch (\PDOException $e) {
            $pdo->rollBack();
            Response::json(['error' => 'Error al eliminar el pedido y sus detalles: ' . $e->getMessage()], 500);
        }
    }
}
