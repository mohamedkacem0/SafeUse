<?php
// Carga manual sin Composer
require_once __DIR__ . '/../app/core/Config.php';
require_once __DIR__ . '/../app/core/DB.php';
require_once __DIR__ . '/../app/core/Response.php';

require_once __DIR__ . '/../app/models/SubstanceModel.php';
require_once __DIR__ . '/../app/controller/substancecontroller.php';

require_once __DIR__ . '/../app/models/ShopModel.php';
require_once __DIR__ . '/../app/controller/shopcontroller.php';

use App\Controllers\SubstanceController;
use App\Controllers\ShopController;

/*
 |---------------------------------------------------------
 |  Router sencillo:
 |  http://localhost/backend/api/public/index.php?route=...
 |---------------------------------------------------------
*/
$route = $_GET['route'] ?? '';

switch ($route) {
    case 'api/sustancias':
        SubstanceController::index();
        break;

    case 'api/productos':
        ShopController::index();
        break;

    case 'api/producto':
        if (isset($_GET['id'])) {
            ShopController::show((int)$_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Falta el parámetro ID']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Ruta no encontrada']);
}
