<?php
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo 'Hello World';
    }    

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['username']) && isset($_POST['password'])) {
            $response = [
                'login' => True,
                'username' => $_POST['username'],
                'password' => $_POST['password'],
            ];
            echo json_encode($response);
        }else{
            $response = [
                'login' => False,
                'username' => $_POST['username'],
                'password' => $_POST['password'],
            ];
            echo json_encode($response);
        }
    }

?>