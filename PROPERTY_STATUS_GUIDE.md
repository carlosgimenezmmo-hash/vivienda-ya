# Sistema de Gestión de Estado de Propiedades

## Estados Disponibles

Las propiedades ahora tienen 4 estados diferentes:

### 1. **ACTIVA** (Verde)
- La propiedad está publicada en el feed
- Visible para todos los usuarios
- Se muestra en búsquedas y recomendaciones
- El agente puede renovarla, pausarla o finalizarla

### 2. **PAUSADA** (Púrpura)
- La propiedad NO aparece en el feed
- NO es visible para otros usuarios
- La propiedad NO se elimina de la base de datos
- El agente puede reactivarla en cualquier momento haciendo click en "Renovar"
- Útil cuando quiere pausar temporalmente sin perder la propiedad

### 3. **FINALIZADA** (Gris)
- La propiedad fue vendida o alquilada
- NO aparece en el feed
- El agente no puede editar la propiedad
- Se mantiene en el histórico para estadísticas
- Si el agente quiere reactivarla, debe hacer click en "Renovar"

### 4. **INACTIVA_POR_RENOVACION** (Automático)
- La propiedad se baja automáticamente si no responde en 24h
- Se genera cuando el sistema envía renovación y el agente no confirma
- El agente puede reactivarla haciendo click en "Renovar"

---

## Botones en el Dashboard

### 🔄 Renovar (Verde)
```
Click: Renovar la propiedad
- Si está PAUSADA → Vuelve a ACTIVA
- Si está FINALIZADA → Vuelve a ACTIVA
- Si está INACTIVA_POR_RENOVACION → Vuelve a ACTIVA
- Si está ACTIVA → Resetea el contador de 7 días
```

**Cuando aparece:** Siempre disponible (todas las propiedades)

**Efecto:** 
- Cambia `listing_status` a `activa`
- Guarda `last_confirmed_at` = NOW()
- Limpia `renewal_notified_at`

### ⏸ Pausar (Púrpura)
```
Click: Pausar la propiedad
- La propiedad desaparece del feed
- NO se elimina
- Puede reactivarse en cualquier momento
```

**Cuando aparece:** Siempre disponible

**Efecto:**
- Cambia `listing_status` a `pausada`
- La propiedad no aparece en búsquedas/feeds

**Casos de uso:**
- Temporada baja y no quiero eliminar
- Tengo muchas consultas y necesito pausa
- Estoy de vacaciones y no puedo atender

### ✓ Finalizar (Rojo)
```
Click: Marcar como vendida o alquilada
- La propiedad se da de baja permanentemente
- NO desaparece (queda en histórico)
- Se puede reactivar con Renovar si fue error
```

**Cuando aparece:** Siempre disponible

**Efecto:**
- Cambia `listing_status` a `finalizada`
- Se mantiene en la base de datos
- No aparece en feed

**Casos de uso:**
- Ya vendí la propiedad
- Ya alquilé la propiedad
- Cambié de idea y después puedo reactivar

---

## Diferencias: PAUSADA vs FINALIZADA

| Acción | PAUSADA | FINALIZADA |
|--------|---------|-----------|
| **Aparece en feed** | ❌ No | ❌ No |
| **Se elimina** | ❌ No | ❌ No |
| **Se puede reactivar** | ✅ Sí (Renovar) | ✅ Sí (Renovar) |
| **Intención del usuario** | Pausa temporal | Transacción completa |
| **Aparece en histórico** | ✅ Sí | ✅ Sí |
| **Cuenta en estadísticas** | Según filtro | Según filtro |

---

## Flujo de Renovación Automática

```
[Cada 7 días]
  ↓
[Sistema busca: activa + created_at > 7 días]
  ↓
[Envía email + crea token]
  ↓
[Agente no responde en 24h]
  ↓
[Status = 'inactiva_por_renovacion']
  ↓
[Desaparece del feed]
  ↓
[Agente puede reactivar con "Renovar"]
```

---

## API Endpoint

### POST `/api/cambiar-estado-propiedad`

**Request:**
```json
{
  "propertyId": 123,
  "action": "renovar" | "pausar" | "finalizar"
}
```

