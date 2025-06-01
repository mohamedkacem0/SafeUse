<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class AdviceModel
{
    /**
     * Obtiene todos los consejos
     *
     * @return array
     */
    public static function getAll(): array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->query(
            'SELECT ID_Advice, title, description, articulo, stage, created_at, updated_at
             FROM advice'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene un consejo por ID
     *
     * @param int $id
     * @return array|null
     */
    public static function getById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT ID_Advice, title, description, articulo, stage, created_at, updated_at
             FROM advice
             WHERE ID_Advice = :id'
        );
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data !== false ? $data : null;
    }

    /**
     * Crea un nuevo consejo
     *
     * @param array $input
     * @return int ID del consejo creado
     */
    public static function create(array $input): int
    {
        $pdo = DB::getInstance()->conn();
        $sql = 'INSERT INTO advice
                    (title, description, articulo, stage)
                VALUES
                    (:title, :description, :articulo, :stage)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title'       => $input['title'],
            ':description' => $input['description'],
            ':articulo'    => $input['articulo'] ?? null,
            ':stage'       => $input['stage'],
        ]);
        return (int)$pdo->lastInsertId();
    }

    /**
     * Actualiza un consejo existente
     *
     * @param int $id
     * @param array $input
     * @return bool
     */
    public static function update(int $id, array $input): bool
    {
        $pdo = DB::getInstance()->conn();
        $sql = 'UPDATE advice SET
                    title = :title,
                    description = :description,
                    articulo = :articulo,
                    stage = :stage
                WHERE ID_Advice = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title'       => $input['title'],
            ':description' => $input['description'],
            ':articulo'    => $input['articulo'] ?? null,
            ':stage'       => $input['stage'],
            ':id'          => $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Elimina un consejo
     *
     * @param int $id
     * @return bool
     */
    public static function delete(int $id): bool
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'DELETE FROM advice WHERE ID_Advice = :id'
        );
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
