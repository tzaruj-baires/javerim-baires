# Sistema de Permisos - Javerim Baires

## Resumen de Niveles

El sistema tiene 3 niveles de permisos basados en el campo `it_level` de la tabla `users`.

**Columnas importantes en base de datos:**

- `organizacion`: Empresa del usuario (en tabla `main`)
- `areas_ref`: Áreas PURAS separadas por comas (en tabla `main`) - **Se usa para comparar permisos**
- `areas`: Áreas + roles separados por comas (en tabla `main`) - Solo para visualización

---

## NIVEL 1: Básico

### Acceso a detalles

- ✅ Solo puede ver su **propio perfil** (`dni === authStore.user.dni`)

### Visualización en detalles

- ✅ Puede ver todas las secciones **excepto "Técnicos"**

### Edición en formulario

Puede editar las siguientes secciones:

- ✅ Información Personal
- ✅ Contacto
- ✅ Domicilio
- ✅ Médicos
- ✅ Vida y Desarrollo
- ✅ Familia

**NO puede editar:**

- ❌ Organización
- ❌ Técnicos

---

## NIVEL 2: Intermedio

### Acceso a detalles

- ✅ Puede ver su **propio perfil**
- ✅ Puede ver perfiles de usuarios **de la MISMA ORGANIZACIÓN**

**Lógica por tipo de usuario:**

1. **Usuario SIN "ROSH" en areas_ref**: Puede ver solo a usuarios que comparten AL MENOS UNA área
   - Debe cumplir: MISMA ORGANIZACIÓN + Comparten ÁREA

2. **Usuario CON "ROSH" en areas_ref**: Puede ver a TODOS de su organización (sin restricción de áreas)
   - Debe cumplir: MISMA ORGANIZACIÓN únicamente
   - ROSH es un rol administrativo que accede a toda la organización

**Restricción importante**: Usuario de EMPRESA1 NO puede ver a usuario de EMPRESA2, independientemente de áreas.

**Ejemplos:**

_Usuario A sin ROSH:_

- ✅ (EMPRESA1, areas_ref: "IT, Finanzas") **SÍ puede ver** (EMPRESA1, areas_ref: "IT, Ventas") - misma empresa, comparte IT
- ❌ (EMPRESA1, areas_ref: "IT, Finanzas") **NO puede ver** (EMPRESA1, areas_ref: "Legal") - misma empresa pero NO comparte área
- ❌ (EMPRESA1, areas_ref: "IT, Finanzas") **NO puede ver** (EMPRESA2, areas_ref: "IT") - empresas diferentes

_Usuario B con ROSH:_

- ✅ (EMPRESA1, areas_ref: "ROSH") **SÍ puede ver** (EMPRESA1, areas_ref: "IT, Ventas") - ROSH accede a todos
- ✅ (EMPRESA1, areas_ref: "ROSH") **SÍ puede ver** (EMPRESA1, areas_ref: "Legal") - ROSH accede a todos
- ❌ (EMPRESA1, areas_ref: "ROSH") **NO puede ver** (EMPRESA2, areas_ref: "IT") - ROSH de EMPRESA1 no ve EMPRESA2

### Visualización en detalles

- ✅ Puede ver todas las secciones **excepto "Técnicos"**

### Edición en formulario

Puede editar las siguientes secciones:

- ✅ Información Personal
- ✅ Contacto
- ✅ Domicilio
- ✅ Médicos
- ✅ Vida y Desarrollo
- ✅ Familia
- ✅ Organización

**NO puede editar:**

- ❌ Técnicos

---

## NIVEL 3: Avanzado

### Acceso a detalles

- ✅ Acceso a **todos los usuarios** sin restricciones

### Visualización en detalles

- ✅ Puede ver **todas las secciones incluyendo "Técnicos"**

### Edición en formulario

- ✅ Puede editar **todas las secciones**:
  - Información Personal
  - Contacto
  - Domicilio
  - Médicos
  - Vida y Desarrollo
  - Familia
  - Organización
  - Técnicos

---

## Implementación Técnica

### Archivo: `usePermissions.js`

