# Rally Competition Platform

Plataforma web en tiempo real para gestionar competencias de rally por equipos con escaneo QR, GPS, puntuación en vivo y clasificación.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- Python 3.11+
- Cuenta de Supabase
- Cuenta de AWS (para despliegue)

### Desarrollo Local

#### Frontend

```bash
cd frontend

# Instalar dependencias con pnpm (SEGURIDAD: usa pnpm, no npm)
pnpm install

# Ejecutar en desarrollo
pnpm dev
# Acceder en http://localhost:3000
```

#### Backend

```bash
cd backend

# Crear ambiente virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements-simple.txt

# Ejecutar servidor
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
# API disponible en http://localhost:8000
# Documentación en http://localhost:8000/docs
```

## 📋 Estructura del Proyecto

```
├── frontend/                    # Next.js 14+ (Typescript)
│   ├── app/                    # App Router
│   ├── components/             # Componentes React
│   ├── lib/                    # Utilities y hooks
│   ├── styles/                 # CSS/Tailwind
│   └── public/                 # Assets estáticos
│
├── backend/                     # FastAPI (Python)
│   ├── main.py                 # Aplicación principal
│   ├── requirements.txt         # Dependencias
│   ├── migrations/              # Scripts SQL
│   └── serverless.yml          # Configuración Lambda
│
├── amplify.yml                  # Configuración AWS Amplify
├── DEPLOYMENT.md               # Guía de despliegue
└── README.md                   # Este archivo
```

## 🔑 Variables de Entorno

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
ENV=development
```

## 🏗️ Características Principales

### Frontend
- ✅ Autenticación con Supabase
- ✅ Escaneo QR con html5-qrcode
- ✅ GPS/Geolocalización en tiempo real
- ✅ Tabla de clasificación en vivo
- ✅ Mapa de ubicaciones (Leaflet)
- ✅ Interfaz responsive móvil
- ✅ Cronómetro en vivo

### Backend
- ✅ API REST con FastAPI
- ✅ Autenticación JWT
- ✅ Cálculo de puntos en tiempo real
- ✅ Clasificación dinámica
- ✅ Row-Level Security (RLS)
- ✅ CORS configurado
- ✅ Logging y monitoreo

### Base de Datos
- ✅ Supabase PostgreSQL
- ✅ Políticas RLS por equipo
- ✅ Índices optimizados
- ✅ Auditoría de cambios

## 📊 Fórmula de Puntuación

```
Puntos = MAX(0, 100 - (duración_en_segundos / 10))

Ejemplos:
- 0 segundos    → 100 puntos
- 100 segundos  → 90 puntos
- 1000 segundos → 0 puntos
```

## 🔐 Autenticación

El sistema usa Supabase Auth con:
- Email/Contraseña
- Tokens JWT
- Cookies HTTP-only
- Políticas RLS en base de datos

### Roles

- **ADMIN**: Panel de control, monitoreo en vivo
- **EQUIPO**: Escaneo QR, seguimiento GPS

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token

### Estaciones
- `GET /api/stations` - Listar estaciones
- `POST /api/stations/{id}/scan` - Escanear QR

### Clasificación
- `GET /api/leaderboard` - Tabla de clasificación

### Ubicaciones
- `POST /api/locations` - Enviar ubicación GPS
- `GET /api/locations` - Obtener ubicaciones (admin)

### Salud
- `GET /api/health` - Estado del API

## 📱 Funcionalidad en Móvil

### Equipo
1. Acceder a escaneo QR
2. Permitir acceso a cámara
3. Escanear código QR inicio
4. Completar desafío
5. Escanear código QR fin
6. Puntos calculados automáticamente

### Admin
1. Ver mapa en vivo de equipos
2. Monitorear tabla de clasificación
3. Ver progreso de estaciones
4. Visualizar tiempos y puntos

## 🚀 Despliegue

### AWS Amplify (Frontend)

```bash
# En Amplify Console:
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Desplegar automático en push a 'main'
```

### AWS Lambda (Backend)

```bash
# Instalar Serverless Framework
npm install -g serverless

# Desplegar
cd backend
serverless deploy --stage prod
```

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

### Testing (Usar PNPM)

```bash
cd frontend
pnpm type-check  # TypeScript check
pnpm lint        # ESLint
```

### Backend

```bash
cd backend
pytest tests/       # Ejecutar tests
```

## 📚 Documentación Detallada

- [Diseño Técnico](./.kiro/specs/rally-competition-platform/design.md)
- [Guía de Despliegue](./DEPLOYMENT.md)
- [API Swagger](http://localhost:8000/docs) (en desarrollo)

## 🤝 Contribuir

1. Crear rama: `git checkout -b feature/nueva-feature`
2. Commit cambios: `git commit -am 'Agregar nueva feature'`
3. Push: `git push origin feature/nueva-feature`
4. Pull Request

## 🐛 Reporte de Bugs

Crear issue en GitHub con:
- Descripción del problema
- Pasos para reproducir
- Ambiente (OS, navegador, etc.)
- Logs de error

## 📄 Licencia

MIT License - Ver LICENSE.md

## 📧 Contacto

- Email: soporte@rally.example.com
- Issues: GitHub Issues
- Documentación: Ver /docs

## 🎯 Roadmap

- [ ] Integración con Google Maps
- [ ] Notificaciones push
- [ ] Sistema de equipos dinámico
- [ ] Análisis de rendimiento
- [ ] Exportar resultados
- [ ] Multi-idioma

---

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2026  
**Estado**: Listo para producción
