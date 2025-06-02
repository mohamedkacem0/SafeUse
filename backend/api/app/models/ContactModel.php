<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class ContactModel
{
    /**
     * Inserta una nueva consulta de contacto
     * y devuelve *todas* las columnas del registro creado.
     *
     * @param array $input ['first_name','last_name','email','phone','message']
     * @return array Todas las columnas de contact_submissions
     */
    public static function create(array $input): array
    {
        $pdo = DB::getInstance()->conn();

        // 1) Insertar (checked y created_at se llenan por defecto)
        $stmt = $pdo->prepare(<<<'SQL'
            INSERT INTO contact_submissions
                (first_name, last_name, email, phone, message)
            VALUES
                (:first_name, :last_name, :email, :phone, :message)
        SQL);
        $stmt->execute([
            ':first_name' => $input['first_name'],
            ':last_name'  => $input['last_name'],
            ':email'      => $input['email'],
            ':phone'      => $input['phone'] ?? null,
            ':message'    => $input['message'],
        ]);

        // 2) Recuperar el ID generado
        $id = (int)$pdo->lastInsertId();

        // 3) Hacer SELECT * para devolver *todas* las columnas
        $stmt2 = $pdo->prepare('
            SELECT
              ID_Submission      AS id,
              first_name,
              last_name,
              email,
              phone,
              message,
              checked,
              created_at
            FROM contact_submissions
            WHERE ID_Submission = :id
        ');
        $stmt2->execute([':id' => $id]);

        // 4) Devolver el registro completo como array asociativo
        return $stmt2->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * (Opcional) Recupera *todas* las filas de contact_submissions
     * y devuelve un array de registros.
     *
     * @return array[]
     */
    public static function getAll(): array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->query('
            SELECT
              ID_Submission      AS id,
              first_name,
              last_name,
              email,
              phone,
              message,
              checked,
              created_at
            FROM contact_submissions
            ORDER BY created_at DESC
        ');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
