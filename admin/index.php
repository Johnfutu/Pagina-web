<?php
require_once __DIR__ . '/auth.php';
require_admin();
require_once __DIR__ . '/../api/db.php';

$status = $_GET['status'] ?? 'all';
$allowed = ['all','new','contacted','closed','spam'];
if (!in_array($status, $allowed, true)) $status = 'all';

$pdo = db();
if ($status === 'all') {
  $stmt = $pdo->query("SELECT * FROM leads ORDER BY created_at DESC LIMIT 200");
} else {
  $stmt = $pdo->prepare("SELECT * FROM leads WHERE status = :s ORDER BY created_at DESC LIMIT 200");
  $stmt->execute([':s'=>$status]);
}
$rows = $stmt->fetchAll();
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin - Leads</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <div class="container" style="padding:28px 0;">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <h1 style="margin:0;">Leads</h1>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <a class="btn btn--outline btn--sm" href="?status=all">Todos</a>
        <a class="btn btn--outline btn--sm" href="?status=new">Nuevos</a>
        <a class="btn btn--outline btn--sm" href="?status=contacted">Contactados</a>
        <a class="btn btn--outline btn--sm" href="?status=closed">Cerrados</a>
        <a class="btn btn--outline btn--sm" href="?status=spam">Spam</a>
        <a class="btn btn--sm btn--primary" href="logout.php">Salir</a>
      </div>
    </div>

    <div style="margin-top:16px; display:grid; gap:12px;">
      <?php foreach ($rows as $r): ?>
        <div class="card">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <div>
              <strong>#<?= (int)$r['id'] ?> · <?= htmlspecialchars($r['name']) ?></strong>
              <div class="muted" style="margin-top:4px;">
                <?= htmlspecialchars($r['source']) ?> · <?= htmlspecialchars($r['created_at']) ?> ·
                <span style="opacity:.9;">Estado: <strong><?= htmlspecialchars($r['status']) ?></strong></span>
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <a class="btn btn--outline btn--sm" href="leads_mark.php?id=<?= (int)$r['id'] ?>&s=contacted">Contactado</a>
              <a class="btn btn--outline btn--sm" href="leads_mark.php?id=<?= (int)$r['id'] ?>&s=closed">Cerrado</a>
              <a class="btn btn--outline btn--sm" href="leads_mark.php?id=<?= (int)$r['id'] ?>&s=spam">Spam</a>
            </div>
          </div>

          <div style="margin-top:10px; display:grid; gap:6px;">
            <div>📞 <a href="tel:<?= htmlspecialchars($r['phone']) ?>"><?= htmlspecialchars($r['phone']) ?></a></div>
            <div>✉️ <a href="mailto:<?= htmlspecialchars($r['email']) ?>"><?= htmlspecialchars($r['email']) ?></a></div>
            <?php if (!empty($r['service'])): ?><div>🧰 Servicio: <?= htmlspecialchars($r['service']) ?></div><?php endif; ?>
            <?php if (!empty($r['subject'])): ?><div>📝 Asunto: <?= htmlspecialchars($r['subject']) ?></div><?php endif; ?>
            <?php if (!empty($r['message'])): ?><div class="muted" style="white-space:pre-wrap;"><?= htmlspecialchars($r['message']) ?></div><?php endif; ?>
          </div>
        </div>
      <?php endforeach; ?>

      <?php if (count($rows) === 0): ?>
        <div class="card"><p class="muted" style="margin:0;">No hay leads.</p></div>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>