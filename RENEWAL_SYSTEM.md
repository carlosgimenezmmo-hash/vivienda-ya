# Sistema de Renovación Automática de Propiedades

## Descripción General

Este sistema implementa un flujo automático de renovación de propiedades que:

1. **Cada 7 días**: Un job automático (cron) revisa propiedades activas
2. **Notificación**: Si la propiedad tiene más de 7 días publicada, envía:
   - Un email con Resend (con links para confirmar o finalizar)
   - Un cartel en la app (la próxima vez que el agente entra)
3. **Confirmación**: El agente puede responder desde el cartel o desde el email
4. **Expiración**: Si no responde en 24 horas, la propiedad baja del feed automáticamente

## Componentes Implementados

### 1. Job de Cron (`/app/api/renovar-propiedades-job/route.ts`)

**Endpoint**: `GET /api/renovar-propiedades-job`
**Frecuencia**: Cada 7 días (configurable en Vercel)

Lógica:
- Busca propiedades `activas` con `created_at` hace +7 días
- Genera un token único de renovación (UUID)
- Envía email con Resend
- Guarda `renewal_notified_at` con timestamp actual
- Verifica propiedades expiradas (24h sin confirmación) y las marca como `inactiva_por_renovacion`

**Variables de entorno necesarias:**
```
CRON_SECRET=tu_secret_aleatorio
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=https://viviendaya.com
```

### 2. Endpoint de Renovación (`/app/api/renovar/route.ts`)

**Endpoints**:
- `POST /api/renovar` - Confirmar o finalizar propiedad
- `GET /api/renovar?token=xxx` - Verificar estado del token

**POST Request**:
```json
{
  "token": "uuid-aqui",
  "action": "confirmar" | "finalizar"
}
```

**Validaciones**:
- Token debe ser válido
- Link expira en 24 horas
- Si acción es "confirmar": resetea `renewal_notified_at` y marca como `activa`
- Si acción es "finalizar": marca como `finalizada`

### 3. Componente Modal (`/components/renewal-notification-modal.tsx`)

**Ubicación**: Integrado en el layout principal

**Comportamiento**:
- Se muestra cuando el usuario inicia sesión
- Busca propiedades pendientes de renovación (últimas 24h)
- Permite confirmar o finalizar
- Si hay múltiples, muestra barra de progreso y botón "Después"
- Auto-cierra al completar todas

### 4. Página de Renovación (`/app/renovar/[token]/page.tsx`)

**URL**: `https://viviendaya.com/renovar/TOKEN?action=confirm|done`

**Características**:
- Accesible sin login (usando token)
- Links del email pueden hacer auto-submit con `?action=confirm` o `?action=done`
- Valida que el link no haya expirado
- Redirige a `/dashboard` tras completar

## Campos de Base de Datos Requeridos

Tabla `properties` debe tener:

```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS renewal_token UUID UNIQUE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS renewal_notified_at TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_confirmed_at TIMESTAMP;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_status TEXT DEFAULT 'activa';
-- listing_status valores: 'activa', 'inactiva_por_renovacion', 'finalizada'
```

## Configuración en Vercel

### 1. Agregar variables de entorno en Vercel Dashboard

```
CRON_SECRET=usar-un-valor-seguro-aleatorio-uuid
NEXT_PUBLIC_APP_URL=https://viviendaya.com (o tu dominio)
```

### 2. Configurar el Cron Job en `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/renovar-propiedades-job",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Opciones de schedule** (cron format):
- `0 0 * * MON` - Cada lunes a las 00:00 UTC
- `0 9 * * *` - Todos los días a las 09:00 UTC
- `*/5 * * * *` - Cada 5 minutos (¡no recomendado!)

### 3. (Alternativa) Usar `/next.config.mjs` para Crons

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config
  experimental: {
    crons: [
      {
        path: '/api/renovar-propiedades-job',
        schedule: '0 0 * * *', // Diario a las 00:00 UTC
      },
    ],
  },
}
export default nextConfig
```

## Email Template

El email enviado incluye:

- Nombre de la propiedad
- Aviso de que fue publicada hace +7 días
- Dos botones: "✓ Sigue disponible" y "✗ Ya se vendió"
- Botones con links seguros (usando token)
- Aviso de que expira en 24 horas
- Fallback para copiar link si no se ven los botones

## Flujo Completo de Usuario

### Caso 1: Agente responde desde la app

1. Agente abre la app
2. Ve modal "Tu propiedad necesita renovación"
3. Hace click en "✓ Sigue disponible" o "✗ Ya se vendió"
4. Sistema procesa la solicitud
5. Modal se cierra o pasa a siguiente propiedad

### Caso 2: Agente responde desde el email

1. Recibe email con links
2. Hace click en "✓ Sigue disponible" 
   - Se abre `https://viviendaya.com/renovar/TOKEN?action=confirm`
   - Se procesa automáticamente
   - Página muestra resultado exitoso
   - Redirige a `/dashboard` en 3s
3. O hace click en "✗ Ya se vendió"
   - Similar pero con `action=done`

### Caso 3: No responde en 24 horas

1. Cron job se ejecuta
2. Detecta propiedades con `renewal_notified_at` hace +24h y `last_confirmed_at` = null
3. Las marca como `listing_status = 'inactiva_por_renovacion'`
4. Desaparecen del feed automáticamente

## Testing

### 1. Verificar que el cron se ejecuta

```bash
# En Vercel Deployments, ver logs
vercel logs [deployment-url]/api/renovar-propiedades-job
```

### 2. Probar manualmente (solo en desarrollo)

```bash
curl "http://localhost:3000/api/renovar-propiedades-job?token=test" \
  -H "Authorization: Bearer tu_CRON_SECRET"
```

### 3. Simular token desde base de datos

```sql
UPDATE properties 
SET renewal_notified_at = NOW() - INTERVAL '1 hour'
WHERE id = 'test-property-id'
LIMIT 1;
```

Luego acceder a: `http://localhost:3000/renovar/TEST_TOKEN`

## Troubleshooting

### El email no se envía
- Verificar `RESEND_API_KEY` en variables de entorno
- Revisar que el dominio esté verificado en Resend
- Cambiar el `from` del email si es necesario

### El cron no se ejecuta
- Verificar que `vercel.json` o `next.config.mjs` esté correctamente configurado
- Asegurar que `CRON_SECRET` esté configurado en Vercel
- En Vercel Deployments, revisar los logs de ejecución

### El modal no aparece
- Verificar que `isLoggedIn` sea `true` en `useAuth()`
- Revisar la query en base de datos (debe haber propiedades con `renewal_notified_at` reciente)
- Abrir DevTools → Network para ver requests a `/api/renovar-propiedades-job`

### El link del email expira
- El link es válido por 24 horas desde `renewal_notified_at`
- Después de 24h, mostrar error "link expirado"
- El usuario sigue pudiendo usar el modal en la app

## Mejoras Futuras

- [ ] Recordatorio por SMS/WhatsApp si no responde en 12h
- [ ] Permitir renovación automática si tiene plan premium
- [ ] Analytics sobre tasa de renovación
- [ ] Reactivar propiedades marcadas como `inactiva_por_renovacion`
