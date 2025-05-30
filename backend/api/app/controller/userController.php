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
            'nombre'       => $nombre,
            'correo'       => $correo,
            'contraseña'   => $passwordHash,
            'telefono'     => $telefono,
            'direccion'    => $direccion,
            'tipo_usuario' => $tipo,
        ]);

        // Inicia sesión inmediatamente
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
     * Autentica un usuario. Si es admin, devuelve también la lista completa de usuarios.
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

        // Prepara la respuesta base
        $response = [
            'success' => true,
            'user'    => $_SESSION['user'],
        ];

        // Si es admin, agregamos la lista completa de usuarios
        if ($_SESSION['user']['Tipo_Usuario'] === 'admin') {
            $response['users'] = UserModel::getAll();
        }

        Response::json($response);
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

    /**
     * Devuelve el perfil del usuario autenticado.
     */
    public static function profile(): void {
        session_start();
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error' => 'No autenticado'], 401);
            return;
        }

        $id   = (int) $_SESSION['user']['ID_Usuario'];
        $user = UserModel::findById($id);
        if (!$user) {
            Response::json(['error' => 'Usuario no encontrado'], 404);
            return;
        }

        Response::json(['user' => [
            'ID_Usuario'   => $user['ID_Usuario'],
            'Nombre'       => $user['Nombre'],
            'Correo'       => $user['Correo'],
            'Telefono'     => $user['Telefono'],
            'Direccion'    => $user['Direccion'],
            'Tipo_Usuario' => $user['Tipo_Usuario'],
        ]]);
    }

    /**
     * Devuelve todos los usuarios.
     */
    public static function users(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        $users = UserModel::getAll();
        Response::json(['users' => $users]);
    }
}
