#  Javerim Baires - Sistema de Autenticación

Sistema completo de login/registro con control de permisos por nivel IT.

---

##  INICIO RÁPIDO

\\\ash
npm install
npm run dev
# Abre http://localhost:5173
\\\

### Flujo Básico:
1. **Registrarse**  /signin (DNI, Email, Teléfono, Contraseña)
2. **Login**  /login (Email + Contraseña)
3. **Acceso según Nivel:**
   - Nivel 1+  /mi-perfil (ver propio perfil)
   - Nivel 2+  /javer/:dni (ver/editar otros)
   - Nivel 3  Eliminar usuarios

---

##  DOCUMENTACIÓN ESENCIAL

- **[ARQUITECTURA.md](./ARQUITECTURA.md)** - Estructura técnica, componentes, API
- **[CAMBIOS_LOG.md](./CAMBIOS_LOG.md)** - Historial de cambios y fixes

---

##  NIVELES DE PERMISO

\\\
Nivel 1 = Básico (ver propio perfil)
Nivel 2 = Intermedio (editar otros usuarios)
Nivel 3 = Avanzado (admin - eliminar usuarios)
\\\

---

##  STACK TÉCNICO

- **Frontend:** Vue 3 + Pinia + Vue Router
- **Backend:** Google Apps Script + Google Sheets
- **Auth:** bcryptjs (10 rounds)
- **UI:** Bootstrap 5.3.8 + Bootstrap Icons

---

##  ISSUES COMUNES

### Datos no persisten
 Verificar que \id\ se envía en updates

### Teléfono no se muestra
 Usar fallback \celular || cellphone || '-'\

### Sin acceso a rutas
 Verificar nivel en tabla 'users'

---

*Última actualización: Enero 2026*
