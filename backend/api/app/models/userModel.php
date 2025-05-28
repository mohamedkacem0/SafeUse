<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class UserModel {
    /**
     * Busca un usuario por correo.
     * @return array|null
     */
    public static function findByEmail(string $email): ?array {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT ID_Usuario, Nombre, Correo, `Contraseña`, Telefono, `Dirección`, Tipo_Usuario, created_at
             FROM usuarios
             WHERE Correo = :email'
        );
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    /**
     * Crea un nuevo usuario y devuelve su ID.
     */
    public static function create(array $data): int {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'INSERT INTO usuarios
             (Nombre, Correo, `Contraseña`, Telefono, `Dirección`, Tipo_Usuario)
             VALUES
             (:nombre, :correo, :contraseña, :telefono, :direccion, :tipo_usuario)'
        );
        $stmt->execute([
            'nombre'      => $data['nombre'],
            'correo'      => $data['correo'],
            'contraseña'  => $data['contraseña'],
            'telefono'    => $data['telefono'],
            'direccion'   => $data['direccion'],
            'tipo_usuario'=> $data['tipo_usuario'],
        ]);
        return (int)$pdo->lastInsertId();
    }
}