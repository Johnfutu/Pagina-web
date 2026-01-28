<?php
require_once __DIR__ . '/db.php';
header('Content-Type: text/plain; charset=utf-8');

try {
  $pdo = db();
  echo "DB OK\n";
} catch (Throwable $e) {
  echo "DB FAIL: " . $e->getMessage();
}