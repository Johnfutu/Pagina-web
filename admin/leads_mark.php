<?php
require_once __DIR__ . '/auth.php';
require_admin();
require_once __DIR__ . '/../api/db.php';

$id = (int)($_GET['id'] ?? 0);
$s  = $_GET['s'] ?? 'new';
$allowed = ['new','contacted','closed','spam'];
if ($id <= 0 || !in_array($s, $allowed, true)) {
  header('Location: index.php');
  exit;
}
$pdo = db();
$stmt = $pdo->prepare("UPDATE leads SET status = :s WHERE id = :id");
$stmt->execute([':s'=>$s, ':id'=>$id]);
header('Location: index.php');