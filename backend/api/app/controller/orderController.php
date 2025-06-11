<?php
namespace App\Controllers;

use App\Models\OrderModel;
use App\Models\CartModel;
use App\Core\DB;
use App\Core\Response;
use PDOException;

class OrderController {

    public static function create(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Invalid request method'], 405);
            return;
        }

        session_start();
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error' => 'User not authenticated'], 401);
            return;
        }
        $userId = (int)$_SESSION['user']['ID_Usuario'];

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            Response::json(['error' => 'Invalid JSON payload'], 400);
            return;
        }

        $address = trim($input['address'] ?? '');
        $city = trim($input['city'] ?? '');
        $postalCode = trim($input['postalCode'] ?? '');

        if (empty($address) || empty($city) || empty($postalCode)) {
            Response::json(['error' => 'Missing delivery address details (address, city, postalCode)'], 400);
            return;
        }
        $direccionEntrega = $address . ', ' . $postalCode . ' ' . $city;
        $estadoPedido = 'processing';
        $cartItems = CartModel::getByUser($userId);
        if (empty($cartItems)) {
            Response::json(['error' => 'Cart is empty'], 400);
            return;
        }

        $pdo = DB::getInstance()->conn();
        try {
            $pdo->beginTransaction();
            $totalOrderPrice = 0;
            foreach ($cartItems as $item) {
                $totalOrderPrice += (float)$item['Precio'] * (int)$item['quantity'];
            }

            $orderId = OrderModel::create($userId, $direccionEntrega, $estadoPedido, $totalOrderPrice, $pdo);
            if (!$orderId) {
                throw new \Exception('Failed to create order record.');
            }

            foreach ($cartItems as $item) {
                $productId = (int)$item['product_id'];
                $quantity = (int)$item['quantity'];
                $precioUnitario = (float)$item['Precio']; 
                $precioTotal = $precioUnitario * $quantity;

                if (!OrderModel::addDetail($orderId, $productId, $quantity, $precioUnitario, $precioTotal, $pdo)) {
                    throw new \Exception('Failed to add order detail for product ID: ' . $productId);
                }
            }

            if (!CartModel::clearCartForOrder($userId)) {
                error_log("CRITICAL: Order $orderId created for user $userId, but cart could not be cleared.");
            }

            $pdo->commit();
            Response::json(['success' => true, 'orderId' => $orderId, 'message' => 'Order created successfully.'], 201);

        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Order creation failed: ' . $e->getMessage());
            Response::json(['error' => 'Order creation failed: ' . $e->getMessage()], 500);
        }
    }

    public static function getUserOrders(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::json(['error' => 'Invalid request method. Use GET.'], 405);
            return;
        }

        session_start();
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error' => 'User not authenticated'], 401);
            return;
        }
        $userId = (int)$_SESSION['user']['ID_Usuario'];

        try {
            $orders = OrderModel::getOrdersByUserId($userId);
            if (empty($orders)) {
                Response::json(['message' => 'No orders found for this user.', 'orders' => []], 200);
                return;
            }
            Response::json(['success' => true, 'orders' => $orders], 200);
        } catch (\Exception $e) {
            error_log('Error fetching user orders: ' . $e->getMessage());
            Response::json(['error' => 'Failed to retrieve orders: ' . $e->getMessage()], 500);
        }
    }
}
