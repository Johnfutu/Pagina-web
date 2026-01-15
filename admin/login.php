<?php
session_start();
require_once __DIR__ . '/../api/config.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $u = $_POST['user'] ?? '';
  $p = $_POST['pass'] ?? '';
  if ($u === ADMIN_USER && $p === ADMIN_PASS) {
    $_SESSION['admin_ok'] = true;
    header('Location: index.php');
    exit;
  }
  $error = 'Credenciales incorrectas';
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin - Login</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <div class="container" style="padding:40px 0; max-width:520px;">
    <div class="card">
      <h1 style="margin-top:0;">Admin</h1>
      <p class="muted">Acceso al panel de leads.</p>
      <?php if ($error): ?>
        <p style="color:#fff;background:rgba(255,0,0,.15);padding:10px;border-radius:12px;border:1px solid rgba(255,0,0,.2)"><?= htmlspecialchars($error) ?></p>
      <?php endif; ?>
      <form class="form" method="post">
        <label><span>Usuario</span><input name="user" required></label>
        <label><span>Contraseña</span><input type="password" name="pass" required></label>
        <button class="btn btn--primary btn--block" type="submit">Entrar</button>
      </form>
    </div>
  </div>
</body>
</html>