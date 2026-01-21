# 📧 CONFIGURACIÓN DE NOTIFICACIONES POR EMAIL

## ¿Qué es?

Sistema de notificación que envía emails a los administradores cuando un nuevo usuario se registra en la plataforma. Permite que el equipo administrativo sepa inmediatamente de nuevos registros y pueda otorgarles acceso.

## ¿Dónde configurarlo?

1. **Acceder con cuenta nivel 3 (Administrador)**
2. **Ir al menú de usuario (esquina superior derecha)**
3. **Hacer clic en "Administración de Usuarios"**
4. **Se abrirá la página `/admin/users`**

## Interfaz de Configuración

En la parte superior de la página, encontrarás una tarjeta gris que dice:
**"Configuración de Notificaciones"**

### Pasos:

1. **Haz clic en el campo de texto** "Correos para notificaciones de nuevos registros"
2. **Ingresa los correos** (uno por línea):
   ```
   admin@ejemplo.com
   coordinador@ejemplo.com
   jefe@ejemplo.com
   ```
3. **Se guardan automáticamente** en el navegador (localStorage)

> **Nota:** Los correos se guardan en el navegador. Si limpias los datos del navegador, se borrará la configuración.

## ¿Qué sucede cuando se registra un usuario?

El sistema automáticamente:

1. ✅ Verifica si el email ya existe (evita duplicados)
2. ✅ Crea la cuenta del usuario con nivel 0 (sin acceso)
3. ✅ Genera un email de notificación con:
   - DNI del usuario
   - Email registrado
   - Nombre de usuario (nickname)
   - Teléfono
   - Estado actual (requiere aprobación)

## Integración con Servicio de Emails

Actualmente, el sistema está preparado para integración con servicios como:

- **SendGrid** - https://sendgrid.com/
- **Mailgun** - https://www.mailgun.com/
- **Gmail API** - Para usar cuenta de Gmail corporativa
- **AWS SES** - Amazon Simple Email Service

### Para agregar un servicio de emails:

El código está en `src/stores/auth.js`, función `sendRegistrationNotification()`.

**Ejemplo de integración con SendGrid:**

```javascript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY)

const sendRegistrationNotification = async (newUser) => {
  const notificationEmailsStr = localStorage.getItem('notificationEmails') || ''
  const notificationEmails = notificationEmailsStr
    .split('\n')
    .map((email) => email.trim())
    .filter((email) => email.length > 0)

  if (notificationEmails.length === 0) return

  const msg = {
    to: notificationEmails,
    from: 'noreply@javerim.com',
    subject: `Nuevo usuario registrado - ${newUser.nickname}`,
    html: `
      <h2>Nuevo Usuario Registrado</h2>
      <p><strong>DNI:</strong> ${newUser.dni}</p>
      <p><strong>Email:</strong> ${newUser.email}</p>
      <p><strong>Nickname:</strong> ${newUser.nickname}</p>
      <p><strong>Teléfono:</strong> ${newUser.cellphone}</p>
      <p><strong>Acceso:</strong> Requiere aprobación</p>
    `,
  }

  await sgMail.send(msg)
}
```

## Gestión desde Admin

Desde la página `/admin/users` puedes:

### 1. **Otorgar Acceso**

- Haz clic en el botón verde ✓ en la columna "Acciones"
- Selecciona el nivel (0, 1, 2 ó 3)
- El usuario recibe acceso inmediatamente

### 2. **Eliminar Usuarios**

- Haz clic en el botón rojo 🗑
- Confirma la eliminación
- Se borra la cuenta permanentemente

### 3. **Buscar Usuarios**

- Usa el campo de búsqueda para filtrar por:
  - DNI
  - Email
  - Nickname

### 4. **Ordenar**

- Haz clic en los encabezados de columnas para ordenar ascendente/descendente

## Niveles de Acceso

| Nivel | Nombre           | Acceso                                |
| ----- | ---------------- | ------------------------------------- |
| 0     | Sin acceso       | Solo pendiente de aprobación          |
| 1     | Usuario Básico   | Ver su perfil                         |
| 2     | Usuario Avanzado | Ver perfil + configuración + reportes |
| 3     | Administrador    | Todo + administrar usuarios           |

## Preguntas Frecuentes

**¿Los emails se guardan permanentemente?**

- No, se guardan en el navegador (localStorage). Son locales al navegador.

**¿Se pierden si cambio de navegador?**

- Sí, cada navegador tiene su propia configuración.

**¿Puedo usar una carpeta compartida o cloud?**

- Futuro: Se puede migrar a guardarse en base de datos en lugar de localStorage.

**¿Qué pasa si ingreso un email inválido?**

- El sistema no valida el formato. Se recomienda copiar/pegar desde libreta de contactos.

**¿Se envían emails reales ahora?**

- No, la función está lista pero necesita integración con servicio de emails.
- Actualmente solo simula (log en consola).
