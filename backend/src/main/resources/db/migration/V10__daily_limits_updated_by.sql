-- Auditoria: registra qual admin alterou o limite (tabela controla custo de API).
ALTER TABLE daily_limits ADD COLUMN updated_by UUID REFERENCES tb_user(uuid);