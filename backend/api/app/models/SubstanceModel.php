<?php
namespace App\Models;                       

use App\Core\DB;                            
use PDO;

class SubstanceModel
{
    public static function getAll(): array
{
    $pdo  = DB::getInstance()->conn();
    $stmt = $pdo->query(
        'SELECT ID_Sustancia,
                Nombre,
                Imagen,
                Titulo,
                Formula
         FROM sustancias'
    );
    
    $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $baseUrl = 'https://safeuse-lkde.onrender.com/uploads/sustancias/';

    foreach ($filas as &$fila) {
        $fila['Imagen'] = $baseUrl . trim($fila['Imagen']);
    }

    return $filas;
}

}
