<?php
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo 'Hello World';
    }    

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['username']) && isset($_POST['password'])) {
            echo 'login api';
        }
    }

?>