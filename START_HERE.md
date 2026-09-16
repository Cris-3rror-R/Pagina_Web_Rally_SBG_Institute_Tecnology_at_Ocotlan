# 🚀 Rally Competition Platform - INICIA AQUÍ

## ¿Qué es esto?

Una **plataforma web en tiempo real** para gestionar competencias de rally por equipos con:
- 📱 Escaneo QR en estaciones
- 📍 Seguimiento GPS en vivo
- 🏆 Tabla de clasificación en tiempo real
- 🗺️ Mapa de ubicaciones de equipos
- ⚡ Despliegue sin servidor en AWS

---

## ⚡ 3 Opciones para Comenzar

### Opción 1: Ver Código Localmente (10 min)

```bash
# Terminal 1 - Frontend (USAR PNPM)
cd frontend && pnpm install && pnpm dev
# Abre http://localhost:3000

# Terminal 2 - Backend
cd backend && pip install -r requirements-simple.txt
python -m uvicorn main:app --reload
# API en http://localhost:8000/docs
```

**Nota**: Necesitarás Variables de Entorno de Supabase

---

### Opción 2: Desplegar a AWS Amplify (20 min) ⭐ RECOMENDADO

1. Seguir [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (15 min)
2. Seguir [QUICK_START_AMPLIFY.md](./QUICK_START_AMPLIFY.md) (15 min)
3. ✅ Tu app estará en vivo

---

### Opción 3: Despliegue Completo (1 hora)

1. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. [QUICK_START_AMPLIFY.md](./QUICK_START_AMPLIFY.md) - Frontend
3. Desplegar Backend:
   ```bash
   cd backend
   npm install -g serverless
   serverless deploy --stage prod
   ```
4. [DEPLOYMENT.md](./DEPLOYMENT.md) - Configuración avanzada

---

## 📚 Documentación

| Documento | Tiempo | Propósito |
|-----------|--------|----------|
| [README.md](./README.md) | 5 min | Visión general del proyecto |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | 15 min | Configurar base de datos |
| [QUICK_START_AMPLIFY.md](./QUICK_START_AMPLIFY.md) | 15 min | Desplegar frontend |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 30 min | Despliegue completo + avanzado |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | 10 min | Estado del proyecto |

---

## 🎯 Próximos Pasos

### Paso 1️⃣: Supabase (15 min)
```
Ver: SUPABASE_SETUP.md
↓
- Crear proyecto
- Ejecutar SQL
- Obtener credenciales
```

### Paso 2️⃣: Frontend en Amplify (15 min)
```
Ver: QUICK_START_AMPLIFY.md
↓
- GitHub
- Amplify
- ✅ En vivo
```

### Paso 3️⃣: Backend en Lambda (10 min)
```
Ver: DEPLOYMENT.md
↓
- serverless deploy
- ✅ API lista
```

---

## 📊 ¿Qué incluye?

### Frontend (Next.js 14+)
- ✅ Páginas protegidas
- ✅ Escaneo QR
- ✅ GPS en tiempo real
- ✅ Tabla de clasificación
- ✅ Mapa de equipos
- ✅ Responsive mobile

### Backend (FastAPI)
- ✅ API REST
- ✅ Cálculo de puntos
- ✅ Autenticación JWT
- ✅ Validación de entrada
- ✅ Health check

### Base de Datos (Supabase)
- ✅ PostgreSQL
- ✅ Tablas optimizadas
- ✅ Row-Level Security
- ✅ Índices

### Despliegue (AWS)
- ✅ AWS Amplify (Frontend)
- ✅ AWS Lambda (Backend)
- ✅ CloudFront CDN
- ✅ CI/CD automático

---

## 🚨 Antes de Empezar

### Requisitos
- [ ] Node.js 18+
- [ ] Python 3.11+
- [ ] Cuenta de GitHub (para Amplify)
- [ ] Cuenta de AWS (gratis)
- [ ] Cuenta de Supabase (gratis)

### Secretos (Guardar en lugar seguro)
```
SUPABASE_URL = https://...supabase.co
SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_KEY = eyJ...
```

---

## 💡 Decisión: ¿Desarrollo Local o Amplify?

### Desarrollo Local 🏠
- Pro: No necesitas AWS
- Con: Solo en tu computadora
- Use: Desarrollo y testing

### AWS Amplify ☁️ (RECOMENDADO)
- Pro: En vivo, URL pública, CI/CD automático
- Con: Alejos de límite gratuito
- Use: Producción, demo, presentación

---

## 📱 Tecnologías Usadas

```
Frontend:    Next.js 14 | TypeScript | Tailwind CSS | Supabase Auth
Backend:     FastAPI | Python 3.11 | Uvicorn | JWT
Database:    Supabase (PostgreSQL)
Deployment:  AWS Amplify | AWS Lambda | CloudFront
CI/CD:       GitHub Actions
```

---

## 🎯 Casos de Uso

### Equipo Participante
1. Registrarse / Loguearse
2. Ir a Escaneo QR
3. Escanear código QR en estación (inicio)
4. Completar desafío
5. Escanear código QR (fin)
6. Ver puntos automáticamente
7. Ver posición en clasificación

### Administrador
1. Ver dashboard
2. Monitorear estaciones en vivo
3. Ver tabla de clasificación
4. Ver mapa de ubicaciones
5. Crear/editar estaciones

---

## ⏱️ Tiempos

| Tarea | Tiempo |
|-------|--------|
| Leer documentación | 10 min |
| Supabase setup | 15 min |
| Desplegar frontend | 15 min |
| Desplegar backend | 10 min |
| Testing | 10 min |
| **TOTAL** | **~60 min** |

---

## 🆘 Ayuda

### Si algo falla:

1. **Búsqueda rápida**:
   - Error en terminal → Buscar en DEPLOYMENT.md
   - Problema Supabase → Buscar en SUPABASE_SETUP.md
   - Problema Amplify → Buscar en QUICK_START_AMPLIFY.md

2. **Logs**:
   - Frontend: DevTools (F12) → Console
   - Backend: Terminal donde corre `python -m uvicorn`
   - Amplify: Console → Deployments → Ver logs

3. **Verificar**:
   - Variables de entorno correctas
   - Supabase proyecto creado
   - Tablas existen
   - RLS policies activas

---

## 🎉 Una Vez Deployado

```
✅ Frontend en vivo:
   https://main.xxxxx.amplifyapp.com

✅ Backend API:
   https://xxxxx.execute-api.us-east-1.amazonaws.com

✅ Base de datos:
   Supabase Dashboard
```

---

## 🚀 Siguientes Steps

1. ✅ Lee esta guía (2 min)
2. ✅ Abre [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (15 min)
3. ✅ Abre [QUICK_START_AMPLIFY.md](./QUICK_START_AMPLIFY.md) (15 min)
4. ✅ Desplega backend (10 min)
5. ✅ ¡Felicidades! 🎊

---

## 📞 Contacto

- **Documentación**: Ver todos los archivos .md
- **Problemas**: Revisar DEPLOYMENT.md → Troubleshooting
- **Código**: Explorar carpetas `frontend/` y `backend/`

---

## 📝 Versión

- **Versión**: 1.0.0
- **Fecha**: Septiembre 16, 2026
- **Estado**: ✅ Listo para Producción

---

## 📚 Estructura de Archivos

```
📁 Página_Web_AWS_Cardenalito/
├── START_HERE.md ← 👈 Estás aquí
├── README.md
├── SUPABASE_SETUP.md
├── QUICK_START_AMPLIFY.md
├── DEPLOYMENT.md
├── PROJECT_STATUS.md
├── amplify.yml
├── .gitignore
│
├── 📁 frontend/          ← Next.js Frontend
│   ├── package.json
│   ├── next.config.js
│   └── app/...
│
├── 📁 backend/           ← FastAPI Backend
│   ├── main.py
│   ├── requirements.txt
│   ├── migrations/...
│   └── serverless.yml
│
├── 📁 .github/
│   └── workflows/
│       └── deploy.yml    ← CI/CD automático
│
└── 📁 .kiro/
    └── specs/...         ← Documentación técnica
```

---

## ✅ Checklist Final

Antes de empezar, asegúrate de tener:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Python 3.11+ instalado (`python --version`)
- [ ] Git instalado (`git --version`)
- [ ] Cuenta GitHub
- [ ] Cuenta AWS
- [ ] Cuenta Supabase

---

## 🎯 EMPEZAR AHORA:

### Si quieres desplegar a AWS (RECOMENDADO):

1. **Paso 1**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) ← Comienza aquí
2. **Paso 2**: [QUICK_START_AMPLIFY.md](./QUICK_START_AMPLIFY.md) ← Luego aquí
3. **Paso 3**: [DEPLOYMENT.md](./DEPLOYMENT.md) ← Para avanzados

### Si quieres desarrollo local:

```bash
cd frontend && npm install && npm run dev
# En otra terminal
cd backend && pip install -r requirements-simple.txt && python -m uvicorn main:app --reload
```

---

**¡Buena suerte! 🚀**

*Para cualquier pregunta, consulta la documentación completa en los archivos .md*
