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
} elseif (preg_match('#^api/admin/products/(\d+)/delete$#', $route, $matches)) {
    $routeBase = 'api/admin/products_delete_action'; // Unique base for delete
    $routeId   = (int)$matches[1];
} elseif (preg_match('#^api/admin/products/(\d+)$#', $route, $matches)) {
    $routeBase = 'api/admin/products_id_action'; // Unique base for ID-specific actions (show, update)
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
    // ------------------------------------------------------------------------
    // RUTAS DE PAGO
    // ------------------------------------------------------------------------
    case 'api/create-payment-intent':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            PaymentController::createPaymentIntent();
        } else {
            Response::json(['error' => 'Método no permitido. Use POST para crear una intención de pago.'], 405);
        }
        break;

    // ------------------------------------------------------------------------
    // RUTAS DE PEDIDOS
    // ------------------------------------------------------------------------
    case 'api/orders/history':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            OrderController::getUserOrders();
        } else {
            Response::json(['error' => 'Método no permitido. Use GET para obtener el historial de pedidos.'], 405);
        }
        break;

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
    // RUTAS ADMIN PRODUCTS
    // ------------------------------------------------------------------------
    case 'api/admin/products': // Handles GET (list) and POST (create)
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminProductController::index();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminProductController::store();
        } else {
            Response::json(['error' => 'Método no permitido para /api/admin/products'], 405);
        }
        break;

    case 'api/admin/products_id_action': // Handles GET /api/admin/products/{id} (show) and POST /api/admin/products/{id} (update)
        if ($routeId !== null) {
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                AdminProductController::show($routeId);
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') { // Using POST for update to support multipart/form-data
                AdminProductController::update($routeId);
            } else {
                Response::json(['error' => "Método no permitido para /api/admin/products/{$routeId}"], 405);
            }
        } else {
            Response::json(['error' => 'ID de producto no especificado para la acción.'], 400);
        }
        break;

    case 'api/admin/products_delete_action': // Handles POST /api/admin/products/{id}/delete
        if ($routeId !== null) {
            // For deletion, it's common to use DELETE method, but POST is also acceptable and simpler for forms.
            // Let's stick to POST for now for consistency with how we might handle it from a simple admin form.
            if ($_SERVER['REQUEST_METHOD'] === 'POST') { 
                AdminProductController::destroy($routeId);
            } else {
                Response::json(['error' => "Método no permitido para /api/admin/products/{$routeId}/delete. Use POST."], 405);
            }
        } else {
            Response::json(['error' => 'ID de producto no especificado para eliminar.'], 400);
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


    // ADMIN ORDERS 
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

    // 4) GET  /api/admin/orders/{id}/details       -> devuelve cabecera + líneas
    case 'api/admin/orders_details':
        if ($orderId !== null) {
            $_GET['id'] = $orderId;
            $_GET['action'] = 'details';
            AdminOrdersController::index();
        } else {
            Response::json(['error' => 'ID de pedido no especificado'], 400);
        }
        break;

    // 5) PUT  /api/admin/orders/{orderId}/details/{detailId}
    case 'api/admin/orders_update_detail':
        if ($orderId !== null && $detailId !== null) {
            $_GET['orderId']  = $orderId;
            $_GET['detailId'] = $detailId;
            AdminOrdersController::updateDetail();
        } else {
            Response::json(['error' => 'IDs no especificados para update detail'], 400);
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

    case 'api/admin/substances/add':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminSubstanceController::addSubstance();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use POST for adding substances.'], 405);
        }
        break;

    case 'api/admin/substances/list_basic':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminSubstanceController::listBasic();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use GET for listing basic substances.'], 405);
        }
        break;

    case 'api/admin/substances/list_details':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            AdminSubstanceController::listDetails();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use GET for listing detailed substances.'], 405);
        }
        break;

    case 'api/admin/substances/update':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            AdminSubstanceController::updateSubstance();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use POST for updating substances.'], 405);
        }
        break;

    case 'api/admin/auth/logout':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            App\Controllers\Admin\AdminUserController::logout();
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use POST for logout.'], 405);
        }
        break;

    // Route for deleting a substance by ID
    case (preg_match('/^api\/admin\/substances\/delete\/(\d+)$/', $route, $matches) ? $route : ''):
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $substanceId = $matches[1]; // Extracted ID from the URL
            AdminSubstanceController::deleteSubstance($substanceId);
        } else {
            App\Core\Response::json(['error' => 'Method not allowed. Use DELETE for deleting substances.'], 405);
        }
        break;

    default:
        Response::json(['error' => 'Ruta no encontrada.'], 404);
        break;
}
