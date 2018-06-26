<?php
    session_start();
    // header('Access-Control-Allow-Origin: http://gabeowens.com');
    header('Access-Control-Allow-Origin: http://portfolio.test');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, WWW-Authenticate, Origin, X-Requested-With, Content-Type, Accept');
    

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
                $expiration = new DateTime();
                $expiration->add(new DateInterval('PT30M'));
                $_SESSION['expiration'] = $expiration->format('Y-m-d H:i:s');

            }
        }
        echo json_encode($response);
    }

?>