#### Función `canAccessUser(targetDni, targetUserData)`

Verifica si el usuario puede acceder al perfil de otro usuario:

- **Nivel 3**: Siempre devuelve `true`
- **Nivel 1**: Solo si `dni === targetDni`
- **Nivel 2**: Si `dni === targetDni` O si cumple:
  - Misma `organizacion` (obligatorio)
  - **Y ENTONCES:**
    - Si tiene "ROSH" en `areas_ref`: Acceso a TODOS de su organización
    - Si NO tiene "ROSH": Solo acceso si comparten al menos una área

**Nota importante**: Usa `areas_ref` (áreas puras), NO `areas` (áreas+roles). ROSH es un área especial que otorga acceso administrativo a toda la organización.

#### Función `shareAreas(areas1, areas2)`

Verifica si dos strings de áreas comparten al menos una área común:

```javascript
// Ejemplo:
shareAreas('TI, Finanzas', 'Finanzas') // true
shareAreas('TI, Finanzas', 'Recursos Humanos') // false
shareAreas('ÁREA1, ÁREA2, ÁREA3', 'ÁREA2') // true
```

#### Función `canEditSection(section)`

Devuelve si el usuario puede editar una sección específica:

- **Nivel 1**: `['personal', 'contacto', 'domicilio', 'medicos', 'desarrollo', 'familia']`
- **Nivel 2**: `['personal', 'contacto', 'domicilio', 'medicos', 'desarrollo', 'familia', 'organizacion']`
- **Nivel 3**: Todas las secciones

#### Función `canSeeTechnical()`

Devuelve si el usuario puede ver la sección de Técnicos:

- Solo **Nivel 3** devuelve `true`

### Archivo: `auth.js` (Pinia Store)

#### Función `login(email, password)`

Actualizada para cargar también los datos de la tabla `main`:

```javascript
// Después de autenticar en tabla users, obtiene:
- areas_ref: de tabla main
- areas: de tabla main
- organizacion: de tabla main
```

Estos datos se guardan en `authStore.user` para usarlos en las validaciones de permisos.

### Archivo: `UserDetail.vue`

#### Computed `canEdit`

Verifica si el usuario actual puede editar el perfil que está viendo usando `areas_ref`:

- `canAccessUser()` para validar acceso
- Mismo usuario nivel 3 = siempre puede editar
- Nivel 1 = solo su propio perfil
- Nivel 2 = su propio perfil O usuarios del mismo área

#### Rendering condicional

- La sección "Técnicos" solo se renderiza si `canSeeTechnical()` devuelve `true`
- Botón "Editar Datos" solo habilitado si `canEdit` es `true`
- Botón "Eliminar" solo visible para nivel 3 (`can(3)`)

### Archivo: `ProfileForm.vue`

#### Props

- `canEditSection`: Función que recibe el nombre de la sección
- `canSeeTechnical`: Función que devuelve si puede ver sección técnicos

#### Computed `canEditAny`

Verifica si puede editar al menos UNA sección:

```javascript
const sections = [
  'personal',
  'contacto',
  'domicilio',
  'medicos',
  'desarrollo',
  'familia',
  'organizacion',
  'tecnicos',
]
return sections.some((section) => props.canEditSection(section))
```

#### Campos deshabilitados

Cada campo de input tiene:

```vue
:disabled="isLoading || !canEditSection('nombre-seccion')"
```

#### Badges "Solo lectura"

Cada acordeón con permisos limitados muestra un badge:

```vue
<span v-if="!canEditSection('nombre-seccion')" class="badge bg-secondary ms-auto">
  Solo lectura
</span>
```

---

## Flujo de Acceso

