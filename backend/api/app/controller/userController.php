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

    /**
     * Actualiza el perfil del usuario autenticado.
     * Espera JSON: { "Nombre": "nuevo valor", "Telefono": "nuevo valor", ... }
     */

    /**
     * Actualiza el perfil del usuario autenticado.
     * Espera JSON: { "Nombre": "nuevo valor", "Telefono": "nuevo valor", "Direccion": "nuevo valor" }
     */
    public static function updateProfile(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            Response::json(['error' => 'Method not allowed for profile update'], 405);
            return;
        }

        session_start();
        if (empty($_SESSION['user']['ID_Usuario'])) {
            Response::json(['error' => 'Not authenticated'], 401);
            return;
        }

        $userId = (int) $_SESSION['user']['ID_Usuario'];
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            Response::json(['error' => 'Invalid payload'], 400);
            return;
        }

        // Fields that can be updated
        $allowedFields = ['Nombre', 'Telefono', 'Direccion'];
        $updateData = [];
        $loggableChanges = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                // Sanitize input - adjust sanitization as per field type
                $sanitizedValue = filter_var(trim($data[$field]), FILTER_SANITIZE_FULL_SPECIAL_CHARS);
                if ($field === 'Telefono' && !preg_match('/^[\d\s\+\-()]*$/', $sanitizedValue)) {
                    Response::json(['error' => 'Invalid phone number format for ' . $field], 400);
                    return;
                }
                if (empty($sanitizedValue) && in_array($field, ['Nombre'])) { // Example: Nombre cannot be empty
                     Response::json(['error' => $field . ' cannot be empty'], 400);
                     return;
                }
                $updateData[$field] = $sanitizedValue;
                $loggableChanges[$field] = $sanitizedValue; // For logging or session update
            }
        }

        if (empty($updateData)) {
            Response::json(['error' => 'No data provided for update'], 400);
            return;
        }

        $success = UserModel::update($userId, $updateData);

        if ($success) {
            // Fetch the full updated user profile to return
            $updatedUser = UserModel::findById($userId);
            if (!$updatedUser) {
                 // This should ideally not happen if update was successful and user exists
                Response::json(['error' => 'Failed to retrieve updated profile, user may have been deleted'], 404);
                return;
            }

            // Update session with changed data that is stored in session
            if (isset($updateData['Nombre'])) {
                $_SESSION['user']['Nombre'] = $updateData['Nombre'];
            }
            // Add other session fields if necessary, e.g., $_SESSION['user']['Email'] if it were updatable and in session

            Response::json([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'user' => [
                    'ID_Usuario'   => $updatedUser['ID_Usuario'],
                    'Nombre'       => $updatedUser['Nombre'],
                    'Correo'       => $updatedUser['Correo'], // Correo is not updatable here, but good to return full profile
                    'Telefono'     => $updatedUser['Telefono'],
                    'Direccion'    => $updatedUser['Direccion'],
                    'Tipo_Usuario' => $updatedUser['Tipo_Usuario'],
                ]
            ]);
        } else {
            Response::json(['error' => 'Failed to update profile in database'], 500);
        }
    }
    /**
 * Elimina un usuario por ID (solo admin).
 * Espera DELETE a /api/users/delete con JSON: { "id": 5 }
 */
public static function deleteUser(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        Response::json(['error' => 'Método no permitido'], 405);
        return;
    }

    session_start();
    if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
        Response::json(['error' => 'No autorizado'], 403);
        return;
    }

    // Obtener el ID del usuario a eliminar desde el body JSON
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? (int)$data['id'] : 0;

    if ($id <= 0) {
        Response::json(['error' => 'ID inválido'], 400);
        return;
    }

    // No permitir que un admin se elimine a sí mismo
    if ($id === (int)$_SESSION['user']['ID_Usuario']) {
        Response::json(['error' => 'No puedes eliminar tu propio usuario'], 403);
        return;
    }

    $targetUser = UserModel::findById($id);
    if (!$targetUser) {
        Response::json(['error' => 'Usuario no encontrado'], 404);
        return;
    }

    $success = UserModel::delete($id);
    if ($success) {
        Response::json([
            'success' => true,
            'message' => "Usuario ID $id eliminado correctamente."
        ]);
    } else {
        Response::json(['error' => 'No se pudo eliminar el usuario'], 500);
    }
}

}
