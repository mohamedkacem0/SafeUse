<?php
// Habilitar todos los errores para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$allowed_origins = [
    'https://safeuse.onrender.com',
    'http://localhost:5173'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}


require_once __DIR__ . '/../app/core/config.php';
require_once __DIR__ . '/../app/core/db.php';
require_once __DIR__ . '/../app/core/response.php';

// Modelos públicos
require_once __DIR__ . '/../app/models/ContactModel.php';
require_once __DIR__ . '/../app/models/AdviceModel.php';
require_once __DIR__ . '/../app/models/cartModel.php';
require_once __DIR__ . '/../app/models/orderModel.php';
require_once __DIR__ . '/../app/models/shopModel.php';
require_once __DIR__ . '/../app/models/SubstanceModel.php';
require_once __DIR__ . '/../app/models/SubstanceDetailModel.php';
require_once __DIR__ . '/../app/models/userModel.php';

// Controladores públicos
require_once __DIR__ . '/../app/controller/ContactController.php';
require_once __DIR__ . '/../app/controller/AdviceController.php';
require_once __DIR__ . '/../app/controller/cartController.php';
require_once __DIR__ . '/../app/controller/orderController.php';
require_once __DIR__ . '/../app/controller/PaymentController.php';
require_once __DIR__ . '/../app/controller/shopController.php';
require_once __DIR__ . '/../app/controller/substancecontroller.php';
require_once __DIR__ . '/../app/controller/SubstanceDetailController.php';
require_once __DIR__ . '/../app/controller/userController.php';

// Modelos admin
require_once __DIR__ . '/../app/models/admin/adminContactModel.php';
require_once __DIR__ . '/../app/models/admin/adminSubstanceModel.php';
require_once __DIR__ . '/../app/models/admin/adminUserModel.php';
require_once __DIR__ . '/../app/models/admin/adminAdviceModel.php';
require_once __DIR__ . '/../app/models/admin/adminProductModel.php';

require_once __DIR__ . '/../app/models/admin/adminOrdersModel.php';

// Controladores admin
require_once __DIR__ . '/../app/controller/admin/adminContactController.php';
require_once __DIR__ . '/../app/controller/admin/adminSubstanceController.php';
require_once __DIR__ . '/../app/controller/admin/adminUserController.php';
require_once __DIR__ . '/../app/controller/admin/adminAdviceController.php';
require_once __DIR__ . '/../app/controller/admin/adminProductController.php';

require_once __DIR__ . '/../app/controller/admin/adminOrdersController.php';

use App\Controllers\ContactController;
use App\Controllers\AdviceController;
use App\Controllers\CartController;
use App\Controllers\OrderController;
use App\Controllers\PaymentController;
use App\Controllers\ShopController;
use App\Controllers\SubstanceController;
use App\Controllers\SubstanceDetailController;
use App\Controllers\UserController;

use App\Controllers\Admin\AdminContactController;
use App\Controllers\Admin\AdminSubstanceController;
use App\Controllers\Admin\AdminUserController;
use App\Controllers\Admin\AdminAdviceController;
use App\Controllers\Admin\AdminProductController;

use App\Controllers\Admin\AdminOrdersController;

use App\Core\Response;

$route = $_GET['route'] ?? '';

if (preg_match('#^api/admin/contact/(\d+)$#', $route, $matches)) {
    $routeBase = 'api/admin/contact';
    $routeId   = (int)$matches[1];
} elseif (preg_match('#^api/admin/advice/(\d+)$#', $route, $matches)) {
    $routeBase = 'api/admin/advice';
    $routeId   = (int)$matches[1];
} elseif (preg_match('#^api/admin/products/(\d+)/delete$#', $route, $matches)) {
    $routeBase = 'api/admin/products_delete_action'; // Unique base for delete
    $routeId   = (int)$matches[1];
} elseif (preg_match('#^api/admin/products/(\d+)$#', $route, $matches)) {
    $routeBase = 'api/admin/products_id_action'; // Unique base for product actions
    $routeId   = (int)$matches[1];
} elseif (preg_match('#^api/admin/orders/(\d+)/details$#', $route, $m1)) {
    $routeBase = 'api/admin/orders_details';
    $orderId   = (int)$m1[1];
} elseif (preg_match('#^api/admin/orders/(\d+)/details/(\d+)$#', $route, $m2)) {
    $routeBase = 'api/admin/orders_update_detail';
    $orderId   = (int)$m2[1];
    $detailId  = (int)$m2[2];
} elseif (preg_match('#^api/admin/orders/(\d+)$#', $route, $m3)) {
    $routeBase = 'api/admin/orders';
    $orderId   = (int)$m3[1];
} else {
    $routeBase = $route;
    $routeId   = null;
}

