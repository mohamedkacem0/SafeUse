<?php
// app/controllers/UserController.php
namespace App\Controllers;

use App\Models\UserModel;
use App\Core\Response;

class UserController {
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


        if (UserModel::findByEmail($correo)) {
            Response::json(['error' => 'User already exists'], 409);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $newId = UserModel::create([
            'nombre'       => $nombre,
            'correo'       => $correo,
            'contraseña'   => $passwordHash,
            'telefono'     => $telefono,
            'direccion'    => $direccion,
            'tipo_usuario' => $tipo,
        ]);

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

        session_start();
        $_SESSION['user'] = [
            'ID_Usuario'   => $user['ID_Usuario'],
            'Nombre'       => $user['Nombre'],
            'Correo'       => $user['Correo'],
            'Tipo_Usuario' => $user['Tipo_Usuario'],
        ];

        $response = [
            'success' => true,
            'user'    => $_SESSION['user'],
        ];
        if ($_SESSION['user']['Tipo_Usuario'] === 'admin') {
            $response['users'] = UserModel::getAll();
        }

        Response::json($response);
    }
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
    public static function users(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::json(['error' => 'Método no permitido'], 405);
            return;
        }

        $users = UserModel::getAll();
        Response::json(['users' => $users]);
    }
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
        $allowedFields = ['Nombre', 'Telefono', 'Direccion'];
        $updateData = [];
        $loggableChanges = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
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
            $updatedUser = UserModel::findById($userId);
            if (!$updatedUser) {
                Response::json(['error' => 'Failed to retrieve updated profile, user may have been deleted'], 404);
                return;
            }
            if (isset($updateData['Nombre'])) {
                $_SESSION['user']['Nombre'] = $updateData['Nombre'];
            }
    
            Response::json([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'user' => [
                    'ID_Usuario'   => $updatedUser['ID_Usuario'],
                    'Nombre'       => $updatedUser['Nombre'],
                    'Correo'       => $updatedUser['Correo'], 
                    'Telefono'     => $updatedUser['Telefono'],
                    'Direccion'    => $updatedUser['Direccion'],
                    'Tipo_Usuario' => $updatedUser['Tipo_Usuario'],
                ]
            ]);
        } else {
            Response::json(['error' => 'Failed to update profile in database'], 500);
        }
    }
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
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? (int)$data['id'] : 0;

    if ($id <= 0) {
        Response::json(['error' => 'ID inválido'], 400);
        return;
    }
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
public static function updateUserByAdmin(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        Response::json(['error' => 'Método no permitido'], 405);
        return;
    }

    session_start();
    if (empty($_SESSION['user']) || ($_SESSION['user']['Tipo_Usuario'] ?? '') !== 'admin') {
        Response::json(['error' => 'No autorizado'], 403);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? (int)$data['id'] : 0;
    if ($id <= 0) {
        Response::json(['error' => 'ID inválido'], 400);
        return;
    }
    $targetUser = UserModel::findById($id);
    if (!$targetUser) {
        Response::json(['error' => 'Usuario no encontrado'], 404);
        return;
    }
    if ($targetUser['Tipo_Usuario'] === 'admin') {
        Response::json(['error' => 'No puedes editar a otro admin'], 403);
        return;
    }

    $allowedFields = ['Nombre', 'Correo', 'Telefono', 'Direccion', 'Contraseña'];
    $updateData = [];
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateData[$field] = filter_var(trim($data[$field]), FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        }
    }

    if (array_key_exists('password', $data) && !empty($data['password'])) {
        if (strlen($data['password']) < 8) {
            Response::json(['error' => 'La nueva contraseña debe tener al menos 8 caracteres.'], 400);
            return;
        }
        $updateData['Contraseña'] = password_hash($data['password'], PASSWORD_DEFAULT);
    }

    if (empty($updateData)) {
        Response::json(['error' => 'No hay datos para actualizar'], 400);
        return;
    }

    $success = UserModel::update($id, $updateData);
    if ($success) {
        $updatedUser = UserModel::findById($id);
        Response::json(['success' => true, 'user' => $updatedUser]);
    } else {
        Response::json(['error' => 'No se pudo actualizar el usuario'], 500);
    }
}
public static function changePassword(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::json(['error' => 'Method not allowed'], 405);
        return;
    }

    session_start();
    if (empty($_SESSION['user']['ID_Usuario'])) {
        Response::json(['error' => 'Not authenticated'], 401);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
        Response::json(['error' => 'Invalid payload. Missing currentPassword or newPassword.'], 400);
        return;
    }

    $userId = (int)$_SESSION['user']['ID_Usuario'];
    $currentPassword = $data['currentPassword'];
    $newPassword = $data['newPassword'];

    if (empty($currentPassword) || empty($newPassword)) {
        Response::json(['error' => 'Current password and new password cannot be empty.'], 400);
        return;
    }
    if (strlen($newPassword) < 8) {
        Response::json(['error' => 'New password must be at least 8 characters long.'], 400);
        return;
    }

    $user = UserModel::findById($userId);
    if (!$user) {
        Response::json(['error' => 'User not found.'], 404); // Should not happen if session is valid
        return;
    }

    if (!password_verify($currentPassword, $user['Contraseña'])) {
        Response::json(['error' => 'Current password does not match.'], 401);
        return;
    }
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    if (UserModel::updatePassword($userId, $newPasswordHash)) {
        Response::json(['success' => true, 'message' => 'Password updated successfully.']);
    } else {
        Response::json(['error' => 'Failed to update password in database.'], 500);
    }
}
}
