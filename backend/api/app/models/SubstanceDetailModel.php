<?php
namespace App\Models;

use App\Core\DB;
use PDO;

class SubstanceDetailModel
{
    /**
     * Obtiene todos los detalles de sustancias
     *
     * @return array
     */
    public static function getAll(): array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->query(
            'SELECT ID_Sustancia,
                    descripcion,
                    metodos_consumo,
                    efectos_deseados,
                    composicion,
                    riesgos,
                    interaccion_otras_sustancias,
                    reduccion_riesgos,
                    legislacion
             FROM detalles_sustancia'
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene los detalles de una sustancia por ID
     *
     * @param int $id
     * @return array|null
     */
    public static function getById(int $id): ?array
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'SELECT ID_Sustancia,
                    descripcion,
                    metodos_consumo,
                    efectos_deseados,
                    composicion,
                    riesgos,
                    interaccion_otras_sustancias,
                    reduccion_riesgos,
                    legislacion
             FROM detalles_sustancia
             WHERE ID_Sustancia = :id'
        );
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data !== false ? $data : null;
    }

    /**
     * Crea un nuevo detalle de sustancia
     *
     * @param array $input
     * @return int ID de la sustancia creada
     */
    public static function create(array $input): int
    {
        $pdo = DB::getInstance()->conn();
        $sql = 'INSERT INTO detalles_sustancia
                    (ID_Sustancia,
                     descripcion,
                     metodos_consumo,
                     efectos_deseados,
                     composicion,
                     riesgos,
                     interaccion_otras_sustancias,
                     reduccion_riesgos,
                     legislacion)
                VALUES
                    (:id,
                     :descripcion,
                     :metodos_consumo,
                     :efectos_deseados,
                     :composicion,
                     :riesgos,
                     :interaccion_otras_sustancias,
                     :reduccion_riesgos,
                     :legislacion)';

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $input['ID_Sustancia'], 
            ':descripcion' => $input['descripcion'] ?? null,
            ':metodos_consumo' => $input['metodos_consumo'] ?? null,
            ':efectos_deseados' => $input['efectos_deseados'] ?? null,
            ':composicion' => $input['composicion'] ?? null,
            ':riesgos' => $input['riesgos'] ?? null,
            ':interaccion_otras_sustancias' => $input['interaccion_otras_sustancias'] ?? null,
            ':reduccion_riesgos' => $input['reduccion_riesgos'] ?? null,
            ':legislacion' => $input['legislacion'] ?? null,
        ]);

        return (int) $input['ID_Sustancia'];
    }

    /**
     * Actualiza un detalle de sustancia existente
     *
     * @param int $id
     * @param array $input
     * @return bool
     */
    public static function update(int $id, array $input): bool
    {
        $pdo = DB::getInstance()->conn();
        $sql = 'UPDATE detalles_sustancia SET
                    descripcion = :descripcion,
                    metodos_consumo = :metodos_consumo,
                    efectos_deseados = :efectos_deseados,
                    composicion = :composicion,
                    riesgos = :riesgos,
                    interaccion_otras_sustancias = :interaccion_otras_sustancias,
                    reduccion_riesgos = :reduccion_riesgos,
                    legislacion = :legislacion
                WHERE ID_Sustancia = :id';

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':descripcion' => $input['descripcion'] ?? null,
            ':metodos_consumo' => $input['metodos_consumo'] ?? null,
            ':efectos_deseados' => $input['efectos_deseados'] ?? null,
            ':composicion' => $input['composicion'] ?? null,
            ':riesgos' => $input['riesgos'] ?? null,
            ':interaccion_otras_sustancias' => $input['interaccion_otras_sustancias'] ?? null,
            ':reduccion_riesgos' => $input['reduccion_riesgos'] ?? null,
            ':legislacion' => $input['legislacion'] ?? null,
            ':id' => $id,
        ]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Elimina un detalle de sustancia
     *
     * @param int $id
     * @return bool
     */
    public static function delete(int $id): bool
    {
        $pdo = DB::getInstance()->conn();
        $stmt = $pdo->prepare(
            'DELETE FROM detalles_sustancia WHERE ID_Sustancia = :id'
        );

        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
