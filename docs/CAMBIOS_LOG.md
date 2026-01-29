# 📝 HISTORIAL DE CAMBIOS

## Enero 2026 - Auto-Creación de Registro en Main al Login

### ✅ CAMBIO: Auto-Crear Fila en 'main' al Login

**Problema:** Usuarios nuevos registrados en 'users' no tenían fila en 'main' para completar datos
**Solución:** Al hacer login, si no existe en 'main', se crea automáticamente
**Archivo:** src/stores/auth.js - Función `login()`

**Lógica:**

1. Usuario hace login exitoso
2. Sistema busca fila en 'main' con mismo DNI
3. Si NO existe por DNI, email O celular → Crea nueva fila en 'main'
4. Si existe por cualquiera de estos → Usa registro existente (sin duplicar)

**Resultado:**

- ✅ Usuarios nuevos pueden inmediatamente rellenar perfil
- ✅ Evita duplicados por DNI, email o celular
- ✅ Procesa automáticamente sin input del usuario

---

## Enero 2026 - Notificación de Cambio de Nivel

### ✅ CAMBIO: Email de Notificación al Cambiar Nivel

**Problema:** Cuando se cambia el nivel de acceso a un usuario, este no lo sabe
**Solución:** Nueva función `sendAccessLevelNotification()` que notifica por email
**Archivos:**

- src/stores/auth.js - Nueva función exportada
- src/pages/AdminUsers.vue - Llamada en grantAccess()

**Comportamiento:**

- Cuando admin cambia nivel en `/admin/users`
- Usuario recibe email con: nuevo nivel, fecha y instrucciones
- Mensaje UI confirma: "Notificación enviada"
- Listo para integrar servicio de emails real

---

## Enero 2026 - Validación Emails + Admin Panel

### ✅ CAMBIO: Validación de Emails Duplicados

**Problema:** Los usuarios podían registrarse con el mismo email
**Solución:** Validación en `auth.js` - `register()` verifica si el email ya existe
**Archivo:** src/stores/auth.js
**Comportamiento:** Si email existe, lanza error: "Este email ya está registrado..."

### ✅ CAMBIO: Página de Administración de Usuarios

**Nuevo Archivo:** src/pages/AdminUsers.vue
**Funcionalidades:**

- Listar todos los usuarios registrados
- Buscar por DNI, Email o Nickname
- Ordenar columnas
- Otorgar/cambiar nivel de acceso (it_level) a usuarios
- Eliminar usuarios
- Configuración de correos para notificaciones de nuevos registros

**Permisos:** Solo accesible para nivel 3 (Administrador)
**Ruta:** /admin/users

### ✅ CAMBIO: Notificaciones por Email en Registro

**Implementado en:** src/stores/auth.js
**Función:** `sendRegistrationNotification()`
**Comportamiento:**

- Al registrarse un usuario, se lee la lista de correos desde localStorage (notificationEmails)
- Se prepara un email con datos del nuevo usuario
- Estructura lista para integración con servicio de emails real (SendGrid, Mailgun, etc.)

**Configuración:**

- Acceder a /admin/users
- Sección "Configuración de Notificaciones"
- Ingresar correos (uno por línea)
- Se guardan en localStorage

### ✅ CAMBIO: Navegación Admin

**Archivo:** src/components/Navbar.vue
**Cambio:** Opción "Gestionar usuarios" ahora enlaza a /admin/users
**Visible para:** Nivel 3 solo

### ✅ CAMBIO: Rutas

**Archivo:** src/router/index.js
**Nueva ruta:**

```javascript
{
  path: '/admin/users',
  name: 'adminUsers',
  component: AdminUsers,
  meta: { requiresAuth: true, minLevel: 3 },
}
```

## Enero 2026 - Correcciones Finales

### ✅ CAMBIO: Campo Teléfono - Field Mapping

**Problema:** 'main' tabla usa "celular" pero 'users' usa "cellphone"  
**Solución:** Mapeo automático en ProfileForm + fallback en templates
**Archivos:**

- ProfileForm.vue: Watcher mapea ambos campos, handleSubmit envía a cada tabla correctamente
- MyProfile.vue: Display usa `celular || cellphone || '-'`
- UserDetail.vue: Display usa `celular || cellphone || '-'`

### ✅ CAMBIO: Actualización No Funcionaba

**Problema:** GAS buscaba por `id` pero frontend no lo enviaba  
**Solución:** ProfileForm ahora envía `id: DNI` (para main) e `id: dni` (para users)
**Archivo:** ProfileForm.vue - handleSubmit

### ✅ CAMBIO: Inicialización de Refs

**Problema:** Vue warning sobre props null  
**Solución:** Cambiar `ref(null)` → `ref({})` en:

- ProfileForm.vue: `default: () => ({})`
- MyProfile.vue: `profileData = ref({})`
- UserDetail.vue: `userData = ref({})`

### ✅ CAMBIO: Rutas Protegidas

**Implementado:** /mi-perfil (minLevel: 1) y /javer/:dni (minLevel: 2)  
**Archivo:** router/index.js

### ✅ CAMBIO: Permisos por Nivel

**Implementado:** usePermissions.js con can(), canExact(), canAny(), getLevelName()  
**Validación en:** router guards + componentes

### ✅ CAMBIO: Sistema de Autenticación

**Implementado:**

- Login/Register con bcryptjs (10 rounds)
- localStorage persistencia
- Pinia store

---

## Notas de Desarrollo

### Reglas Importantes

1. **Campo Teléfono**: Siempre mapear ambos campos

   ```javascript
   // En templates
   {{ data.celular || data.cellphone || '-' }}

   // En watcher
   cellphone: newData.cellphone || newData.celular || ''

   // En update
   id: DNI,  // ← CRUCIAL: GAS busca por id
   celular: formData.cellphone
   ```

2. **Actualización de Datos**: Incluir siempre `id`

   ```javascript
   await update('main', {
     id: formData.value.dni, // ← Necesario
     DNI: formData.value.dni,
     // otros campos...
   })
   ```

3. **Nombres de Tablas**
   - Frontend: 'main', 'users' (no sheetId)
   - Backend: Mapeo automático en TABLES{}

---

## Próximas Mejoras (Futuro)

- [ ] Validación de datos más robusta
- [ ] Recuperación de contraseña
- [ ] Auditoría de cambios
- [ ] Exportar datos a CSV/PDF
