<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;

class AdminUserModel
{
    /**
     * Crea un nuevo usuario y devuelve su ID.
     * @param array $data
     * @return int|null
     */
    public static function create(array $data): ?int
    {
        $pdo = DB::getInstance()->conn();
        try {
            // Usamos :password en lugar de :Contraseña para evitar problemas de encoding/nombre de parámetro
            $stmt = $pdo->prepare(
                'INSERT INTO usuarios
                 (Nombre, Correo, `Contraseña`, Telefono, Direccion, Tipo_Usuario)
                 VALUES
                 (:Nombre, :Correo, :password, :Telefono, :Direccion, :Tipo_Usuario)'
            );

            // Para debug (opcional)
//          error_log('DATA PARA INSERT: ' . print_r($data, true));

            $ok = $stmt->execute([
                'Nombre'       => $data['Nombre'],
                'Correo'       => $data['Correo'],
                // Aquí debe coincidir la clave 'password' con el placeholder :password
                'password'     => $data['password'],
                // Si no viene 'Telefono' o 'Direccion', pongo cadena vacía
                'Telefono'     => $data['Telefono'] ?? '',
                'Direccion'    => $data['Direccion'] ?? '',
                'Tipo_Usuario' => $data['Tipo_Usuario'] ?? 'usuario',
            ]);

            return $ok ? (int)$pdo->lastInsertId() : null;
        } catch (\PDOException $e) {
            // Registrar el error en el log y responder con JSON de error
            error_log('Error en AdminUserModel::create: ' . $e->getMessage());
            \App\Core\Response::json(['error' => 'DB: ' . $e->getMessage()], 500);
            return null;
        }
    }

    /**
     * Busca un usuario por correo electrónico.
     * @param string $email
     * @return array|null
     */
    public static function findByEmail(string $email): ?array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT * FROM usuarios WHERE Correo = :Correo'
        );
        $stmt->execute(['Correo' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }
}
