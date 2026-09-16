# Rally Competition Platform - Backend API

Backend REST API implementado con FastAPI para la Plataforma de Competencia Rally.

## Descripción

Backend que proporciona endpoints REST para:
- Autenticación con tokens JWT (Supabase)
- Escaneo y validación de códigos QR
- Cálculo de puntos y clasificación en vivo
- Geolocalización y seguimiento de equipos
- Integración con Supabase PostgreSQL

## Requisitos

- Python 3.10+
- pip (gestor de paquetes)
- Virtual environment (recomendado)

## Instalación

### 1. Crear y activar Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con valores reales de Supabase
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-key-here
# SUPABASE_ANON_KEY=your-anon-key-here
```

## Ejecución

### Modo desarrollo (con hot-reload)

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Modo producción

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

La API estará disponible en: `http://localhost:8000`
- Documentación interactiva: `http://localhost:8000/docs`
- Esquema OpenAPI: `http://localhost:8000/openapi.json`

## Estructura del Proyecto

```
backend/
├── main.py                    # Aplicación principal FastAPI
├── requirements.txt           # Dependencias del proyecto
├── .env.example              # Plantilla de variables de entorno
├── README.md                 # Este archivo
│
├── core/                     # Configuración e utilidades
│   ├── __init__.py
│   └── config.py            # Configuración de aplicación
│
├── api/                      # Rutas/endpoints REST
│   └── __init__.py
│
├── services/                 # Lógica de negocio
│   └── __init__.py
│
└── migrations/               # Scripts de migración SQL
    └── 001_initial_structure.sql
```

## Endpoints

### Health Check
- `GET /health` - Verifica el estado de la API

### Root
- `GET /` - Información básica de la API

## Características Implementadas (Fase 1.2)

✅ Estructura de directorios completa
✅ requirements.txt con dependencias necesarias
✅ Configuración centralizada con Pydantic Settings
✅ Virtual environment support
✅ Documentación de API con FastAPI

## Próximas Fases

- [ ] Autenticación con JWT y Supabase
- [ ] Endpoints de escaneo QR
- [ ] Cálculo de puntos
- [ ] Clasificación en tiempo real
- [ ] Geolocalización
- [ ] Pruebas unitarias e integración

## Desarrollo

### Linting y Formateo

```bash
# Formatear código con black
black .

# Verificar con flake8
flake8 .

# Ordenar imports con isort
isort .
```

### Pruebas

```bash
# Ejecutar pruebas
pytest

# Con coverage
pytest --cov=.
```

## Licencia

Interno - Rally Competition Platform 2024
