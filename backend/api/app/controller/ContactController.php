<?php
namespace App\Controllers;

use App\Models\ContactModel;
use App\Core\Response;

class ContactController
{
    /**
     * Almacena una nueva consulta de contacto
     * y devuelve todas las columnas del registro creado.
     */
    public static function store(): void
    {
        // Leemos JSON plano
        $input = json_decode(file_get_contents('php://input'), true);

        // Validación mínima
        if (
            !isset($input['first_name'], $input['last_name'], $input['email'], $input['message'])
            || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)
        ) {
            Response::json(['error' => 'Datos inválidos'], 400);
            return;
        }

        // Creamos el registro y obtenemos todas sus columnas
        $newRecord = ContactModel::create($input);

        // Respondemos con 201 y el registro completo en JSON
        Response::json($newRecord, 201);
    }

    /**
     * (Opcional) Lista todas las consultas de contacto
     */
    public static function index(): void
    {
        $all = ContactModel::getAll();  // devuelve un array de registros completos
        Response::json($all, 200);
    }
}
