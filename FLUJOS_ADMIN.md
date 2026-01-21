# 🎯 FLUJO DE FUNCIONALIDADES - ADMIN USERS

## 1️⃣ FLUJO: Prevención de Emails Duplicados

```
┌─────────────────┐
│ Usuario ingresa │
│ formulario de   │
│ registro        │
└────────┬────────┘
         │ Envía datos
         ↓
┌──────────────────────┐
│ SignIn.vue valida    │
│ (campos requeridos)  │
└────────┬─────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ authStore.register() se ejecuta  │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Obtiene todos usuarios de BD     │
│ api.getAll('users')              │
└────────┬─────────────────────────┘
         │
         ↓
    ┌────┴─────┐
    │ Email     │
    │ existe?   │
    └────┬──────┘
    YES  │  NO
        │     │
        ↓     ↓
    ❌ERROR  ✅CREAR
   "Email ya  Usuario
    registrado"
```

---

## 2️⃣ FLUJO: Administración de Usuarios

```
┌───────────────────────────────┐
│ Usuario Nivel 3 Inicia Sesión │
└────────────┬──────────────────┘
             │
             ↓
┌────────────────────────────────────────┐
│ Navbar muestra opción:                 │
│ "Administración de Usuarios"           │
└────────────┬─────────────────────────┐─┘
             │                         │
             ↓                         ↓
      /admin/users ← Protegida por minLevel: 3
             │
             ↓
┌──────────────────────────────┐
│ AdminUsers.vue se carga      │
│ Obtiene lista de usuarios    │
│ api.getAll('users')          │
└──────────┬───────────────────┘
           │
           ↓
    ┌──────────────┬──────────────┬──────────┐
    │              │              │          │
    ↓              ↓              ↓          ↓
┌─────────┐ ┌────────┐ ┌────────────┐ ┌─────────┐
│ BUSCAR  │ │ ORDENAR│ │CONFIG EMAIL│ │ACTUALIZAR
│por DNI, │ │por     │ │            │ │lista
│email,   │ │columnas│ │Guardar en  │ │
│nickname │ │(▲▼)    │ │localStorage│ │
└─────────┘ └────────┘ └────────────┘ └─────────┘
```

---

## 3️⃣ FLUJO: Otorgar Acceso a Usuario

```
Admin hace click en ✔ (botón verde)
         │
         ↓
┌─────────────────────────────┐
│ Modal "Otorgar Acceso"      │
│ - Usuario: usuario@abc.com  │
│ - Nivel actual: 0           │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│ Admin selecciona nivel:     │
│ [0] Sin acceso              │
│ [1] Usuario Básico          │
│ [2] Usuario Avanzado        │
│ [3] Administrador           │
└────────┬────────────────────┘
         │ Click "Actualizar"
         ↓
┌──────────────────────────────┐
│ api.update('users', {        │
│   id: usuario.id,            │
│   it_level: nivel_seleccionado
│ })                           │
└────────┬─────────────────────┘
         │
         ↓
    ✅ Nivel actualizado
    ✅ Usuario puede acceder
    ✅ Mensaje de éxito
```

---

## 4️⃣ FLUJO: Notificación de Nuevo Registro

```
┌──────────────────────────┐
│ Usuario se registra      │
│ (SignIn.vue)             │
└─────────┬────────────────┘
          │ handleRegister()
          ↓
┌────────────────────────────────┐
│ authStore.register()           │
├─ Valida email NO duplicado     │
├─ Crea usuario en BD            │
└────────┬──────────────────────┐┘
         │                      │
    ✅ÉXITO             Async - no espera
         │                      │
         ├─────────────┬────────┘
         │             │
         ↓             ↓
┌──────────────────────────────────┐
│ sendRegistrationNotification()    │
│ Lee localStorage['notificationEmails']
│ (correos guardados por admin)
└─────────┬──────────────────────┬┘
          │                      │
    ✅Manda email          ❌Sin correos:
      (cuando se              (silencia, no
       integre servicio)       interrumpe)
```

---

## 5️⃣ FLUJO: Configuración de Correos

