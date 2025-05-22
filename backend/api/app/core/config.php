<?php
namespace App\Core;

class Config {
    public const DB_HOST = 'localhost';
    public const DB_NAME = 'safeusedb';
    public const DB_USER = 'flotante';
    public const DB_PASS = 'flotante';
    public const DSN     = 'mysql:host=' . self::DB_HOST . ';dbname=' . self::DB_NAME . ';charset=utf8mb4';
}
