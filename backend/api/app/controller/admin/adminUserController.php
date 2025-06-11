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
        $data = json_decode(file_get_contents('php://input'), true);

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
        $tipoUsuario = 'usuario';
        if (AdminUserModel::findByEmail($data['Correo'])) {
            Response::json(['error' => 'El correo ya está registrado'], 409);
            return;
        }
        $userData = [
            'Nombre'       => $data['Nombre'],
            'Correo'       => $data['Correo'],
            'password'     => password_hash($data['password'], PASSWORD_DEFAULT),
            'Telefono'     => $data['Telefono'] ?? '',
            'Direccion'    => $data['Direccion'] ?? '',
            'Tipo_Usuario' => $tipoUsuario,
        ];
        $userId = AdminUserModel::create($userData);

        if ($userId) {
            Response::json(['success' => true, 'userId' => $userId]);
        } else {
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
        $_SESSION = array();
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
        session_destroy();

        Response::json(['success' => true, 'message' => 'Sesión cerrada correctamente.']);
    }
}
