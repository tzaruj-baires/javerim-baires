# 🎉 Javerim Baires - Sistema de Autenticación + Permisos

Sistema completo de login/registro/logout con control de permisos por nivel IT.

---

## ⚡ INICIO RÁPIDO

### Instalar y ejecutar:
```bash
npm install
npm run dev
# Abre http://localhost:5173
```

### Registrarse:
1. Ir a `/signin`
2. Completar: DNI (8 dígitos), email, teléfono, contraseña
3. Click "Registrarse"

### Iniciar sesión:
1. Ir a `/login`
2. Email + contraseña
3. Click "Iniciar Sesión" → Va a `/`

### Ver contenido según nivel:
- **Nivel 1 (Básico)**: Acceso básico
- **Nivel 2 (Intermedio)**: + Reportes y Configuración
- **Nivel 3 (Avanzado)**: + Panel Admin completo

---

## 🔐 PROTECCIÓN DE RUTAS

```
Sin autenticación → Solo /login y /signin
Con autenticación → Acceso a / y otras rutas protegidas
```

**En router/index.js:**
```javascript
router.beforeEach((to, from, next) => {
  // Si no autenticado → /login
  // Si autenticado en /login → /
})
```

---

## 🎯 SISTEMA DE PERMISOS

### Usar en templates:
```vue
<div v-if="can(1)">Nivel 1+</div>
<div v-if="can(2)">Nivel 2+</div>
<div v-if="can(3)">Nivel 3</div>

<button :disabled="!can(2)">Editar</button>
```

### Usar en scripts:
```javascript
import { usePermissions } from '@/composables/usePermissions'
const { can, getLevelName } = usePermissions()

if (can(3)) {
  // Solo admin
}
```

### Métodos disponibles:
- `can(level)` - ¿Nivel >= este nivel?
- `canExact(level)` - ¿Nivel exacto?
- `canAny([1,3])` - ¿Tiene alguno?
- `getLevelName(level)` - Nombre legible

---

## 📁 ESTRUCTURA

```
src/
├── composables/
│   └── usePermissions.js    ← Sistema de permisos
├── stores/
│   └── auth.js              ← Autenticación (login/register/logout)
├── router/
│   └── index.js             ← Route guards
├── components/
│   └── Navbar.vue           ← Barra de navegación
└── pages/
    ├── Home.vue             ← Página protegida
    ├── Login.vue            ← Formulario login
    └── SignIn.vue           ← Formulario registro
```

---

## 🔑 MATRIZ DE ACCESO

```
Nivel | can(1) | can(2) | can(3)
------|--------|--------|--------
  1   |   ✓    |   ✗    |   ✗
  2   |   ✓    |   ✓    |   ✗
  3   |   ✓    |   ✓    |   ✓
```

---

## 🧪 TESTING RÁPIDO

### Test en DevTools Console:
```javascript
// Ver sesión actual
JSON.parse(localStorage.getItem('user'))

// Cambiar nivel (para testing)
const u = JSON.parse(localStorage.getItem('user'))
u.it_level = 3
localStorage.setItem('user', JSON.stringify(u))
location.reload()

// Verificar can()
import { usePermissions } from '@/composables/usePermissions'
const { can } = usePermissions()
can(1)  // true/false
can(2)  // true/false
can(3)  // true/false
```

---

## 🔒 SEGURIDAD

✅ Contraseñas hasheadas con bcryptjs (10 rounds)  
✅ Hash nunca guardado en localStorage  
✅ Route guards protegen acceso  
✅ UUID para IDs únicos  
✅ localStorage solo guarda sesión actual  
⚠️ Validar permisos siempre en backend  

---

## 📊 EJEMPLO PRÁCTICO

```vue
<template>
  <!-- Tabla con permisos -->
  <table>
    <th>Email</th>
    <th v-if="can(2)">Organización</th>
    <tr v-for="user in users">
      <td>{{ user.email }}</td>
      <td v-if="can(2)">{{ user.org }}</td>
      <td>
        <button v-if="can(2)">✏️ Editar</button>
        <button v-if="can(3)">🗑️ Eliminar</button>
      </td>
    </tr>
  </table>

  <!-- Tarjetas por nivel -->
  <section v-if="can(1)" class="card">Nivel 1+</section>
  <section v-if="can(2)" class="card">Nivel 2+</section>
  <section v-if="can(3)" class="card">Admin</section>
</template>

<script setup>
import { usePermissions } from '@/composables/usePermissions'
const { can } = usePermissions()
</script>
```

---

## 🛠️ FLUJOS

### Registro:
```
SignIn → Validar → Hash pwd → API → localStorage → Login
```

### Login:
```
Login → Verificar hash → localStorage → Home
```

### Logout:
```
Navbar → Borrar sesión → localStorage limpio → Login
```

---

## 📦 DEPENDENCIAS

```json
{
  "bcryptjs": "^3.0.3",
  "uuid": "^13.0.0",
  "pinia": "^3.0.4",
  "vue-router": "^4.6.4"
}
```

---

## 🎓 EJEMPLOS COMUNES

| Necesidad | Código |
|-----------|--------|
| Mostrar si nivel 2+ | `<div v-if="can(2)">...</div>` |
| Deshabilitar botón | `<button :disabled="!can(3)">...</button>` |
| Ejecutar en script | `if (can(3)) { adminCode() }` |
| Obtener nivel | `authStore.user.it_level` |
| Obtener nombre | `getLevelName(authStore.user.it_level)` |
| Logout | `authStore.logout()` |

---

## 🚀 CHECKLIST

- ✅ Autenticación (register/login/logout)
- ✅ Protección de rutas
- ✅ Sistema de permisos por nivel
- ✅ Función can() para templates
- ✅ Navbar contextual
- ✅ Validaciones completas
- ✅ Hash de contraseñas
- ✅ Sesión persistente

---

## 📞 SOPORTE

**¿Cómo mostrar contenido solo para nivel 2?**
→ `<div v-if="can(2)">contenido</div>`

**¿Dónde cambiar nivel del usuario?**
→ En la base de datos (Google Apps Script)

**¿Cómo testear rápido?**
→ Modificar localStorage en DevTools y recargar

**¿Es seguro client-side?**
→ No, es solo UX. Validar siempre en backend

---

## 🎯 NIVEL DE ACCESO

```
Nivel 1: Básico
  ├─ Ver datos públicos
  └─ Acceso a funciones básicas

Nivel 2: Intermedio  
  ├─ Todo nivel 1
  ├─ Reportes avanzados
  └─ Configuración personal

Nivel 3: Avanzado (Admin)
  ├─ Todo nivel 2
  ├─ Panel administrativo
  └─ Gestión de usuarios
```

---

## 📚 DOCUMENTACIÓN

- **[TECNICO.md](TECNICO.md)** - Detalles técnicos avanzados, APIs, troubleshooting
- **[INDICE_DOCUMENTACION.md](INDICE_DOCUMENTACION.md)** - Índice de otros documentos

---

**Estado: ✅ Completo y Funcional**
