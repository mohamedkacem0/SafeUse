<?php
namespace App\Core;

class Response {
    public static function json($data, int $status = 200) {
        /*header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");*/
        http_response_code($status);
        echo json_encode($data);
        exit;
    }
}
