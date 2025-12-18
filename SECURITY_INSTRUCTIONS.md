# 🔒 Instrucciones de Seguridad - IMPORTANTE

## ⚠️ DEBES EJECUTAR ESTE SCRIPT SQL EN SUPABASE

Después de desplegar a Vercel, **DEBES** ejecutar la migración de seguridad en tu base de datos Supabase:

### Pasos:

1. Ve a tu proyecto en Supabase: [app.supabase.com](https://app.supabase.com)
2. Abre el **SQL Editor**
3. Copia y pega el contenido completo de este archivo: `database/migrations/003_admin_roles_security.sql`
4. Haz click en **Run**
5. Verifica que no haya errores

### ¿Qué hace esta migración?

✅ Crea tabla `admin_users` con tus emails de admin  
✅ Crea función `is_admin()` para verificar permisos  
✅ **BLOQUEA** modificación de productos a usuarios no-admin  
✅ **PROTEGE** privacidad de órdenes (cada usuario ve solo sus órdenes)  
✅ Agrega audit logging de acciones críticas  

### ⚠️ Sin esta migración:

- ❌ Cualquier usuario puede modificar/eliminar productos
- ❌ Cualquier usuario puede ver órdenes de otros
- ❌ No hay protección de datos

---

## 📋 Verificación Post-Deploy

Después de ejecutar la migración, verifica:

1. **Probar como usuario normal:**
   - Login con email NO admin
   - Intenta editar un producto desde DevTools → **Debe fallar**
   - Verifica que solo ves tus propias órdenes

2. **Probar como admin:**
   - Login con `mariano.j.munoz.1985@gmail.com`
   - Debes poder editar productos
   - Debes ver todas las órdenes

3. **Revisar audit log:**
   ```sql
   SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;
   ```

---

## 🛡️ Seguridad Implementada

### 1. Base de Datos (Crítico)
- ✅ RLS policies estrictas
- ✅ Sistema de roles de admin
- ✅ Audit logging

### 2. Frontend
- ✅ XSS prevention con DOMPurify
- ✅ Validación de inputs
- ✅ HTML sanitization

### 3. Headers HTTP
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options (previene clickjacking)
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy
- ✅ Permissions-Policy

---

## 🔐 Emails de Admin Configurados

Los siguientes emails tienen acceso de administrador:
- `mariano.j.munoz.1985@gmail.com`
- `mariano.j.munoz@hotmail.com`

Para agregar más admins, ejecuta en Supabase SQL Editor:
```sql
INSERT INTO admin_users (email) VALUES ('nuevo_admin@email.com');
```

---

## ⚡ Próximos Pasos Recomendados

### Alta Prioridad (Primera semana)
1. Configurar monitoreo de errores (Sentry)
2. Implementar rate limiting en Vercel
3. Configurar alerts de Supabase

### Media Prioridad (Primer mes)
4. Auditoría de dependencias: `npm audit`
5. Configurar backups automáticos en Supabase
6. Implementar 2FA para admins

---

**¿Dudas?** Revisa `SECURITY_AUDIT.md` para más detalles.
