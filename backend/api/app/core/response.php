<?php
namespace App\Core;

class Response {
    public static function json($data, int $code = 200): void {
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}
