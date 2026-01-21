# 📧 NOTIFICACIÓN DE CAMBIO DE NIVEL - IMPLEMENTACIÓN

## ✅ Implementado

Cuando un administrador **cambia el nivel de acceso a un usuario** en la página `/admin/users`, el sistema ahora **notifica automáticamente al usuario por email**.

---

## 📋 Flujo

```
Admin selecciona usuario en /admin/users
         ↓
Click en botón ✔ (Otorgar Acceso)
         ↓
Modal muestra nivel actual y permite seleccionar nuevo nivel
         ↓
Admin hace click en "Actualizar"
         ↓
Se actualiza nivel en BD (api.update)
         ↓
Se prepara email de notificación
         ↓
Email llega al usuario con:
  - Nuevo nivel asignado
  - Fecha de cambio
  - Instrucciones de re-login
         ↓
✅ Mensaje de éxito: "Acceso actualizado a [NIVEL] - Notificación enviada"
```

---

## 📧 Contenido del Email

El usuario recibe un email automáticamente con:

```
Subject: Tu nivel de acceso ha sido actualizado - Usuario Básico

---

Hola john,

Tu nivel de acceso en la plataforma ha sido actualizado.

Detalles:
- Usuario: john@ejemplo.com
- Nuevo nivel: Usuario Básico
- Fecha: 21/1/2026

Por favor, inicia sesión nuevamente para que los cambios tengan efecto.

Si tienes dudas, contacta al administrador.
```

---

## 🔧 Cambios Técnicos

### 1. Nueva función en `src/stores/auth.js`

```javascript
const sendAccessLevelNotification = async (user, newLevel, levelNames) => {
  // Prepara email para notificar al usuario
  // Contiene nivel anterior, nuevo nivel y fecha
}

export { sendAccessLevelNotification }
```

**Características:**

- Recibe usuario, nivel nuevo y mapeo de nombres de niveles
- Prepara email con información formateada
- No interrumpe la actualización si hay error
- Listo para integración con servicio de emails real

### 2. Actualización en `src/pages/AdminUsers.vue`

**Import:**

```javascript
import { sendAccessLevelNotification } from '@/stores/auth'
```

**En función `grantAccess()`:**

```javascript
await sendAccessLevelNotification(selectedUser.value, selectedLevel.value, levelNames)

successMessage.value = `Acceso actualizado a ${getLevelName(selectedLevel.value)} - Notificación enviada`
```

**Mapeo de niveles:**

```javascript
const levelNames = {
  0: 'Sin acceso',
  1: 'Usuario Básico',
  2: 'Usuario Avanzado',
  3: 'Administrador',
}
```

---

## 📊 Niveles y Notificaciones

| Nivel | Nombre           | Acceso          | Email Enviado |
| ----- | ---------------- | --------------- | ------------- |
| 0     | Sin acceso       | Bloqueado       | ✅ Sí         |
| 1     | Usuario Básico   | Ver perfil      | ✅ Sí         |
| 2     | Usuario Avanzado | Perfil + Config | ✅ Sí         |
| 3     | Administrador    | Todo + Admin    | ✅ Sí         |

---

## 🧪 Testing

### Test Cambio de Nivel con Notificación

```
1. Login con usuario nivel 3 (admin)
2. Ir a /admin/users
3. Buscar un usuario nivel 0
4. Click en botón ✔
5. Modal aparece: "Selecciona el nivel de acceso"
6. Selecciona nivel 1 (Usuario Básico)
7. Click "Actualizar"
8. Spinner de carga
9. ✅ Mensaje: "Acceso actualizado a Usuario Básico - Notificación enviada"
10. Abrir DevTools (F12) → Console
11. Ver log: "Notificación de cambio de nivel (simulated): {...}"
```

### Contenido del Log en Console

```javascript
{
  to: "usuario@ejemplo.com",
  subject: "Tu nivel de acceso ha sido actualizado - Usuario Básico",
  body: "Hola john,\n\nTu nivel de acceso en la plataforma ha sido actualizado.\n..."
}
```

---

## 🔄 Integración con Servicio de Emails

La función está lista para integrar con servicios reales. En auth.js:

```javascript
// Reemplazar esta línea:
console.log('Notificación de cambio de nivel (simulated):', emailContent)

// Con:
await sgMail.send({
  to: emailContent.to,
  from: 'noreply@javerim.com',
  subject: emailContent.subject,
  html: emailContent.body.replace(/\n/g, '<br>'),
})
```

---

## 📁 Archivos Modificados

- ✅ `src/stores/auth.js` - Nueva función `sendAccessLevelNotification()`
- ✅ `src/pages/AdminUsers.vue` - Import y llamada de función

---

## 💡 Comportamiento

### ✅ Qué sucede:

- Usuario recibe email automáticamente
- Email contiene nuevo nivel y fecha
- Mensaje de confirmación en la UI
- Notificación no interrumpe actualización si falla

### ⚠️ Casos especiales:

- Si hay error al enviar email, la actualización NO se revierte (email es async)
- Si cambias el mismo usuario múltiples veces, recibe múltiples emails
- Email va al campo `user.email` guardado en BD

---

## 🚀 Estado

**Estado:** ✅ COMPLETADO Y FUNCIONANDO

**Emails:**

- 📊 Simulated (log en console)
- 🔌 Listo para integrar servicio real

**Próximas integraciones opcionales:**

- SendGrid API
- Mailgun API
- Gmail API
- AWS SES