```
1. Usuario accede a /javer/:dni
   ├─ ¿Nivel < 1? → No autorizado
   │
   ├─ ¿Nivel 1?
   │  └─ ¿dni === user.dni? → Acceso permitido
   │     └─ No → Sin permiso
   │
   ├─ ¿Nivel 2?
   │  ├─ ¿dni === user.dni? → Acceso permitido
   │  └─ ¿Misma organizacion?
   │     └─ Sí: ¿Tiene "ROSH" en areas_ref?
   │           Sí → Acceso permitido (acceso administrativo)
   │           No → ¿Comparten áreas? → Acceso permitido
   │                                     No: Sin permiso
   │           No: Sin permiso
   │
   └─ ¿Nivel 3? → Acceso permitido (siempre)

2. En la página de detalles
   ├─ Se cargan datos de tablas 'main' y 'users'
   ├─ Se valida `canAccessUser()` con lógica de ROSH
   ├─ Se renderizan secciones según `canSeeTechnical()`
   └─ Se habilitan botones según `canEdit` computed

3. Al hacer click en "Editar"
   ├─ Se abre ProfileForm con props `canEditSection` y `canSeeTechnical`
   ├─ Campos deshabilitados según la sección
   ├─ Botones deshabilitados si NO puede editar ninguna sección
   └─ Al guardar, se actualiza 'main' y/o 'users'
```

---

## Ejemplo: Usuario Nivel 2

```javascript
// EJEMPLO 1: Usuario Nivel 2 SIN ROSH
authStore.user = {
  dni: 12345678,
  it_level: 2,
  organizacion: "EMPRESA1",
  areas_ref: "IT, Finanzas, Recursos Humanos",
  areas: "IT - Senior, Finanzas - Gerente"
}

// Puede acceder a:
- Su propio perfil (12345678) ✅
- Usuario (EMPRESA1, areas_ref: "IT, Contabilidad") ✅ (misma empresa, comparte "IT")
- Usuario (EMPRESA1, areas_ref: "Finanzas") ✅ (misma empresa, comparte "Finanzas")
- Usuario (EMPRESA1, areas_ref: "ENSH, IT") ✅ (misma empresa, comparte "IT")

// NO puede acceder a:
- Usuario (EMPRESA1, areas_ref: "Legal") ❌ (misma empresa pero NO comparte área)
- Usuario (EMPRESA2, areas_ref: "IT") ❌ (DIFERENTE empresa, aunque comparta "IT")

---

// EJEMPLO 2: Usuario Nivel 2 CON ROSH (acceso administrativo)
authStore.user = {
  dni: 87654321,
  it_level: 2,
  organizacion: "EMPRESA1",
  areas_ref: "ROSH",
  areas: "ROSH - Administrador"
}

// Puede acceder a (TODOS de EMPRESA1):
- Usuario (EMPRESA1, areas_ref: "IT, Contabilidad") ✅ (ROSH accede a todos)
- Usuario (EMPRESA1, areas_ref: "Finanzas") ✅ (ROSH accede a todos)
- Usuario (EMPRESA1, areas_ref: "Legal") ✅ (ROSH accede a todos)
- Usuario (EMPRESA1, areas_ref: "ENSH, IT") ✅ (ROSH accede a todos)

// NO puede acceder a:
- Usuario (EMPRESA2, areas_ref: "ROSH") ❌ (ROSH de EMPRESA1 no accede a EMPRESA2)
- Usuario (EMPRESA2, areas_ref: "IT") ❌ (ROSH de EMPRESA1 no accede a EMPRESA2)

---

// En formulario puede editar:
- personal, contacto, domicilio, medicos, desarrollo, familia, organizacion
// NO puede editar:
- tecnicos
```

---

## Cambios desde la versión anterior

### Versión Anterior

- Nivel 2: Solo podía editar usuarios del MISMO área Y organización (combinación exacta)
- Nivel 1: Permitía editar organización

### Versión Actual (Reformulada)

- Nivel 2: Puede editar usuarios que comparten AL MENOS UNA área (intersección)
- Nivel 1: NO puede editar organización
- Nivel 2: SÍ puede editar organización

---

## Notas de Desarrollo

1. **Compartir áreas**: La función `shareAreas()` usa `split(',')` y `trim()` para manejar espacios
2. **Badge "Solo lectura"**: Se muestra automáticamente cuando no puede editar una sección
3. **Botones deshabilitados**: Los botones se deshabilitan si NO puede editar NINGUNA sección
4. **Nivel 3 sin restricciones**: Siempre puede hacer todo, incluso si no es nivel 3 en ciertos contextos
