<?php
    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo 'Hello World';
    }

?>