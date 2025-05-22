<?php
namespace App\Models;                       // ← Mayúsculas

use App\Core\DB;                            // ← Clase correcta
use PDO;

class SubstanceModel
{
    /** Devuelve todas las sustancias */
    public static function getAll(): array  // ← nombre esperado por el controlador
    {
        $pdo  = DB::getInstance()->conn();
        $stmt = $pdo->query(
            'SELECT ID_Sustancia,
                    Nombre,
                    Imagen,
                    Titulo,
                    Formula
             FROM sustancias'               // ← tabla existente
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
