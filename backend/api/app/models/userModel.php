<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class UserModel {
  
    public static function findByEmail(string $email): ?array {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT ID_Usuario, Nombre, Correo, `Contraseña`, Telefono, `Direccion`, Tipo_Usuario, created_at
             FROM usuarios
             WHERE Correo = :email'
        );
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public static function create(array $data): int {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'INSERT INTO usuarios
             (Nombre, Correo, `Contraseña`, Telefono, `Direccion`, Tipo_Usuario)
             VALUES
             (:nombre, :correo, :hashed_password, :telefono, :direccion, :tipo_usuario)'
        );
        $stmt->execute([
            'nombre'          => $data['nombre'],
            'correo'          => $data['correo'],
            'hashed_password' => $data['contraseña'], 
            'telefono'        => $data['telefono'],
            'direccion'       => $data['direccion'],
            'tipo_usuario'    => $data['tipo_usuario'],
        ]);
        return (int)$pdo->lastInsertId();
    }

    public static function findById(int $id): ?array {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT ID_Usuario, Nombre, Correo, `Contraseña`, Telefono, `Direccion`, Tipo_Usuario, created_at
             FROM usuarios
             WHERE ID_Usuario = :id'
        );
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }
    public static function getAll(): array {
        $pdo = DB::getInstance()->conn();
        $sql = "
            SELECT
                ID_Usuario,
                Nombre,
                Correo,
                Telefono,
                `Direccion` AS Direccion,
                Tipo_Usuario AS Tipo_Usuario,
                created_at
            FROM usuarios
        ";
        $stmt = $pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public static function update(int $id, array $data): bool {
        $pdo = DB::getInstance()->conn();

        $allowedFields = ['Nombre', 'Correo', 'Telefono', 'Direccion', 'Contraseña'];
        $setClauses = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields)) {
               
                if ($key === 'Contraseña') {
                    $setClauses[] = "`Contraseña` = :password";
                    $params['password'] = $value;
                } else {
                    $setClauses[] = "`$key` = :$key";
                    $params[$key] = $value;
                }
            }
        }

        if (empty($setClauses)) {
            return false;
        }

        $sql = "UPDATE usuarios SET " . implode(', ', $setClauses) . " WHERE ID_Usuario = :id";

        try {
            $stmt = $pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (\PDOException $e) {
            error_log('Error en update: ' . $e->getMessage());
            \App\Core\Response::json(['error' => 'DB: ' . $e->getMessage()], 500);
            return false;
        }
    }
    public static function delete(int $id): bool {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare('DELETE FROM usuarios WHERE ID_Usuario = :id');
            return $stmt->execute(['id' => $id]);
        } catch (\PDOException $e) {
            return false;
        }
    }
    public static function updatePassword(int $userId, string $newPasswordHash): bool {
        $pdo = DB::getInstance()->conn();
        $sql = "UPDATE usuarios SET `Contraseña` = :password WHERE ID_Usuario = :id";
        
        try {
            $stmt = $pdo->prepare($sql);
            return $stmt->execute(['password' => $newPasswordHash, 'id' => $userId]);
        } catch (\PDOException $e) {
            error_log('Error updating password for user ' . $userId . ': ' . $e->getMessage());
            return false;
        }
    }
}
