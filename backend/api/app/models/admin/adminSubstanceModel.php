<?php
namespace App\Models\Admin;

use App\Core\DB;
use PDO;

class AdminSubstanceModel {
    public static function createSubstance(array $data): int|false {
        $pdo = DB::getInstance()->conn();

        try {
            $pdo->beginTransaction();
            $sqlSustancia = "INSERT INTO sustancias (Nombre, Imagen, Titulo, Formula) VALUES (:nombre, :imagen, :titulo, :formula)";
            $stmtSustancia = $pdo->prepare($sqlSustancia);
            $stmtSustancia->execute([
                ':nombre'  => $data['Nombre'],
                ':imagen'  => $data['Imagen'],
                ':titulo'  => $data['Titulo'],
                ':formula' => $data['Formula'],
            ]);
            
            $idSustancia = (int)$pdo->lastInsertId();

            if (!$idSustancia) {
                $pdo->rollBack();
                error_log('Error creating substance: Failed to get lastInsertId for sustancias table.');
                return false;
            }
            $sqlDetalles = "INSERT INTO detalles_sustancia (
                                ID_Sustancia, descripcion, metodos_consumo, efectos_deseados, 
                                composicion, riesgos, interaccion_otras_sustancias, 
                                reduccion_riesgos, legislacion
                            ) VALUES (
                                :id_sustancia, :descripcion, :metodos_consumo, :efectos_deseados, 
                                :composicion, :riesgos, :interaccion_otras_sustancias, 
                                :reduccion_riesgos, :legislacion
                            )";
            $stmtDetalles = $pdo->prepare($sqlDetalles);
            $stmtDetalles->execute([
                ':id_sustancia'                 => $idSustancia,
                ':descripcion'                  => $data['descripcion'],
                ':metodos_consumo'              => $data['metodos_consumo'],
                ':efectos_deseados'             => $data['efectos_deseados'],
                ':composicion'                  => $data['composicion'],
                ':riesgos'                      => $data['riesgos'],
                ':interaccion_otras_sustancias' => $data['interaccion_otras_sustancias'],
                ':reduccion_riesgos'            => $data['reduccion_riesgos'],
                ':legislacion'                  => $data['legislacion'],
            ]);

            $pdo->commit();
            return $idSustancia;

        } catch (\PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Error creating substance and details: ' . $e->getMessage() . ' Data: ' . print_r($data, true));
            return false;
        }
    }

    public static function updateSubstance(int $id, array $data, ?array $imageFile): bool {
        $pdo = DB::getInstance()->conn();
        
        $stmtCurrent = $pdo->prepare("SELECT Nombre, Imagen FROM sustancias WHERE ID_Sustancia = :id");
        $stmtCurrent->bindParam(':id', $id, \PDO::PARAM_INT);
        $stmtCurrent->execute();
        $currentSubstance = $stmtCurrent->fetch(\PDO::FETCH_ASSOC);

        if (!$currentSubstance) {
            error_log("Substance with ID $id not found for update.");
            return false; 
        }

        $oldImagePath = $currentSubstance['Imagen'];
        $currentNombreForPath = $currentSubstance['Nombre'];

        $pdo->beginTransaction();
        try {
            $newImagePath = $oldImagePath; 
            if (isset($imageFile) && $imageFile['error'] === UPLOAD_ERR_OK) {
                $nombreForFolder = $data['Nombre'] ?? $currentNombreForPath; 
                $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nombreForFolder);
                $targetDir = __DIR__ . '/../../../../uploads/sustancias/' . $sanitizedName . '/';

                if (!is_dir($targetDir)) {
                    if (!mkdir($targetDir, 0777, true) && !is_dir($targetDir)) {
                        throw new \RuntimeException(sprintf('Directory \"%s\" was not created', $targetDir));
                    }
                }

                $imageFileType = strtolower(pathinfo($imageFile['name'], PATHINFO_EXTENSION));
                $newFileName = uniqid('img_', true) . '.' . $imageFileType;
                $targetFilePath = $targetDir . $newFileName;

                if (move_uploaded_file($imageFile['tmp_name'], $targetFilePath)) {
                    $newImagePath = $sanitizedName . '/' . $newFileName;

                    if ($oldImagePath && $oldImagePath !== $newImagePath && file_exists(__DIR__ . '/../../../../' . $oldImagePath)) {
                        unlink(__DIR__ . '/../../../../' . $oldImagePath);
                    }
                } else {
                    $pdo->rollBack();
                    error_log('Failed to move uploaded image for substance ID: ' . $id);
                    return false;
                }
            } else {
            //  If Nombre changed, move existing image to new folder based on new Nombre.
                if (isset($data['Nombre']) && $data['Nombre'] !== $currentNombreForPath && !empty($oldImagePath)) {
                    $newNombreForFolder = $data['Nombre'];
                    $newSanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $newNombreForFolder);
                    $newTargetDir = __DIR__ . '/../../../../uploads/sustancias/' . $newSanitizedName . '/';
                    $oldFileName = basename($oldImagePath);
                    $newPotentialPathInDB = 'uploads/sustancias/' . $newSanitizedName . '/' . $oldFileName;
                    $newAbsoluteTargetPath = $newTargetDir . $oldFileName;
                    $oldAbsoluteSourcePath = __DIR__ . '/../../../../' . $oldImagePath;

                    if (file_exists($oldAbsoluteSourcePath)) {
                        if (!is_dir($newTargetDir)) {
                            if (!mkdir($newTargetDir, 0777, true) && !is_dir($newTargetDir)) {
                               throw new \RuntimeException(sprintf('Directory \"%s\" was not created for image move', $newTargetDir));
                            }
                        }
                        if (rename($oldAbsoluteSourcePath, $newAbsoluteTargetPath)) {
                            $newImagePath = $newPotentialPathInDB;
                            $oldSanitizedNameForDir = preg_replace('/[^a-zA-Z0-9_-]/', '_', $currentNombreForPath);
                            $oldDir = __DIR__ . '/../../../../uploads/sustancias/' . $oldSanitizedNameForDir . '/';
                            if (is_dir($oldDir) && count(scandir($oldDir)) == 2) { 
                                rmdir($oldDir);
                            }
                        } else {
                            error_log("Failed to move image from $oldAbsoluteSourcePath to $newAbsoluteTargetPath for substance ID $id when name changed.");
                        }
                    }
                }
            }
            $sqlSustancias = "UPDATE sustancias SET Nombre = :Nombre, Titulo = :Titulo, Formula = :Formula, Imagen = :Imagen WHERE ID_Sustancia = :ID_Sustancia";
            $stmtSustancias = $pdo->prepare($sqlSustancias);
            $stmtSustancias->bindParam(':Nombre', $data['Nombre']);
            $stmtSustancias->bindParam(':Titulo', $data['Titulo']);
            $stmtSustancias->bindParam(':Formula', $data['Formula']);
            $stmtSustancias->bindParam(':Imagen', $newImagePath);
            $stmtSustancias->bindParam(':ID_Sustancia', $id, \PDO::PARAM_INT);
            $stmtSustancias->execute();
 
            $stmtCheckDetails = $pdo->prepare("SELECT COUNT(*) FROM detalles_sustancia WHERE ID_Sustancia = :id");
            $stmtCheckDetails->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmtCheckDetails->execute();
            $detailsExist = $stmtCheckDetails->fetchColumn() > 0;

            if ($detailsExist) {
                $sqlDetalles = "UPDATE detalles_sustancia SET 
                                    descripcion = :descripcion, 
                                    metodos_consumo = :metodos_consumo, 
                                    efectos_deseados = :efectos_deseados, 
                                    composicion = :composicion, 
                                    riesgos = :riesgos, 
                                    interaccion_otras_sustancias = :interaccion_otras_sustancias, 
                                    reduccion_riesgos = :reduccion_riesgos, 
                                    legislacion = :legislacion
                                WHERE ID_Sustancia = :ID_Sustancia";
            } else {
                $sqlDetalles = "INSERT INTO detalles_sustancia (ID_Sustancia, descripcion, metodos_consumo, efectos_deseados, composicion, riesgos, interaccion_otras_sustancias, reduccion_riesgos, legislacion) 
                                VALUES (:ID_Sustancia, :descripcion, :metodos_consumo, :efectos_deseados, :composicion, :riesgos, :interaccion_otras_sustancias, :reduccion_riesgos, :legislacion)";
            }
            
            $stmtDetalles = $pdo->prepare($sqlDetalles);
            $detailsData = [
                'descripcion' => $data['descripcion'] ?? null,
                'metodos_consumo' => $data['metodos_consumo'] ?? null,
                'efectos_deseados' => $data['efectos_deseados'] ?? null,
                'composicion' => $data['composicion'] ?? null,
                'riesgos' => $data['riesgos'] ?? null,
                'interaccion_otras_sustancias' => $data['interaccion_otras_sustancias'] ?? null,
                'reduccion_riesgos' => $data['reduccion_riesgos'] ?? null,
                'legislacion' => $data['legislacion'] ?? null,
            ];

            $stmtDetalles->bindParam(':descripcion', $detailsData['descripcion']);
            $stmtDetalles->bindParam(':metodos_consumo', $detailsData['metodos_consumo']);
            $stmtDetalles->bindParam(':efectos_deseados', $detailsData['efectos_deseados']);
            $stmtDetalles->bindParam(':composicion', $detailsData['composicion']);
            $stmtDetalles->bindParam(':riesgos', $detailsData['riesgos']);
            $stmtDetalles->bindParam(':interaccion_otras_sustancias', $detailsData['interaccion_otras_sustancias']);
            $stmtDetalles->bindParam(':reduccion_riesgos', $detailsData['reduccion_riesgos']);
            $stmtDetalles->bindParam(':legislacion', $detailsData['legislacion']);
            $stmtDetalles->bindParam(':ID_Sustancia', $id, \PDO::PARAM_INT);
            $stmtDetalles->execute();

            $pdo->commit();
            return true;

        } catch (\PDOException $e) {
            $pdo->rollBack();
            error_log('PDO Error updating substance ID ' . $id . ': ' . $e->getMessage());
            return false;
        } catch (\RuntimeException $e) {
            $pdo->rollBack();
            error_log('Runtime Error updating substance ID ' . $id . ': ' . $e->getMessage());
            return false;
        }
    }
 
    public static function deleteById(int $id): bool {
        $pdo = DB::getInstance()->conn();

        try {
            $pdo->beginTransaction();
 
            $stmtSelectImage = $pdo->prepare("SELECT Imagen, Nombre FROM sustancias WHERE ID_Sustancia = :id");
            $stmtSelectImage->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtSelectImage->execute();
            $substanceData = $stmtSelectImage->fetch(PDO::FETCH_ASSOC);
            $imagePathInDb = $substanceData ? $substanceData['Imagen'] : null;
            $substanceName = $substanceData ? $substanceData['Nombre'] : null; 
            $sqlDeleteDetails = "DELETE FROM detalles_sustancia WHERE ID_Sustancia = :id";
            $stmtDeleteDetails = $pdo->prepare($sqlDeleteDetails);
            $stmtDeleteDetails->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtDeleteDetails->execute(); 
            $sqlDeleteSubstance = "DELETE FROM sustancias WHERE ID_Sustancia = :id";
            $stmtDeleteSubstance = $pdo->prepare($sqlDeleteSubstance);
            $stmtDeleteSubstance->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtDeleteSubstance->execute();

            if ($stmtDeleteSubstance->rowCount() === 0) { 
                $pdo->rollBack();
                error_log("Intento de eliminar sustancia con ID $id no encontrada.");
                return false;
            }
 
            if ($imagePathInDb) {
                $fullImagePath = $_SERVER['DOCUMENT_ROOT'] . '/TFG/SafeUse/' . $imagePathInDb;
                if (file_exists($fullImagePath) && is_file($fullImagePath)) {
                    if (!unlink($fullImagePath)) {
                        error_log("No se pudo eliminar el archivo de imagen: $fullImagePath");
                         
                    }
                }
 
                if ($substanceName) {
                    $substanceFolderName = strtolower(preg_replace('/[^a-zA-Z0-9_-]+/', '', str_replace(' ', '_', $substanceName)));
                    $substanceDirectory = $_SERVER['DOCUMENT_ROOT'] . 'https://safeuse-lkde.onrender.com/uploads/sustancias/' . $substanceFolderName;
                    
                    if (is_dir($substanceDirectory)) {
                     
                        $items = array_diff(scandir($substanceDirectory), ['.', '..']);
                        if (empty($items)) {
                            if (!rmdir($substanceDirectory)) {
                                error_log("No se pudo eliminar el directorio vacío: $substanceDirectory");
                            }
                        }
                    }
                }
            }

            $pdo->commit();
            return true;

        } catch (\PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Error eliminando sustancia con ID ' . $id . ': ' . $e->getMessage());
            return false;
        } catch (\Exception $e) {
       
            if ($pdo->inTransaction()) {
                $pdo->rollBack();  
            }
            error_log('Error general durante la eliminación de sustancia con ID ' . $id . ': ' . $e->getMessage());
            return false;
        }
    }
}
