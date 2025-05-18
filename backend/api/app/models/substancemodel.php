<?php
namespace app\models;
use app\core\db;
use PDO;

class SubstanceModel {
    public static function all(?string $q = ''): array {
        $pdo = DB::getInstance()->conn();
        if ($q !== '') {
            $stmt = $pdo->prepare('SELECT * FROM substances WHERE name LIKE :q');
            $stmt->execute([':q' => "%$q%"]);
        } else {
            $stmt = $pdo->query('SELECT * FROM substances');
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
