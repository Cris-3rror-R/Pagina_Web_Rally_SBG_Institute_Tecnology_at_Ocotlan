# 📖 Guía Completa de Setup - Rally Competition Platform

**Todo lo que necesitas saber en un solo documento**

---

## 🎯 Resumen Ejecutivo

**Proyecto**: Rally Competition Platform
**Marca**: AWS SBG
**Stack**: Next.js 14 + FastAPI + Supabase + AWS Amplify
**Responsivo**: Mobile + Desktop
**Credenciales**: 2 usuarios de prueba incluidos

---

## 📋 Información de Diseño

### 🎨 Colores AWS SBG

```
PRIMARY (Naranja):     #FF9900
SECONDARY (Navy):      #232F3E
ACCENT (Azul):         #0A66C2
BACKGROUND (Gris):     #EAEDED
SUCCESS (Verde):       #28A745
ERROR (Rojo):          #DC3545
WARNING (Amarillo):    #FFC107
INFO (Azul):           #17A2B8
```

### 📱 Responsividad

```
Mobile-first approach
├─ xs: 0px - 640px
├─ sm: 640px - 768px
├─ md: 768px - 1024px
├─ lg: 1024px - 1280px
├─ xl: 1280px - 1536px
└─ 2xl: 1536px+
```

### 🔐 Seguridad

- Row-Level Security (RLS) en todas las tablas
- JWT tokens con expiración
- HTTPS en producción
- Validación de entrada en ambos lados

---

## 👥 Credenciales de Prueba

### Admin
```
Usuario: admin
Contraseña: [ADMIN_PASSWORD_CONFIGURED_IN_SUPABASE]
Rol: ADMIN
Acceso: Panel administrativo completo
```

### Equipo Regular
```
Usuario: prueba
Contraseña: [TEAM_PASSWORD_CONFIGURED_IN_SUPABASE]
Rol: EQUIPO
Acceso: Escaneo QR, GPS, clasificación
```

---

## 🔑 Códigos QR

El sistema tiene 2 códigos QR principales:

```
1. QR INICIO
   ├─ Hash: START_001
   ├─ Propósito: Marcar inicio de evento
   └─ Ubicación: Punto de salida

2. QR FIN
   ├─ Hash: END_001
   ├─ Propósito: Marcar fin de evento
   └─ Ubicación: Línea de meta
```

### Generar Códigos QR

```python
# En backend/generate_qr.py
import qrcode

hashes = ['START_001', 'END_001']

for qr_hash in hashes:
    qr = qrcode.QRCode(version=1, box_size=10)
    qr.add_data(qr_hash)
    qr.make(fit=True)
    img = qr.make_image()
    img.save(f'qr_{qr_hash}.png')
```

---

## 📁 Documentación Disponible

### 🎨 Diseño
- **DESIGN_REQUIREMENTS.md** - Especificaciones completas de UI/UX
  - Colores, tipografía, componentes
  - Layouts para cada página
  - Animaciones y efectos
  - Accesibilidad

### 🔐 Autenticación
- **AUTHENTICATION_SETUP.md** - Sistema de login y permisos
  - Cómo crear usuarios
  - Flujo de autenticación
  - RLS policies
  - Testing de auth

### 🗄️ Base de Datos
- **SUPABASE_AI_PROMPT.md** - Prompt para generar BD con IA
- **SUPABASE_SETUP.md** - Guía manual de BD
- **HOW_TO_USE_SUPABASE_PROMPT.md** - Instrucciones de uso
- **SUPABASE_INSTRUCTIONS.md** - Checklist de setup

### 🚀 Despliegue
- **QUICK_START_AMPLIFY.md** - Desplegar en 20 min
- **DEPLOYMENT.md** - Guía completa

### 📚 General
- **README.md** - Visión general
- **START_HERE.md** - Punto de entrada
- **PROJECT_STATUS.md** - Estado del proyecto

---

## 🚀 Pasos para Comenzar

### Paso 1: Preparar Base de Datos (20 min)

