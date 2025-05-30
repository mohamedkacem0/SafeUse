<?php
namespace App\Controllers;

use App\Models\CartModel;
use App\Core\Response;

class CartController {
    // GET /api?route=api/cart
    public static function index(): void {
        session_start();
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error'=>'No autenticado'], 401);
            return;
        }
        $uid = (int)$_SESSION['user']['ID_Usuario'];
        $items = CartModel::getByUser($uid);
        Response::json($items);
    }

    // POST /api?route=api/cart/add
    public static function add(): void {
        session_start();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error'=>'Método no permitido'], 405);
            return;
        }
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error'=>'No autenticado'], 401);
            return;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $pid   = (int)($input['productId'] ?? 0);
        $qty   = max(1, (int)($input['quantity'] ?? 1));
        if (!$pid) {
            Response::json(['error'=>'productId requerido'], 400);
            return;
        }
        try {
            CartModel::addItem($_SESSION['user']['ID_Usuario'], $pid, $qty);
            Response::json(['success' => true, 'message' => 'Product added to cart']);
        } catch (\Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 400); // Or 409 for conflict/stock issue
        }
    }

    // POST /api?route=api/cart/update
    public static function update(): void {
        session_start();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error'=>'Método no permitido'], 405);
            return;
        }
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error'=>'No autenticado'], 401);
            return;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $pid   = (int)($input['productId'] ?? 0);
        $qty   = (int)($input['quantity'] ?? 0);
        if (!$pid) {
            Response::json(['error'=>'productId requerido'], 400);
            return;
        }
        try {
            CartModel::updateItem($_SESSION['user']['ID_Usuario'], $pid, $qty);
            Response::json(['success' => true, 'message' => 'Cart updated']);
        } catch (\Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api?route=api/cart/remove
    public static function remove(): void {
        session_start();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error'=>'Método no permitido'], 405);
            return;
        }
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error'=>'No autenticado'], 401);
            return;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $pid   = (int)($input['productId'] ?? 0);
        if (!$pid) {
            Response::json(['error'=>'productId requerido'], 400);
            return;
        }
        try {
            CartModel::removeItem($_SESSION['user']['ID_Usuario'], $pid);
            Response::json(['success' => true, 'message' => 'Product removed from cart']);
        } catch (\Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api?route=api/cart/count
    public static function getCartCount(): void {
        session_start();
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['count' => 0]); // Return 0 if not authenticated, or could be an error
            return;
        }
        $uid = (int)$_SESSION['user']['ID_Usuario'];
        $count = CartModel::getCartItemCountByUser($uid);
        Response::json(['count' => $count]);
    }
}
