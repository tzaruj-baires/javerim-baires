# 🔧 DIAGNÓSTICO: Actualización de Nivel de IT

## ¿Qué cambió?

Mejoré la función `update` en `src/services/api.js` para enviar los datos de forma más robusta.

---

## 📋 Pasos para Probar

### 1. Abre la consola del navegador

```
F12 → Pestaña "Console"
```

### 2. Navega a `/admin/users`

```
Debe estar logueado con nivel 3 (admin)
```

### 3. Intenta cambiar el nivel de un usuario

```
1. Click en botón ✔ (verde)
2. Selecciona nuevo nivel
3. Click "Actualizar"
```

### 4. Revisa la consola - deberías ver:

```
[DEBUG]
Datos a enviar: {
  id: "uuid-xxx",
  it_level: 1
}

API Update Request: {
  resource: "users",
  action: "update",
  id: "uuid-xxx",
  it_level: 1
}
```

---

## 🔍 Qué Verificar

### ✅ Éxito

- El log muestra los datos correctamente
- Ves mensaje: "Acceso actualizado a [NIVEL] - Notificación enviada"
- En BD, la fila de 'users' tiene nuevo it_level

### ❌ Error

- Log muestra error
- Mensaje de error en rojo en la UI
- BD no se actualiza

---

## 📊 Cambios en API

### Antes

```javascript
export const update = (resource, data) => axios.post(API_URL, params(resource, 'update', data))
```

### Ahora

```javascript
export const update = (resource, data) => {
  const formData = new URLSearchParams()
  formData.append('resource', resource)
  formData.append('action', 'update')

  // Agregar cada propiedad explícitamente
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      formData.append(key, data[key])
    }
  }

  console.log('API Update Request:', { resource, action: 'update', ...data })
  return axios.post(API_URL, formData)
}
```

**Mejoras:**

- ✅ Envía FormData explícitamente
- ✅ Agrega cada parámetro por separado
- ✅ Log de depuración para ver qué se envía
- ✅ Más compatible con Google Apps Script

---

## 💻 Backend (Google Apps Script)

El script en GAS debe recibir los parámetros:

- `resource`: "users"
- `action`: "update"
- `id`: uuid del usuario
- `it_level`: nuevo nivel (0-3)

Y debe buscar la fila por `id` en la tabla 'users' y actualizar el campo `it_level`.

---

## 📁 Archivo Modificado

- ✅ `src/services/api.js` - Función `update()` mejorada
- ✅ `src/pages/AdminUsers.vue` - Console.log agregado para debug

---

## ¿Todavía no funciona?

Si después de esto sigue sin funcionar:

1. **Revisa la consola (F12)** - ¿hay errores rojos?
2. **Copia el contenido de "API Update Request"** - muéstralo
3. **Verifica el Backend en GAS** - ¿está recibiendo los parámetros?
4. **Prueba con otro usuario** - ¿mismo problema?
