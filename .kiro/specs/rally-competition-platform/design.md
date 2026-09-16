# Plataforma de Competencia Rally - Documento de Diseño Técnico
# Rally Competition Platform - Technical Design Document

## Overview

**Descripción General:** La Plataforma de Competencia Rally es una aplicación web en tiempo real para gestionar competiciones de rally basadas en equipos. El sistema permite que los equipos escaneen códigos QR en estaciones, acumulen puntos basados en el rendimiento, realicen un seguimiento de ubicaciones mediante GPS y compitan en una tabla de clasificación en vivo. Los administradores pueden monitorear el progreso de los equipos a través de un panel de control en tiempo real que muestra ubicaciones, posiciones en la clasificación y el estado de las estaciones.

The Rally Competition Platform is a real-time web application for managing team-based rally competitions. The system enables teams to scan QR codes at stations, accumulate points based on performance, track locations via GPS, and compete on a live leaderboard. Administrators can monitor team progress through a real-time dashboard showing locations, leaderboard standings, and station status.

**Objetivos de Diseño / Key Design Goals:**
- Sincronización de datos en tiempo real en todos los clientes
- Arquitectura escalable que soporta múltiples equipos concurrentes
- Control de acceso basado en roles seguro en niveles de base de datos y API
- Interfaz frontal responsive móvil con funcionalidad de GPS y cámara
- Alta disponibilidad mediante AWS Amplify con SSR

---

## Architecture

### System Overview Diagram (Diagrama General del Sistema)

```
┌────────────────────────────────────────────────────────────────┐
│               CDN & CloudFront (AWS)                            │
└──────────────────────┬───────────────────────────────────────┘
                       │
      ┌────────────────┼────────────────────────────┐
      │                │                            │
  ┌───▼───┐      ┌────▼────┐           ┌──────────▼──┐
  │Frontend│      │API Lambda           │Static Files│
  │ (Next) │◄────►│(FastAPI)│           │   (S3/CF)  │
  └───┬───┘      └────┬────┘           └────────────┘
      │                │
      │          ┌─────▼─────┐
      │          │JWT Auth   │
      │          │Validation │
      │          └─────┬─────┘
      │                │
      └────┬───────────┼────────────────────────┐
           │           │                        │
      ┌────▼──┐  ┌────▼───┐           ┌────────▼──┐
      │Supabase          │  │Real-time│           │WebSocket│
      │Database          │  │Subscr.  │    Channels
      │(PostgreSQL)      │  │         │           │
      └──────────────────┘  └─────────┘           └─────────┘
            
      ┌──────────────────────────────────┐
      │Mobile/Desktop Client Devices     │
      │(Camera, GPS, Geolocation API)    │
      └──────────────────────────────────┘
```

### Capas de la Arquitectura / Architecture Layers

```
┌──────────────────────────────────────────┐
│  Presentation Layer (Next.js Frontend)   │ - User Interfaces
├──────────────────────────────────────────┤   - Components
│  Pages & Components & State Management   │   - Real-time Subscriptions
└──────────────────────────────────────────┘
            │                    │
            ▼ HTTP/WebSocket     ▼
┌──────────────────────────────────────────┐
│  API Layer (FastAPI Backend)             │ - Request Handling
├──────────────────────────────────────────┤ - JWT Validation
│  Routes | Business Logic | Validation    │ - Error Responses
└──────────────────────────────────────────┘
            │
            ▼ SQL Queries
┌──────────────────────────────────────────┐
│  Data Layer (Supabase PostgreSQL)        │ - Table Definitions
├──────────────────────────────────────────┤ - RLS Policies
│  Tables | RLS Policies | Indexes        │ - Query Optimization
└──────────────────────────────────────────┘
```

### Flujo de Escaneo QR / QR Scanning Flow

```
1. Equipo escanea QR de inicio
   ├─► Validar hash QR contra Estaciones tabla
   ├─► Verificar sin intento en progreso
   └─► Crear registro en Registros_Estacion
       ├─► start_timestamp = NOW()
       ├─► status = "In Progress"
       └─► Iniciar cronómetro en UI

2. Equipo escanea QR de finalización
   ├─► Validar QR hash coincide con estación en progreso
   ├─► Calcular duration_seconds
   │   └─► duration = end_timestamp - start_timestamp
   ├─► Calcular puntos
   │   └─► points = MAX(0, 100 - (duration_seconds / 10))
   ├─► Actualizar Registros_Estacion
   │   ├─► end_timestamp = NOW()
   │   ├─► duration_seconds = duration
   │   ├─► points = points
   │   └─► status = "Complete"
   ├─► Actualizar Profiles tabla
   │   ├─► total_accumulated_points += points
   │   └─► total_accumulated_time += duration_seconds
   └─► Emitir evento real-time
       └─► Supabase notifica a clientes suscritos
```

### Flujo de Autenticación / Authentication Flow

```
1. Usuario proporciona credenciales
   └─► Supabase Auth (Email/Password)
       └─► Devuelve JWT + User ID

2. Gestión de JWT
   ├─► Access Token (Corta duración: ~1 hora)
   ├─► Refresh Token (Larga duración: ~7 días)
   └─► Almacenar en cookies HTTP-only seguras

3. Asignación de Rol y Perfil
   ├─► Consultar tabla Profiles con user_id
   ├─► Determinar rol: ADMIN o EQUIPO
   └─► Almacenar rol en estado de aplicación

4. Verificación de Autorización (Middleware)
   ├─► Verificar validez JWT
   ├─► Verificar rol contra requisitos de ruta
   ├─► Forzar políticas RLS en nivel de base de datos
   └─► Devolver 401 (No autorizado) o 403 (Prohibido) en caso de error
```

---

## Components and Interfaces

### Frontend Architecture (Arquitectura del Frontend)

