<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

function respond(int $code, array $payload) {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

function clean_str($v, $max=255) {
  $v = trim((string)$v);
  $v = preg_replace("/[\r\n]+/", " ", $v);
  if (mb_strlen($v) > $max) $v = mb_substr($v, 0, $max);
  return $v;
}

function get_body() {
  $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
  if (stripos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
  }
  // form-data o x-www-form-urlencoded
  return $_POST ?? [];
}

// --- Rate limit por IP (muy básico con archivos) ---
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$rlKey = sys_get_temp_dir() . '/lead_rl_' . md5($ip);
$now = time();
if ($ip) {
  if (file_exists($rlKey)) {
    $last = (int)file_get_contents($rlKey);
    if ($now - $last < RATE_LIMIT_SECONDS) {
      respond(429, ['ok'=>false, 'message'=>'Demasiadas solicitudes. Intenta en unos segundos.']);
    }
  }
  file_put_contents($rlKey, (string)$now);
}

$body = get_body();

$source  = clean_str($body['source'] ?? 'contact', 32);
$name    = clean_str($body['name'] ?? '', 120);
$phone   = clean_str($body['phone'] ?? '', 40);
$email   = clean_str($body['email'] ?? '', 180);
$service = clean_str($body['service'] ?? '', 80);
$subject = clean_str($body['subject'] ?? '', 180);
$message = trim((string)($body['message'] ?? ''));

if ($name === '' || $phone === '' || $email === '') {
  respond(400, ['ok'=>false, 'message'=>'Faltan campos obligatorios (nombre, teléfono, email).']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(400, ['ok'=>false, 'message'=>'Email no válido.']);
}

// Anti-spam simple: si trae un campo "website" (honeypot) y viene relleno -> spam
$honeypot = trim((string)($body['website'] ?? ''));
if ($honeypot !== '') {
  respond(200, ['ok'=>true, 'message'=>'OK']); // fingimos ok para no dar pistas
}

$ua = clean_str($_SERVER['HTTP_USER_AGENT'] ?? '', 255);

try {
  $pdo = db();
  $stmt = $pdo->prepare("
    INSERT INTO leads (source, name, phone, email, service, subject, message, ip, user_agent)
    VALUES (:source, :name, :phone, :email, :service, :subject, :message, :ip, :ua)
  ");
  $stmt->execute([
    ':source' => $source,
    ':name' => $name,
    ':phone' => $phone,
    ':email' => $email,
    ':service' => $service !== '' ? $service : null,
    ':subject' => $subject !== '' ? $subject : null,
    ':message' => $message !== '' ? $message : null,
    ':ip' => $ip !== '' ? $ip : null,
    ':ua' => $ua !== '' ? $ua : null,
  ]);

    // Email (simple). En shared hosting puede fallar si SPF/DKIM no están OK.
  $leadId = $pdo->lastInsertId();

  $mailSubject = "Nuevo lead (#$leadId) - " . ($source === 'hero' ? 'Hero' : 'Contacto');
  $mailBody =
    "Nuevo lead recibido\n\n" .
    "ID: $leadId\n" .
    "Origen: $source\n" .
    "Nombre: $name\n" .
    "Teléfono: $phone\n" .
    "Email: $email\n" .
    "Servicio: " . ($service ?: '-') . "\n" .
    "Asunto: " . ($subject ?: '-') . "\n" .
    "Mensaje:\n" . ($message ?: '-') . "\n\n" .
    "IP: " . ($ip ?: '-') . "\n";

  $from = 'contacto@montillasholding.com';

  $headers =
    "From: Montillas Holding <{$from}>\r\n" .
    "Reply-To: {$email}\r\n" .
    "Content-Type: text/plain; charset=UTF-8\r\n";

  // Envelope sender (-f) ayuda a la entregabilidad
  $sent = mail(LEADS_TO_EMAIL, $mailSubject, $mailBody, $headers, "-f {$from}");

  if (!$sent) {
    $lastError = error_get_last();
    error_log("MAIL() FAILED to=" . LEADS_TO_EMAIL . " err=" . json_encode($lastError));
    respond(500, ['ok'=>false, 'message'=>'No se pudo enviar el email.']);
  }
    respond(200, ['ok'=>true, 'message'=>'¡Gracias! Hemos recibido tu solicitud.']);

} catch (Throwable $e) {
  $msg = date('c') . " | " . $e->getMessage() . " | " . $e->getFile() . ":" . $e->getLine() . "\n";
  file_put_contents(__DIR__ . "/debug_leads.log", $msg, FILE_APPEND);
  respond(500, ['ok'=>false, 'message'=>'Error interno (revisar log).']);
}