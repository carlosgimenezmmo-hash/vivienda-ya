# Checklist de Deployment - Sistema de Renovación

Completar antes de hacer deploy a producción.

---

## ☐ Fase 1: Preparación de Base de Datos

- [ ] Acceder a Supabase Dashboard
- [ ] Ir a SQL Editor
- [ ] Crear nueva query
- [ ] Copiar contenido de `scripts/setup-renewal-db.sql`
- [ ] Ejecutar la query
- [ ] Verificar que NO hay errores
- [ ] Ejecutar query de verificación:
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'properties' 
  AND column_name IN ('renewal_token', 'renewal_notified_at', 'last_confirmed_at', 'listing_status');
  ```
- [ ] Confirmar que aparecen las 4 columnas

---

## ☐ Fase 2: Variables de Entorno

### En Vercel Dashboard:

- [ ] Ir a **Settings → Environment Variables**
- [ ] Generar un CRON_SECRET seguro:
  ```bash
  # En terminal:
  openssl rand -hex 32
  # O usar: https://www.uuidgenerator.net/
  ```
- [ ] Agregar variable:
  - **Name:** `CRON_SECRET`
  - **Value:** `[el_valor_generado]`
  - **Environments:** Production
  
- [ ] Agregar variable:
  - **Name:** `NEXT_PUBLIC_APP_URL`
  - **Value:** `https://viviendaya.com` (o tu dominio)
  - **Environments:** Production, Preview, Development

- [ ] Verificar que existen:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `RESEND_API_KEY`

---

## ☐ Fase 3: Verificar Configuración

- [ ] Abrir `/vercel.json`
- [ ] Verificar que contiene:
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
- [ ] Si no está, agregar (mantener otros crons)

- [ ] Abrir `/app/layout.tsx`
- [ ] Verificar import:
  ```typescript
  import { RenewalNotificationModal } from "@/components/renewal-notification-modal"
  ```
- [ ] Verificar que está en el JSX: `<RenewalNotificationModal />`

- [ ] Verificar que existen estos archivos:
  - [ ] `/app/api/renovar-propiedades-job/route.ts`
  - [ ] `/components/renewal-notification-modal.tsx`
  - [ ] `/app/renovar/[token]/page.tsx`

---

## ☐ Fase 4: Testing Local

```bash
# 1. Iniciar servidor
npm run dev

# 2. En Supabase SQL Editor:
UPDATE properties 
SET created_at = NOW() - INTERVAL '8 days'
WHERE id = 'ANY-PROP-ID'
LIMIT 1;

# 3. Llamar endpoint manualmente
curl -X GET \
  'http://localhost:3000/api/renovar-propiedades-job' \
  -H 'Authorization: Bearer test-secret'
```

- [ ] El endpoint responde con status 200
- [ ] Respuesta incluye: `{"ok": true, "notified": 1, ...}`
- [ ] En Supabase, la propiedad tiene `renewal_token` (UUID)
- [ ] En Supabase, la propiedad tiene `renewal_notified_at` (timestamp)

---

## ☐ Fase 5: Verificar Emails

- [ ] Abrir Resend Dashboard
- [ ] Verificar dominio `@viviendaya.com` esté confirmado
- [ ] Si no: agregar SPF/DKIM records a tu DNS

**En caso de error de email:**
- [ ] Revisar que `RESEND_API_KEY` es correcto
- [ ] Revisar que el dominio está verificado en Resend
- [ ] Probar con un email de test (prueba@gmail.com, etc.)

---

## ☐ Fase 6: Hacer Deploy

```bash
# 1. Commitear cambios
git add .
git commit -m "feat: Sistema automático de renovación de propiedades

- Job cron que ejecuta cada 7 días
- Busca propiedades activas > 7 días publicadas
- Envía emails con Resend
- Modal en la app para confirmar o finalizar
- Auto-baja del feed si no responde en 24h
- Completar RENEWAL_SYSTEM.md para documentación"

# 2. Push a main
git push origin main

# 3. Esperar que Vercel complete el deploy
```

