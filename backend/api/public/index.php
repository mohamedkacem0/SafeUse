<?php
// ----------------------------------------------------------------------------
// CORS y preflight
// ----------------------------------------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173'); // <- Cambia al puerto/origen de tu React
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ----------------------------------------------------------------------------
// Carga manual de dependencias (sin Composer)
// ----------------------------------------------------------------------------
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
require_once __DIR__ . '/../app/models/admin/AdminContactModel.php';
require_once __DIR__ . '/../app/models/admin/adminSubstanceModel.php';
require_once __DIR__ . '/../app/models/admin/adminUserModel.php';

// Controladores admin
require_once __DIR__ . '/../app/controller/admin/AdminContactController.php';
require_once __DIR__ . '/../app/controller/admin/adminSubstanceController.php';
require_once __DIR__ . '/../app/controller/admin/adminUserController.php';

use App\Controllers\ContactController;
use App\Controllers\Admin\AdminContactController;
use App\Controllers\Admin\AdminSubstanceController;
use App\Controllers\Admin\AdminUserController;
use App\Core\Response;

// ----------------------------------------------------------------------------
// Router sencillo
// URL base: http://localhost/tfg/SafeUse/backend/api/public/index.php?route=...
// ----------------------------------------------------------------------------
$route = $_GET['route'] ?? '';

// Si la ruta viene como “api/admin/contact/123”, la desglosamos en base e id
if (preg_match('#^api/admin/contact/(\d+)$#', $route, $matches)) {
    $routeBase = 'api/admin/contact';
    $routeId   = (int)$matches[1];
} else {
    $routeBase = $route;
    $routeId   = null;
}

switch ($routeBase) {
    // ----------------------------------------
    // Rutas públicas de “contact”
    // ----------------------------------------
    case 'api/contact':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            ContactController::index();
        }
        elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            ContactController::store();
        }
        else {
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido para /api/contact']);
        }
        break;

    // ----------------------------------------
    // Rutas de ADMIN para “contact”
    // ----------------------------------------
    // GET  /api/admin/contact       -> lista todas (index)
    // PUT  /api/admin/contact/{id}  -> updateChecked
    // DELETE /api/admin/contact/{id} -> destroy
    case 'api/admin/contact':
        // Si vinieron con “/123”, asignamos $_GET['id']
        if ($routeId) {
            $_GET['id'] = $routeId;
        }

        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                AdminContactController::index();
                break;

            case 'PUT':
                AdminContactController::updateChecked();
                break;

            case 'DELETE':
                AdminContactController::destroy();
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido para /api/admin/contact']);
        }
        break;

    // ----------------------------------------
    // Rutas de admin sustancias (por ejemplo)
    // ----------------------------------------
    case 'api/admin/substances/add':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminSubstanceController::addSubstance();
        } else {
            Response::json(['error' => 'Método no permitido. Use POST para añadir sustancias.'], 405);
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

    // ----------------------------------------
    // Rutas de admin usuarios
    // ----------------------------------------
    case 'api/admin/users/addUser':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminUserController::addUser();
        } else {
            Response::json(['error' => 'Método no permitido. Use POST para crear usuarios.'], 405);
        }
        break;

    // ----------------------------------------
    // OTRAS RUTAS PÚBLICAS (ejemplos)
    // ----------------------------------------
     case 'api/sustancias':
         SubstanceController::index();
         break;
    
     case 'api/productos':
         ShopController::index();
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
             AdviceController::show((int) $_GET['id']);
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
    
     case 'api/create-payment-intent':
         PaymentController::createPaymentIntent();
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

    default:
        Response::json(['error' => 'Ruta no encontrada.'], 404);
        break;
}
