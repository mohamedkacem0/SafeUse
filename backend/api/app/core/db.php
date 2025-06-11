<?php
namespace App\Core;
use PDO, PDOException;

class DB {
    private static ?self $instance = null;
    private ?PDO $conn = null;
 
    private function __construct() {
        try {
            $this->conn = new PDO(
                Config::DSN,
                Config::DB_USER,
                Config::DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $e) {
            die('DB connection error: ' . $e->getMessage());
        }
    } 
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function conn(): PDO {
        return $this->conn;
    }
}
