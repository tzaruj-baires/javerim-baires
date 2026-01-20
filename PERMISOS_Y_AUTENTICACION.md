# 🔐 Sistema de Autenticación y Permisos

## Resumen de Cambios

He implementado un sistema completo de autenticación con protección de rutas y un sistema de roles/permisos basado en nivel IT.

---

## 1️⃣ PROTECCIÓN DE RUTAS (Route Guards)

### Comportamiento:
- **Sin autenticación**: El usuario solo puede acceder a `/login` y `/signin`
- **Con autenticación**: El usuario no puede volver a `/login` o `/signin` (se redirige a `/`)
- **Rutas protegidas**: Cualquier otra ruta que no sea login/signin requiere autenticación

### Código en `router/index.js`:
```javascript
// Guard global que verifica autenticación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')  // Si necesita auth y no está autenticado, ir a login
  } else if (!requiresAuth && authStore.isAuthenticated && ...) {
    next('/')  // Si ya está autenticado, no dejar volver a login
  } else {
    next()
  }
})
```

---

## 2️⃣ SISTEMA DE PERMISOS/ROLES

### Composable: `usePermissions()`

Ubicación: `src/composables/usePermissions.js`

#### Métodos disponibles:

```javascript
const { can, canExact, canAny, getLevelName } = usePermissions()
```

| Método | Parámetro | Retorna | Descripción |
|--------|-----------|---------|-------------|
| `can(level)` | 1, 2 o 3 | boolean | ¿El usuario tiene este nivel O superior? |
| `canExact(level)` | 1, 2 o 3 | boolean | ¿El usuario tiene exactamente este nivel? |
| `canAny(levels)` | [1,3] | boolean | ¿El usuario tiene alguno de estos niveles? |
| `getLevelName(level)` | 1, 2 o 3 | string | Retorna "Básico", "Intermedio", "Avanzado" |

### Niveles IT:

```
1 - Básico       (Usuario normal, acceso básico)
2 - Intermedio   (Analista, acceso a reportes avanzados)
3 - Avanzado     (Administrador, acceso completo)
```

---

## 3️⃣ CÓMO USAR EN TEMPLATES VUE

### Mostrar/Ocultar elementos según nivel:

```vue
<!-- Solo para nivel 1+ (todo usuario autenticado) -->
<div v-if="can(1)">
  Contenido visible para todos
</div>

<!-- Solo para nivel 2+ (analistas y admins) -->
<div v-if="can(2)">
  <button><i class="bi bi-graph-up"></i> Reportes Avanzados</button>
</div>

<!-- Solo para nivel 3 (administradores) -->
<div v-if="can(3)">
  <button><i class="bi bi-shield-lock"></i> Panel Admin</button>
</div>
```

### Acceso a datos del usuario:

```vue
{{ authStore.user?.email }}           <!-- Email del usuario -->
{{ authStore.user?.it_level }}        <!-- Nivel IT (1-3) -->
{{ authStore.user?.nickname }}        <!-- Nickname del usuario -->
{{ getLevelName(authStore.user?.it_level) }}  <!-- "Básico", "Intermedio", etc -->
```

---

## 4️⃣ CÓMO USAR EN SCRIPTS

```javascript
<script setup>
import { usePermissions } from '@/composables/usePermissions'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { can, getLevelName } = usePermissions()

// Verificar permiso
if (can(3)) {
  console.log('El usuario es administrador')
}

// Mostrar nombre del nivel
console.log(getLevelName(authStore.user?.it_level))  // "Avanzado"

// Ejecutar código solo para cierto nivel
if (can(2)) {
  // Cargar datos de reportes avanzados
  loadAdvancedReports()
}
</script>
```

---

## 5️⃣ EJEMPLOS PRÁCTICOS EN HOME.VUE

### Tabla de usuarios con permisos:

```vue
<table>
  <th v-if="can(2)">Organización</th>  <!-- Visible solo nivel 2+ -->
  <th>Email</th>
  <tr v-for="user in users">
    <td>{{ user.email }}</td>
    <td v-if="can(2)">{{ user.organizacion }}</td>
    <td>
      <!-- Editar visible para nivel 2+ -->
      <button v-if="can(2)"><i class="bi bi-pencil"></i></button>
      <!-- Eliminar visible solo para nivel 3 -->
      <button v-if="can(3)"><i class="bi bi-trash"></i></button>
    </td>
  </tr>
</table>
```

