<?php
    session_start();
    require '../controllers/projectController.php';

    header('Access-Control-Allow-Origin: http://gabeowens.com');
    // header('Access-Control-Allow-Origin: http://portfolio.test');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, WWW-Authenticate, Origin, X-Requested-With, Content-Type, Accept');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $response = [
            'result' => False,
            'message' => 'Unauthorized'
        ];
        if(isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === True){
            $response['message'] = 'authenticated';
            if(isset($_SESSION['expiration']) && is_string($_SESSION['expiration'])){
                $response['message'] = 'expiration';
                $expiration = new DateTime($_SESSION['expiration']);
                $now = new DateTime();
                if ($now <= $expiration){
                    $expiration = new DateTime();
                    $expiration->add(new DateInterval('PT30M'));
                    $_SESSION['expiration'] = $expiration->format('Y-m-d H:i:s');

                    $requestBody = file_get_contents('php://input');
                    $post_vars = json_decode($requestBody);
                    if (isset($post_vars->projectId) && is_string($post_vars->projectId)){
                        $projectCtrl = new ProjectController($post_vars->projectId);
                        $response = [
                            'result' => true,
                            'project' => $projectCtrl->buildProjectObject()
                        ];
                    }else{
                        $response['message'] = 'Invalid project ID';
                    }
                }
            }
        }
        echo json_encode($response);
    }

?>