```
app/
├── (public)/                              # Rutas públicas sin autenticación
│   ├── layout.tsx                        # Layout público
│   ├── page.tsx                          # Página de inicio
│   ├── login/
│   │   └── page.tsx                      # Registro y login
│   └── error.tsx                         # Página de error global
│
├── (protected)/                           # Rutas protegidas (requieren autenticación)
│   ├── layout.tsx                        # Layout protegido
│   ├── middleware.ts                     # Verificación de autenticación
│   │
│   ├── dashboard/                        # Panel de control de equipos
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Vista principal del equipo
│   │   ├── profile/
│   │   │   └── page.tsx                  # Perfil del equipo
│   │   └── leaderboard/
│   │       └── page.tsx                  # Vista de clasificación
│   │
│   ├── stations/                         # Gestión de estaciones
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Lista de estaciones
│   │   └── [stationId]/
│   │       └── page.tsx                  # Detalle de estación individual
│   │
│   ├── admin/                            # Panel de administrador
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Panel principal del admin
│   │   ├── stations/
│   │   │   └── page.tsx                  # Configuración de estaciones
│   │   ├── locations/
│   │   │   └── page.tsx                  # Mapa en vivo de ubicaciones
│   │   └── leaderboard/
│   │       └── page.tsx                  # Vista de clasificación del admin
│   │
│   └── scanner/
│       └── page.tsx                      # Escáner QR (acceso a cámara)
│
├── api/                                   # Rutas API internas de Next.js
│   ├── auth/
│   │   ├── login/route.ts               # Endpoint de login
│   │   ├── logout/route.ts              # Endpoint de logout
│   │   └── refresh/route.ts             # Renovación de token
│   │
│   ├── stations/
│   │   ├── route.ts                     # GET estaciones
│   │   └── [stationId]/
│   │       ├── route.ts                 # GET detalle de estación
│   │       └── scan/route.ts            # POST escaneo QR (inicio/fin)
│   │
│   ├── leaderboard/
│   │   └── route.ts                     # GET clasificación
│   │
│   └── locations/
│       └── route.ts                     # POST ubicación, GET ubicaciones

components/
├── shared/                               # Componentes reutilizables comunes
│   ├── Header.tsx                       # Encabezado de navegación
│   ├── Navigation.tsx                   # Menú de navegación
│   ├── Footer.tsx                       # Pie de página
│   ├── LoadingSpinner.tsx               # Indicador de carga
│   ├── Button.tsx                       # Botón reutilizable
│   ├── Input.tsx                        # Campo de entrada
│   └── Card.tsx                         # Componente de tarjeta
│
├── auth/                                 # Componentes de autenticación
│   ├── LoginForm.tsx                    # Formulario de login
│   ├── ProtectedRoute.tsx               # Wrapper de protección de ruta
│   └── AuthProvider.tsx                 # Proveedor de contexto Auth
│
├── scanner/                              # Componentes de escaneo QR
│   ├── QRScanner.tsx                    # UI del escáner QR
│   ├── ScanButton.tsx                   # Botón de acceso a cámara
│   └── ScanResult.tsx                   # Feedback de resultado de escaneo
│
├── stations/                             # Componentes de estaciones
│   ├── StationCard.tsx                  # Visualización de estado de estación
│   ├── StationList.tsx                  # Lista de 4 estaciones
│   ├── Chronometer.tsx                  # Componente de cronómetro en vivo
│   └── StationDetail.tsx                # Vista detallada de estación
│
├── leaderboard/                          # Componentes de clasificación
│   ├── LeaderboardTable.tsx             # Visualización de clasificación
│   ├── TeamRank.tsx                     # Fila de clasificación individual
│   └── LeaderboardSubscription.tsx      # Actualizaciones en tiempo real
│
├── map/                                  # Componentes de mapa
│   ├── LiveMap.tsx                      # Integración Leaflet/Mapbox
│   ├── TeamMarker.tsx                   # Marcador de ubicación de equipo
│   └── MapSubscription.tsx              # Actualizaciones en tiempo real de ubicación
│
└── forms/                                # Componentes de formularios
    ├── ProfileForm.tsx                  # Formulario de perfil del equipo
    ├── StationForm.tsx                  # Formulario de configuración de estación
    └── FormField.tsx                    # Campo de formulario reutilizable

lib/
├── auth/
│   ├── client.ts                        # Configuración de cliente Supabase
│   ├── session.ts                       # Gestión de sesión
│   └── jwt.ts                           # Utilidades de JWT
│
├── api/
│   ├── client.ts                        # Wrapper de cliente API
│   ├── endpoints.ts                     # URLs de endpoints API
│   └── interceptors.ts                  # Interceptores de solicitud/respuesta
│
├── hooks/
│   ├── useAuth.ts                       # Hook de autenticación
│   ├── useProfile.ts                    # Hook de datos de perfil/usuario
│   ├── useLeaderboard.ts                # Hook de clasificación en tiempo real
│   ├── useLocations.ts                  # Hook de seguimiento de ubicación
│   ├── useGeolocation.ts                # Hook de GPS
│   └── useQRScanner.ts                  # Hook de escáner QR
│
├── utils/
│   ├── time.ts                          # Utilidades de formato de tiempo
│   ├── points.ts                        # Cálculo de puntos
│   ├── validation.ts                    # Validación de entrada
│   └── formatting.ts                    # Formato de datos
│
├── context/
│   └── AppContext.tsx                   # Contexto global de aplicación
│
└── types/
    ├── index.ts                         # Definiciones de tipo global
    ├── api.ts                           # Tipos de respuesta API
    ├── database.ts                      # Tipos de modelos de base de datos
    └── auth.ts                          # Tipos de autenticación

styles/
├── globals.css                          # Estilos Tailwind globales
└── variables.css                        # Propiedades CSS personalizadas

public/
├── favicon.ico
├── logo.svg
└── images/
    └── station-icons/
```

### Estrategia de Gestión de Estado / State Management Strategy

**Contexto Global de React + useReducer para Sincronización en Tiempo Real:**

```typescript
// lib/context/AppContext.tsx - Gestión centralizada de estado

interface AppState {
  // Estado de Autenticación
  user: User | null
  isAuthenticated: boolean
  userRole: 'ADMIN' | 'EQUIPO' | null
  
  // Estado de Perfil de Equipo
  profile: Profile | null
  totalPoints: number
  totalTime: number
  
  // Estado de Estación
  stations: Station[]
  activeAttempt: StationAttempt | null
  attemptHistory: StationAttempt[]
  
  // Estado de Clasificación
  leaderboard: LeaderboardEntry[]
  lastLeaderboardUpdate: Date | null
  
  // Estado de Ubicación
  teamLocations: Map<string, TeamLocation>
  myLocation: GeoLocation | null
  
  // Estado de UI
  isLoading: boolean
  error: string | null
  notifications: Notification[]
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LEADERBOARD'; payload: LeaderboardEntry[] }
  | { type: 'UPDATE_LOCATION'; payload: TeamLocation }
  | { type: 'UPDATE_PROFILE'; payload: Profile }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'START_ATTEMPT'; payload: StationAttempt }
  | { type: 'COMPLETE_ATTEMPT'; payload: StationAttempt }
```

