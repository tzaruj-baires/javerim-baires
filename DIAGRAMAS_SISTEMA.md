# 🎨 DIAGRAMA DEL SISTEMA

## Flujo de Autenticación y Autorización

```
┌─────────────────────────────────────────────────────────────────┐
│                      USUARIO NO AUTENTICADO                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
                   ┌─────────────────────┐
                   │   Router Guard      │
                   │  beforeEach()       │
                   └─────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ↓                           ↓
        ✓ /login         ✗ / (Protegida)
        ✓ /signin        ✗ /home
                          ✗ Cualquier otra
                                  │
                                  ↓
                        REDIRIGE A → /login
                                  │
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                      USUARIO AUTENTICADO                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
                   ┌─────────────────────┐
                   │  useAuthStore()     │
                   │  user =             │
                   │  {                  │
                   │    email,           │
                   │    it_level,        │
                   │    nickname,        │
                   │    ...              │
                   │  }                  │
                   └─────────────────────┘
                              │
                              ↓
                   ┌─────────────────────┐
                   │  usePermissions()   │
                   │  can(level)         │
                   └─────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ↓                           ↓
        ✓ Mostra UI       ✗ Ocultar UI
        ✓ Habilitar btn   ✗ Desabilitar btn
        ✓ Ejecutar acción ✗ Denegar acceso
```

---

## Árbol de Decisión de Permisos

```
USUARIO LOGUEADO (it_level = ?)
        │
        ├─→ can(1)?  ← ¿Nivel >= 1?
        │   ├─ YES (Nivel 1, 2, 3)   → Mostrar contenido básico
        │   └─ NO                      → Ocultar todo
        │
        ├─→ can(2)?  ← ¿Nivel >= 2?
        │   ├─ YES (Nivel 2, 3)       → Mostrar reportes avanzados
        │   └─ NO (Nivel 1)           → Ocultar reportes
        │
        └─→ can(3)?  ← ¿Nivel == 3?
            ├─ YES (Nivel 3)          → Mostrar admin panel
            └─ NO (Nivel 1, 2)        → Ocultar admin panel
```

---

## Mapeo de Niveles IT vs Funcionalidades

```
┌────────────┬──────────────┬──────────────┬──────────────┐
│ Función    │ Nivel 1 ✓    │ Nivel 2 ✓    │ Nivel 3 ✓    │
├────────────┼──────────────┼──────────────┼──────────────┤
│ Ver datos  │      ✓       │      ✓       │      ✓       │
│ buscar     │      ✓       │      ✓       │      ✓       │
├────────────┼──────────────┼──────────────┼──────────────┤
│ Reportes   │      ✗       │      ✓       │      ✓       │
│ Análisis   │      ✗       │      ✓       │      ✓       │
├────────────┼──────────────┼──────────────┼──────────────┤
│ Admin      │      ✗       │      ✗       │      ✓       │
│ Usuarios   │      ✗       │      ✗       │      ✓       │
│ Config     │      ✗       │      ✗       │      ✓       │
└────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Arquitectura en Capas

```
┌─────────────────────────────────────────────────┐
│         PRESENTACIÓN (Vue Templates)            │
│  ├─ Navbar.vue       (Menú contextual)         │
│  ├─ Home.vue         (Contenido protegido)     │
│  ├─ Login.vue        (Formulario)              │
│  └─ SignIn.vue       (Formulario)              │
└─────────────────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────┐
│         LÓGICA (Composables + Stores)            │
│  ├─ usePermissions() (Verificar permisos)      │
│  ├─ useAuthStore()   (Estado autenticación)    │
│  └─ router guards    (Proteger rutas)          │
└─────────────────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────┐
│         DATOS (API + localStorage)              │
│  ├─ Google Apps Script API  (Base de datos)    │
│  ├─ localStorage            (Sesión local)     │
│  └─ bcryptjs                (Hashing)          │
└─────────────────────────────────────────────────┘
```

---

## Flujo Detallado: Del Login al Dashboard

```
1. USUARIO ACCEDE /
   ├─→ Router Guard verifica autenticación
   ├─→ NO autenticado → Redirect a /login
   └─→ Autenticado → Continúa

