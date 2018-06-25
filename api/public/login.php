<?php
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, WWW-Authenticate, Origin, X-Requested-With, Content-Type, Accept');
    session_start();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo '404 - Not Found';
    }    

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $requestBody = file_get_contents('php://input');
        $response = [
            'login' => False,
            'requestBody' => $requestBody,
        ];
        $post_vars = json_decode($requestBody);
        if (isset($post_vars->username) && is_string($post_vars->username) && isset($post_vars->password) && is_string($post_vars->password)) {
            if (strtolower($post_vars->username) == 'gabe' && $post_vars->password == 'test'){
                $response = [
                    'login' => True
                ];
                $_SESSION['authenticated'] = True;
                // $now = new Datetime();
                
            }
        }
        echo json_encode($response);
    }

?>