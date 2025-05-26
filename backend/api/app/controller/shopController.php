<?php
namespace App\Controllers;

use App\Models\ShopModel;
use App\Core\Response;

class ShopController {
    public static function index(): void {
        $products = ShopModel::getAll();
        Response::json($products);
    }

    public static function show(int $id): void {
        $product = ShopModel::getById($id);

        if ($product) {
            Response::json($product);
        } else {
            Response::json(["error" => "Product not found"], 404);
        }
    }
}
