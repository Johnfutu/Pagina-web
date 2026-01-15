<?php
session_start();
require_once __DIR__ . '/../api/config.php';

function require_admin() {
  if (!isset($_SESSION['admin_ok']) || $_SESSION['admin_ok'] !== true) {
    header('Location: login.php');
    exit;
  }
}