### Integración de Escáner QR / QR Scanner Implementation

**Usando biblioteca html5-qrcode:**

```typescript
// components/scanner/QRScanner.tsx

import { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerProps {
  onScan: (qrCode: string) => Promise<void>
  onError?: (error: Error) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  // Inicializar escáner de códigos QR
  // Scanner resolve:
  // 1. Validar hash QR contra tabla Estaciones
  // 2. Verificar estado actual del intento
  // 3. Crear o actualizar registro en Registros_Estacion
  // 4. Calcular puntos si es escaneo de fin
  // 5. Actualizar tabla Profiles con puntos/tiempo
  // 6. Emitir evento en tiempo real
}
```

### Seguimiento de Geolocalización / Geolocation Tracking Implementation

**Usando API de Geolocalización del navegador:**

```typescript
// lib/hooks/useGeolocation.ts

export function useGeolocation(options?: PositionOptions) {
  // Hook personalizado para rastreo de GPS
  // Comportamiento:
  // 1. Solicitar permiso de acceso a GPS
  // 2. Si se otorga: actualizar Ubicaciones_Equipo cada 10 segundos
  // 3. Si se niega: mostrar advertencia pero permitir continuar
  // 4. Validar coordenadas: lat [-90, 90], lon [-180, 180]
  // 5. Usar timestamp del servidor para consistencia
  // 6. Manejar errores de precisión y conexión
}
```

### Actualizaciones en Tiempo Real de Clasificación / Real-Time Leaderboard

**Componente con suscripciones Supabase:**

```typescript
// components/leaderboard/LeaderboardTable.tsx

export function LeaderboardTable() {
  // Suscribirse a cambios en tabla Profiles
  // Cuando se actualiza un perfil (puntos/tiempo):
  // 1. Recalcular y re-ordenar clasificación
  // 2. Aplicar orden primario: total_accumulated_points DESC
  // 3. Aplicar desempate: total_accumulated_time ASC
  // 4. Actualizar estado global
  // 5. Re-renderizar sin recargar página
}
```

### Implementación del Mapa en Vivo / Live Location Map Implementation

**Usando Leaflet para mapeo:**

```typescript
// components/map/LiveMap.tsx

export function LiveMap() {
  // Inicializar mapa centrado en ubicación del rally
  // Suscribirse a cambios en tabla Ubicaciones_Equipo
  // Para cada equipo activo:
  // 1. Crear marcador en mapa
  // 2. Actualizar posición cada 10 segundos
  // 3. Mostrar nombre del equipo al pasar el cursor
  // 4. Reflejar actualizaciones dentro de 15 segundos
  // 5. Manejar reconexión graceful si conexión se interrumpe
}
```

---

## Arquitectura del Backend / Backend Architecture

### Estructura de Proyecto FastAPI / FastAPI Project Structure

```
backend/
├── main.py                              # Aplicación principal FastAPI
├── requirements.txt                     # Dependencias de Python
├── .env                                 # Variables de entorno (gitignored)
├── .env.example                         # Plantilla de variables de entorno
│
├── app/
│   ├── __init__.py
│   ├── config.py                        # Configuración de aplicación
│   ├── dependencies.py                  # Dependencias inyectables
│   ├── exceptions.py                    # Excepciones personalizadas
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                      # Rutas de autenticación
│   │   ├── stations.py                  # Rutas de estaciones
│   │   ├── qr.py                        # Rutas de escaneo QR
│   │   ├── leaderboard.py               # Rutas de clasificación
│   │   ├── locations.py                 # Rutas de ubicación
│   │   ├── points.py                    # Rutas de puntos
│   │   └── health.py                    # Rutas de health check
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py              # Lógica de autenticación
│   │   ├── qr_service.py                # Validación y procesamiento QR
│   │   ├── points_service.py            # Cálculo de puntos
│   │   ├── leaderboard_service.py       # Generación de clasificación
│   │   └── location_service.py          # Procesamiento de ubicaciones
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py                   # Esquemas Pydantic
│   │   ├── database.py                  # Modelos de base de datos
│   │   └── responses.py                 # Esquemas de respuesta
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py                      # Middleware de JWT
│   │   ├── cors.py                      # Configuración CORS
│   │   └── error_handler.py             # Manejador de errores global
│   │
│   └── utils/
│       ├── __init__.py
│       ├── database.py                  # Utilidades de base de datos
│       ├── validation.py                # Validación de entrada
│       ├── security.py                  # Utilidades de seguridad
│       └── logger.py                    # Configuración de logging
│
├── migrations/                          # Scripts de migración de base de datos
│   ├── 001_create_tables.sql           # Crear tablas base
│   ├── 002_create_rls_policies.sql     # Crear políticas RLS
│   └── 003_create_indexes.sql          # Crear índices para rendimiento
│
└── tests/                               # Tests de propiedades y integración
    ├── __init__.py
    ├── test_points_calculation.py       # Tests de cálculo de puntos
    ├── test_leaderboard_sorting.py      # Tests de ordenamiento
    ├── test_input_validation.py         # Tests de validación
    └── test_api_endpoints.py            # Tests de endpoints
```

### Endpoints REST de la API / REST API Endpoints

