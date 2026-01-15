CREATE TABLE leads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(32) NOT NULL,              -- hero | contact
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(180) NOT NULL,
  service VARCHAR(80) NULL,
  subject VARCHAR(180) NULL,
  message TEXT NULL,
  ip VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  status ENUM('new','contacted','closed','spam') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_leads_status ON leads(status);