switch ($routeBase) {
    case 'api/create-payment-intent':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            PaymentController::createPaymentIntent();
        } else {
            Response::json(['error' => 'Método no permitido. Use POST para crear una intención de pago.'], 405);
        }
        break;

    case 'api/contact':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            ContactController::index();
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            ContactController::store();
        }
        else {
            Response::json(['error' => 'Método no permitido para /api/contact'], 405);
        }
        break;
    // RUTAS ADMIN: Contact (sólo admin)

    case 'api/admin/contact':
        if ($routeId) {
            $_GET['id'] = $routeId;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminContactController::index();
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            AdminContactController::updateChecked();
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            AdminContactController::destroy();
        }
        else {
            Response::json(['error' => 'Método no permitido para /api/admin/contact'], 405);
        }
        break;

        case 'api/admin/advice':
        if ($routeId) {
            $_GET['id'] = $routeId;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminAdviceController::index();
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            AdminAdviceController::destroy();
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            AdminAdviceController::update();
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminAdviceController::store();
        }
        else {
            Response::json(['error' => 'Método no permitido para /api/admin/advice'], 405);
        }
        break;

    case 'api/admin/substances/list_basic':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminSubstanceController::listBasic();
        } else {
            Response::json(['error' => 'Método no permitido. Use GET para listar sustancias básicas.'], 405);
        }
        break;

    case 'api/admin/substances/list_details':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminSubstanceController::listDetails();
        } else {
            Response::json(['error' => 'Método no permitido. Use GET para listar detalles de sustancias.'], 405);
        }
        break;

    case 'api/admin/substances/update':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminSubstanceController::updateSubstance();
        } else {
            Response::json(['error' => 'Método no permitido. Use POST para actualizar sustancias.'], 405);
        }
        break;

    case 'api/admin/products': 
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminProductController::index();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminProductController::store();
        } else {
            Response::json(['error' => 'Método no permitido para /api/admin/products'], 405);
        }
        break;

    case 'api/admin/products_id_action':
        if ($routeId !== null) {
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                AdminProductController::show($routeId);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                AdminProductController::update($routeId);
            } else {
                Response::json(['error' => "Método no permitido para /api/admin/products/{$routeId}"], 405);
            }
        } else {
            Response::json(['error' => 'ID de producto no especificado para la acción.'], 400);
        }
        break;

    case 'api/admin/products_delete_action': 
        if ($routeId !== null) {
            if ($_SERVER['REQUEST_METHOD'] === 'POST') { 
                AdminProductController::destroy($routeId);
            } else {
                Response::json(['error' => "Método no permitido para /api/admin/products/{$routeId}/delete. Use POST."], 405);
            }
        } else {
            Response::json(['error' => 'ID de producto no especificado para eliminar.'], 400);
        }
        break;
    case 'api/admin/users/addUser':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminUserController::addUser();
        } else {
            Response::json(['error' => 'Método no permitido. Use POST para crear usuarios.'], 405);
        }
        break;

    case 'api/users/updateUserByAdmin':
         UserController::updateUserByAdmin();
        break;

    case 'api/users':
        UserController::users();
        break;

    case 'api/users/delete':
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            UserController::deleteUser();
        } else {
            Response::json(['error' => 'Método no permitido'], 405);
        }
        break;

     case 'api/admin/orders':
        if ($orderId !== null) {
            $_GET['id'] = $orderId;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminOrdersController::index();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            AdminOrdersController::destroy();
        } else {
            Response::json(['error' => 'Método no permitido para /api/admin/orders'], 405);
        }
        break;

    case 'api/admin/orders_details':
        if ($orderId !== null) {
            $_GET['id'] = $orderId;
            $_GET['action'] = 'details';
            AdminOrdersController::index();
        } else {
            Response::json(['error' => 'ID de pedido no especificado'], 400);
        }
        break;
    case 'api/admin/orders_update_detail':
        if ($orderId !== null && $detailId !== null) {
            $_GET['orderId']  = $orderId;
            $_GET['detailId'] = $detailId;
            AdminOrdersController::updateDetail();
        } else {
            Response::json(['error' => 'IDs no especificados para update detail'], 400);
        }
        break;

    case 'api/sustancias':
        SubstanceController::index();
        break;

    case 'api/detalles_sustancias':
        SubstanceDetailController::index();
        break;

    case 'api/sustancia':
        if (isset($_GET['id'])) {
            SubstanceDetailController::show((int)$_GET['id']);
        } else {
            Response::json(['error' => 'Falta el parámetro ID'], 400);
        }
        break;

    case 'api/productos':
        ShopController::index();
        break;

    case 'api/producto':
        if (isset($_GET['id'])) {
            ShopController::show((int)$_GET['id']);
        } else {
            Response::json(['error' => 'Falta el parámetro ID'], 400);
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
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            UserController::updateProfile();
        }
        else {
            Response::json(['error' => 'Método no permitido para /api/profile'], 405);
        }
        break;

    case 'api/change-password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            UserController::changePassword();
        } else {
            Response::json(['error' => 'Método no permitido. Use POST para cambiar contraseña.'], 405);
        }
        break;
    case 'api/advice':
        if (isset($_GET['id'])) {
            AdviceController::show((int)$_GET['id']);
        } else {
            AdviceController::index();
        }
        break;

    case 'api/advices':
        AdviceController::index();
        break;

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

    case 'api/cart/count':
        CartController::getCartCount();
        break;
    case 'api/order/create':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            OrderController::create();
        } else {
            Response::json(['error' => 'Método no permitido. Use POST para crear órdenes.'], 405);
        }
        break;

    case 'api/orders/history':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            OrderController::getUserOrders();
        } else {
            Response::json(['error' => 'Método no permitido. Use GET para historial de órdenes.'], 405);
        }
        break;

    case 'api/admin/substances/add':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminSubstanceController::addSubstance();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use POST for adding substances.'], 405);
        }
        break;

    case 'api/admin/auth/logout':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            App\Controllers\Admin\AdminUserController::logout();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use POST for logout.'], 405);
        }
        break;
    case (preg_match('/^api\/admin\/substances\/delete\/(\d+)$/', $route, $matches) ? $route : ''):
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $substanceId = $matches[1];
            AdminSubstanceController::deleteSubstance($substanceId);
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use DELETE for deleting substances.'], 405);
        }
        break;

    default:
        Response::json(['error' => 'Ruta no encontrada.'], 404);
        break;
}
