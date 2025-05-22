<?php
namespace App\Controllers;

use App\Models\SubstanceModel;
use App\Core\Response;

class SubstanceController {
    public static function index(): void {
        $data = SubstanceModel::getAll();
        Response::json($data);
    }
}
