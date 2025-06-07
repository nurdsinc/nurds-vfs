<?php
include('/var/www/html/bootstrap.php');
require_once "AfterInstall.php";

$app = new \Espo\Core\Application();

(new \AfterInstall())->run(
    $app->getContainer()
);