```
1. Abre: SUPABASE_AI_PROMPT.md
2. Copia: El prompt completo
3. Pega: En ChatGPT, Claude o Gemini
4. Obtén: El SQL generado
5. Ejecuta: En Supabase SQL Editor
```

**Resultado**: 4 tablas creadas (Profiles, Stations, StationAttempts, TeamLocations)

### Paso 2: Configurar Autenticación (5 min)

```
1. Supabase Dashboard → Authentication → Users
2. Crear usuario: admin / [ADMIN_PASSWORD_CONFIGURED_IN_SUPABASE]
3. Crear usuario: prueba / [TEAM_PASSWORD_CONFIGURED_IN_SUPABASE]
4. Ejecutar SQL de perfiles (ver AUTHENTICATION_SETUP.md)
```

**Resultado**: 2 usuarios listos para testing

### Paso 3: Obtener Credenciales (2 min)

```
Settings → API
├─ Copiar: Project URL
├─ Copiar: anon public key
└─ Copiar: service_role secret
```

### Paso 4: Configurar Variables de Entorno (5 min)

Crear archivo: `frontend/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=<URL del paso 3>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Key del paso 3>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Paso 5: Instalar y Ejecutar (5 min)

```bash
# Frontend
cd frontend
pnpm install
pnpm dev
# Abre http://localhost:3000

# Backend (otra terminal)
cd backend
pip install -r requirements-simple.txt
python -m uvicorn main:app --reload
# Abre http://localhost:8000/docs
```

### Paso 6: Testing (10 min)

```
1. Ir a http://localhost:3000
2. Click "Login"
3. Ingresar: admin / [ADMIN_PASSWORD_CONFIGURED_IN_SUPABASE]
4. Ver dashboard admin
5. Logout
6. Ingresar: prueba / [TEAM_PASSWORD_CONFIGURED_IN_SUPABASE]
7. Ver dashboard equipo
8. ✅ Listo!
```

**Tiempo Total**: ~50 minutos

---

## 🎨 Implementación de Diseño

### Colores en Tailwind

Ya configurados en `tailwind.config.ts`:

```typescript
colors: {
  'aws-orange': '#FF9900',
  'aws-navy': '#232F3E',
  'aws-blue': '#0A66C2',
  'aws-light': '#EAEDED',
  'aws-success': '#28A745',
  'aws-warning': '#FFC107',
  'aws-error': '#DC3545',
  'aws-info': '#17A2B8',
}
```

### Uso en Componentes

```jsx
// Botón naranja AWS
<button className="bg-aws-orange hover:bg-aws-orange/90 text-white px-6 py-3 rounded-lg">
  Escanear QR
</button>

// Card responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Auto-responsivo */}
</div>
```

---

## 📱 Layout Responsivo

### Ejemplo: Login Page

```
MOBILE (xs-md):
┌──────────────────┐
│   AWS Logo       │
│                  │
│  Email Input     │
│  Password Input  │
│  [Login Button]  │
│                  │
│  Credentials:    │
│  admin/pass...   │
└──────────────────┘

DESKTOP (lg+):
┌──────────────────────────────────────┐
│  Branding (izq)  │  Form (der)       │
│                  │                   │
│  AWS SBG Info    │  Email Input      │
│  Beautiful       │  Password Input   │
│  Graphic         │  [Login Button]   │
│                  │                   │
└──────────────────────────────────────┘
```

---

## 🔄 Flujo de Aplicación

### Usuario Normal (Equipo)

```
1. Login
   ↓
2. Dashboard
   ├─ Ver puntuación actual
   ├─ Ver próxima estación
   └─ Ver clasificación
   ↓
3. Click QR Scanner (Floating Button)
   ↓
4. Permitir acceso a cámara
   ↓
5. Escanear QR INICIO
   ├─ Cámara activa
   ├─ Detecta código
   └─ "Evento iniciado"
   ↓
6. Volver a dashboard
   └─ Cronómetro corriendo
   ↓
7. Completar desafío en estación
   ↓
8. Click QR Scanner nuevamente
   ↓
9. Escanear QR FIN
   ├─ Cámara activa
   ├─ Detecta código
   ├─ "Evento completado"
   └─ Calcula puntos
   ↓
