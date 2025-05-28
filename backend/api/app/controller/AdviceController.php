<?php
namespace App\Controllers;

use App\Models\AdviceModel;
use App\Core\Response;

class AdviceController {
    /**
     * Devuelve todos los consejos
     */
    public static function index(): void {
        $data = AdviceModel::getAll();
        Response::json($data);
    }

    /**
     * Devuelve un consejo por su ID
     *
     * @param int $id
     */
    public static function show(int $id): void {
        $advice = AdviceModel::getById($id);
        if ($advice) {
            Response::json($advice);
        } else {
            Response::json([
                'error' => 'Consejo no encontrado'
            ], 404);
        }
    }

    /**
     * Crea un nuevo consejo
     *
     * @param array $input Datos del consejo
     */
    public static function create(array $input): void {
        $newId = AdviceModel::create($input);
        Response::json([ 'ID_Advice' => $newId ], 201);
    }

    /**
     * Actualiza un consejo existente
     *
     * @param int $id
     * @param array $input
     */
    public static function update(int $id, array $input): void {
        $updated = AdviceModel::update($id, $input);
        if ($updated) {
            Response::json([ 'message' => 'Actualizado correctamente' ]);
        } else {
            Response::json([ 'error' => 'No se pudo actualizar' ], 400);
        }
    }

    /**
     * Elimina un consejo
     *
     * @param int $id
     */
    public static function delete(int $id): void {
        $deleted = AdviceModel::delete($id);
        if ($deleted) {
            Response::json([ 'message' => 'Eliminado correctamente' ]);
        } else {
            Response::json([ 'error' => 'No se pudo eliminar' ], 400);
        }
    }
}