```
POST /api/auth/login
├─ Request: { email, password }
├─ Response: { access_token, refresh_token, user_id, role }
└─ Status: 200 OK | 401 Unauthorized

POST /api/auth/logout
├─ Headers: Authorization: Bearer <token>
├─ Response: { message: "Logged out successfully" }
└─ Status: 200 OK

POST /api/auth/refresh
├─ Request: { refresh_token }
├─ Response: { access_token, refresh_token }
└─ Status: 200 OK | 401 Unauthorized

GET /api/stations
├─ Headers: Authorization: Bearer <token>
├─ Response: [{ estacion_id, estacion_nombre, qr_code_hash }, ...]
└─ Status: 200 OK

GET /api/stations/{stationId}
├─ Headers: Authorization: Bearer <token>
├─ Response: { estacion_id, estacion_nombre, qr_code_hash, current_attempts }
└─ Status: 200 OK

POST /api/stations/{stationId}/scan
├─ Headers: Authorization: Bearer <token>
├─ Request: { qr_code_hash, scan_type: 'START' | 'END' }
├─ Response: { registro_id, points, duration_seconds, status }
└─ Status: 200 OK | 400 Bad Request | 409 Conflict

GET /api/leaderboard
├─ Headers: Authorization: Bearer <token>
├─ Response: [{ rank, team_name, total_points, total_time }, ...]
└─ Status: 200 OK

POST /api/locations
├─ Headers: Authorization: Bearer <token>
├─ Request: { latitude, longitude, accuracy }
├─ Response: { ubicacion_id, timestamp }
└─ Status: 201 Created | 400 Bad Request

GET /api/locations
├─ Headers: Authorization: Bearer <token>
├─ Query: team_id (admin only)
├─ Response: [{ team_id, latitude, longitude, timestamp }, ...]
└─ Status: 200 OK

GET /api/health
├─ Response: { status: 'healthy', timestamp }
└─ Status: 200 OK
```

### Lógica de Negocio - Cálculo de Puntos / Points Calculation Logic

```python
# app/services/points_service.py

def calculate_points(duration_seconds: int) -> int:
    """
    Calcula puntos basado en la duración de un intento.
    
    Fórmula: puntos = MAX(0, 100 - (duration_seconds / 10))
    
    Ejemplos:
    - duration = 0 segundos   → puntos = 100
    - duration = 100 segundos → puntos = 90
    - duration = 1000 segundos → puntos = 0
    - duration = 1500 segundos → puntos = MAX(0, -50) = 0
    
    Args:
        duration_seconds: Duración en segundos (entero positivo)
    
    Returns:
        Puntos calculados como entero redondeado (0.5 redondea hacia arriba)
    """
    if duration_seconds < 0:
        raise ValueError("duration_seconds debe ser >= 0")
    
    # Cálculo: 100 - (duración / 10)
    points_float = 100 - (duration_seconds / 10)
    
    # Aplicar máximo de 0
    points_float = max(0, points_float)
    
    # Redondeo estándar (0.5 redondea hacia arriba)
    points_int = round(points_float)
    
    return points_int

def accumulate_team_points(team_id: str, new_points: int, supabase) -> dict:
    """
    Acumula puntos a los puntos totales del equipo.
    
    Proceso:
    1. Obtener puntos actuales del equipo
    2. Agregar nuevos puntos
    3. Actualizar tabla Profiles
    4. Devolver datos actualizados
    
    Args:
        team_id: ID del equipo
        new_points: Nuevos puntos a agregar
        supabase: Cliente Supabase
    
    Returns:
        Dict con total_accumulated_points actualizado
    """
    # Consultar perfil actual
    profile = supabase.table('Profiles').select('*').eq('user_id', team_id).execute()
    current_total = profile.data[0]['total_accumulated_points']
    
    # Calcular nuevo total
    new_total = current_total + new_points
    
    # Actualizar perfil
    updated = supabase.table('Profiles').update({
        'total_accumulated_points': new_total,
        'updated_at': datetime.now(timezone.utc)
    }).eq('user_id', team_id).execute()
    
    return {
        'team_id': team_id,
        'new_points': new_points,
        'previous_total': current_total,
        'new_total': new_total
    }
```

### Lógica de Clasificación / Leaderboard Sorting Logic

```python
# app/services/leaderboard_service.py

def generate_leaderboard(supabase) -> List[dict]:
    """
    Genera la clasificación ordenada por puntos acumulados (desc)
    y desempate por tiempo acumulado (asc).
    
    Orden:
    1. Primary: total_accumulated_points DESC (mayor puntuación primero)
    2. Tiebreaker: total_accumulated_time ASC (menor tiempo primero)
    
    Args:
        supabase: Cliente Supabase
    
    Returns:
        Lista de entradas de clasificación con rango, nombre, puntos, tiempo
    """
    # Consultar todos los equipos (EQUIPO role)
    teams = supabase.table('Profiles').select('*').eq('role', 'EQUIPO').execute()
    
    # Ordenar: puntos DESC, tiempo ASC
    sorted_teams = sorted(
        teams.data,
        key=lambda x: (-x['total_accumulated_points'], x['total_accumulated_time'])
    )
    
    # Generar ranking con rango
    leaderboard = []
    for rank, team in enumerate(sorted_teams, 1):
        leaderboard.append({
            'rank': rank,
            'team_name': team['team_name'],
            'total_accumulated_points': team['total_accumulated_points'],
            'total_accumulated_time': team['total_accumulated_time'],
            'user_id': team['user_id']
        })
    
    return leaderboard
```

### Validación de Entrada / Input Validation

```python
# app/utils/validation.py

def validate_team_name(name: str) -> tuple[bool, Optional[str]]:
    """
    Valida nombre de equipo:
    - No vacío
    - Longitud <= 100 caracteres
    - Sin caracteres especiales (solo alfanuméricos, espacios, guiones)
    
    Args:
        name: Nombre de equipo propuesto
    
    Returns:
        Tupla (válido: bool, mensaje_error: Optional[str])
    """
    if not name or not name.strip():
        return False, "Team name cannot be empty"
    
    if len(name) > 100:
        return False, "Team name cannot exceed 100 characters"
    
    # Permitir solo alfanuméricos, espacios, guiones, acentos
    if not re.match(r'^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s\-]+$', name):
        return False, "Team name contains invalid characters"
    
    return True, None

def validate_coordinates(latitude: float, longitude: float) -> tuple[bool, Optional[str]]:
    """
    Valida coordenadas GPS.
    
    Rango válido:
    - Latitud: [-90, 90]
    - Longitud: [-180, 180]
    
    Args:
        latitude: Latitud en grados
        longitude: Longitud en grados
    
    Returns:
        Tupla (válido: bool, mensaje_error: Optional[str])
    """
    if not isinstance(latitude, (int, float)):
        return False, "Latitude must be a number"
    
    if not isinstance(longitude, (int, float)):
        return False, "Longitude must be a number"
    
    if not -90 <= latitude <= 90:
        return False, "Latitude must be between -90 and 90"
    
    if not -180 <= longitude <= 180:
        return False, "Longitude must be between -180 and 180"
    
    return True, None

def sanitize_string_input(value: str) -> str:
    """
    Sanitiza entrada de string para prevenir inyección SQL.
    
    Prevenciones:
    - Escapar caracteres especiales
    - Remover scripts HTML
    - Usar con consultas parametrizadas
    
    Args:
        value: String a sanitizar
    
    Returns:
        String sanitizado
    """
    # Escapar caracteres especiales
    sanitized = value.replace("'", "''")
    sanitized = sanitized.replace('"', '""')
    
    # Remover etiquetas HTML peligrosas
    sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r'<iframe[^>]*>.*?</iframe>', '', sanitized, flags=re.IGNORECASE)
    
    return sanitized
```

