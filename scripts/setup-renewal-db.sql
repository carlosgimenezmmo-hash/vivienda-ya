-- Script para configurar la base de datos para el sistema de renovación
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que la tabla properties existe y agregar columnas faltantes
ALTER TABLE properties ADD COLUMN IF NOT EXISTS renewal_token UUID UNIQUE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS renewal_notified_at TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_confirmed_at TIMESTAMP;

-- 2. Verificar listing_status y sus valores
-- (Si la columna no existe, crear con valor por defecto)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_status TEXT DEFAULT 'activa';

-- Los valores posibles de listing_status son:
-- 'activa' - propiedad publicada normalmente
-- 'pausada' - propiedad pausada (no aparece en feed, se mantiene)
-- 'finalizada' - propiedad vendida/alquilada
-- 'inactiva_por_renovacion' - propiedad baja del feed por no renovar en 24h

-- 3. Crear índices para optimizar queries de renovación
CREATE INDEX IF NOT EXISTS idx_properties_renewal 
ON properties(listing_status, renewal_notified_at, last_confirmed_at);

CREATE INDEX IF NOT EXISTS idx_properties_user_status 
ON properties(user_id, listing_status);

CREATE INDEX IF NOT EXISTS idx_properties_created_at 
ON properties(created_at);

-- 4. (Opcional) Verificar que existen los campos necesarios en users
-- Esto es para guardar las preferencias de notificación
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preference TEXT DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_whatsapp TEXT;

-- 5. Crear vista para propiedades pendientes de renovación
-- (Útil para queries complejas)
DROP VIEW IF EXISTS pending_renewals CASCADE;
CREATE VIEW pending_renewals AS
SELECT 
  p.id,
  p.title,
  p.user_id,
  p.created_at,
  p.renewal_notified_at,
  p.last_confirmed_at,
  p.renewal_token,
  EXTRACT(HOUR FROM (NOW() - p.renewal_notified_at)) as hours_since_notification,
  CASE 
    WHEN p.renewal_notified_at IS NULL THEN 'no_notified'
    WHEN EXTRACT(HOUR FROM (NOW() - p.renewal_notified_at)) > 24 THEN 'expired'
    WHEN p.last_confirmed_at IS NULL THEN 'pending'
    ELSE 'confirmed'
  END as renewal_status
FROM properties p
WHERE p.listing_status = 'activa'
AND EXTRACT(DAY FROM (NOW() - p.created_at)) >= 7;

-- 6. Crear función para marcar propiedades como inactivas por renovación expirada
-- (Puede ser llamada por el cron job)
CREATE OR REPLACE FUNCTION deactivate_expired_renewals()
RETURNS TABLE(deactivated_count int) AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE properties 
  SET listing_status = 'inactiva_por_renovacion'
  WHERE listing_status = 'activa'
  AND renewal_notified_at IS NOT NULL
  AND last_confirmed_at IS NULL
  AND EXTRACT(HOUR FROM (NOW() - renewal_notified_at)) > 24;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Actualizar propiedades existentes si es necesario
-- (Establer listing_status = 'activa' para todas las activas)
UPDATE properties 
SET listing_status = COALESCE(listing_status, 'activa')
WHERE listing_status IS NULL;

-- 8. Verificar columnas creadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'properties'
AND column_name IN ('renewal_token', 'renewal_notified_at', 'last_confirmed_at', 'listing_status')
ORDER BY ordinal_position;
