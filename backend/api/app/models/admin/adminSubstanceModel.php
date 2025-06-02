<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;

class AdminSubstanceModel {
    /**
     * Crea una nueva sustancia en la base de datos.
     *
     * @param array $data Datos de la sustancia. Espera claves: 'Nombre', 'Imagen', 'Titulo', 'Formula'.
     * @return int|false El ID de la sustancia recién creada o false en caso de error.
     */
    public static function createSubstance(array $data): int|false {
        $pdo = DB::getInstance()->conn();

        try {
            $pdo->beginTransaction();

            // 1. Insert into sustancias
            $sqlSustancia = "INSERT INTO sustancias (Nombre, Imagen, Titulo, Formula) VALUES (:nombre, :imagen, :titulo, :formula)";
            $stmtSustancia = $pdo->prepare($sqlSustancia);
            $stmtSustancia->execute([
                ':nombre'  => $data['Nombre'],
                ':imagen'  => $data['Imagen'],
                ':titulo'  => $data['Titulo'],
                ':formula' => $data['Formula'],
            ]);
            
            $idSustancia = (int)$pdo->lastInsertId();

            if (!$idSustancia) {
                $pdo->rollBack();
                error_log('Error creating substance: Failed to get lastInsertId for sustancias table.');
                return false;
            }

            // 2. Insert into detalles_sustancia
            $sqlDetalles = "INSERT INTO detalles_sustancia (
                                ID_Sustancia, descripcion, metodos_consumo, efectos_deseados, 
                                composicion, riesgos, interaccion_otras_sustancias, 
                                reduccion_riesgos, legislacion
                            ) VALUES (
                                :id_sustancia, :descripcion, :metodos_consumo, :efectos_deseados, 
                                :composicion, :riesgos, :interaccion_otras_sustancias, 
                                :reduccion_riesgos, :legislacion
                            )";
            $stmtDetalles = $pdo->prepare($sqlDetalles);
            $stmtDetalles->execute([
                ':id_sustancia'                 => $idSustancia,
                ':descripcion'                  => $data['descripcion'],
                ':metodos_consumo'              => $data['metodos_consumo'],
                ':efectos_deseados'             => $data['efectos_deseados'],
                ':composicion'                  => $data['composicion'],
                ':riesgos'                      => $data['riesgos'],
                ':interaccion_otras_sustancias' => $data['interaccion_otras_sustancias'],
                ':reduccion_riesgos'            => $data['reduccion_riesgos'],
                ':legislacion'                  => $data['legislacion'],
            ]);

            $pdo->commit();
            return $idSustancia;

        } catch (\PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Error creating substance and details: ' . $e->getMessage() . ' Data: ' . print_r($data, true));
            return false;
        }
    }

    // Aquí se podrían añadir otros métodos para el CRUD de sustancias por parte del admin (update, delete, getById, etc.)
}
