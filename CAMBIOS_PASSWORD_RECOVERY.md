# Cambios - Recuperación de Contraseña y Visibilidad de Contraseña

## Resumen

Se han implementado dos funcionalidades principales:

1. **Mostrar/Ocultar Contraseña**: Toggler de visibilidad en formularios de Login, SignIn y Recuperación de contraseña
2. **Recuperación de Contraseña**: Nuevo flujo de 3 pasos para que los usuarios puedan resetear su contraseña olvidada

## Cambios Realizados

### 1. **SignIn.vue** - Actualización

- ✅ Agregado toggle de mostrar/ocultar contraseña en ambos campos (Contraseña y Confirmar Contraseña)
- ✅ Agregado enlace a página de recuperación de contraseña
- ✅ Iconos de ojo (Bootstrap Icons) para mejor UX

**Variables nuevas:**

```javascript
const showPassword = ref(false)
const showConfirmPassword = ref(false)
```

### 2. **Login.vue** - Actualización

- ✅ Agregado toggle de mostrar/ocultar contraseña
- ✅ Agregado enlace a página de recuperación de contraseña
- ✅ Iconos de ojo (Bootstrap Icons) para mejor UX

**Variables nuevas:**

```javascript
const showPassword = ref(false)
```

### 3. **ForgotPassword.vue** - Nuevo Archivo

Página completa con 3 pasos:

**Paso 1: Verificación de Identidad**

- Solicita DNI y Email
- Verifica que el usuario exista en la base de datos

**Paso 2: Resetear Contraseña**

- Solicita nueva contraseña
- Confirmar nueva contraseña
- Toggle de visibilidad en ambos campos
- Validación de coincidencia y longitud mínima

**Paso 3: Confirmación**

- Muestra mensaje de éxito
- Enlace directo a página de Login

### 4. **router/index.js** - Actualización

- ✅ Importada la nueva página `ForgotPassword`
- ✅ Agregada ruta `/forgot-password` con nombre `forgotPassword`
- ✅ Meta información: no requiere autenticación

```javascript
{
  path: '/forgot-password',
  name: 'forgotPassword',
  component: ForgotPassword,
  meta: { requiresAuth: false },
}
```

### 5. **stores/auth.js** - Actualización

Agregados dos nuevos métodos:

**`verifyUserIdentity(data)`**

- Parámetros: `{ dni, email }`
- Busca el usuario por DNI y email
- Valida que exista
- Guarda datos en sessionStorage para el reset

**`resetPassword(data)`**

- Parámetros: `{ dni, email, newPassword }`
- Busca el usuario por DNI y email
- Genera nuevo hash de contraseña con bcryptjs
- Actualiza en la base de datos (Google Sheets)
- Limpia datos temporales de sessionStorage

## Características Implementadas

### ✅ Mostrar/Ocultar Contraseña

- Disponible en: Login, SignIn, ForgotPassword
- Usa iconos de Bootstrap Icons (bi bi-eye / bi bi-eye-slash)
- Botón junto al campo de contraseña
- Mejora la UX permitiendo verificar lo escrito

### ✅ Recuperación de Contraseña en 3 Pasos

1. **Verificación**: Validación por DNI + Email
2. **Reseteo**: Establecer nueva contraseña
3. **Confirmación**: Mensaje de éxito y redirección a Login

### ✅ Validaciones Implementadas

- DNI debe tener 8 dígitos
- Email debe ser válido
- Contraseña mínimo 6 caracteres
- Las contraseñas deben coincidir
- Usuario debe existir en la base de datos

### ✅ Seguridad

- Las contraseñas se hashean con bcryptjs
- Uso de sessionStorage para datos temporales
- No se almacenan contraseñas en localStorage
- Validaciones en frontend y backend

## Rutas Disponibles

- `/login` - Iniciar sesión (con toggle de contraseña)
- `/signin` - Registro (con toggle de contraseña)
- `/forgot-password` - Recuperar contraseña (NEW)

## Links de Navegación Agregados

- **SignIn → Login**: "¿Ya tienes cuenta?"
- **SignIn → ForgotPassword**: "¿Olvidaste tu contraseña?"
- **Login → SignIn**: "¿No tienes cuenta? Regístrate aquí"
- **Login → ForgotPassword**: "¿Olvidaste tu contraseña?"
- **ForgotPassword → Login**: "Volver a Iniciar sesión" (después de éxito)
- **ForgotPassword → SignIn**: "¿No tienes cuenta? Regístrate"

## Próximos Pasos Opcionales

- [ ] Implementar envío de email de confirmación
- [ ] Agregar token de seguridad por tiempo limitado
- [ ] Implementar captcha en formularios de recuperación
- [ ] Agregar historial de cambios de contraseña
- [ ] Implementar bloqueo temporal tras intentos fallidos