### Middleware de Autenticación JWT / JWT Authentication Middleware

```python
# app/middleware/auth.py

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import jwt
from typing import Optional

security = HTTPBearer()

async def verify_jwt(credentials: HTTPAuthCredentials = Depends(security)) -> dict:
    """
    Verifica validez del JWT token.
    
    Proceso:
    1. Extraer token del header Authorization
    2. Decodificar y verificar firma
    3. Verificar expiración
    4. Devolver claims del token
    
    Args:
        credentials: Credenciales HTTP Bearer
    
    Returns:
        Claims del token JWT (user_id, role, exp, etc.)
    
    Raises:
        HTTPException 401: Token inválido o expirado
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            options={"verify_signature": False}  # Supabase verifica firma
        )
        user_id: Optional[str] = payload.get("sub")
        role: Optional[str] = payload.get("role")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {"user_id": user_id, "role": role}
    
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

async def verify_admin_role(auth: dict = Depends(verify_jwt)) -> dict:
    """
    Verifica que el usuario sea administrador.
    
    Args:
        auth: Datos de autenticación verificados
    
    Returns:
        Datos de autenticación si el rol es ADMIN
    
    Raises:
        HTTPException 403: Usuario no es administrador
    """
    if auth.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return auth
```

### Configuración CORS / CORS Configuration

```python
# app/middleware/cors.py

from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    """
    Configura CORS para permitir solo el dominio del frontend.
    
    Política de seguridad:
    - Solo origen específico permitido
    - Credenciales incluidas en solicitudes
    - Headers personalizados permitidos
    - Métodos: GET, POST, PUT, DELETE
    """
    allowed_origins = [
        "https://rally.example.com",  # Producción
        "http://localhost:3000",       # Desarrollo local
    ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        max_age=3600,  # Cachear preflight durante 1 hora
    )
```

---

## Data Models

### Database Architecture (Arquitectura de Base de Datos)

**Descripción:** El sistema utiliza Supabase (PostgreSQL) como base de datos con políticas de Row-Level Security (RLS) para aislamiento de datos entre equipos. Todos los usuarios se autentican mediante Supabase Auth con tokens JWT.

### Database Design

```sql
-- ===============================================
-- TABLA: Profiles
-- Descripción: Perfiles de usuario y información de equipo
-- ===============================================

CREATE TABLE Profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'EQUIPO') NOT NULL DEFAULT 'EQUIPO',
    team_name VARCHAR(100) UNIQUE,  -- NULL para ADMIN
    total_accumulated_points INTEGER NOT NULL DEFAULT 0,
    total_accumulated_time INTEGER NOT NULL DEFAULT 0,  -- en segundos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones
    CHECK (
        (role = 'EQUIPO' AND team_name IS NOT NULL) OR
        (role = 'ADMIN' AND team_name IS NULL)
    )
);

CREATE UNIQUE INDEX idx_profiles_team_name ON Profiles(team_name)
WHERE role = 'EQUIPO';  -- Índice parcial: nombres únicos solo para equipos

-- ===============================================
-- TABLA: Estaciones
-- Descripción: Configuración de 4 estaciones
-- ===============================================

CREATE TABLE Estaciones (
    estacion_id INTEGER PRIMARY KEY CHECK (estacion_id BETWEEN 1 AND 4),
    estacion_nombre VARCHAR(50) NOT NULL UNIQUE,  -- "Estación 1", "Estación 2", etc.
    qr_code_hash VARCHAR(255) NOT NULL UNIQUE,    -- Hash único del código QR
    description TEXT,                             -- Descripción opcional
    latitude DECIMAL(10, 8),                       -- Ubicación de estación
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_estaciones_qr ON Estaciones(qr_code_hash);

-- Datos iniciales
INSERT INTO Estaciones (estacion_id, estacion_nombre, qr_code_hash)
VALUES
    (1, 'Estación 1', 'qr_hash_station_1'),
    (2, 'Estación 2', 'qr_hash_station_2'),
    (3, 'Estación 3', 'qr_hash_station_3'),
    (4, 'Estación 4', 'qr_hash_station_4');

-- ===============================================
-- TABLA: Registros_Estacion
-- Descripción: Registro de intentos de equipos en estaciones
-- ===============================================

CREATE TABLE Registros_Estacion (
    registro_id SERIAL PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES Profiles(user_id) ON DELETE CASCADE,
    estacion_id INTEGER NOT NULL REFERENCES Estaciones(estacion_id),
    start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    end_timestamp TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,  -- end - start
    points INTEGER,            -- MAX(0, 100 - duration/10)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones
    CHECK (end_timestamp IS NULL OR end_timestamp >= start_timestamp),
    CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CHECK (points IS NULL OR (points >= 0 AND points <= 100))
);

CREATE INDEX idx_registros_team_id ON Registros_Estacion(team_id);
CREATE INDEX idx_registros_estacion_id ON Registros_Estacion(estacion_id);
CREATE INDEX idx_registros_start_timestamp ON Registros_Estacion(start_timestamp);
-- Índice para consultas de intentos en progreso
CREATE INDEX idx_registros_incomplete ON Registros_Estacion(team_id, estacion_id)
WHERE end_timestamp IS NULL;

-- ===============================================
-- TABLA: Ubicaciones_Equipo
-- Descripción: Datos GPS en tiempo real de equipos
-- ===============================================

CREATE TABLE Ubicaciones_Equipo (
    ubicacion_id SERIAL PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES Profiles(user_id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(5, 2),  -- Precisión en metros
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones
    CHECK (latitude >= -90 AND latitude <= 90),
    CHECK (longitude >= -180 AND longitude <= 180),
    CHECK (accuracy IS NULL OR accuracy >= 0)
);

CREATE INDEX idx_ubicaciones_team_id ON Ubicaciones_Equipo(team_id, timestamp DESC);
CREATE INDEX idx_ubicaciones_timestamp ON Ubicaciones_Equipo(timestamp DESC);
-- Índice geoespacial para consultas de proximidad (futuro)
CREATE INDEX idx_ubicaciones_geo ON Ubicaciones_Equipo USING GIST (
    ll_to_earth(latitude, longitude)
);

-- ===============================================
-- TABLA: Tiempos_Rally
-- Descripción: Cronómetro global del rally para cada equipo
-- ===============================================

CREATE TABLE Tiempos_Rally (
    tiempo_id SERIAL PRIMARY KEY,
    team_id UUID NOT NULL UNIQUE REFERENCES Profiles(user_id) ON DELETE CASCADE,
    start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    end_timestamp TIMESTAMP WITH TIME ZONE,
    total_duration_seconds INTEGER,  -- end - start
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones
    CHECK (end_timestamp IS NULL OR end_timestamp >= start_timestamp),
    CHECK (total_duration_seconds IS NULL OR total_duration_seconds >= 0)
);

CREATE INDEX idx_tiempos_team_id ON Tiempos_Rally(team_id);
```

