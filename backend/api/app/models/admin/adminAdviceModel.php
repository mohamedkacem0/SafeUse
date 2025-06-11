<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;
use App\Core\Response;

class AdminAdviceModel
{ 
    public static function fetchAll(): ?array
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->query('SELECT * FROM advice ORDER BY created_at DESC');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log('Error en AdminAdviceModel::fetchAll: ' . $e->getMessage());
            return null;
        }
    }
 
    public static function deleteById(int $id): bool
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare('DELETE FROM advice WHERE ID_Advice = :id');
            $ok = $stmt->execute(['id' => $id]);
            return ($ok && $stmt->rowCount() > 0);
        } catch (\PDOException $e) {
            error_log('Error en AdminAdviceModel::deleteById: ' . $e->getMessage());
            return false;
        }
    }
 
    public static function updateById(int $id, array $data): bool
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare(
                'UPDATE advice
                 SET title = :title,
                     description = :description,
                     articulo = :articulo,
                     stage = :stage,
                     updated_at = NOW()
                 WHERE ID_Advice = :id'
            );
            $ok = $stmt->execute([
                'title'       => $data['title'],
                'description' => $data['description'],
                'articulo'    => $data['articulo'],
                'stage'       => $data['stage'],
                'id'          => $id,
            ]);
            return ($ok && $stmt->rowCount() > 0);
        } catch (\PDOException $e) {
            error_log('Error en AdminAdviceModel::updateById: ' . $e->getMessage());
            return false;
        }
    }
 
    public static function create(array $data): ?int
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare(
                'INSERT INTO advice (title, description, articulo, stage, created_at, updated_at)
                 VALUES (:title, :description, :articulo, :stage, NOW(), NOW())'
            );
            $ok = $stmt->execute([
                'title'       => $data['title'],
                'description' => $data['description'],
                'articulo'    => $data['articulo'],
                'stage'       => $data['stage'],
            ]);
            return $ok ? (int)$pdo->lastInsertId() : null;
        } catch (\PDOException $e) {
            error_log('Error en AdminAdviceModel::create: ' . $e->getMessage());
            return null;
        }
    }
 
    public static function fetchById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare('SELECT * FROM advice WHERE ID_Advice = :id');
            $stmt->execute(['id' => $id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (\PDOException $e) {
            error_log('Error en AdminAdviceModel::fetchById: ' . $e->getMessage());
            return null;
        }
    }
}