10. Puntos mostrados ✅
    └─ Clasificación actualizada
```

### Admin

```
1. Login
   ↓
2. Admin Dashboard
   ├─ Estadísticas
   ├─ Equipos activos
   └─ Control de estaciones
   ↓
3. Mapa en Vivo
   ├─ Ver ubicación de todos los equipos
   ├─ Actualización real-time
   └─ Colores según estado
   ↓
4. Leaderboard
   ├─ Clasificación actualizada
   ├─ Puntos por equipo
   └─ Tiempos acumulados
   ↓
5. Gestionar Estaciones
   ├─ Ver/editar estaciones
   ├─ Administrar códigos QR
   └─ Modificar reglamentos
```

---

## 🧪 Testing Completo

### Verificación de Funcionalidades

```
☐ Login/Auth funciona
☐ Logout funciona
☐ Admin ve panel administrativo
☐ Equipo ve dashboard
☐ QR Scanner abre cámara
☐ QR Scanner detecta códigos
☐ Puntos se calculan correctamente
☐ Clasificación se actualiza
☐ Ubicación GPS se envía
☐ Mapa muestra ubicaciones
☐ Responsive en móvil
☐ Responsive en desktop
☐ Colores AWS SBG correctos
☐ Animations funcionan
☐ Performance aceptable
```

---

## 📊 Arquitectura Final

```
┌─────────────────────────────────────────┐
│         AWS CloudFront CDN              │
└────────────┬────────────────────────────┘
             │
   ┌─────────┴─────────┐
   │                   │
┌──▼──┐          ┌────▼────┐
│S3   │          │Amplify  │
│     │          │Next.js  │
│     │          │SSR      │
└─────┘          └────┬────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
      ┌───▼──┐    ┌───▼──┐    ┌──▼──┐
      │Auth  │    │API   │    │RLS  │
      │      │    │Lambda│    │     │
      └──────┘    └───┬──┘    └─────┘
                      │
               ┌──────▼──────┐
               │  Supabase   │
               │ PostgreSQL  │
               │  RealTime   │
               └─────────────┘
```

---

## 🔒 Seguridad

### En Desarrollo

```
✅ HTTPS Amplify (automático)
✅ CORS configurado
✅ JWT validation
✅ RLS policies activas
✅ Env variables separadas
✅ Sin credenciales en git
```

### En Producción

```
☐ Cambiar credenciales de test
☐ Generar contraseñas fuertes
☐ Habilitar 2FA
☐ Configurar WAF
☐ Auditar RLS policies
☐ Monitoring activo
☐ Backups automáticos
☐ Rate limiting
```

---

## 📞 Troubleshooting Rápido

### "Module not found"
```bash
cd frontend
pnpm install  # Reinstalar
```

### "Cannot connect to Supabase"
- Verificar NEXT_PUBLIC_SUPABASE_URL en .env.local
- Verificar NEXT_PUBLIC_SUPABASE_ANON_KEY
- Refrescar página

### "QR Scanner no funciona"
- Permitir acceso a cámara en navegador
- Probar en HTTPS (Amplify)
- Verificar permiso en settings

### "Login fallido"
- Verificar credenciales exactas
- Verificar usuario existe en Supabase
- Revisar logs en Supabase Auth

---

## 📚 Referencias Rápidas

- **Tailwind**: https://tailwindcss.com
- **Next.js**: https://nextjs.org
- **Supabase**: https://supabase.com/docs
- **AWS Amplify**: https://docs.amplify.aws
- **FastAPI**: https://fastapi.tiangolo.com

---

## 🎯 Siguiente Paso

1. ✅ Lees este documento
2. ✅ Abres SUPABASE_AI_PROMPT.md
3. ✅ Generas la BD
4. ✅ Configuras .env.local
5. ✅ Ejecutas `pnpm dev`
6. ✅ Testeas con credenciales
7. ✅ Deploy a Amplify

---

**Tiempo total**: ~1 hora desde cero a producción 🚀

**¿Listo? Comienza con SUPABASE_AI_PROMPT.md**