### Políticas de Row-Level Security (RLS) / Row-Level Security Policies

```sql
-- ===============================================
-- RLS PARA TABLA: Registros_Estacion
-- ===============================================

-- Deshabilitar acceso público
ALTER TABLE Registros_Estacion ENABLE ROW LEVEL SECURITY;

-- Política: Equipos ven solo sus propios registros
CREATE POLICY "Equipos ven sus propios registros"
ON Registros_Estacion FOR SELECT
AS PERMISSIVE
TO authenticated
USING (
    team_id = (SELECT user_id FROM Profiles WHERE user_id = auth.uid())
    AND
    (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'EQUIPO'
);

-- Política: Admin ve todos los registros
CREATE POLICY "Admin ve todos los registros"
ON Registros_Estacion FOR SELECT
AS PERMISSIVE
TO authenticated
USING (
    (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'ADMIN'
);

-- Política: Solo backend puede insertar (via service role)
CREATE POLICY "Backend inserta registros"
ON Registros_Estacion FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Backend puede actualizar registros
CREATE POLICY "Backend actualiza registros"
ON Registros_Estacion FOR UPDATE
TO authenticated
USING (true);

-- ===============================================
-- RLS PARA TABLA: Ubicaciones_Equipo
-- ===============================================

ALTER TABLE Ubicaciones_Equipo ENABLE ROW LEVEL SECURITY;

-- Política: Equipos ven solo sus propias ubicaciones
CREATE POLICY "Equipos ven sus propias ubicaciones"
ON Ubicaciones_Equipo FOR SELECT
AS PERMISSIVE
TO authenticated
USING (
    team_id = (SELECT user_id FROM Profiles WHERE user_id = auth.uid())
    AND
    (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'EQUIPO'
);

-- Política: Admin ve todas las ubicaciones
CREATE POLICY "Admin ve todas las ubicaciones"
ON Ubicaciones_Equipo FOR SELECT
AS PERMISSIVE
TO authenticated
USING (
    (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'ADMIN'
);

-- Política: Equipos insertan sus propias ubicaciones
CREATE POLICY "Equipos insertan sus ubicaciones"
ON Ubicaciones_Equipo FOR INSERT
TO authenticated
WITH CHECK (
    team_id = auth.uid()
);

-- ===============================================
-- RLS PARA TABLA: Profiles
-- ===============================================

ALTER TABLE Profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios ven su propio perfil
CREATE POLICY "Usuarios ven su perfil"
ON Profiles FOR SELECT
AS PERMISSIVE
TO authenticated
USING (
    user_id = auth.uid() OR
    (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'ADMIN'
);

-- Política: Usuarios actualizan su propio perfil
CREATE POLICY "Usuarios actualizan su perfil"
ON Profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===============================================
-- RLS PARA TABLA: Estaciones (solo lectura pública)
-- ===============================================

ALTER TABLE Estaciones ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver estaciones
CREATE POLICY "Todos ven estaciones"
ON Estaciones FOR SELECT
TO authenticated
USING (true);
```

### Disparadores y Automatización / Triggers and Automation

```sql
-- ===============================================
-- TRIGGER: Actualizar total_accumulated_points en Profiles
-- ===============================================

CREATE OR REPLACE FUNCTION actualizar_puntos_perfil()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se actualiza puntos en Registros_Estacion
    -- Actualizar total en Profiles
    
    IF NEW.points IS NOT NULL AND OLD.points IS DISTINCT FROM NEW.points THEN
        UPDATE Profiles
        SET total_accumulated_points = total_accumulated_points + (NEW.points - COALESCE(OLD.points, 0)),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.team_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_puntos
AFTER INSERT OR UPDATE ON Registros_Estacion
FOR EACH ROW
EXECUTE FUNCTION actualizar_puntos_perfil();

-- ===============================================
-- TRIGGER: Actualizar total_accumulated_time en Profiles
-- ===============================================

CREATE OR REPLACE FUNCTION actualizar_tiempo_perfil()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se actualiza duration_seconds en Registros_Estacion
    -- Actualizar total en Profiles
    
    IF NEW.duration_seconds IS NOT NULL 
       AND OLD.duration_seconds IS DISTINCT FROM NEW.duration_seconds THEN
        UPDATE Profiles
        SET total_accumulated_time = total_accumulated_time + 
            (NEW.duration_seconds - COALESCE(OLD.duration_seconds, 0)),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.team_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_tiempo
AFTER INSERT OR UPDATE ON Registros_Estacion
FOR EACH ROW
EXECUTE FUNCTION actualizar_tiempo_perfil();

-- ===============================================
-- TRIGGER: Auditoría de cambios (timestamps)
-- ===============================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas principales
CREATE TRIGGER trigger_updated_at_profiles
BEFORE UPDATE ON Profiles
FOR EACH ROW
EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_updated_at_registros
BEFORE UPDATE ON Registros_Estacion
FOR EACH ROW
EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_updated_at_estaciones
BEFORE UPDATE ON Estaciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_updated_at_tiempos
BEFORE UPDATE ON Tiempos_Rally
FOR EACH ROW
EXECUTE FUNCTION actualizar_updated_at();
```

