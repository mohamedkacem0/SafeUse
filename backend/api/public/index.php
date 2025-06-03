<?php
// ----------------------------------------------------------------------------
// CORS y preflight
// ----------------------------------------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Opcional: impedir que PHP imprima errores directamente en pantalla (se registrarán en el log)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

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
require_once __DIR__ . '/../app/models/admin/adminAdviceModel.php';

// Controladores admin
require_once __DIR__ . '/../app/controller/admin/AdminContactController.php';
require_once __DIR__ . '/../app/controller/admin/adminSubstanceController.php';
require_once __DIR__ . '/../app/controller/admin/adminUserController.php';
require_once __DIR__ . '/../app/controller/admin/adminAdviceController.php';

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

use App\Core\Response;

// ----------------------------------------------------------------------------
// Router sencillo
// ----------------------------------------------------------------------------
$route = $_GET['route'] ?? '';

// Detectar si la ruta es “api/admin/contact/{id}” o “api/admin/advice/{id}”
if (preg_match('#^api/admin/contact/(\d+)$#', $route, $matches)) {
    $routeBase = 'api/admin/contact';
    $routeId   = (int)$matches[1];
} elseif (preg_match('#^api/admin/advice/(\d+)$#', $route, $matches)) {
    $routeBase = 'api/admin/advice';
    $routeId   = (int)$matches[1];
} else {
    $routeBase = $route;
    $routeId   = null;
}

switch ($routeBase) {
    // ------------------------------------------------------------------------
    // RUTAS PÚBLICAS: Contact (público)
    // ------------------------------------------------------------------------
    // GET  /api/contact       -> lista todas las consultas
    // POST /api/contact       -> crea una nueva consulta
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

    // ------------------------------------------------------------------------
    // RUTAS ADMIN: Contact (sólo admin)
    // ------------------------------------------------------------------------
    // GET    /api/admin/contact          -> listado completo para admin
    // PUT    /api/admin/contact/{id}     -> toggle “checked” de la consulta {id}
    // DELETE /api/admin/contact/{id}     -> elimina la consulta {id}
    case 'api/admin/contact':
        // Si vinieron con “api/admin/contact/123”, asignamos $_GET['id']
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
        // Si vinieron con “/123”, asignar $_GET['id']
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

    // ------------------------------------------------------------------------
    // RUTAS ADMIN SUBSTANCES (ejemplo)
    // ------------------------------------------------------------------------
    // POST  /api/admin/substances/add        -> añade sustancia
    // GET   /api/admin/substances/list_basic -> lista básicas
    // GET   /api/admin/substances/list_details -> lista detalladas
    // POST  /api/admin/substances/update     -> actualiza sustancia
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

    // ------------------------------------------------------------------------
    // RUTAS ADMIN USERS (ejemplo)
    // ------------------------------------------------------------------------
    // POST /api/admin/users/addUser  -> crea un nuevo usuario como admin
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


         // Usuarios (público / admin)
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
    // ------------------------------------------------------------------------
    // RUTAS PÚBLICAS ADICIONALES
    // ------------------------------------------------------------------------
    // Sustancias (público)
    case 'api/sustancias':
        SubstanceController::index();
        break;

    // Detalles de sustancia (público)
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

    // Productos / Tienda (público)
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


    // Registro y login (público)
    case 'api/register':
        UserController::register();
        break;

    case 'api/login':
        UserController::login();
        break;

    case 'api/logout':
        UserController::logout();
        break;

    // Perfil de usuario
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

    // Advice (público)
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

    // Carrito (público)
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

    // Pago (público)
    case 'api/create-payment-intent':
        PaymentController::createPaymentIntent();
        break;

    // Ordenes (público)
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

    // ------------------------------------------------------------------------
    // CADENA “Route” NO COINCIDE: 404
    // ------------------------------------------------------------------------
    default:
        Response::json(['error' => 'Ruta no encontrada.'], 404);
        break;
}
