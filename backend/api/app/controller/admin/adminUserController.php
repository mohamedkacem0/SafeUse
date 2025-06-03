<?php
namespace App\Controllers\Admin;

use App\Models\Admin\AdminUserModel;
use App\Core\Response;

class AdminUserController
{
    public static function addUser(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        session_start();
        if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
            Response::json(['error' => 'No autorizado'], 403);
            return;
        }

        // Leer JSON crudo
        $data = json_decode(file_get_contents('php://input'), true);

        // Validación básica de los campos requeridos
        if (
            !isset($data['Nombre']) || trim($data['Nombre']) === '' ||
            !isset($data['Correo']) || trim($data['Correo']) === '' ||
            !isset($data['password']) || trim($data['password']) === ''
        ) {
            Response::json(['error' => 'Todos los campos obligatorios deben estar completos.'], 400);
            return;
        }

        if (strlen($data['password']) < 8) {
            Response::json(['error' => 'La contraseña debe tener al menos 8 caracteres.'], 400);
            return;
        }

        // Forzar el rol a "usuario" (ignoramos cualquier rol que venga en el JSON)
        $tipoUsuario = 'usuario';

        // Comprobar si el correo ya existe
        if (AdminUserModel::findByEmail($data['Correo'])) {
            Response::json(['error' => 'El correo ya está registrado'], 409);
            return;
        }

        // Construir los datos para el modelo. OBSERVA que usamos la clave 'password' 
        // para que coincida con el placeholder :password del modelo.
        $userData = [
            'Nombre'       => $data['Nombre'],
            'Correo'       => $data['Correo'],
            // Aquí guardamos directamente el hash en la clave 'password'
            'password'     => password_hash($data['password'], PASSWORD_DEFAULT),
            'Telefono'     => $data['Telefono'] ?? '',
            'Direccion'    => $data['Direccion'] ?? '',
            'Tipo_Usuario' => $tipoUsuario,
        ];

        // Opcional: log para depuración
        // error_log('AdminUserController::addUser, $userData = ' . print_r($userData, true));

        $userId = AdminUserModel::create($userData);

        if ($userId) {
            Response::json(['success' => true, 'userId' => $userId]);
        } else {
            // En caso de que create() arroje excepción, ya devolvió JSON y finalizó.
            Response::json(['error' => 'No se pudo crear el usuario'], 500);
        }
    }

    public static function logout(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido. Se esperaba POST.'], 405);
            return;
        }

        session_start();

        // Destruir todas las variables de sesión.
        $_SESSION = array();

        // Si se desea destruir la sesión completamente, borre también la cookie de sesión.
        // Nota: ¡Esto destruirá la sesión, y no solo los datos de la sesión!
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        // Finalmente, destruir la sesión.
        session_destroy();

        Response::json(['success' => true, 'message' => 'Sesión cerrada correctamente.']);
    }
}
