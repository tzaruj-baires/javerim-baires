# 📝 HISTORIAL DE CAMBIOS

## Enero 2026 - Correcciones Finales

### ✅ CAMBIO: Campo Teléfono - Field Mapping
**Problema:** 'main' tabla usa "celular" pero 'users' usa "cellphone"  
**Solución:** Mapeo automático en ProfileForm + fallback en templates
**Archivos:**
- ProfileForm.vue: Watcher mapea ambos campos, handleSubmit envía a cada tabla correctamente
- MyProfile.vue: Display usa `celular || cellphone || '-'`
- UserDetail.vue: Display usa `celular || cellphone || '-'`

### ✅ CAMBIO: Actualización No Funcionaba
**Problema:** GAS buscaba por `id` pero frontend no lo enviaba  
**Solución:** ProfileForm ahora envía `id: DNI` (para main) e `id: dni` (para users)
**Archivo:** ProfileForm.vue - handleSubmit

### ✅ CAMBIO: Inicialización de Refs
**Problema:** Vue warning sobre props null  
**Solución:** Cambiar `ref(null)` → `ref({})` en:
- ProfileForm.vue: `default: () => ({})`
- MyProfile.vue: `profileData = ref({})`
- UserDetail.vue: `userData = ref({})`

### ✅ CAMBIO: Rutas Protegidas
**Implementado:** /mi-perfil (minLevel: 1) y /javer/:dni (minLevel: 2)  
**Archivo:** router/index.js

### ✅ CAMBIO: Permisos por Nivel
**Implementado:** usePermissions.js con can(), canExact(), canAny(), getLevelName()  
**Validación en:** router guards + componentes

### ✅ CAMBIO: Sistema de Autenticación
**Implementado:** 
- Login/Register con bcryptjs (10 rounds)
- localStorage persistencia
- Pinia store

---

## Notas de Desarrollo

### Reglas Importantes

1. **Campo Teléfono**: Siempre mapear ambos campos
   ```javascript
   // En templates
   {{ data.celular || data.cellphone || '-' }}
   
   // En watcher
   cellphone: newData.cellphone || newData.celular || ''
   
   // En update
   id: DNI,  // ← CRUCIAL: GAS busca por id
   celular: formData.cellphone
   ```

2. **Actualización de Datos**: Incluir siempre `id`
   ```javascript
   await update('main', {
     id: formData.value.dni,  // ← Necesario
     DNI: formData.value.dni,
     // otros campos...
   })
   ```

3. **Nombres de Tablas**
   - Frontend: 'main', 'users' (no sheetId)
   - Backend: Mapeo automático en TABLES{}

---

## Próximas Mejoras (Futuro)

- [ ] Validación de datos más robusta
- [ ] Recuperación de contraseña
- [ ] Auditoría de cambios
- [ ] Exportar datos a CSV/PDF
