<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;
use App\Core\Response;

class AdminContactModel
{
    /**
     * Actualiza el campo "checked" (0 o 1) de una fila en la tabla contact_submissions.
     *
     * @param int $id      El ID_Submission que se quiere marcar/desmarcar.
     * @param int $checked El nuevo valor: 0 o 1.
     * @return bool        True si la fila existía y se actualizó; false en caso contrario.
     */
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

            // Si execute() devolvió true y rowCount() > 0 significa que se actualizó al menos una fila.
            return ($ok && $stmt->rowCount() > 0);
        } catch (\PDOException $e) {
            error_log('Error en AdminContactModel::updateChecked: ' . $e->getMessage());
            Response::json([
                'error' => 'DB error al actualizar checked: ' . $e->getMessage()
            ], 500);
            return false;
        }
    }

    /**
     * (Opcional) Obtiene todas las submissions de contacto, ordenadas por fecha descendente.
     *
     * @return array|null
     */
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

    /**
     * (Opcional) Busca una sola submission por ID_Submission.
     *
     * @param int $id
     * @return array|null
     */
    public static function findById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare('SELECT * FROM contact_submissions WHERE ID_Submission = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Elimina una submission de contacto por ID_Submission.
     *
     * @param int $id
     * @return bool True si se eliminó al menos una fila, false si no existía o hubo error.
     */
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
