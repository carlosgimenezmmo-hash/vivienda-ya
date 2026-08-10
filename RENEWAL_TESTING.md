// Testing the Renewal System

// =====================================================
// 1. TESTING LOCALLY (Desarrollo)
// =====================================================

// Set up a .env.local con:
// CRON_SECRET=test-secret-123
// NEXT_PUBLIC_SUPABASE_URL=https://...
// SUPABASE_SERVICE_ROLE_KEY=...
// RESEND_API_KEY=...
// NEXT_PUBLIC_APP_URL=http://localhost:3000

// =====================================================
// 2. TEST: Ejecutar el cron manualmente
// =====================================================

// En tu terminal (después de npm run dev):
// 
// curl -X GET \
//   'http://localhost:3000/api/renovar-propiedades-job' \
//   -H 'Authorization: Bearer test-secret-123'
//
// Deberías ver respuesta:
// {
//   "ok": true,
//   "notified": 0,
//   "errors": 0,
//   "deactivated": 0
// }

// =====================================================
// 3. TEST: Preparar datos de prueba
// =====================================================

// En Supabase SQL Editor, ejecutar:

-- Crear una propiedad de prueba
INSERT INTO properties (
  id,
  title,
  user_id,
  operation_type,
  property_type,
  price,
  currency,
  lat,
  lng,
  created_at,
  listing_status
) VALUES (
  'test-renewal-prop-1',
  'Casa Test para Renovación',
  'test-user-id',
  'venta',
  'casa',
  100000,
  'ARS',
  -34.603,
  -58.381,
  NOW() - INTERVAL '8 days',  -- Hace 8 días
  'activa'
);

-- Verificar que la propiedad existe
SELECT id, title, created_at, renewal_notified_at, listing_status 
FROM properties 
WHERE id = 'test-renewal-prop-1';

-- =====================================================
// 4. TEST: Ejecutar el cron (debería enviar email)
// =====================================================

// Ejecutar el curl del paso 2
// Si funciona, debería:
// - Generar renewal_token
// - Guardar renewal_notified_at
// - Enviar email (verificar en Resend dashboard)

// Respuesta esperada:
// {
//   "ok": true,
//   "notified": 1,
//   "errors": 0,
//   "deactivated": 0
// }

// =====================================================
// 5. TEST: Verificar que el token se guardó
// =====================================================

// En SQL:
SELECT id, title, renewal_token, renewal_notified_at 
FROM properties 
WHERE id = 'test-renewal-prop-1';

// Deberías ver un UUID en renewal_token y timestamp en renewal_notified_at

// =====================================================
// 6. TEST: Acceder a la página de renovación
// =====================================================

// En el navegador:
// http://localhost:3000/renovar/[RENEWAL_TOKEN]
// Reemplaza [RENEWAL_TOKEN] con el UUID del paso anterior

// Deberías ver:
// - Título: "Renovar propiedad"
// - Título de la propiedad: "Casa Test para Renovación"
// - Botones: "✓ Sigue disponible" y "✗ Ya se vendió"

// =====================================================
// 7. TEST: Hacer click en "Sigue disponible"
// =====================================================

// Debería:
// 1. Mostrar "Procesando..."
// 2. Guardar last_confirmed_at en BD
// 3. Mostrar mensaje "✓ Propiedad renovada exitosamente"
// 4. Redirigir a /dashboard en 3 segundos

// Verificar en SQL:
SELECT id, last_confirmed_at, renewal_notified_at 
FROM properties 
WHERE id = 'test-renewal-prop-1';

// last_confirmed_at debe tener un valor (NOW())
// renewal_notified_at debe ser NULL

// =====================================================
// 8. TEST: Hacer click en "Ya se vendió"
// =====================================================

// PRIMERO, volver a preparar la propiedad:
UPDATE properties 
SET renewal_notified_at = NOW(),
    last_confirmed_at = NULL,
    listing_status = 'activa'
WHERE id = 'test-renewal-prop-1';

// Luego hacer click en "Ya se vendió"
// Debería:
// 1. Mostrar "Procesando..."
// 2. Guardar listing_status = 'finalizada'
// 3. Mostrar mensaje "✓ Propiedad marcada como finalizada"
// 4. Redirigir a /dashboard

// Verificar en SQL:
SELECT listing_status 
FROM properties 
WHERE id = 'test-renewal-prop-1';

// Debe ser 'finalizada'

// =====================================================
// 9. TEST: Modal en la app
// =====================================================

// PREPARAR LA PROPIEDAD NUEVAMENTE:
UPDATE properties 
SET renewal_notified_at = NOW(),
    last_confirmed_at = NULL,
    listing_status = 'activa'
