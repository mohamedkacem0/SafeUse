<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;
use App\Core\Response;

class AdminContactModel
{
    public static function updateChecked(int $id, int $checked): bool
    {
        $pdo = DB::getInstance()->conn();

        try {
            $stmt = $pdo->prepare(
                'UPDATE contact_submissions
                 SET checked = :checked
                 WHERE ID_Submission = :id'
            );
            $ok = $stmt->execute([
                'checked' => $checked,
                'id'      => $id,
            ]);
            return ($ok && $stmt->rowCount() > 0);
        } catch (\PDOException $e) {
            error_log('Error en AdminContactModel::updateChecked: ' . $e->getMessage());
            Response::json([
                'error' => 'DB error al actualizar checked: ' . $e->getMessage()
            ], 500);
            return false;
        }
    }
    public static function fetchAll(): ?array
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log('Error en AdminContactModel::fetchAll: ' . $e->getMessage());
            return null;
        }
    }
    public static function findById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare('SELECT * FROM contact_submissions WHERE ID_Submission = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
    public static function deleteById(int $id): bool
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare('DELETE FROM contact_submissions WHERE ID_Submission = :id');
            $ok = $stmt->execute(['id' => $id]);
            return ($ok && $stmt->rowCount() > 0);
        } catch (\PDOException $e) {
            error_log('Error en AdminContactModel::deleteById: ' . $e->getMessage());
            return false;
        }
    }
}
