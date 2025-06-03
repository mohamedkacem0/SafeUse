<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;
use App\Core\Response;

class AdminOrdersModel
{
    /**
     * Obtiene todas las órdenes (pedidos) de la tabla `pedidos`, renombrando columnas
     * para que coincidan con lo que el frontend espera.
     *
     * @return array|null
     */
    public static function fetchAll(): ?array
    {
        $pdo = DB::getInstance()->conn();
        try {
            // Seleccionamos de la tabla `pedidos` y renombramos campos a propiedades genéricas:
            $sql = '
                SELECT
                    ID_Pedido          AS id,
                    ID_Usuario         AS user_id,
                    Precio_total       AS total,
                    Estado_Pedido      AS status,
                    Fecha_Pedido       AS created_at,
                    Direccion_entrega  AS shipping_address
                FROM pedidos
                ORDER BY Fecha_Pedido DESC
            ';
            $stmt = $pdo->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log('Error en AdminOrdersModel::fetchAll: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Elimina un pedido por su ID_Pedido.
     *
     * @param int $id
     * @return bool True si se eliminó al menos una fila; false en caso contrario.
     */
    public static function deleteById(int $id): bool
    {
        $pdo = DB::getInstance()->conn();
        try {
            $stmt = $pdo->prepare('DELETE FROM pedidos WHERE ID_Pedido = :id');
            $ok = $stmt->execute(['id' => $id]);
            return ($ok && $stmt->rowCount() > 0);
        } catch (\PDOException $e) {
            error_log('Error en AdminOrdersModel::deleteById: ' . $e->getMessage());
            return false;
        }
    }
}
