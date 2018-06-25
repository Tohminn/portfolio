<?php
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo 'Hello World';
    }    

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $requestBody = file_get_contents('php://input');
        $post_vars = json_decode($requestBody)
        if (isset($post_vars['username']) && isset($post_vars['password'])) {
            $response = [
                'login' => True,
                'username' => $post_vars['username'],
                'password' => $post_vars['password'],
            ];
            echo json_encode($response);
        }else{
            $response = [
                'login' => False,
                'requestBody' => $requestBody,
            ];
            echo json_encode($response);
        }
    }

?>