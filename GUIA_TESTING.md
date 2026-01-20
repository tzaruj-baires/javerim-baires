# 🧪 GUÍA DE TESTING

## Cómo Probar el Sistema de Autenticación y Permisos

---

## 1️⃣ REGISTRAR UN USUARIO

### Pasos:
1. Acceder a `http://localhost:5173/signin`
2. Rellenar formulario:
   - **DNI**: 12345678 (8 dígitos)
   - **Email**: usuario1@example.com
   - **Teléfono**: 1123456789
   - **Nivel IT**: Seleccionar "1 - Básico"
   - **Contraseña**: micontraseña123
   - **Confirmar**: micontraseña123
3. Click en "Registrarse"
4. Ver mensaje de éxito
5. Será redirigido a `/login`

### Verificar:
- ✓ Usuario se crea en API (Google Apps Script)
- ✓ Contraseña está hasheada
- ✓ Nickname se genera automáticamente del email (usuario1)
- ✓ it_level = 1 por defecto

---

## 2️⃣ INICIAR SESIÓN

### Pasos:
1. En `/login`, ingresar:
   - **Email**: usuario1@example.com
   - **Contraseña**: micontraseña123
2. Click "Iniciar Sesión"
3. Ver mensaje de éxito
4. Será redirigido a `/` (Home)

### Verificar:
- ✓ Sesión se guarda en localStorage
- ✓ En DevTools → Application → localStorage → user
- ✓ Navbar muestra nombre del usuario
- ✓ Navbar muestra badge con nivel

---

## 3️⃣ VERIFICAR PROTECCIÓN DE RUTAS

### Test 1: Acceder a rutas protegidas sin autenticación
1. Abrir DevTools → Application → Storage → Clear all
2. Ir a `http://localhost:5173/`
3. **Resultado esperado**: Redirige a `/login` automáticamente

### Test 2: Intentar volver a login si ya está autenticado
1. Estar logueado
2. Ir a `http://localhost:5173/login`
3. **Resultado esperado**: Redirige a `/` automáticamente

### Test 3: Verificar rutas válidas
- `/` (Home) → Acceso OK si autenticado
- `/login` → Acceso OK solo si NO autenticado
- `/signin` → Acceso OK solo si NO autenticado
- Cualquier otra → Según requiresAuth en router

---

## 4️⃣ PROBAR SISTEMA DE PERMISOS (can)

### Test 1: Nivel 1 (Básico)
1. Registrarse con nivel 1
2. Ir a Home (`/`)
3. **Debería ver:**
   - ✓ Tabla de usuarios (básica)
   - ✓ Tarjeta "Nivel Básico (1+)"
   - ✓ Badge "Básico" en Navbar
4. **No debería ver:**
   - ✗ Tarjeta "Nivel Intermedio (2+)"
   - ✗ Tarjeta "Nivel Avanzado (3)"
   - ✗ Botón "Eliminar" en tabla
   - ✗ Opción "Reportes" en menú Navbar

---

## 4.2️⃣ CAMBIAR NIVEL A 2 (Intermedio)

Para simular esto (sin ir a BD):

### Opción 1: Modificar localStorage directamente
```javascript
// En DevTools Console:
const user = JSON.parse(localStorage.getItem('user'))
user.it_level = 2
localStorage.setItem('user', JSON.stringify(user))
location.reload()
```

### O Opción 2: En API/Google Apps Script
Cambiar it_level del usuario a 2, luego reloguear

### Con Nivel 2 debería ver:
- ✓ Tabla de usuarios con columna "Organización"
- ✓ Botón "Editar" en la tabla
- ✓ Tarjeta "Nivel Intermedio (2+)"
- ✓ Opciones "Configuración" y "Reportes" en Navbar
- ✗ Botón "Eliminar" (solo para nivel 3)
- ✗ Tarjeta "Nivel Avanzado (3)"
- ✗ "Admin Panel" en Navbar

---

## 4.3️⃣ CAMBIAR NIVEL A 3 (Avanzado)

```javascript
const user = JSON.parse(localStorage.getItem('user'))
user.it_level = 3
localStorage.setItem('user', JSON.stringify(user))
location.reload()
```

### Con Nivel 3 debería ver:
- ✓ Tabla de usuarios con columna "Organización"
- ✓ Botones "Editar" Y "Eliminar" en tabla
- ✓ Tarjeta "Nivel Avanzado (3)"
- ✓ TODAS las opciones en Navbar (Configuración, Reportes, Admin, Gestionar usuarios)
- ✓ Tarjetas de todos los niveles

---

## 5️⃣ PROBAR NAVBAR

### Test 1: Sin autenticación
1. Limpiar localStorage
2. Navbar debe mostrar:
   - ✓ Logo "Javerim Baires"
   - ✓ Botón "Iniciar Sesión"
   - ✓ Botón "Registrarse"
   - ✗ Menú de usuario

