<?php

session_start(); 

header('Content-Type: application/json');

if (!isset($_SESSION['favorites'])) {
    $_SESSION['favorites'] = [];
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode([
            'status' => 'success',
            'data' => $_SESSION['favorites']
        ]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        if (isset($input['name']) && isset($input['lat']) && isset($input['lon'])) {
            
            $isExist = false;
            foreach ($_SESSION['favorites'] as $city) {
                if ($city['name'] === $input['name']) {
                    $isExist = true;
                    break;
                }
            }

            if (!$isExist) {
                $newCity = [
                    'id' => uniqid(), 
                    'name' => htmlspecialchars($input['name']), 
                    'lat' => $input['lat'],
                    'lon' => $input['lon'],
                    'country' => isset($input['country']) ? htmlspecialchars($input['country']) : ''
                ];

                array_push($_SESSION['favorites'], $newCity);

                echo json_encode([
                    'status' => 'success', 
                    'message' => 'Lokasi berhasil disimpan', 
                    'data' => $newCity
                ]);
            } else {
                echo json_encode([
                    'status' => 'info', 
                    'message' => 'Lokasi sudah ada di favorit'
                ]);
            }
        } else {
            http_response_code(400); // Bad Request
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $idToDelete = $_GET['id'];
            $initialCount = count($_SESSION['favorites']);

            $_SESSION['favorites'] = array_filter($_SESSION['favorites'], function($city) use ($idToDelete) {
                return $city['id'] !== $idToDelete;
            });

            $_SESSION['favorites'] = array_values($_SESSION['favorites']);

            if (count($_SESSION['favorites']) < $initialCount) {
                echo json_encode(['status' => 'success', 'message' => 'Lokasi dihapus']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID diperlukan']);
        }
        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan']);
        break;
}
?>