- [ ] Deployment completado sin errores
- [ ] Todas las variables de entorno están confirmadas

---

## ☐ Fase 7: Verificar en Producción

### En Vercel Dashboard:

- [ ] Ir a **Deployments → [Tu deployment actual]**
- [ ] Bajar a **Logs**
- [ ] Buscar: `/api/renovar-propiedades-job`
- [ ] Verificar status: `200` ✅

### Verificar que el cron está activo:

- [ ] En Vercel, ir a **Settings → Cron Jobs**
- [ ] Debe aparecer: `/api/renovar-propiedades-job` con status `enabled`
- [ ] Si no aparece: Ir a **Deployments** y hacer re-deploy forzado
  ```bash
  vercel deploy --prod
  ```

### Testing en Prod:

- [ ] Acceder a `https://viviendaya.com/renovar/[TOKEN]`
- [ ] Reemplazar [TOKEN] con un token válido de base de datos
- [ ] Debe mostrar la página de renovación correctamente

- [ ] Loguear con una cuenta de test
- [ ] Revisar que el modal aparece si hay renovaciones pendientes
- [ ] Hacer click en un botón y verificar que funciona

---

## ☐ Fase 8: Comunicación a Agentes

- [ ] Preparar un email/notificación para los agentes
- [ ] Explicar el nuevo proceso:
  - "Cada 7 días reciben notificación por email"
  - "Tienen 24h para responder"
  - "Pueden responder desde la app o el email"
  - "Si no responden, la propiedad baja del feed"

---

## ☐ Fase 9: Monitoreo Inicial

Durante los primeros 7 días:

- [ ] Revisar logs de Vercel diariamente
- [ ] Verificar que no hay errores
- [ ] Revisar emails enviados en Resend
- [ ] Monitorear base de datos (propiedades con `renewal_notified_at`)
- [ ] Recopilar feedback de agentes

---

## ☐ Rollback (Si algo sale mal)

Si hay problemas críticos:

```bash
# 1. Revertir vercel.json
# Remover la entrada del cron

# 2. En Supabase, restaurar propiedades
UPDATE properties SET listing_status = 'activa' 
WHERE listing_status = 'inactiva_por_renovacion';

# 3. Push
git push origin main
```

- [ ] Rollback completado
- [ ] Sistema funcionando normalmente

---

## 📝 Notas Importantes

**Horario de Ejecución:**
- El cron se ejecuta a las **00:00 UTC** (medianoche)
- En Argentina (ART): **21:00 del día anterior** (UTC-3)

**Validación:**
- El primer cron se ejecutará a las 00:00 UTC del día siguiente
- No se ejecuta inmediatamente al hacer deploy

**Versionado:**
- Guardar este checklist completado como referencia
- Anotar cualquier problema encontrado y cómo se resolvió

---

## ✅ Criterios de Aceptación

El sistema está correctamente deployado si:

- [ ] Job de cron se ejecuta cada día sin errores
- [ ] Emails se envían correctamente a los agentes
- [ ] Modal aparece en la app cuando hay renovaciones pendientes
- [ ] El botón "Sigue disponible" actualiza la base de datos
- [ ] El botón "Ya se vendió" marca como finalizada
- [ ] Link del email funciona y auto-completa
- [ ] Propiedades se dan de baja si no responden en 24h
- [ ] No hay errores en los logs de Vercel

---

## 🎯 Próximos Pasos

Después de verificar:

1. [ ] Crear documentación para el equipo de soporte
2. [ ] Implementar dashboard de analytics (fase 2)
3. [ ] Agregar recordatorio por SMS/WhatsApp (fase 2)
4. [ ] Permitir renovación automática para premium (fase 2)

---

**Inicio de Checklist:** [Fecha]  
**Completado:** [Fecha]  
**Responsable:** [Nombre]  
**Status:** [ ] En Progreso | [ ] Completado | [ ] Con Problemas

**Notas:**

---

**Fecha de Deployment:** 2026-08-10