```
┌──────────────────────────────┐
│ Admin en /admin/users        │
│ Ve sección:                  │
│ "Configuración de Notificaciones"
└─────────┬────────────────────┘
          │
          ↓
┌──────────────────────────────┐
│ Ingresa correos (uno por línea):
│ admin@empresa.com            │
│ coordinador@empresa.com      │
│ jefe@empresa.com             │
└─────────┬────────────────────┘
          │ @change event
          ↓
┌──────────────────────────────┐
│ saveNotificationEmails()      │
│ localStorage.setItem(         │
│   'notificationEmails',       │
│   correos_ingresados          │
│ )                            │
└─────────┬────────────────────┘
          │
    ✅ Guardado en navegador
    ✅ Persiste en sesiones
    ✅ Usado para notificaciones
```

---

## 6️⃣ FLUJO: Eliminar Usuario

```
Admin hace click en 🗑 (botón rojo)
         │
         ↓
┌─────────────────────────────┐
│ Confirmación:               │
│ "¿Estás seguro?"            │
└────────┬────────────────────┘
         │ Confirma
         ↓
┌────────────────────────────┐
│ api.remove('users', userId)│
└────────┬───────────────────┘
         │
         ↓
    ✅ Usuario eliminado
    ✅ Se remueve de lista
    ✅ Permanentemente
```

---

## 7️⃣ ÁRBOL DE PERMISOS

```
Navegación:
├─ /
│  └─ requiresAuth: true
│     └─ Cualquier nivel puede ver
│
├─ /login
│  └─ requiresAuth: false
│     └─ Solo no autenticados
│
├─ /signin
│  └─ requiresAuth: false
│     └─ Solo no autenticados
│
├─ /forgot-password
│  └─ requiresAuth: false
│
├─ /javer/:dni (Mi Perfil)
│  └─ requiresAuth: true
│     └─ minLevel: 1
│        ├─ Nivel 0: BLOQUEADO
│        ├─ Nivel 1+: ACCESO ✅
│
└─ /admin/users ⭐ NUEVO
   └─ requiresAuth: true
      └─ minLevel: 3
         ├─ Nivel 0,1,2: BLOQUEADO ❌
         └─ Nivel 3: ACCESO ✅
```

---

## 8️⃣ DATOS ALMACENADOS

### localStorage (Navegador)

```
Key: 'user'
Value: {
  id: "uuid-xxx",
  dni: 12345678,
  nickname: "john",
  email: "john@example.com",
  cellphone: 1123456789,
  it_level: 3
}

Key: 'notificationEmails'
Value: "admin@empresa.com
coordinador@empresa.com
jefe@empresa.com"
```

### BD (Google Sheets)

```
Tabla: users
├─ id (uuid)
├─ dni (integer)
├─ nickname (string)
├─ email (string)
├─ cellphone (integer)
├─ it_level (0-3)
└─ hash_pwd (bcrypt)

Tabla: main
└─ [datos de perfil]
```

---

## 9️⃣ ESTADÍSTICAS

```
📊 IMPLEMENTACIÓN FINAL

Archivos Creados:        2
├─ AdminUsers.vue
└─ ADMIN_EMAILS_CONFIG.md

Archivos Modificados:    4
├─ auth.js (+85 líneas)
├─ router/index.js (+7 líneas)
├─ Navbar.vue (+5 líneas)
└─ CAMBIOS_LOG.md

Total de Código:         ~500 líneas nuevas

Funcionalidades:         6
├─ Validación emails duplicados ✅
├─ Panel admin de usuarios ✅
├─ Otorgar acceso ✅
├─ Eliminar usuarios ✅
├─ Config de emails ✅
└─ Notificaciones (estructura) ✅

Protecciones:            1
└─ Ruta /admin/users minLevel: 3
```

---

## 🔟 CHECKLISTA DE VALIDACIÓN

```
✅ Usuarios no pueden duplicar email
✅ Panel de admin solo para nivel 3
✅ Panel carga lista de usuarios
✅ Puede buscar usuarios
✅ Puede ordenar columnas
✅ Puede otorgar/cambiar acceso
✅ Puede eliminar usuarios
✅ Puede configurar correos de notificación
✅ Correos se guardan en localStorage
✅ Enlace en navbar funciona
✅ Ruta está protegida por permisos
✅ Sin errores en console
✅ UI responsive (mobile friendly)
✅ Mensajes de éxito/error mostrados
✅ Confirmación antes de eliminar
```
