<?php
// Llaves de Flow (sandbox)
$apiKey = '1F522BCF-2CB5-45F9-8EA4-8016C933L426';
$secretKey = '8d7c176d79c7811e3406cab4edb699914d6341ce';

// Datos del pago
$commerceOrder = '12345';
$subject = 'Pago de prueba desde PHP';
$currency = 'CLP';
$amount = '1000';
$email = 'rod.reyes.s@gmail.com';
$urlReturn = 'https://comunidadvirtual.cl/retorno';
$urlConfirmation = 'https://comunidadvirtual.cl/notificacion';

// Construir el mensaje en orden alfabético, sin urlencode
$message =
    'amount=' . $amount .
    '&apiKey=' . $apiKey .
    '&commerceOrder=' . $commerceOrder .
    '&currency=' . $currency .
    '&email=' . $email .
    '&subject=' . $subject .
    '&urlConfirmation=' . $urlConfirmation .
    '&urlReturn=' . $urlReturn;

// Generar firma
$signature = hash_hmac('sha256', $message, $secretKey);

// Datos a enviar
$postData = [
    'apiKey' => $apiKey,
    'commerceOrder' => $commerceOrder,
    'subject' => $subject,
    'currency' => $currency,
    'amount' => $amount,
    'email' => $email,
    'urlReturn' => $urlReturn,
    'urlConfirmation' => $urlConfirmation, // ✅ ahora coincide con la firma
    's' => $signature
];

// Enviar solicitud
$ch = curl_init('https://sandbox.flow.cl/api/payment/create');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
$response = curl_exec($ch);
curl_close($ch);

// Mostrar resultado
$result = json_decode($response, true);
if (isset($result['url'])) {
    echo "Redireccionar al cliente a: " . $result['url'];
} else {
    echo "Error en la creación del pago:\n";
    print_r($result);
}
?>
