<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // <-- Asegúrate de que PUT está aquí
header('Access-Control-Allow-Headers: Content-Type');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Carga manual sin Composer
require_once __DIR__ . '/../app/core/Config.php';
require_once __DIR__ . '/../app/core/DB.php';
require_once __DIR__ . '/../app/core/Response.php';

require_once __DIR__ . '/../app/models/SubstanceModel.php';
require_once __DIR__ . '/../app/controller/substancecontroller.php';

require_once __DIR__ . '/../app/models/ShopModel.php';
require_once __DIR__ . '/../app/controller/shopcontroller.php';

require_once __DIR__ . '/../app/models/userModel.php';
require_once __DIR__ . '/../app/controller/userController.php';

// Añadido para detalles de sustancia
require_once __DIR__ . '/../app/models/SubstanceDetailModel.php';
require_once __DIR__ . '/../app/controller/SubstanceDetailController.php';

// Añadido para consejos de sustancias
require_once __DIR__ . '/../app/models/AdviceModel.php';
require_once __DIR__ . '/../app/controller/AdviceController.php';

//contacto
require_once __DIR__ . '/../app/models/ContactModel.php';
require_once __DIR__ . '/../app/controller/ContactController.php';

require_once __DIR__ . '/../app/models/CartModel.php';
require_once __DIR__ . '/../app/controller/CartController.php';

require_once __DIR__ . '/../app/controller/PaymentController.php';
require_once __DIR__ . '/../app/models/orderModel.php'; // Added for OrderModel
require_once __DIR__ . '/../app/controller/orderController.php'; // Added for OrderController

// Admin Substance Management
require_once __DIR__ . '/../app/models/admin/adminSubstanceModel.php';
require_once __DIR__ . '/../app/controller/admin/adminSubstanceController.php';

use App\Controllers\UserController;
use App\Controllers\Admin\AdminSubstanceController;
use App\Controllers\SubstanceController;
use App\Controllers\ShopController;
// Añadido para detalles de sustancia
use App\Controllers\SubstanceDetailController;
use App\Controllers\AdviceController;
use App\Controllers\ContactController;
use App\Controllers\CartController;
use App\Controller\PaymentController; // Corregido de App\Controllers a App\Controller
use App\Controllers\OrderController; // Added for OrderController

use App\Core\Response;

/*
 |---------------------------------------------------------
 |  Router sencillo:
 |  http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/...
 |---------------------------------------------------------
*/
$route = $_GET['route'] ?? '';

switch ($route) {
    case 'api/sustancias':
        SubstanceController::index();
        break;

    case 'api/detalles_sustancias':
        // Lista todos los detalles de sustancias
        SubstanceDetailController::index();
        break;

    case 'api/sustancia':
        // Muestra detalle de una sustancia por ID
        if (isset($_GET['id'])) {
            SubstanceDetailController::show((int) $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Falta el parámetro ID']);
        }
        break;

    case 'api/productos':
        ShopController::index();
        break;

    case 'api/producto':
        if (isset($_GET['id'])) {
            ShopController::show((int) $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Falta el parámetro ID']);
        }
        break;

        case 'api/users':
        UserController::users();
        break;

    case 'api/users/delete':
        // Solo permite DELETE y espera el id en el body JSON
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            UserController::deleteUser();
        } else {
            Response::json(['error' => 'Método no permitido'], 405);
        }
        break;

    case 'api/register':
        UserController::register();
        break;

    case 'api/login':
        UserController::login();
        break;

    case 'api/logout':
        UserController::logout();
        break;

    case 'api/profile':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            UserController::profile();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            UserController::updateProfile();
        } else {
            // Use the Response class if available and appropriate, otherwise plain json_encode
            // Assuming Response class is available as per UserController
            App\Core\Response::json(['error' => 'Método no permitido para /api/profile'], 405);
        }
        break;

    case 'api/change-password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            UserController::changePassword();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use POST for changing password.'], 405);
        }
        break;
   
    case 'api/advice':

        
        // Devuelve consejo individual o lista
        if (isset($_GET['id'])) {
            AdviceController::show((int) $_GET['id']);
        } else {
            AdviceController::index();
        }
        break;
        
    case 'api/advices':
        AdviceController::index();
        break;

            // … el resto de tu switch …

    case 'api/contact':
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                // Lista todas las consultas
                ContactController::index();
                break;

            case 'POST':
                // Crea una nueva y devuelve todo el registro
                ContactController::store();
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    // … sigue el resto de rutas …


        case 'api/cart':
            CartController::index();
            break;
        case 'api/cart/add':
            CartController::add();
            break;
        case 'api/cart/update':
            CartController::update();
            break;
        case 'api/cart/remove':
            CartController::remove();
            break;
        case 'api/cart/count': // Nueva ruta para obtener el contador del carrito
            CartController::getCartCount();
            break;

    case 'api/create-payment-intent': // Nueva ruta
        PaymentController::createPaymentIntent();
        break;

    case 'api/users/updateUserByAdmin':
         UserController::updateUserByAdmin();
        break;
    case 'api/order/create': // Added for creating an order
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            OrderController::create();
        } else {
            Response::json(['error' => 'Method not allowed. Use POST for creating orders.'], 405);
        }
        break;

    case 'api/orders/history': // Added for fetching user order history
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            OrderController::getUserOrders();
        } else {
            Response::json(['error' => 'Method not allowed. Use GET for fetching order history.'], 405);
        }
        break;

    case 'api/users/update':
        UserController::updateUserByAdmin();
        break;

    case 'api/admin/substances/add':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminSubstanceController::addSubstance();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use POST for adding substances.'], 405);
        }
        break;

    default:
        App\Core\Response::json(['error' => 'Ruta no encontrada'], 404);
        break;
}
