<?php
namespace App\Controllers;

use App\Models\SubstanceDetailModel;
use App\Core\Response;

class SubstanceDetailController {
    /**
     * Devuelve todos los detalles de sustancias
     */
    public static function index(): void {
        $data = SubstanceDetailModel::getAll();
        Response::json($data);
    }

    /**
     * Devuelve los detalles de una sustancia por su ID
     *
     * @param int $id
     */
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

    /**
     * Crea un nuevo registro de detalle de sustancia
     *
     * @param array $input Datos de detalle de sustancia
     */
    public static function create(array $input): void {
        $newId = SubstanceDetailModel::create($input);
        Response::json([ 'ID_Sustancia' => $newId ], 201);
    }

    /**
     * Actualiza un registro de detalle de sustancia existente
     *
     * @param int $id
     * @param array $input
     */
    public static function update(int $id, array $input): void {
        $updated = SubstanceDetailModel::update($id, $input);
        if ($updated) {
            Response::json([ 'message' => 'Actualizado correctamente' ]);
        } else {
            Response::json([ 'error' => 'No se pudo actualizar' ], 400);
        }
    }

    /**
     * Elimina un registro de detalle de sustancia
     *
     * @param int $id
     */
    public static function delete(int $id): void {
        $deleted = SubstanceDetailModel::delete($id);
        if ($deleted) {
            Response::json([ 'message' => 'Eliminado correctamente' ]);
        } else {
            Response::json([ 'error' => 'No se pudo eliminar' ], 400);
        }
    }
}
