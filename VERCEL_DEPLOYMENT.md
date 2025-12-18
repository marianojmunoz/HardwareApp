# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación **Compumercado** en Vercel y conectarla a tu dominio personalizado.

## 📋 Pre-requisitos

- Cuenta de GitHub (gratis)
- Cuenta de Vercel (gratis) - [vercel.com](https://vercel.com)
- Tu código subido a GitHub
- Credenciales de Supabase (ya las tienes en tu `.env`)

---

## 🔧 Paso 1: Preparar el Repositorio en GitHub

Si aún no has subido tu proyecto a GitHub:

1. Ve a [github.com](https://github.com) y crea un nuevo repositorio
2. Nombra el repositorio (ej: `compumercado`)
3. En tu terminal, en la carpeta del proyecto:

```bash
git add .
git commit -m "Preparado para despliegue en Vercel"
git push origin main
```

---

## 🌐 Paso 2: Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login con GitHub
2. Click en **"Add New..."** → **"Project"**
3. Selecciona tu repositorio `compumercado`
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (dejar por defecto)
   - **Build Command**: `npm run build` (autodetectado)
   - **Output Directory**: `dist` (autodetectado)

5. **NO hagas click en Deploy todavía** - primero configura las variables de entorno

---

## 🔑 Paso 3: Configurar Variables de Entorno

Antes de desplegar, agrega tus credenciales de Supabase:

1. En la página de configuración del proyecto en Vercel, desplázate hasta **"Environment Variables"**
2. Agrega las siguientes variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Tu URL de Supabase (cópiala de tu archivo `.env`) |
| `VITE_SUPABASE_ANON_KEY` | Tu Anon Key de Supabase (cópiala de tu archivo `.env`) |

3. Asegúrate de seleccionar **Production**, **Preview**, y **Development** para cada variable
4. Click en **"Deploy"**

---

## ⏳ Paso 4: Esperar el Despliegue

- Vercel construirá y desplegará tu aplicación (toma ~2-3 minutos)
- Verás un progreso en tiempo real
- Cuando termine, verás ✅ **"Deployment Ready"**

---

## 🌍 Paso 5: Conectar tu Dominio Personalizado (www.compumercado.com.ar)

### 5.1 Agregar el Dominio en Vercel

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Domains"**
3. Escribe: `www.compumercado.com.ar`
4. Click en **"Add"**

Vercel te mostrará los registros DNS que necesitas configurar.

### 5.2 Configurar DNS en tu Proveedor de Dominios

Debes configurar estos registros en tu proveedor de dominios (ej: NIC Argentina, GoDaddy, etc.):

#### Para `www.compumercado.com.ar`:
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
```

#### Para `compumercado.com.ar` (sin www):
```
Type:  A
Name:  @
Value: 76.76.21.21
```

**Importante**: Los cambios de DNS pueden tardar entre 1 minuto y 48 horas en propagarse (típicamente 10-30 minutos).

### 5.3 Verificar el Dominio

1. Espera unos minutos después de configurar el DNS
2. Vuelve a Vercel → **Settings** → **Domains**
3. Deberías ver ✅ junto a tu dominio cuando esté listo
4. Vercel automáticamente configurará HTTPS (certificado SSL gratis)

---

## ✅ Paso 6: Probar la Aplicación

Visita tu sitio en:
- **Dominio temporal de Vercel**: `https://tu-proyecto.vercel.app`
- **Tu dominio**: `https://www.compumercado.com.ar` (después de configurar DNS)

Prueba las siguientes funcionalidades:
- ✅ Login con email
- ✅ Catálogo de productos
- ✅ Carrito de compras
- ✅ Checkout y órdenes
- ✅ Subida de Excel (solo admin)
- ⚠️ **Scraping de imágenes NO funcionará** (ver nota abajo)

---

## ⚠️ Limitaciones Importantes

### Image Scraping (Selenium) NO Funciona en Vercel

El servicio de scraping de imágenes con Selenium/ChromeDriver **NO puede ejecutarse** en el entorno serverless de Vercel.

**Soluciones alternativas:**

1. **Opción Recomendada**: Ejecutar el scraping localmente
   ```bash
   npm run backend:dev
   ```
   Luego usar la funcionalidad de scraping desde tu computadora.

2. **Opción Avanzada**: Hospedar el backend en un servicio diferente:
   - [Railway.app](https://railway.app) - $5 USD gratis/mes
   - [Render.com](https://render.com) - Plan gratuito disponible
   
   Estos servicios soportan contenedores Docker donde Selenium puede ejecutarse.

---

## 🔄 Despliegues Automáticos

Cada vez que hagas `git push` a tu repositorio de GitHub:
- Vercel automáticamente detectará los cambios
- Construirá y desplegará la nueva versión
- Actualizará tu sitio sin intervención manual

---

## 🐛 Troubleshooting

### Error: "Build Failed"
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs en Vercel para ver el error específico

### Error: "Supabase connection failed"
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas
- Asegúrate de que no haya espacios extras en las variables

### Dominio no funciona
- Espera 10-30 minutos para propagación DNS
- Verifica los registros DNS con: `nslookup www.compumercado.com.ar`
- Asegúrate de usar `www` en la URL

### CSS o JavaScript no carga
- Limpia la caché del navegador (Ctrl + Shift + R)
- Verifica que el build haya completado exitosamente en Vercel

---

## 📞 Soporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## 📝 Resumen de URLs

| Propósito | URL |
|-----------|-----|
| Dashboard Vercel | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Tu aplicación (temporal) | `https://tu-proyecto.vercel.app` |
| Tu aplicación (dominio propio) | `https://www.compumercado.com.ar` |
| Supabase Dashboard | [app.supabase.com](https://app.supabase.com) |

---

**¡Listo! Tu aplicación ya está en producción. 🎉**
