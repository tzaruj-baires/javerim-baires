# Instructivo de Uso - Javerim Baires

## Introducción

Javerim Baires es una aplicación web para la gestión de voluntarios y personal de organizaciones. Permite registrar usuarios, gestionar perfiles y controlar permisos según roles asignados. La aplicación está diseñada para ser intuitiva y segura, con diferentes niveles de acceso según el rol del usuario.

## Roles en la Aplicación

La aplicación cuenta con tres niveles de permisos principales, cada uno con funcionalidades específicas:

### 1. Voluntarios (Nivel Básico)
Usuarios que pueden gestionar su propio perfil personal. Son los miembros regulares de la organización que participan en actividades.

### 2. Roshim (Nivel Intermedio)
Líderes o coordinadores que supervisan a grupos de voluntarios dentro de su organización. Tienen acceso a perfiles de usuarios relacionados con sus áreas de responsabilidad.

### 3. Administradores (Nivel Avanzado)
Personal técnico o directivo con acceso completo al sistema. Pueden gestionar todos los usuarios, configurar permisos y acceder a información técnica.

## Cómo Usar la Aplicación

### Registro e Inicio de Sesión

#### Registro Inicial
1. Accede a la página de registro (/signin)
2. Completa los campos requeridos:
   - DNI
   - Email
   - Teléfono
   - Contraseña
3. Haz clic en "Registrarse"
4. Recibirás un email de confirmación
5. Espera a que un administrador apruebe tu acceso

#### Inicio de Sesión
1. Ve a la página de login (/login)
2. Ingresa tu email y contraseña
3. Haz clic en "Iniciar Sesión"

#### Recuperar Contraseña
Si olvidaste tu contraseña:
1. Ve a "Olvidé mi contraseña" (/forgot-password)
2. Ingresa tu email
3. Recibirás instrucciones por email

### Navegación Principal

Después de iniciar sesión, verás la barra de navegación con opciones según tu rol:

- **Inicio**: Página principal con información general
- **Mi Perfil**: Acceso a tu propio perfil de usuario
- **Mis Áreas**: (Disponible para Roshim y Administradores) Gestión de áreas asignadas
- **Administración de Usuarios**: (Solo Administradores) Gestión completa de usuarios

## Funcionalidades por Rol

### Para Voluntarios (Nivel Básico)

#### Páginas Disponibles
- **Inicio** (/): Dashboard principal
- **Mi Perfil** (/javer/[tu-dni]): Vista y edición de tu perfil personal

#### Qué Puedes Hacer
- Ver tu propio perfil completo
- Editar información personal:
  - Datos personales
  - Información de contacto
  - Domicilio
  - Datos médicos
  - Vida y desarrollo
  - Información familiar

#### Limitaciones
- No puedes ver perfiles de otros usuarios
- No puedes editar información organizacional
- No tienes acceso a datos técnicos

### Para Roshim (Nivel Intermedio)

#### Páginas Disponibles
- **Inicio** (/): Dashboard principal
- **Mi Perfil** (/javer/[tu-dni]): Tu perfil personal
- **Mis Áreas** (/mis-areas): Gestión de tus áreas asignadas
- **Áreas y Roshim** (/areas-y-roshim): Vista de áreas y coordinadores
- **Perfiles de Usuarios** (/javer/[dni]): Perfiles de usuarios bajo tu supervisión

#### Qué Puedes Hacer
- Todo lo que pueden hacer los Voluntarios
- Ver perfiles de usuarios de tu misma organización que:
  - Compartan al menos una área contigo (si no tienes rol ROSH)
  - Todos los usuarios de tu organización (si tienes rol ROSH)
- Editar información organizacional de los perfiles que puedes ver
- Gestionar tus áreas asignadas

#### Limitaciones
- No puedes ver datos técnicos de los usuarios
- No puedes eliminar usuarios
- Acceso limitado a usuarios de otras organizaciones

### Para Administradores (Nivel Avanzado)

#### Páginas Disponibles
- Todas las páginas disponibles para Roshim
- **Administración de Usuarios** (/admin/users): Panel completo de gestión
- **Alta Masiva** (/alta): Registro masivo de usuarios
- **Baja** (/baja): Gestión de bajas

#### Qué Puedes Hacer
- Acceso completo a todos los perfiles de usuario
- Ver y editar toda la información, incluyendo datos técnicos
- Gestionar niveles de acceso de usuarios
- Eliminar usuarios del sistema
- Recibir notificaciones de nuevos registros
- Configurar correos de notificación

#### Responsabilidades Adicionales
- Aprobar accesos de nuevos usuarios
- Gestionar permisos y roles
- Mantener la integridad de los datos

## Problemas Comunes y Soluciones

### No Puedo Acceder a Ciertas Páginas
- **Causa**: Tu nivel de acceso no es suficiente para esa funcionalidad
- **Solución**: Contacta a un administrador para que actualice tu nivel de acceso

### Los Datos No Se Guardan
- **Causa**: Problema con la conexión o ID de usuario no válido
- **Solución**: Verifica tu conexión a internet y recarga la página. Si persiste, contacta al soporte técnico

### El Teléfono No Se Muestra
- **Causa**: Campos de teléfono pueden variar (celular, cellphone)
- **Solución**: El sistema usa el primer campo disponible. Si no se muestra, edita tu perfil para actualizar la información

### No Recibo Emails de Notificación
- **Causa**: Configuración de correos no establecida o problema con el servicio
- **Solución**: Los administradores deben verificar la configuración de notificaciones

### No Puedo Ver Perfiles de Otros Usuarios
- **Causa**: Restricciones de permisos por organización o áreas
- **Solución**: Verifica que compartas organización y áreas con el usuario. Si eres ROSH, deberías tener acceso a toda tu organización

## Consejos de Uso

- Mantén tu información personal actualizada
- Usa contraseñas seguras y no las compartas
- Si encuentras errores, anota los pasos que seguiste y reporta al administrador
- Los administradores reciben notificaciones de nuevos registros para aprobar accesos
- Los cambios en niveles de acceso requieren reiniciar sesión para aplicarse completamente

## Contacto y Soporte

Para problemas técnicos o dudas sobre permisos, contacta al equipo de soporte técnico de tu organización.