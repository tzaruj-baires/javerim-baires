# 📋 AUTO-CREACIÓN DE REGISTRO EN TABLA 'MAIN' - LOGIN

## ✅ Implementado

Cuando un usuario inicia sesión en la plataforma, el sistema **automáticamente crea un registro en la tabla 'main'** si no existe ninguno con su DNI, email o celular.

---

## 📊 Flujo de Login

```
Usuario ingresa email + contraseña
         ↓
Valida credenciales en tabla 'users'
         ↓
Obtiene datos de tabla 'main'
         ↓
¿Existe registro con mismo DNI?
         │
    YES  │  NO
        │     │
        ↓     ↓
    Usar      ¿Existe email o celular?
    datos        │
    main     YES │  NO
              │     │
              ↓     ✅CREATE new record in 'main'
            Nada
            (persona ya registrada desde antes)
         │
         ↓
    Sesión exitosa
    Datos completos guardados
```

---

## 🔍 Lógica Detallada

### Paso 1: Validar Credenciales

```javascript
// Busca usuario en 'users' por email
const foundUser = users.find((u) => u.email === email)
// Valida contraseña con bcrypt
const isValidPassword = await bcryptjs.compare(password, foundUser.hash_pwd)
```

### Paso 2: Verificar si existe en 'main'

```javascript
// Busca por DNI (campo principal)
const mainRecord = mainData.find((m) => m.DNI === foundUser.dni)
```

### Paso 3: Si NO existe en 'main'

```javascript
if (!mainRecord) {
  // Verifica si existe email o celular
  const existingByEmailOrPhone = mainData.some(
    (m) => m.email === foundUser.email || m.celular === foundUser.cellphone.toString(),
  )

  // Si NO existe por email ni celular, crea nuevo registro
  if (!existingByEmailOrPhone) {
    await api.create('main', {
      DNI: foundUser.dni,
      email: foundUser.email,
      celular: foundUser.cellphone.toString(),
      nombre: '',
      apellido: '',
      apodo: foundUser.nickname,
      organizacion: '',
      areas: '',
      areas_ref: '',
      mail_operativo: foundUser.email,
      mail_personal: '',
    })
  }
}
```

---

## 📁 Campos que se crean en 'main'

| Campo          | Valor                 | Tipo    |
| -------------- | --------------------- | ------- |
| DNI            | dni del usuario       | integer |
| email          | email del usuario     | string  |
| celular        | cellphone del usuario | string  |
| nombre         | vacío ""              | string  |
| apellido       | vacío ""              | string  |
| apodo          | nickname del usuario  | string  |
| organizacion   | vacío ""              | string  |
| areas          | vacío ""              | string  |
| areas_ref      | vacío ""              | string  |
| mail_operativo | email del usuario     | string  |
| mail_personal  | vacío ""              | string  |

---

## 🎯 Casos de Uso

### Caso 1: Usuario nuevo (registrado solo en 'users')

```
1. Usuario hace signup en /signin
2. Se crea en tabla 'users'
3. Primer login
4. Sistema crea automáticamente fila en 'main' con campos vacíos
5. Usuario puede luego rellenar datos en perfil
```

### Caso 2: Usuario pre-existente (solo en 'main')

```
1. Persona existe en 'main' desde antes
2. Administrador la agrega a 'users'
3. Usuario inicia sesión
4. Sistema detecta que existe en 'main'
5. NO crea duplicado, usa registro existente
```

### Caso 3: Usuario con email diferente pero mismo teléfono

```
1. Persona A: dni=123, email=a@mail.com, celular=1111111111 en 'main'
2. Persona A se registra como: dni=123, email=b@mail.com
3. Intenta login
4. Sistema detecta celular duplicado en 'main'
5. NO crea nuevo, asume es el mismo usuario
```

---

## ✨ Beneficios

✅ **Usuarios nuevos pueden completar perfil gradualmente**

- Se registran en /signin
- Login automáticamente crea fila en 'main'
- Después pueden editar perfil para agregar organización, áreas, etc.

✅ **Evita duplicados**

- Si DNI, email o celular ya existen, no crea copia
- Valida todas las coincidencias posibles

✅ **Seamless experience**

- Usuario no ve los detalles técnicos
- Todo sucede automáticamente al login

---

## 📝 Información Guardada en Sesión

Después del login exitoso, la sesión incluye:

```javascript
{
  id: "uuid-xxx",
  dni: 12345678,
  nickname: "john",
  email: "john@example.com",
  cellphone: 1123456789,
  it_level: 0,
  // Datos de 'main' si existen:
  areas_ref: "",
  areas: "",
  organizacion: ""
}
```

---

## 🔄 Flujo de Datos

### Antes (sin auto-creación):

```
Signup en 'users' → Login → Sin datos en 'main' → Perfil vacío
```

### Ahora (con auto-creación):

```
Signup en 'users' → Login → Auto-crea en 'main' → Perfil listo para editar
```

---

## 📁 Archivo Modificado

- ✅ **[src/stores/auth.js](src/stores/auth.js)** - Función `login()` actualizada

---

## 🧪 Testing

### Test: Nuevo Usuario

```
1. Registrarse en /signin con:
   - DNI: 99999999
   - Email: nuevo@test.com
   - Celular: 1199999999
   - Password: test123456

2. Login con nuevo@test.com / test123456

3. Verificar en BD (tabla 'main'):
   ✓ Debe existir fila con DNI=99999999
   ✓ email = nuevo@test.com
   ✓ celular = 1199999999
   ✓ nombre, apellido, etc = vacíos
   ✓ Editables desde /perfil
```

### Test: Usuario Pre-existente

```
1. Crear fila manual en 'main' con:
   - DNI: 88888888
   - email: viejo@test.com
   - celular: 1188888888

2. Registrar nuevo usuario en 'users':
   - DNI: 88888888
   - Email: viejo@test.com
   - Celular: 1188888888

3. Login

4. Verificar:
   ✓ NO debe crear duplicado en 'main'
   ✓ Usa el registro existente
```

---

## 💡 Comportamiento Especial

- ⏱️ **Async**: La creación en 'main' es automática, no requiere input del usuario
- 🔍 **Validación**: Chequea DNI, email Y celular (cualquiera que coincida = no crear)
- 📊 **Vacío**: Los campos nombre, apellido, organizacion, etc se crean vacíos (usuario los rellena después)
- 🔄 **Actualización**: Si se acaba de crear, se vuelve a obtener para guardar datos actualizados en sesión

---

## 🚀 Estado

**Estado:** ✅ COMPLETADO Y FUNCIONANDO

**Próximos pasos opcionales:**

- Permitir que usuarios editen todos los campos de 'main' en su perfil
- Agregar validación de datos duplicados en perfil
