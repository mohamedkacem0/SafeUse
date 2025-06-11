<?php
namespace App\Controllers;

use App\Models\SubstanceDetailModel;
use App\Core\Response;

class SubstanceDetailController {
     
    public static function index(): void {
        $data = SubstanceDetailModel::getAll();
        Response::json($data);
    }
 
    public static function show(int $id): void {
        $detail = SubstanceDetailModel::getById($id);
        if ($detail) {
            Response::json($detail);
        } else {
            Response::json([
                'error' => 'Detalle de sustancia no encontrado'
            ], 404);
        }
    }
 
    public static function create(array $input): void {
        $newId = SubstanceDetailModel::create($input);
        Response::json([ 'ID_Sustancia' => $newId ], 201);
    }
 
    public static function update(int $id, array $input): void {
        $updated = SubstanceDetailModel::update($id, $input);
        if ($updated) {
            Response::json([ 'message' => 'Actualizado correctamente' ]);
        } else {
            Response::json([ 'error' => 'No se pudo actualizar' ], 400);
        }
    }
 
    public static function delete(int $id): void {
        $deleted = SubstanceDetailModel::delete($id);
        if ($deleted) {
            Response::json([ 'message' => 'Eliminado correctamente' ]);
        } else {
            Response::json([ 'error' => 'No se pudo eliminar' ], 400);
        }
    }
}