WHERE id = 'test-renewal-prop-1'
  AND user_id = 'test-user-id';

// Abrir la app y loguear con test-user-id
// Ir a cualquier página
// Deberías ver un modal: "Tu propiedad necesita renovación"
// Con botones para confirmar o finalizar

// =====================================================
// 10. TEST: Expiración en 24 horas
// =====================================================

// Preparar una propiedad hace 24+ horas:
UPDATE properties 
SET renewal_notified_at = NOW() - INTERVAL '25 hours',
    last_confirmed_at = NULL,
    listing_status = 'activa'
WHERE id = 'test-renewal-prop-1';

// Ejecutar el cron:
// curl -X GET \
//   'http://localhost:3000/api/renovar-propiedades-job' \
//   -H 'Authorization: Bearer test-secret-123'

// Verificar resultado:
// {
//   "ok": true,
//   "notified": 0,
//   "errors": 0,
//   "deactivated": 1  <-- Debe haber deactivated
// }

// Verificar en SQL:
SELECT listing_status 
FROM properties 
WHERE id = 'test-renewal-prop-1';

// Debe ser 'inactiva_por_renovacion'

// =====================================================
// 11. TEST: Links del email con query params
// =====================================================

// Acceder con ?action=confirm:
// http://localhost:3000/renovar/[TOKEN]?action=confirm
// Debería procesar automáticamente y mostrar éxito

// Acceder con ?action=done:
// http://localhost:3000/renovar/[TOKEN]?action=done
// Debería procesar automáticamente como finalizada

// =====================================================
// 12. TEST: Validación de token expirado
// =====================================================

// Preparar un token expirado (hace +24h):
UPDATE properties 
SET renewal_notified_at = NOW() - INTERVAL '25 hours',
    last_confirmed_at = NULL
WHERE id = 'test-renewal-prop-1';

// Acceder a:
// http://localhost:3000/renovar/[TOKEN]

// Debería mostrar:
// "El link de renovación ha expirado (máximo 24 horas)"

// =====================================================
// 13. PERFORMANCE TEST: Múltiples propiedades
// =====================================================

-- Crear 10 propiedades de prueba
WITH RECURSIVE numbers AS (
  SELECT 1 as n
  UNION ALL
  SELECT n + 1 FROM numbers WHERE n < 10
)
INSERT INTO properties (
  id,
  title,
  user_id,
  operation_type,
  property_type,
  price,
  currency,
  lat,
  lng,
  created_at,
  listing_status
)
SELECT
  'test-perf-' || LPAD(n::text, 2, '0'),
  'Test Property ' || n,
  'test-user-id',
  'venta',
  'casa',
  100000 + (n * 1000),
  'ARS',
  -34.603,
  -58.381,
  NOW() - INTERVAL '8 days',
  'activa'
FROM numbers;

// Ejecutar el cron:
// curl -X GET \
//   'http://localhost:3000/api/renovar-propiedades-job' \
//   -H 'Authorization: Bearer test-secret-123'

// Debería notificar 10 propiedades

// =====================================================
// 14. TEST: Modal con múltiples propiedades
// =====================================================

// Logear con test-user-id
// Abrir la app
// El modal debe mostrar barra de progreso (1 de 10)
// Botón "Después" para pasar a la siguiente

// =====================================================
// CLEANUP: Borrar datos de prueba
// =====================================================

// DELETE FROM properties WHERE id LIKE 'test-%';
// DELETE FROM properties WHERE id LIKE 'test-renewal-%';
// DELETE FROM properties WHERE id LIKE 'test-perf-%';

// =====================================================
// VERCEL TESTING (Production)
// =====================================================

// Después de deployar a Vercel:

// 1. Ver logs en tiempo real:
// vercel logs [URL] --tail

// 2. El cron se ejecutará a las 00:00 UTC automáticamente
// Puedes forzar una ejecución en Vercel Dashboard:
// Settings → Functions → Click en "renovar-propiedades-job"

// 3. Revisar que aparecen en los logs
// y que no hay errores

// =====================================================
// MONITORING EN PRODUCCIÓN
// =====================================================

// Crear alertas en Supabase para:
// - Propiedades marcadas como 'inactiva_por_renovacion'
// - Cambios en 'renewal_notified_at'

// Crear dashboard en Vercel para:
// - Hits al endpoint /api/renovar-propiedades-job
// - Tiempo de respuesta
// - Error rate

// Usar Resend Analytics para:
// - Tasa de apertura de emails
// - Click rate en botones
