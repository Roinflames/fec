<?php
// retorno.php

// Flow envía datos por GET o POST, típicamente con el parámetro commerceOrder o token
// Puedes leerlos y mostrar un mensaje simple

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $commerceOrder = $_GET['commerceOrder'] ?? 'N/A';
    $status = $_GET['status'] ?? 'N/A';  // a veces envían status o similar

    echo "<h1>Gracias por su compra</h1>";
    echo "<p>Orden de comercio: " . htmlspecialchars($commerceOrder) . "</p>";
    echo "<p>Estado: " . htmlspecialchars($status) . "</p>";
} else {
    echo "<p>Solicitud no válida</p>";
}
?>
