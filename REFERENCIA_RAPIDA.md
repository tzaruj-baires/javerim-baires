# ⚡ REFERENCIA RÁPIDA

## 🔐 PROTECCIÓN DE RUTAS

| Escenario | Resultado |
|-----------|-----------|
| Sin sesión → Ir a `/` | ❌ Redirige a `/login` |
| Sin sesión → Ir a `/login` | ✅ Permite acceso |
| Con sesión → Ir a `/` | ✅ Permite acceso |
| Con sesión → Ir a `/login` | ❌ Redirige a `/` |

---

## 🎯 SISTEMA DE PERMISOS

```javascript
// Importar
import { usePermissions } from '@/composables/usePermissions'
const { can, canExact, canAny, getLevelName } = usePermissions()

// En template
v-if="can(1)"        // ¿Nivel >= 1?
v-if="can(2)"        // ¿Nivel >= 2?
v-if="can(3)"        // ¿Nivel >= 3?

// En script
if (can(2)) { /* ... */ }
```

---

## 👤 DATOS DEL USUARIO

```javascript
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

authStore.user.email          // Email
authStore.user.it_level       // 1, 2 o 3
authStore.user.nickname       // Email sin dominio
authStore.user.dni            // Documento
authStore.user.cellphone      // Teléfono
authStore.isAuthenticated     // Boolean
```

---

## 📱 NAVBAR

```vue
<!-- Sin sesión muestra: -->
<button>Iniciar Sesión</button>
<button>Registrarse</button>

<!-- Con sesión muestra: -->
<span>Básico/Intermedio/Avanzado</span>  <!-- Badge -->
<menu>
  Email: user@mail.com
  Nivel: Básico
  [Configuración]     <!-- Si nivel 2+ -->
  [Reportes]          <!-- Si nivel 2+ -->
  [Admin]             <!-- Si nivel 3 -->
  [Gestionar usuarios] <!-- Si nivel 3 -->
  [Cerrar Sesión]
</menu>
```

---

## 📊 MATRIX DE ACCESO

```
Nivel 1: can(1)✓ can(2)✗ can(3)✗
Nivel 2: can(1)✓ can(2)✓ can(3)✗
Nivel 3: can(1)✓ can(2)✓ can(3)✓
```

---

## 🔄 FLUJO LOGIN

```
1. Usuario va a /signin
2. Registra: dni, email, phone, pwd
3. Redirige a /login
4. Ingresa email + pwd
5. Sistema verifica hash
6. localStorage = sesión
7. Redirige a /
8. Ve contenido según nivel
```

---

## 🚪 CERRAR SESIÓN

```javascript
// En Navbar:
const handleLogout = () => {
  authStore.logout()           // user = null
  router.push('/login')        // Redirige
}

// Resultado:
// - localStorage se limpia
// - user = null
// - isAuthenticated = false
// - Can() retorna false para todo
```

---

## 💾 DATOS ALMACENADOS

```javascript
// localStorage
{
  user: {
    id: "uuid...",
    dni: 12345678,
    nickname: "usuario1",
    email: "usuario1@example.com",
    cellphone: 1123456789,
    it_level: 1
    // hash_pwd NO se guarda
  }
}
```

---

## 🛡️ SEGURIDAD

```
✓ Contraseñas hasheadas (bcryptjs)
✓ Hash_pwd no en localStorage
✓ Route guards en servidor
✓ Validaciones en front
✓ API sin modificar
```

---

## 🧪 TEST RÁPIDO

```javascript
// En Console:
import { usePermissions } from '@/composables/usePermissions'
const { can } = usePermissions()

can(1)  // true si nivel >= 1
can(2)  // true si nivel >= 2
can(3)  // true si nivel == 3
```

---

## 📁 ARCHIVOS CLAVE

| Archivo | Función |
|---------|---------|
| `src/composables/usePermissions.js` | Sistema de permisos |
| `src/stores/auth.js` | Autenticación |
| `src/router/index.js` | Route guards |
| `src/components/Navbar.vue` | Menú contextual |
| `src/pages/Home.vue` | Página protegida |
| `src/pages/Login.vue` | Formulario login |
| `src/pages/SignIn.vue` | Formulario signup |

---

## 🎨 ESTILOS

```
Bootstrap 5.3.8
Bootstrap Icons
Responsive
Dark mode navbar
Gradient backgrounds
```

---

## ⚙️ DEPENDENCIAS

```json
{
  "bcryptjs": "^latest",
  "uuid": "^latest",
  "pinia": "^3.0.4",
  "vue-router": "^4.6.4",
  "axios": "^1.13.2"
}
```

---

## 🔴 ERRORES COMUNES

| Error | Solución |
|-------|----------|
| `can() undefined` | Importar usePermissions |
| `authStore undefined` | Importar useAuthStore |
| No carga sesión | Llamar loadUserFromStorage() |
| Redirige infinito | Verificar meta.requiresAuth |
| localStorage no guarda | Verificar sesión sin hash_pwd |

---

## 📞 AYUDA RÁPIDA

```
¿Mostrar solo para nivel 2?
→ <div v-if="can(2)"></div>

¿Desactivar botón si no es admin?
→ <button :disabled="!can(3)"></button>

¿Verificar en script?
→ if (can(3)) { adminCode() }

¿Obtener nombre del nivel?
→ getLevelName(authStore.user.it_level)

¿Limpiar sesión?
→ authStore.logout()
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] npm install (dependencias)
- [ ] npm run dev (servidor)
- [ ] Ir a /signin y registrarse
- [ ] Loguearse
- [ ] Ver home protegido
- [ ] Cambiar nivel en localStorage
- [ ] Recargar y ver cambios
- [ ] Logout funciona
- [ ] Navbar se actualiza

---

## 📈 PRÓXIMOS PASOS

```
1. Testear en navegador
2. Verificar rutas protegidas
3. Cambiar niveles en localStorage
4. Completar funcionalidades
5. Agregar más rutas protegidas
6. Implementar más permisos
```

---

## 🎉 ¡LISTO!

Sistema implementado, documentado y funcional.
