<?php
namespace App\Controllers;

use App\Models\ContactModel;
use App\Core\Response;

class ContactController
{
    /**
     * Almacena una nueva consulta de contacto
     */
    public static function store(): void
    {
        // Leemos JSON plano
        $input = json_decode(file_get_contents('php://input'), true);

        if (
            !isset($input['first_name'], $input['last_name'], $input['email'], $input['message'])
            || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)
        ) {
            Response::json(['error' => 'Datos inválidos'], 400);
            return;
        }

        $id = ContactModel::create($input);
        Response::json(['ID_Submission' => $id], 201);
    }
}
