# Instrucciones de Deployment - Sistema de Renovación

## Paso 1: Configurar la Base de Datos

### En Supabase Dashboard:

1. Ir a **SQL Editor**
2. Crear una nueva query
3. Copiar el contenido de `scripts/setup-renewal-db.sql`
4. Ejecutar
5. Verificar que las columnas fueron creadas sin errores

**Campos que se crearán:**
- `renewal_token` (UUID único)
- `renewal_notified_at` (timestamp)
- `last_confirmed_at` (timestamp)
- `listing_status` (texto, valores: 'activa', 'inactiva_por_renovacion', 'finalizada')

---

## Paso 2: Configurar Variables de Entorno en Vercel

### En Vercel Dashboard:

1. Ir a **Settings → Environment Variables**
2. Agregar las siguientes variables:

```
CRON_SECRET = [generar un UUID aleatorio o string seguro]
NEXT_PUBLIC_APP_URL = https://viviendaya.com (o tu dominio)
```

**Las siguientes ya deben estar presentes:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

---

## Paso 3: Verificar/Actualizar vercel.json

### Archivo: `vercel.json`

Debe tener el siguiente cron job agregado:

```json
{
  "crons": [
    {
      "path": "/api/limpiar-reservas",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/renovar-propiedades-job",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Schedule explicado:**
- `0 0 * * *` = Se ejecuta todos los días a las 00:00 UTC
- Para cambiar: `0 9 * * MON` = Solo lunes a las 09:00 UTC
- [Ver más opciones de cron](https://crontab.guru/)

**Este archivo ya ha sido actualizado** ✓

---

## Paso 4: Deploy a Vercel

```bash
# Commitear cambios
git add .
git commit -m "feat: Agregar sistema automático de renovación de propiedades"
git push origin main
```

El deployment se ejecutará automáticamente en Vercel.

---

## Paso 5: Verificar que está funcionando

### Opción A: Revisar logs en Vercel

1. Ir a **Vercel Dashboard → Deployments → [Tu deployment]**
2. Bajar a **Logs**
3. Buscar requests a `/api/renovar-propiedades-job`
4. Verificar que dice "200" (exitoso)

### Opción B: Monitorear en tiempo real

```bash
vercel logs [URL] --tail
```

---

## Paso 6: Testing Manual (Opcional)

### Crear un token de prueba en la BD

```sql
UPDATE properties 
SET renewal_notified_at = NOW() - INTERVAL '1 hour'
WHERE id = 'test-property-123'
LIMIT 1;
```

### Acceder a la página de renovación

- URL: `https://viviendaya.com/renovar/[TOKEN]`
- Reemplazar `[TOKEN]` con el `renewal_token` de la propiedad

### Probar que el email se envía

El job se ejecuta a las **00:00 UTC**, pero puedes:

1. Cambiar manualmente `created_at` de una propiedad a hace 7+ días
2. Ejecutar un cron manual en Vercel (Settings → Function → Run)
3. O cambiar el schedule a cada minuto para testing: `* * * * *` (pero revertir después)

---

## Troubleshooting

### El cron no aparece en Vercel

- [ ] Verificar que `vercel.json` está en la raíz del proyecto
- [ ] Redeployar forzadamente: `vercel deploy --prod`
- [ ] Esperar 5 minutos a que se actualice

### Los emails no se envían

- [ ] Verificar que `RESEND_API_KEY` está correcto
- [ ] En Resend Dashboard: verificar que el dominio está confirmado
- [ ] Ver logs: `vercel logs [URL]/api/renovar-propiedades-job --tail`

### El modal no aparece en la app

- [ ] Verificar que `RenewalNotificationModal` está importado en `app/layout.tsx`
- [ ] Ir a DevTools → Console y buscar errores
- [ ] Verifica que el usuario esté logueado (`isLoggedIn = true`)
- [ ] Crear una propiedad de prueba y cambiar `renewal_notified_at` en BD

### El link del email no funciona

- [ ] Verificar que el link contiene el `renewal_token` correcto
- [ ] Verificar que la propiedad existe en BD con ese token
- [ ] El link expira en 24 horas desde `renewal_notified_at`

---

## Próximos Pasos

### Recomendado:

1. Revisar los logs después de la primera ejecución
2. Probar con un usuario real
3. Ajustar el schedule si es necesario (ej: cambiar horario)
4. Comunicar a los agentes sobre la nueva feature

### Opcional:

- Agregar analytics para ver tasa de renovación
- Implementar recordatorio por SMS/WhatsApp
- Permitir renovación automática para planes premium

---

## Rollback (Si algo sale mal)

1. Revertir cambios en `vercel.json` (remover el cron job)
2. En Supabase: marcar todas las propiedades como `listing_status = 'activa'`
3. Push a main: `git push origin main`

```sql
UPDATE properties SET listing_status = 'activa' WHERE listing_status = 'inactiva_por_renovacion';
```

---

## Contacto / Soporte

Si hay problemas:

1. Revisar logs: `vercel logs [URL] --tail`
2. Verificar base de datos en Supabase SQL Editor
3. Revisar status de Resend API
4. Revisar las variables de entorno en Vercel
