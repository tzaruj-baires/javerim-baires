# 🔧 CÓDIGO PARA GOOGLE APPS SCRIPT - Actualizar Tabla 'users'

## Problema

Frontend envía los datos correctamente, pero GAS no los está actualizando en la BD.

## Solución

El script de GAS necesita tener la lógica para actualizar la tabla 'users'.

---

## 📝 Código para Agregar a tu Google Apps Script

### Función Principal - `doPost(e)`

```javascript
function doPost(e) {
  const resource = e.parameter.resource
  const action = e.parameter.action

  try {
    if (action === 'update') {
      return updateRecord(resource, e.parameter)
    }
    // ... otras acciones (create, delete, etc)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}
```

### Función de Actualización - `updateRecord()`

```javascript
function updateRecord(resource, params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()

  if (resource === 'users') {
    return updateUsersTable(params)
  } else if (resource === 'main') {
    return updateMainTable(params)
  }

  throw new Error('Resource no reconocido: ' + resource)
}

function updateUsersTable(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users')
  const data = sheet.getDataRange().getValues()

  // Asumir que las columnas son: id, dni, nickname, email, cellphone, it_level, hash_pwd
  // Index: 0=id, 1=dni, 2=nickname, 3=email, 4=cellphone, 5=it_level, 6=hash_pwd

  const userId = params.id
  const newItLevel = parseInt(params.it_level)

  Logger.log('Actualizando usuario: ' + userId + ' a nivel: ' + newItLevel)

  // Buscar la fila con este id (empezar desde fila 2, fila 1 es encabezado)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      // Columna 0 es 'id'
      // Actualizar el campo it_level (columna 5)
      sheet.getRange(i + 1, 6).setValue(newItLevel) // +1 porque getRange es 1-indexed

      Logger.log('Usuario actualizado exitosamente en fila: ' + (i + 1))

      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Usuario actualizado correctamente',
          userId: userId,
          newItLevel: newItLevel,
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  throw new Error('Usuario no encontrado con id: ' + userId)
}
```

---

## 🔍 Estructura Esperada de la Tabla 'users'

| Columna | Campo     | Tipo        |
| ------- | --------- | ----------- |
| A (1)   | id        | Text (UUID) |
| B (2)   | dni       | Number      |
| C (3)   | nickname  | Text        |
| D (4)   | email     | Text        |
| E (5)   | cellphone | Number      |
| F (6)   | it_level  | Number      |
| G (7)   | hash_pwd  | Text        |

---

## ⚙️ Pasos para Implementar

### 1. Abre tu Google Sheet

```
Herramientas → Editor de secuencias de comandos
```

### 2. Copia el código anterior

### 3. Adapta los índices de columnas

Si tus columnas son diferentes, cambia:

```javascript
sheet.getRange(i + 1, 6).setValue(newItLevel) // 6 = columna F
```

**Mapeo de columnas:**

- Columna A = 1
- Columna B = 2
- Columna C = 3
- Columna D = 4
- Columna E = 5
- Columna F = 6
- Columna G = 7

### 4. Guarda y ejecuta

---

## 📊 Ejemplo Completo con Validación

```javascript
function updateUsersTable(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users')
  const data = sheet.getDataRange().getValues()

  const userId = params.id
  const newItLevel = parseInt(params.it_level)

  // Validar que it_level esté entre 0 y 3
  if (newItLevel < 0 || newItLevel > 3) {
    throw new Error('it_level debe estar entre 0 y 3')
  }

  Logger.log('Buscando usuario: ' + userId)
  Logger.log('Nuevas filas totales: ' + data.length)

  // Buscar usuario (empezar desde fila 2)
  for (let i = 1; i < data.length; i++) {
    const currentId = data[i][0] // Columna A (id)

    Logger.log('Fila ' + (i + 1) + ': id=' + currentId)

    if (currentId === userId) {
      const oldItLevel = data[i][5] // Columna F (it_level)

      // Actualizar
      sheet.getRange(i + 1, 6).setValue(newItLevel)

      Logger.log('✅ Usuario actualizado:')
      Logger.log('  ID: ' + userId)
      Logger.log('  Nivel anterior: ' + oldItLevel)
      Logger.log('  Nivel nuevo: ' + newItLevel)
      Logger.log('  Fila actualizada: ' + (i + 1))

      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: 'Usuario actualizado correctamente',
          userId: userId,
          oldItLevel: oldItLevel,
          newItLevel: newItLevel,
          row: i + 1,
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  Logger.log('❌ Usuario NO encontrado: ' + userId)
  throw new Error('Usuario no encontrado con id: ' + userId)
}
```

---

## 🧪 Para Probar

### 1. En Google Apps Script

```
Ejecución → doPost
```

### 2. Simula una solicitud (copia esto en la consola del navegador después de actualizar)

```javascript
fetch('YOUR_GAS_URL', {
  method: 'POST',
  body: new URLSearchParams({
    resource: 'users',
    action: 'update',
    id: 'UUID_DEL_USUARIO',
    it_level: '2',
  }),
})
  .then((r) => r.json())
  .then((data) => console.log(data))
```

---

## 📋 Checklist

- [ ] Encontraste el editor de Apps Script
- [ ] Actualizaste el código con la función updateUsersTable()
- [ ] Verificaste los índices de columnas (1-7)
- [ ] Guardaste el script
- [ ] Probaste cambiar un nivel en AdminUsers
- [ ] Verificaste que se actualice en Google Sheets

---

## ❌ Si Sigue Sin Funcionar

1. **Revisa los logs en GAS**:

   ```
   Ejecución → Mostrar registros de ejecución
   ```

2. **Verifica que la tabla se llame "users"**:

   ```
   Si no se llama así, cambia:
   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("users");
   ```

3. **Verifica la estructura de columnas**:
   ```
   Imprime data[i] para ver qué datos tienes
   Logger.log(JSON.stringify(data[i]));
   ```
