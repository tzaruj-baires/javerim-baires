# 🏗️ ARQUITECTURA DEL SISTEMA

## 📐 Estructura de Carpetas

```
src/
├── components/
│   ├── Navbar.vue           # Barra de navegación con logout
│   └── ProfileForm.vue      # Formulario offcanvas para editar perfil
├── pages/
│   ├── Home.vue            # Página principal
│   ├── Login.vue           # Inicio de sesión
│   ├── SignIn.vue          # Registro de usuarios
│   ├── MyProfile.vue       # Perfil propio (nivel 1+)
│   └── UserDetail.vue      # Editar usuarios (nivel 2+)
├── router/
│   └── index.js            # Rutas + guardias de autenticación
├── services/
│   └── api.js              # Llamadas HTTP a Google Apps Script
├── stores/
│   └── auth.js             # Pinia store (usuario logueado)
├── composables/
│   └── usePermissions.js   # Lógica de permisos
└── App.vue
```

## 🗂️ FLUJO DE DATOS

### Base de Datos (Google Sheets)

**Tabla 'main'** (DNI, nombre, apellido, celular, mail_operativo, mail_personal, organizacion)
- Registro maestro de personas
- Campo identificador: DNI

**Tabla 'users'** (dni, email, cellphone, it_level, hash_pwd)
- Usuarios registrados con contraseña hasheada
- Campo identificador: dni

⚠️ **Nota:** 'main' usa "celular" | 'users' usa "cellphone"

### Ciclo de Autenticación

1. **Registro** (`/signin`)
   - Frontend: Hashea contraseña con bcryptjs (10 rounds)
   - GAS: Crea registro en 'main' + 'users'
   - Nunca almacena hash en localStorage

2. **Login** (`/login`)
   - Frontend: Valida email + compara hash de contraseña
   - Pinia: Almacena usuario en localStorage (sin hash)
   - Router: Redirige a `/`

3. **Protección de Rutas**
   - beforeEach: Verifica autenticación + minLevel
   - Sin auth → `/login`
   - Auth insuficiente → `/` (home)

## 🔐 NIVELES DE PERMISO

```
0 = Sin acceso (no registrado)
1 = Básico (ver propio perfil en /mi-perfil)
2 = Intermedio (ver/editar otros usuarios en /javer/:dni)
3 = Avanzado (admin - puede eliminar usuarios)
```

Validación en: `router.beforeEach()` + componentes

## 🔄 COMPONENTES CLAVE

### Navbar.vue
- Logout button
- "Mi Perfil" link (solo si nivel >= 1)
- Mensaje de bienvenida

### ProfileForm.vue (Offcanvas)
- Edita perfil del usuario
- Campos: nombre, apellido, email, teléfono, organización
- Actualiza 'main' con `id: DNI` + 'users' con `id: dni`
- Manejo de errores con alerts

### MyProfile.vue
- Ruta: `/mi-perfil` (minLevel: 1)
- Muestra perfil propio desde 'main'
- Teléfono: `celular || cellphone || '-'`
- Botón "Editar" abre ProfileForm

### UserDetail.vue
- Ruta: `/javer/:dni` (minLevel: 2)
- Combina datos de 'main' + 'users'
- Teléfono: `celular || cellphone || '-'`
- Level 3: Botón "Eliminar" (elimina de ambas tablas)

## 📡 API (Google Apps Script)

### Métodos

```javascript
// READ
getAll(resource) 
// Devuelve: { data: [...] }

// CREATE
create(resource, data)
// Devuelve: { success: true }

// UPDATE
update(resource, data)
// Requiere: data.id (identificador a buscar)
// Devuelve: { success: true }

// DELETE
remove(resource, id)
// Devuelve: { success: true }
```

### Llamadas Frontned

```javascript
// Cargar usuarios
const response = await getAll('main')
const users = response.data

// Actualizar (con id para buscar)
await update('main', {
  id: DNI,
  nombre: 'Nuevo nombre',
  // ...
})

// Eliminar
await remove('main', DNI)
```

## 🛠️ COMPOSABLES

### usePermissions.js

```javascript
// Verificar si puede hacer acción
can(minLevel) // true/false

// Nivel exacto
canExact(level) // true/false

// Múltiples niveles
canAny([2, 3]) // true/false

// Nombre del nivel
getLevelName(level) // "Básico", "Intermedio", etc.
```

## 🔒 ALMACENAMIENTO LOCAL

```javascript
// AuthStore (Pinia)
{
  user: {
    dni: 12345678,
    email: 'user@example.com',
    cellphone: '1234567890',
    it_level: 1,
    nickname: 'Juan'
  },
  isAuthenticated: true
}
```

⚠️ **Nunca** almacena el hash de contraseña

## 📱 CAMPO TELÉFONO

| Tabla | Campo | Fuente |
|-------|-------|--------|
| main | celular | Mostrado en perfiles |
| users | cellphone | Almacenado en registro de usuario |

ProfileForm mapea automáticamente ambos campos durante actualización.

---

*Última actualización: Enero 2026*
