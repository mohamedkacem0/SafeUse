<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;

class AdminUserModel
{ 
    public static function create(array $data): ?int
    {
        $pdo = DB::getInstance()->conn();
        try { 
            $stmt = $pdo->prepare(
                'INSERT INTO usuarios
                 (Nombre, Correo, `Contraseña`, Telefono, Direccion, Tipo_Usuario)
                 VALUES
                 (:Nombre, :Correo, :password, :Telefono, :Direccion, :Tipo_Usuario)'
            );
 
            $ok = $stmt->execute([
                'Nombre'       => $data['Nombre'],
                'Correo'       => $data['Correo'], 
                'password'     => $data['password'], 
                'Telefono'     => $data['Telefono'] ?? '',
                'Direccion'    => $data['Direccion'] ?? '',
                'Tipo_Usuario' => $data['Tipo_Usuario'] ?? 'usuario',
            ]);

            return $ok ? (int)$pdo->lastInsertId() : null;
        } catch (\PDOException $e) { 
            error_log('Error en AdminUserModel::create: ' . $e->getMessage());
            \App\Core\Response::json(['error' => 'DB: ' . $e->getMessage()], 500);
            return null;
        }
    } 
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