### Test 2: Con autenticación (Nivel 1)
1. Loguearse con nivel 1
2. Navbar debe mostrar:
   - ✓ Logo
   - ✓ Badge "Básico"
   - ✓ Menú usuario con:
     - Nombre/Email del usuario
     - Nivel IT actual
     - Botón "Cerrar Sesión"
   - ✗ Opciones "Configuración" o "Admin"

### Test 3: Con autenticación (Nivel 2)
1. Cambiar a nivel 2
2. Navbar debe mostrar opciones adicionales:
   - ✓ "Configuración"
   - ✓ "Reportes"

### Test 4: Con autenticación (Nivel 3)
1. Cambiar a nivel 3
2. Navbar debe mostrar TODAS las opciones

---

## 6️⃣ PROBAR LOGOUT

### Pasos:
1. Estar logueado
2. Click en nombre usuario (Navbar)
3. Click "Cerrar Sesión"
4. **Verificar:**
   - ✓ localStorage se limpia
   - ✓ Redirige a `/login`
   - ✓ Navbar vuelve a mostrar botones de login/signup
   - ✓ Ya no puede acceder a `/`

---

## 7️⃣ PROBAR VALIDACIONES

### En Registro (/signin):

#### DNI inválido:
```
Input: 1234567  (solo 7 dígitos)
Error: "DNI debe tener 8 dígitos"
```

#### Contraseñas no coinciden:
```
Contraseña: abc123
Confirmar: xyz789
Error: "Las contraseñas no coinciden"
```

#### Contraseña muy corta:
```
Contraseña: abc1
Error: "La contraseña debe tener al menos 6 caracteres"
```

#### Campo vacío:
```
Error: "Por favor completa todos los campos"
```

### En Login (/login):

#### Usuario no existe:
```
Email: nosoynadie@mail.com
Pwd: cualquiera
Error: "Usuario no encontrado"
```

#### Contraseña incorrecta:
```
Email: usuario1@example.com
Pwd: contraseña_incorrecta
Error: "Contraseña incorrecta"
```

---

## 8️⃣ PROBAR FUNCIONALIDAD CAN()

### En Console (Estando logueado):

```javascript
// Importar y testar
import { usePermissions } from '@/composables/usePermissions'
const { can, getLevelName } = usePermissions()

// Test 1: Nivel 1
can(1)  // true
can(2)  // false (es nivel 1)
can(3)  // false

// Test 2: Cambiar a nivel 2
const user = JSON.parse(localStorage.getItem('user'))
user.it_level = 2
localStorage.setItem('user', JSON.stringify(user))
location.reload()

can(1)  // true
can(2)  // true
can(3)  // false (es nivel 2)

// Test 3: getLevelName
getLevelName(1)  // "Básico"
getLevelName(2)  // "Intermedio"
getLevelName(3)  // "Avanzado"
```

---

## 9️⃣ PRUEBA COMPLETA (E2E)

### Escenario completo:

1. **Limpiar storage**: DevTools → Clear all
2. **Registrarse**: `/signin` → Completar formulario → Registrar
3. **Verificar**: Usuario creado, redirigido a `/login`
4. **Loguearse**: Email + pwd → Iniciar sesión
5. **Verificar Home**: Ver contenido de nivel 1
6. **Verificar Navbar**: Nombre, nivel, opción logout
7. **Cambiar nivel**: Modificar localStorage a nivel 2
8. **Recargar**: `location.reload()`
9. **Verificar cambios**: Nuevas columnas/botones visibles
10. **Logout**: Click Navbar → Cerrar sesión
11. **Verificar**: Redirigido a login, localStorage limpio

---

## 🔟 CHECKLIST FINAL

- [ ] Registro funciona con validaciones
- [ ] Login verifica hash correctamente
- [ ] Rutas protegidas redirigen
- [ ] localStorage persiste sesión
- [ ] can(1) muestra contenido básico
- [ ] can(2) oculta hasta que sea nivel 2+
- [ ] can(3) solo nivel 3 ve admin
- [ ] Navbar actualiza según nivel
- [ ] Logout limpia sesión
- [ ] Refresh mantiene sesión (localStorage)
- [ ] Contraseña correcta entra, incorrecta falla
- [ ] DNI valida 8 dígitos
- [ ] Nickname se genera del email

---

## 📝 NOTAS DE TESTING

```
✓ Usar DevTools para ver localStorage
✓ Usar Console para test de composables
✓ Limpiar localStorage entre tests
✓ Usar diferentes niveles IT para cada test
✓ Verificar redireccionamientos
✓ Testear en mobile (responsive)
```

¡Listo para testear! 🚀