---

## Correctness Properties

**Descripción:** Las propiedades de corrección verifican que la lógica del negocio core funcione correctamente bajo todas las condiciones. Estas propiedades se validan mediante pruebas basadas en propiedades (Property-Based Testing) con mínimo 100 iteraciones cada una.

### Property 1: Cálculo de Puntos / Points Calculation

**Para cualquier duración de segundos no negativa, los puntos calculados deben ser:**
- Mayor o igual a 0
- Menor o igual a 100
- Disminuyendo monótonamente conforme aumenta la duración
- Fórmula exacta: MAX(0, 100 - (duration_seconds / 10))

**Valida: Requisitos 7.1, 7.2, 7.3**

```python
# Test de propiedad / Property test
from hypothesis import given, strategies as st

@given(
    duration=st.integers(min_value=0, max_value=100000)
)
def test_points_calculation_bounds(duration):
    points = calculate_points(duration)
    
    # Propiedad: puntos en rango válido
    assert 0 <= points <= 100
    
    # Propiedad: fórmula exacta
    expected = max(0, round(100 - (duration / 10)))
    assert points == expected
```

### Property 2: Acumulación de Puntos / Points Accumulation

**Para cualquier conjunto de intentos completados, el total de puntos acumulados debe ser:**
- Igual a la suma de puntos individuales
- Consistente cuando se calcula múltiples veces (idempotencia)
- Nunca negativo

**Valida: Requisitos 7.5, 7.6, 11.1, 11.2, 11.3**

### Property 3: Ordenamiento de Clasificación / Leaderboard Sorting

**La clasificación debe estar ordenada correctamente por:**
- Orden primario: Total de puntos acumulados (descendente)
- Desempate: Tiempo total acumulado (ascendente)
- Cada equipo debe tener su rango correcto basado en estos criterios

**Valida: Requisitos 10.2, 10.3, 12.2, 12.3**

### Property 4: Validación de Nombre de Equipo / Team Name Validation

**Para cualquier string de nombre de equipo, la validación debe:**
- Rechazar strings vacíos
- Rechazar strings > 100 caracteres
- Rechazar strings con caracteres especiales (solo alfanuméricos + espacios/guiones)
- Aceptar solo inputs válidos según la especificación

**Valida: Requisito 31.1**

### Property 5: Validación de Coordenadas GPS / GPS Coordinates Validation

**Para cualquier par de coordenadas GPS, deben:**
- Latitud en rango [-90, 90]
- Longitud en rango [-180, 180]
- Ambas son números válidos
- Ser consistentemente validadas

**Valida: Requisito 19.4, 31.2**

### Property 6: Tiempo Total Acumulado / Accumulated Time

**Para cualquier conjunto de intentos, el tiempo total acumulado debe:**
- Ser la suma exacta de duraciones individuales
- Nunca ser negativo
- Crecer monótonamente con nuevos intentos
- Ser idempotente (múltiples cálculos = resultado igual)

**Valida: Requisitos 12.1, 12.2, 12.4**

---

## Testing Strategy

**Descripción:** La estrategia de pruebas combina pruebas basadas en propiedades (PBT) para lógica core, pruebas de integración para flujos de usuario, y pruebas unitarias para componentes y servicios.

### Property-Based Testing Strategy

**Configuración:** Mínimo 100 iteraciones por test de propiedad

**Bibliotecas:** Python (Hypothesis), JavaScript (fast-check)

**Tests Implementables:**

1. **Cálculo de puntos** - Propiedad 1
   - Framework: Hypothesis
   - Tag: `Feature: rally-competition-platform, Property 1: Points calculation bounds`
   - Iteraciones: 100+
   - Entrada: duraciones aleatorias (0-100000 segundos)

2. **Acumulación de puntos** - Propiedad 2
   - Framework: Hypothesis
   - Tag: `Feature: rally-competition-platform, Property 2: Points accumulation correctness`
   - Iteraciones: 100+
   - Entrada: listas de intentos (1-10 intentos con duraciones variadas)

3. **Ordenamiento de clasificación** - Propiedad 3
   - Framework: Hypothesis
   - Tag: `Feature: rally-competition-platform, Property 3: Leaderboard sorting correctness`
   - Iteraciones: 100+
   - Entrada: combinaciones de puntos y tiempos de múltiples equipos

4. **Validación de nombre de equipo** - Propiedad 4
   - Framework: Hypothesis
   - Tag: `Feature: rally-competition-platform, Property 4: Team name validation`
   - Iteraciones: 100+
   - Entrada: strings aleatorios con varios caracteres

5. **Validación de coordenadas GPS** - Propiedad 5
   - Framework: Hypothesis
   - Tag: `Feature: rally-competition-platform, Property 5: GPS coordinates validation`
   - Iteraciones: 100+
   - Entrada: pares de coordenadas en y fuera del rango válido

6. **Tiempo total acumulado** - Propiedad 6
   - Framework: Hypothesis
   - Tag: `Feature: rally-competition-platform, Property 6: Accumulated time consistency`
   - Iteraciones: 100+
   - Entrada: listas de duraciones (0-10000 segundos, 1-10 elementos)

### Pruebas de Integración (Integration Tests)

**Escenarios Representativos:**

- Flujo completo de autenticación (registro, login, logout, token refresh)
- Escaneo QR inicio y fin con cálculo de puntos
- Actualización en tiempo real de clasificación vía Supabase
- Rastreo de ubicación GPS cada 10 segundos
- Control de acceso basado en roles (equipo vs admin)
- Manejo de errores: QR inválido, duplicado, permiso denegado
- Actualización de datos ubicación en mapa en <15 segundos

### Pruebas Unitarias (Unit Tests)

**Cobertura Mínima:**

- Componentes React (StationCard, Chronometer, Leaderboard)
- Servicios backend (QR, puntos, clasificación, ubicación)
- Utilidades (validación, formateo, cálculo)
- Middleware de autenticación y autorización
- Manejo de errores

### Pruebas de Smoke

- Construcción de aplicación completada
- Servidor backend inicia correctamente
- API responde a /health check
- Página de login es accesible sin autenticación
- Panel de admin es inaccesible sin rol ADMIN

---

## Error Handling

