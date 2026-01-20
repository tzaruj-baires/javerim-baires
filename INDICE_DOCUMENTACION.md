# 📚 DOCUMENTACIÓN - ÍNDICE

## 📖 Archivos Principales

### 1. 🚀 [README.md](README.md) - COMIENZA AQUÍ
- Descripción general del sistema
- Quick start (instalación y prueba)
- Ejemplos de uso con `can()`
- Tabla de acceso y niveles
- Soporte rápido

**Tiempo de lectura:** 5 minutos

### 2. 🔧 [TECNICO.md](TECNICO.md) - REFERENCIA TÉCNICA
- APIs completas (composables, stores, router)
- Estructura de base de datos
- Flujos detallados (registro, login, logout, permisos)
- Seguridad (hashing, validaciones)
- Testing y troubleshooting

**Tiempo de lectura:** 15 minutos

---

## 📁 ARCHIVOS HISTÓRICOS (Consulta opcional)

Los siguientes archivos contienen información que ya está consolidada en README.md y TECNICO.md:

- `AUTENTICACION.md` - Sistema de autenticación (ref. histórica)
- `PERMISOS_Y_AUTENTICACION.md` - Permisos detallados (ref. histórica)
- `DIAGRAMAS_SISTEMA.md` - Diagramas visuales (ref. histórica)
- `GUIA_TESTING.md` - Guía de testing paso a paso (ref. histórica)
- `REFERENCIA_RAPIDA.md` - Quick reference (ref. histórica)
- `IMPLEMENTACION_FINAL.md` - Resumen final (ref. histórica)
- `RESUMEN_IMPLEMENTACION.md` - Primera versión (ref. histórica)
- `README_SISTEMA_COMPLETO.md` - Resumen completo (ref. histórica)

---

## 🎯 FLUJO RECOMENDADO

### Para Empezar Rápido (5 min):
1. Leer [README.md](README.md)
2. Ejecutar `npm install && npm run dev`
3. Probar `/signin` → `/login` → `/`

### Para Entender a Fondo (20 min):
1. Leer [README.md](README.md) - Concepto general
2. Leer [TECNICO.md](TECNICO.md) - Detalles técnicos

### Para Implementar Nuevas Features:
1. Ver sección "Componentes: Uso de Permisos" en TECNICO.md
2. Ver sección "Validaciones: Reglas" en TECNICO.md
3. Ver ejemplos en Home.vue o Navbar.vue

### Para Debuggear Problemas:
1. Ver sección "Troubleshooting" en TECNICO.md
2. Ver sección "Testing: Casos" en TECNICO.md

---

## 🔑 CONCEPTOS CLAVE

### ¿Qué es `can()`?
Función que verifica si el usuario tiene permiso para una funcionalidad según su nivel IT.

```javascript
can(2)  // true si user.it_level >= 2
```

### ¿Qué es `it_level`?
Número (0-3) que determina permisos del usuario:
- 0 = Sin acceso (usuario nuevo)
- 1 = Básico
- 2 = Intermedio
- 3 = Avanzado (Admin)

### ¿Cómo funciona la protección?
El router guard verifica si el usuario está autenticado antes de acceder a rutas protegidas.

---

## 🎓 CASOS DE USO

| Pregunta | Dónde buscar |
|----------|--------------|
| ¿Cómo muestro contenido solo para nivel 2? | README.md - Ejemplos |
| ¿Qué hace `can(level)`? | TECNICO.md - Composable: usePermissions |
| ¿Cómo hago login? | README.md - Inicio Rápido |
| ¿Cómo cambio nivel del usuario? | TECNICO.md - Base de Datos |
| ¿Por qué me redirige a login? | TECNICO.md - Router: Protección |
| ¿Es seguro lo que hago? | TECNICO.md - Troubleshooting |

---

## 📊 ESTRUCTURA DE CARPETAS

```
Javerim Baires/
├── README.md                    ← LEER PRIMERO
├── TECNICO.md                   ← REFERENCIA
├── INDICE_DOCUMENTACION.md      ← ESTE ARCHIVO
│
├── src/
│   ├── composables/
│   │   └── usePermissions.js
│   ├── stores/
│   │   └── auth.js
│   ├── router/
│   │   └── index.js
│   ├── components/
│   │   └── Navbar.vue
│   └── pages/
│       ├── Home.vue
│       ├── Login.vue
│       └── SignIn.vue
│
└── [Otros archivos históricos]
```

---

## ✨ RESUMEN RÁPIDO

**Sistema implementado:**
- ✅ Login / Registro / Logout
- ✅ Protección de rutas
- ✅ Sistema de permisos por nivel IT
- ✅ Contraseñas hasheadas
- ✅ Sesión persistente

**Cómo usar:**
```javascript
// Mostrar elemento si nivel >= 2
<div v-if="can(2)">Solo para nivel 2+</div>

// Verificar en script
if (can(3)) { adminAction() }
```

**Niveles:**
- Nivel 1 = Básico
- Nivel 2 = Intermedio
- Nivel 3 = Admin

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Leer README.md (5 min)
2. ✅ Ejecutar `npm run dev`
3. ✅ Probar registrarse y loguearse
4. ✅ Ver contenido según nivel
5. ✅ Consultar TECNICO.md para dudas

---

## 📞 AYUDA

**¿Algo no funciona?**
→ Ver TECNICO.md - Troubleshooting

**¿No entiendo `can()`?**
→ Ver TECNICO.md - Composable: usePermissions()

**¿Cómo testeo?**
→ Ver TECNICO.md - Testing: Casos

---

**Última actualización:** Enero 2026  
**Versión:** 2.1 (Consolidada)  
**Estado:** ✅ Completo y Funcional

