<?php
// app/models/UserModel.php
namespace App\Models;

use App\Core\DB;
use PDO;

class UserModel {
    /**
     * Busca un usuario por correo.
     * @param string $email
     * @return array|null
     */
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

    /**
     * Crea un nuevo usuario y devuelve su ID.
     * @param array $data
     * @return int
     */
    public static function create(array $data): int {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'INSERT INTO usuarios
             (Nombre, Correo, `Contraseña`, Telefono, `Direccion`, Tipo_Usuario)
             VALUES
             (:nombre, :correo, :contraseña, :telefono, :direccion, :tipo_usuario)'
        );
        $stmt->execute([
            'nombre'       => $data['nombre'],
            'correo'       => $data['correo'],
            'contraseña'   => $data['contraseña'],
            'telefono'     => $data['telefono'],
            'direccion'    => $data['direccion'],
            'tipo_usuario' => $data['tipo_usuario'],
        ]);
        return (int)$pdo->lastInsertId();
    }

    /**
     * Busca un usuario por ID.
     * @param int $id
     * @return array|null
     */
    public static function findById(int $id): ?array {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT ID_Usuario, Nombre, Correo, Telefono, `Direccion`, Tipo_Usuario, created_at
             FROM usuarios
             WHERE ID_Usuario = :id'
        );
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    /**
     * Recupera todos los usuarios de la tabla, incluyendo fecha de creación.
     * @return array Lista de usuarios.
     */
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

    /**
     * Actualiza los datos de un usuario por ID.
     * @param int $id
     * @param array $data Campos a actualizar (ej: ['Nombre' => 'Nuevo Nombre'])
     * @return bool True si la actualización fue exitosa, false en caso contrario.
     */
    public static function update(int $id, array $data): bool {
        $pdo = DB::getInstance()->conn();
        
        $allowedFields = ['Nombre', 'Correo', 'Telefono', 'Direccion']; // Ahora incluye Correo
        $setClauses = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $setClauses[] = "`$key` = :$key";
                $params[$key] = $value;
            }
        }

        if (empty($setClauses)) {
            return false; // No hay campos válidos para actualizar o datos vacíos
        }

        $sql = "UPDATE usuarios SET " . implode(', ', $setClauses) . " WHERE ID_Usuario = :id";
        
        try {
            $stmt = $pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (\PDOException $e) {
            // Opcional: Loggear el error $e->getMessage()
            return false;
        }
    }

    /**
     * Elimina un usuario por su ID.
     * @param int $id
     * @return bool True si se eliminó, false si no.
     */
    public static function delete(int $id): bool {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare('DELETE FROM usuarios WHERE ID_Usuario = :id');
            return $stmt->execute(['id' => $id]);
        } catch (\PDOException $e) {
            // Opcional: Loggear el error $e->getMessage()
            return false;
        }
    }
}
