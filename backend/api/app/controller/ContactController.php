<?php
namespace App\Controllers;

use App\Models\ContactModel;
use App\Core\Response;

class ContactController
{
    
    public static function store(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (
            !isset($input['first_name'], $input['last_name'], $input['email'], $input['message'])
            || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)
        ) {
            Response::json(['error' => 'Datos inválidos'], 400);
            return;
        }
        $newRecord = ContactModel::create($input);

        Response::json($newRecord, 201);
    }

    public static function index(): void
    {
        $all = ContactModel::getAll();
        Response::json($all, 200);
    }
}
