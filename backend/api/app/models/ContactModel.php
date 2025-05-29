<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class ContactModel
{
    /**
     * Inserta una nueva consulta de contacto
     *
     * @param array $input ['first_name','last_name','email','phone','message']
     * @return int ID de la inserción
     */
    public static function create(array $input): int
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'INSERT INTO contact_submissions
                (first_name, last_name, email, phone, message)
             VALUES
                (:first_name, :last_name, :email, :phone, :message)'
        );
        $stmt->execute([
            ':first_name' => $input['first_name'],
            ':last_name'  => $input['last_name'],
            ':email'      => $input['email'],
            ':phone'      => $input['phone'] ?? null,
            ':message'    => $input['message'],
        ]);
        return (int)$pdo->lastInsertId();
    }
}