2. EN /LOGIN
   ├─→ Usuario ingresa email + password
   ├─→ authStore.login() verifica
   ├─→ Compara password con bcryptjs
   └─→ Si OK → localStorage + redirect a /

3. EN / (HOME)
   ├─→ App.vue carga authStore.loadUserFromStorage()
   ├─→ Navbar se renderiza con sesión activa
   ├─→ Home.vue carga datos
   └─→ usePermissions() controla qué se ve

4. EN HOME.VUE
   ├─→ can(1)? → Mostrar tabla usuarios
   ├─→ can(2)? → Mostrar columna "Org" + botón editar
   ├─→ can(3)? → Mostrar botón eliminar + panel admin
   └─→ Cada elemento controlado por can()

5. EN NAVBAR
   ├─→ Mostrar badge de nivel
   ├─→ can(2)? → Mostrar "Configuración"
   ├─→ can(3)? → Mostrar "Admin Panel"
   └─→ Mostrar "Logout"

6. AL HACER LOGOUT
   ├─→ authStore.logout()
   ├─→ Borrar localStorage
   ├─→ user = null
   └─→ Redirect a /login
```

---

## Ejemplo: Renderizado Condicional

```vue
<!-- Template Home.vue -->

<!-- 1. Contenedor exterior protegido por ruta -->
<template v-if="authStore.isAuthenticated">

  <!-- 2. Tabla básica (visible para todos) -->
  <table>
    <tr v-for="user in users">
      <td>{{ user.email }}</td>
      
      <!-- 3. Columna extra solo para nivel 2+ -->
      <td v-if="can(2)">{{ user.organizacion }}</td>
      
      <!-- 4. Acciones según nivel -->
      <td>
        <button v-if="can(2)">Editar</button>
        <button v-if="can(3)">Eliminar</button>
      </td>
    </tr>
  </table>

  <!-- 5. Secciones completas por nivel -->
  <section v-if="can(1)">Contenido Básico</section>
  <section v-if="can(2)">Reportes Avanzados</section>
  <section v-if="can(3)">Panel Administrativo</section>

</template>

<!-- Resultado según nivel del usuario: -->

<!-- Nivel 1 (Básico) ve: -->
<!-- Tabla: Email | [Editar y Eliminar ocultos] -->
<!-- Secciones: Básico visible | Reportes ocultos | Admin ocultos -->

<!-- Nivel 2 (Intermedio) ve: -->
<!-- Tabla: Email | Org | [Editar visible, Eliminar oculto] -->
<!-- Secciones: Básico visible | Reportes visible | Admin ocultos -->

<!-- Nivel 3 (Avanzado) ve: -->
<!-- Tabla: Email | Org | [Editar y Eliminar visibles] -->
<!-- Secciones: Básico visible | Reportes visible | Admin visible -->
```

---

## Código vs Decisión

```
CÓDIGO                          RESULTADO
───────────────────────────────────────────────────
can(1)  →  user.it_level >= 1  →  true / false
can(2)  →  user.it_level >= 2  →  true / false
can(3)  →  user.it_level >= 3  →  true / false

v-if="can(1)"  →  Mostrar si true, ocultar si false
:disabled="!can(2)"  →  Habilitar si true, deshabilitar si false

if (can(3)) { adminAction() }  →  Ejecutar solo si true
```

---

## Matriz de Acceso

```
              user.it_level
    ╔════════════╦════════════╦════════════╗
    ║     1      ║     2      ║     3      ║
╔═══╬════════════╬════════════╬════════════╣
║ 1 ║    ✓       ║     ✓      ║     ✓      ║  can(1)
║ 2 ║    ✗       ║     ✓      ║     ✓      ║  can(2)
║ 3 ║    ✗       ║     ✗      ║     ✓      ║  can(3)
╚═══╩════════════╩════════════╩════════════╝

can(x) retorna true si:
  user.it_level >= x
```

---

## Stack Tecnológico

```
Frontend (Vue 3)
├── Router (Protección de rutas)
├── Pinia (State management)
├── Composables (Lógica compartida)
└── Components (UI)
          │
          ↓
Backend Simulation
├── localStorage (Sesión)
├── bcryptjs (Hash de pwd)
└── API (Google Apps Script)
```

¡Todo integrado y funcional! 🚀
