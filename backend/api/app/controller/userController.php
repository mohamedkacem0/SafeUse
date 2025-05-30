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
// app/controllers/UserController.php

/**
 * Sube o actualiza la foto de perfil del usuario.
 * Espera un campo 'foto' en multipart/form-data.
 */
public static function uploadPhoto(): void {
    session_start();
    if (empty($_SESSION['user']['ID_Usuario'])) {
        Response::json(['error' => 'No autenticado'], 401);
        return;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::json(['error' => 'Método no permitido'], 405);
        return;
    }

    if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        Response::json(['error' => 'Error al subir la imagen'], 400);
        return;
    }

    $userId = (int)$_SESSION['user']['ID_Usuario'];
    $tmpPath = $_FILES['foto']['tmp_name'];
    $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
    $newName = 'avatar_'.$userId.'_'.time().'.'.$ext;
    $destPath = __DIR__ . '/../../public/uploads/avatars/' . $newName;

    // Mueve el fichero
    if (!move_uploaded_file($tmpPath, $destPath)) {
        Response::json(['error' => 'No se pudo guardar la imagen'], 500);
        return;
    }

    // Guarda la ruta en la BD
    $pdo = \App\Core\DB::getInstance()->conn();
    $stmt = $pdo->prepare('UPDATE usuarios SET foto_perfil = :foto WHERE ID_Usuario = :id');
    $stmt->execute(['foto' => '/uploads/avatars/'.$newName, 'id' => $userId]);

    // Devolver la URL
    Response::json(['foto_perfil' => '/uploads/avatars/'.$newName]);
}
public static function updateProfile(): void {
    session_start();
    if (empty($_SESSION['user']['ID_Usuario'])) {
        Response::json(['error' => 'No autenticado'], 401);
        return;
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::json(['error' => 'Método no permitido'], 405);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !is_array($input)) {
        Response::json(['error' => 'Payload no válido'], 400);
        return;
    }

    // Campos permitidos
    $allowed = ['Nombre', 'Correo', 'Telefono', 'Direccion'];
    $fields  = [];
    $params  = ['id' => $_SESSION['user']['ID_Usuario']];

    // Sanitiza y recoge los dados a actualizar
    if (in_array('Nombre', $allowed) && isset($input['Nombre'])) {
        $fields[]            = 'Nombre = :Nombre';
        $params['Nombre']    = filter_var($input['Nombre'], FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    }
    if (in_array('Correo', $allowed) && isset($input['Correo'])) {
        $fields[]            = 'Correo = :Correo';
        $params['Correo']    = filter_var($input['Correo'], FILTER_VALIDATE_EMAIL);
    }
    if (in_array('Telefono', $allowed) && isset($input['Telefono'])) {
        $fields[]             = 'Telefono = :Telefono';
        $params['Telefono']   = filter_var($input['Telefono'], FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    }
    if (in_array('Direccion', $allowed) && isset($input['Direccion'])) {
        $fields[]              = '`Dirección` = :Direccion';
        $params['Direccion']   = filter_var($input['Direccion'], FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    }

    if (empty($fields)) {
        Response::json(['error' => 'Nada que actualizar'], 400);
        return;
    }

    // Construye y ejecuta el UPDATE
    $setClause = implode(', ', $fields);
    $pdo       = \App\Core\DB::getInstance()->conn();
    $stmt      = $pdo->prepare("UPDATE usuarios SET {$setClause} WHERE ID_Usuario = :id");
    $stmt->execute($params);

    // Devuelve el usuario actualizado
    $updated = UserModel::findById((int)$_SESSION['user']['ID_Usuario']);
    if (!$updated) {
        Response::json(['error' => 'Error al recuperar usuario'], 500);
        return;
    }

    // Refresca la sesión para que use los nuevos valores
    $_SESSION['user']['Nombre']    = $updated['Nombre'];
    $_SESSION['user']['Correo']    = $updated['Correo'];
    $_SESSION['user']['Tipo_Usuario'] = $updated['Tipo_Usuario'];

    Response::json(['user' => [
        'ID_Usuario'   => $updated['ID_Usuario'],
        'Nombre'       => $updated['Nombre'],
        'Correo'       => $updated['Correo'],
        'Telefono'     => $updated['Telefono'],
        'Direccion'    => $updated['Dirección'],
        'Tipo_Usuario' => $updated['Tipo_Usuario'],
        'foto_perfil'  => $updated['foto_perfil'] ?? null,
    ]]);
}

}