### Tarjetas de contenido con restricción de acceso:

```vue
<div v-if="can(1)" class="card border-success">
  <h5>Nivel Básico (1+)</h5>
  <p>Acceso a funciones básicas</p>
</div>

<div v-if="can(2)" class="card border-warning">
  <h5>Nivel Intermedio (2+)</h5>
  <p>Acceso a análisis avanzado</p>
</div>

<div v-if="can(3)" class="card border-danger">
  <h5>Nivel Avanzado (3)</h5>
  <p>Acceso administrativo</p>
</div>
```

---

## 6️⃣ ACTUALIZACIÓN EN NAVBAR

El Navbar ahora muestra:

✓ **Badge** con el nivel IT del usuario  
✓ **Opciones contextuales** en el menú desplegable según nivel:
  - Nivel 1+: Opciones básicas
  - Nivel 2+: Configuración, Reportes
  - Nivel 3: Panel Admin, Gestionar usuarios

```vue
<li v-if="can(2)">
  <a class="dropdown-item" href="#"><i class="bi bi-gear"></i> Configuración</a>
</li>

<li v-if="can(3)">
  <a class="dropdown-item text-warning" href="#">
    <i class="bi bi-shield-lock"></i> Admin
  </a>
</li>
```

---

## 7️⃣ FLUJO COMPLETO

### Nuevo usuario se registra:

1. Llena formulario en `/signin`
2. Se crea con `it_level = 1` por defecto
3. Se redirige a `/login`

### Usuario inicia sesión:

1. Ingresa credenciales en `/login`
2. Sistema verifica hash
3. Se guarda sesión en localStorage
4. Se redirige a `/` (Home)
5. En Home solo ve contenido de nivel 1

### Cambiar nivel IT del usuario:

El nivel IT se cambia desde la API/Base de datos (Google Apps Script).  
La próxima vez que el usuario inicie sesión, verá su nuevo nivel.

```javascript
// En auth.js, el nivel se asigna así:
const userLevel = authStore.user.it_level || 1
```

---

## 8️⃣ ARQUITECTURA

```
┌─────────────────────────────────────────┐
│          ROUTER (index.js)              │
│  • Route Guards                         │
│  • Protección de rutas                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       AUTENTICACIÓN (auth.js store)     │
│  • Login/Register/Logout                │
│  • Sesión persistente                   │
│  • user.it_level                        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      PERMISOS (usePermissions)          │
│  • can(level)                           │
│  • canExact(level)                      │
│  • canAny(levels)                       │
│  • getLevelName(level)                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     COMPONENTES (Home, Navbar, etc)     │
│  • Usan can() en templates              │
│  • Control de visibilidad               │
│  • Control de acciones                  │
└─────────────────────────────────────────┘
```

---

## 9️⃣ CASOS DE USO

### Usar can() para MOSTRAR/OCULTAR:
```vue
<button v-if="can(2)">Generar Reporte</button>
<div v-if="can(3)">Panel Administrativo</div>
<a v-if="can(3)" href="/admin">Configuración</a>
```

### Usar can() para PERMITIR/DENEGAR ACCIONES:
```javascript
const handleDelete = async (id) => {
  if (!can(3)) {
    alert('No tienes permisos para eliminar')
    return
  }
  // Proceder con eliminación...
}
```

### Usar can() para DESACTIVAR BOTONES:
```vue
<button :disabled="!can(2)">Opción Avanzada</button>
<input type="checkbox" :disabled="!can(3)" />
```

---

## 🔟 SEGURIDAD

⚠️ **IMPORTANTE**: El sistema de `can()` es para **UX solo**.

Para seguridad real:
1. El servidor SIEMPRE debe verificar permisos
2. El nivel IT viene de la base de datos
3. Nunca confiar solo en cliente-side

La protección de rutas (`router guards`) sí es segura porque redirecciona.

---

## Resumen Rápido

```javascript
// Importar composable
import { usePermissions } from '@/composables/usePermissions'
const { can, getLevelName } = usePermissions()

// Usar en template
<div v-if="can(2)">Solo nivel 2+</div>

// Usar en script
if (can(3)) { /* admin code */ }
```

¡Listo! 🚀 El sistema está implementado y funcional.
