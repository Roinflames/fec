<?php
// notificacion.php

// Leer el contenido raw JSON o POST data
$input = file_get_contents('php://input');

// Guardar en un log para revisar
file_put_contents('flow_notification.log', date('Y-m-d H:i:s') . " - " . $input . PHP_EOL, FILE_APPEND);

// Puedes decodificar si quieres procesar datos
$data = json_decode($input, true);

// Aquí deberías validar la firma si quieres (opcional)

// Responder con 200 OK sin contenido
http_response_code(200);
exit;
?>
