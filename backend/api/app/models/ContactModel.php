<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class ContactModel
{
    public static function create(array $input): array
    {
        $pdo = DB::getInstance()->conn();

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

        $id = (int)$pdo->lastInsertId();

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
        return $stmt2->fetch(PDO::FETCH_ASSOC);
    }
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
