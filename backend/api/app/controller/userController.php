<?php
// app/controllers/UserController.php
namespace App\Controllers;

use App\Models\UserModel;
use App\Core\Response;

class UserController {
    /**
     * Registra un nuevo usuario y lo autentica (inicia sesión).
     * Espera JSON: { nombre, correo, password, telefono, direccion, tipo_usuario }
     */
    public static function register(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            Response::json(['error' => 'Payload no válido'], 400);
            return;
        }

        // Sanear y validar
        $nombre    = filter_var($data['nombre']    ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $correo    = filter_var($data['correo']    ?? '', FILTER_VALIDATE_EMAIL);
        $password  = $data['password'] ?? '';
        $telefono  = filter_var($data['telefono']  ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $direccion = filter_var($data['direccion'] ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $tipo      = in_array($data['tipo_usuario'] ?? '', ['usuario', 'admin'])
                     ? $data['tipo_usuario'] : 'usuario';

        if (!$nombre || !$correo || !$password) {
            Response::json(['error' => 'Faltan datos obligatorios'], 400);
            return;
        }

        // Comprueba si ya existe
        if (UserModel::findByEmail($correo)) {
            Response::json(['error' => 'User already exists'], 409);
            return;
        }

        // Hashea la contraseña
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $newId = UserModel::create([
            'Nombre'       => $nombre,
            'Correo'       => $correo,
            'Password'     => $passwordHash,
            'Telefono'     => $telefono,
            'Direccion'    => $direccion,
            'Tipo_usuario' => $tipo,
        ]);

        // Inicia sesión inmediatamente, igual que en login
        session_start();
        $_SESSION['user'] = [
            'ID_Usuario'   => $newId,
            'Nombre'       => $nombre,
            'Correo'       => $correo,
            'Tipo_Usuario' => $tipo,
        ];

        Response::json([
            'success' => true,
            'user'    => $_SESSION['user']
        ], 201);
    }

    /**
     * Autentica un usuario.
     * Espera JSON: { correo, password }
     */
    public static function login(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            Response::json(['error' => 'Payload no válido'], 400);
            return;
        }

        $correo   = filter_var($data['correo']   ?? '', FILTER_VALIDATE_EMAIL);
        $password = $data['password'] ?? '';

        if (!$correo || !$password) {
            Response::json(['error' => 'Faltan datos'], 400);
            return;
        }

        $user = UserModel::findByEmail($correo);
        if (!$user) {
            Response::json(['error' => 'User doesn\'t exist'], 401);
            return;
        }
        if (!password_verify($password, $user['Contraseña'])) {
            Response::json(['error' => 'User/pass don\'t match'], 401);
            return;
        }

        // Inicia sesión
        session_start();
        $_SESSION['user'] = [
            'ID_Usuario'   => $user['ID_Usuario'],
            'Nombre'       => $user['Nombre'],
            'Correo'       => $user['Correo'],
            'Tipo_Usuario' => $user['Tipo_Usuario'],
        ];

        Response::json(['success' => true, 'user' => $_SESSION['user']]);
    }

    /**
     * Cierra la sesión del usuario.
     */
    public static function logout(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        session_start();
        session_destroy();
        Response::json(['success' => true]);
    }

     public static function profile(): void {
        session_start();
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error' => 'No autenticado'], 401);
            return;
        }

        $id = (int) $_SESSION['user']['ID_Usuario'];
        $user = UserModel::findById($id);

        if (!$user) {
            Response::json(['error' => 'Usuario no encontrado'], 404);
            return;
        }

        // Mapea el campo Dirección a Direccion para el frontend
        Response::json(['user' => [
            'ID_Usuario'   => $user['ID_Usuario'],
            'Nombre'       => $user['Nombre'],
            'Correo'       => $user['Correo'],
            'Telefono'     => $user['Telefono'],
            'Direccion'    => $user['Dirección'],
            'Tipo_Usuario' => $user['Tipo_Usuario'],
        ]]);
}

}