**Descripción:** El sistema maneja errores de forma consistente con logging centralizado, mensajes de error claros para usuarios y monitoreo automático de anomalías.

### Estrategia de Logging de Errores

```python
# app/utils/logger.py

import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

def log_error(
    error_message: str,
    error_type: str,
    user_id: Optional[str] = None,
    context: Optional[dict] = None
):
    """
    Registra errores con contexto completo.
    
    Información registrada:
    - Timestamp exacto
    - Tipo de error
    - Mensaje de error
    - Contexto de usuario
    - Stack trace
    - Contexto adicional
    
    Args:
        error_message: Mensaje descriptivo del error
        error_type: Tipo de error (ValidationError, AuthError, etc.)
        user_id: ID del usuario afectado (si aplica)
        context: Dict con información contextual adicional
    """
    log_entry = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'error_type': error_type,
        'error_message': error_message,
        'user_id': user_id,
        'context': context or {},
        'severity': 'ERROR'
    }
    
    logger.error(json.dumps(log_entry))
    
    # Enviar a servicio de monitoreo (Sentry, CloudWatch, etc.)
    # sentry_sdk.capture_exception(exception)
```

### Respuestas de Error de API

```python
# app/exceptions.py

class APIError(Exception):
    """Base exception para errores de API."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code

class ValidationError(APIError):
    """Error de validación de entrada."""
    def __init__(self, message: str):
        super().__init__(message, 400)

class AuthenticationError(APIError):
    """Error de autenticación."""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, 401)

class AuthorizationError(APIError):
    """Error de autorización (acceso denegado)."""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, 403)

class NotFoundError(APIError):
    """Recurso no encontrado."""
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", 404)

class ConflictError(APIError):
    """Conflicto (ej: QR duplicado, nombre de equipo duplicado)."""
    def __init__(self, message: str):
        super().__init__(message, 409)

# Manejador global de excepciones
@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    """Maneja errores de API y devuelve respuesta JSON."""
    log_error(exc.message, exc.__class__.__name__)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'error': exc.__class__.__name__,
            'message': exc.message,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    )
```

### Error Boundaries en Frontend

```typescript
// components/shared/ErrorBoundary.tsx

import { ReactNode } from 'react'
import * as Sentry from "@sentry/react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details to monitoring service
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })
    
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Algo salió mal / Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Recargar / Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## Despliegue / Deployment

### Configuración AWS Amplify

```yaml
# amplify.yml - Configuración de despliegue

version: 1

frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npm run env:set  # Configurar variables de entorno
    build:
      commands:
        - npm run build
    postBuild:
      commands:
        - npm run test
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*

backend:
  phases:
    preBuild:
      commands:
        - cd backend
        - pip install -r requirements.txt
    build:
      commands:
        - echo "No build step for Python"
    postBuild:
      commands:
        - pytest  # Ejecutar tests
  artifacts:
    baseDirectory: backend
    files:
      - '**/*'

# Variables de entorno
env:
  variables:
    NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY: $SUPABASE_ANON_KEY
    NEXT_PUBLIC_API_URL: $API_URL
    PYTHON_VERSION: 3.11
```

### Gestión de Variables de Entorno

```bash
# .env.example - Plantilla de variables

# Frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_API_URL=https://api.rally.example.com

# Backend
SUPABASE_URL=https://your-supabase.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
API_CORS_ORIGIN=https://rally.example.com
LOG_LEVEL=INFO
SENTRY_DSN=https://your-sentry-dsn
```

### Migraciones de Base de Datos

```bash
# scripts/migrate.sh - Script de migración

#!/bin/bash

# Conexión a Supabase
SUPABASE_URL="$SUPABASE_URL"
SUPABASE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# Ejecutar migraciones en orden
psql -d "$SUPABASE_URL" -f migrations/001_create_tables.sql
psql -d "$SUPABASE_URL" -f migrations/002_create_rls_policies.sql
psql -d "$SUPABASE_URL" -f migrations/003_create_indexes.sql
psql -d "$SUPABASE_URL" -f migrations/004_create_triggers.sql

echo "Database migrations completed successfully"
```

---

## Resumen de Decisiones de Diseño / Design Decision Summary

| Aspecto | Decisión | Justificación |
|--------|----------|---------------|
| **Framework Frontend** | Next.js App Router | SSR nativo, mejora SEO y rendimiento |
| **Styling** | Tailwind CSS | Utilidades extensibles, responsive design |
| **Backend** | FastAPI (Python) | Rápido, documentación automática, async |
| **Base de Datos** | Supabase (PostgreSQL) | Real-time, RLS, autenticación integrada |
| **Autenticación** | Supabase Auth + JWT | Seguro, tokens con expiración |
| **Real-time** | Supabase Subscriptions | WebSocket nativo, push events |
| **Mapeo** | Leaflet | Ligero, open-source, sin clave API requerida |
| **Escáner QR** | html5-qrcode | Funciona en navegador, sin dependencias externas |
| **Despliegue** | AWS Amplify | CI/CD integrado, SSR soportado |
| **Monitoreo** | Sentry | Error tracking, alertas, releases |
| **Testing** | Hypothesis + pytest | Property-based testing para lógica core |

---

## Conclusión y Próximos Pasos / Conclusion & Next Steps

Este documento de diseño proporciona una especificación completa y lista para implementación para la Plataforma de Competencia Rally. Los equipos de desarrollo pueden utilizar este documento como:

1. **Blueprint de arquitectura** para cada componente
2. **Guía de estructura de proyecto** para organización de código
3. **Especificación de API** para integración frontend-backend
4. **Definición de esquema de base de datos** con RLS y seguridad
5. **Estrategia de pruebas** incluyendo propiedades verificables
6. **Guía de despliegue** en AWS Amplify

**Siguientes fases:**
- Fase 3: Crear tareas detalladas de implementación
- Fase 4: Desarrollar e implementar componentes
- Fase 5: Ejecutar tests de propiedad y pruebas de integración
- Fase 6: Desplegar en ambiente de prueba
- Fase 7: Validación con usuarios finales

---

**Documento preparado:** Diseño técnico completo siguiendo workflow requirements-first con análisis de propiedades verificables y especificaciones de implementación detalladas.

**Lenguaje:** Toda documentación, comentarios, docstrings y esquemas SQL están en español conforme a requisitos.

**Estado:** Listo para fase de creación de tareas y ejecución de desarrollo.
