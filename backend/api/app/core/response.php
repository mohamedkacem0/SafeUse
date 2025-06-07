<?php
namespace App\Core;

class Response {
    public static function json($data, int $status = 200) {
      /*  header('Access-Control-Allow-Origin: http://localhost:5173');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');*/
        http_response_code($status);
        echo json_encode($data);
        exit;
    }
}
