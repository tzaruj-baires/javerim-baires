# Javerim Baires – Documentación General

## 1. ¿Qué es este proyecto?

**Javerim Baires** es un sistema base de autenticación y administración de usuarios pensado para aplicaciones web pequeñas y medianas.

Su objetivo principal es resolver:

* Registro y login de usuarios
* Control de permisos por niveles
* Administración básica de usuarios

El proyecto prioriza **simplicidad**, **bajo costo de infraestructura** y **facilidad de mantenimiento**.

---

## 2. Idea central de la arquitectura

La aplicación está dividida en dos partes bien claras:

* **Frontend**: aplicación web en Vue 3
* **Backend**: API serverless en Google Apps Script

La persistencia de datos se realiza usando **Google Sheets**, que cumple el rol de base de datos.

Esto permite:

* No mantener servidores
* Desplegar rápido
* Escalar gradualmente

---

## 3. Stack tecnológico

### Frontend

* Vue 3
* Vite
* Vue Router
* Pinia (estado global)
* Bootstrap 5

### Backend

* Google Apps Script
* Google Sheets
* bcryptjs para hash de contraseñas

---

## 4. Flujo funcional del sistema

### Registro

1. El usuario completa el formulario de registro
2. La contraseña se encripta
3. El usuario se guarda en Google Sheets
4. Se asigna un nivel de acceso inicial

### Login

1. El usuario ingresa email y contraseña
2. El backend valida las credenciales
3. Devuelve los datos del usuario y su nivel
4. El frontend habilita o restringe funcionalidades

---

## 5. Niveles de acceso

El sistema utiliza niveles numéricos simples:

| Nivel | Rol     | Descripción                         |
| ----- | ------- | ----------------------------------- |
| 1     | Usuario | Solo puede ver su propio perfil     |
| 2     | Editor  | Puede modificar otros usuarios      |
| 3     | Admin   | Control total (incluye eliminación) |

> Regla clave: **los permisos deben validarse siempre en frontend y backend**

---

## 6. Estructura general del proyecto

```
├── public/
├── src/
│   ├── components/   # Componentes visuales
│   ├── views/        # Vistas principales
│   ├── router/       # Rutas protegidas
│   ├── stores/       # Pinia (estado y usuario)
│   └── assets/
├── package.json
├── vite.config.js
└── README.md
```

---

## 7. Backend y Google Sheets

Google Apps Script funciona como una API HTTP.

Responsabilidades principales:

* Crear usuarios
* Validar login
* Actualizar niveles
* Eliminar usuarios

Google Sheets actúa como base de datos.

Campos típicos:

* id
* nombre
* email
* password (hash)
* nivel
* fecha de alta

---

## 8. Seguridad (estado actual)

* Contraseñas encriptadas con bcrypt
* Validaciones básicas de permisos
* No se usan tokens JWT (aún)

> El sistema es adecuado para MVPs y proyectos internos. Para producción a gran escala se recomienda reforzar la capa de seguridad.

---

## 9. Escalabilidad – cómo crecer el proyecto

Caminos claros de evolución:

1. Reemplazar Google Sheets por una base de datos real
2. Migrar Apps Script a una API Node.js
3. Implementar JWT o sesiones
4. Agregar tests automáticos
5. Separar servicios de negocio

---

## 10. Documentación heredada

El repositorio contiene varios archivos `.md` creados durante el desarrollo.

Esta documentación **los reemplaza como guía principal**.

Los archivos antiguos pueden usarse como referencia histórica o técnica puntual, pero se recomienda no extenderlos más.

---

## 11. Guía para nuevos desarrolladores

Si sos nuevo en el proyecto:

1. Leé este documento completo
2. Corré el proyecto en local
3. Revisá el flujo de login y permisos
4. Entendé la comunicación frontend ↔ backend
5. Recién después modificá o agregá features

---

## 12. Estado del proyecto

* Funcional
* En evolución
* Orientado a simplicidad y claridad

---

**Este documento es la referencia principal del proyecto.**