**Headers requeridos:**
```
Authorization: Bearer [access_token]
Content-Type: application/json
```

**Response:**
```json
{
  "ok": true,
  "message": "Propiedad renovada exitosamente",
  "status": "activa"
}
```

**Validaciones:**
- Usuario debe ser dueño de la propiedad
- Token debe ser válido
- propertyId debe existir

---

## Base de Datos

Campo `listing_status` en tabla `properties`:

```sql
-- Posibles valores:
'activa'                  -- Publicada normalmente
'pausada'                 -- Pausada por el agente
'finalizada'              -- Vendida/alquilada
'inactiva_por_renovacion' -- Baja automática por no renovar
```

---

## Frontend - Dashboard

### Header
Muestra desglose de propiedades:
```
✓ 3 activas · 1 pausada · 1 finalizada (Total: 5)
```

### Badges
Cada propiedad muestra su estado:
- DESTACADO (amarillo)
- GPS (verde)
- PAUSADA (púrpura) - nuevo
- FINALIZADA (gris) - nuevo

### Botones
Tres botones por propiedad:
- ↻ Renovar (verde)
- ⏸ Pausar (púrpura)
- ✓ Finalizar (rojo)

---

## Casos de Uso Reales

### Caso 1: Agente con temporada baja
```
1. Publica 5 propiedades en enero
2. En julio, vende 2 de ellas → Finalizar
3. Las otras 3 están lentas → Pausar
4. En septiembre quiere reactivar → Renovar
5. Todo visible en dashboard
```

### Caso 2: Renovación automática
```
1. Propiedad publicada hace 7 días
2. Sistema envía email
3. Agente no responde en 24h
4. Status automático = 'inactiva_por_renovacion'
5. Propiedad baja del feed
6. Agente ve en dashboard y hace click "Renovar"
7. Propiedad vuelve a estar activa
```

### Caso 3: Error
```
1. Agente marca "Finalizada" por error
2. Se da cuenta después
3. Va a dashboard y hace click "Renovar"
4. Propiedad vuelve a estar activa
5. No hay pérdida de datos
```

---

## Impacto en Otras Funcionalidades

### Feed (app/feed/page.tsx)
- Mostrar solo propiedades con `listing_status = 'activa'`
- Excluir pausadas, finalizadas, inactiva_por_renovacion

### Búsqueda (app/buscar/page.tsx)
- Mostrar solo propiedades con `listing_status = 'activa'`

### Mapa (app/mapa/page.tsx)
- Mostrar solo propiedades con `listing_status = 'activa'` y `mostrar_en_mapa = true`

### Mi Perfil (app/perfil/page.tsx)
- Mostrar propiedades activas del agente
- Opcionalmente mostrar totales historicos

### Dashboard (app/dashboard/page.tsx) - ✅ ACTUALIZADO
- Mostrar todas las propiedades
- Filtradas por estado
- Con botones de control

---

## Seguridad

- Solo el dueño de la propiedad puede cambiar su estado
- Token de autenticación requerido
- Validación de ownership en backend
- No hay eliminación física de datos

---

## Próximos Pasos

1. [ ] Actualizar queries en feed/búsqueda para filtrar por `listing_status`
2. [ ] Agregar filtros en dashboard para ver solo pausadas/finalizadas
3. [ ] Analytics: tracking de cambios de estado
4. [ ] Recordatorio: notificar si hay propiedades pausadas hace >30 días

---

## Preguntas Frecuentes

**¿Se pierde la información si pauso una propiedad?**  
No, toda la información se mantiene. Solo desaparece del feed.

**¿Puedo cambiar una pausada a activa?**  
Sí, con el botón "Renovar".

**¿Qué diferencia hay entre Pausar y Finalizar?**  
Pausar es temporal, Finalizar es definitivo. Pero ambos se pueden reactivar.

**¿Se puede vender mientras está pausada?**  
Está oculta, así que no recibir consultas. Mejor finalizarla si ya se vendió.

**¿Qué pasa con las reservas de una propiedad pausada?**  
Sigue activa para tracking, pero no se pueden hacer nuevas reservas.

---

**Actualizado:** 2026-08-10
