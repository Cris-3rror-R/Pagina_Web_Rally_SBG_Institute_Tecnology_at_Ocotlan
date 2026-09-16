# Configuración de Supabase - Guía Paso a Paso

**Tiempo estimado**: 15-20 minutos

---

## Paso 1: Crear Proyecto Supabase

1. Ir a https://app.supabase.com
2. Hacer login o registrarse (gratis)
3. Click en "New project"
4. Rellenar:
   - **Name**: `rally-competition-platform`
   - **Database Password**: Generar fuerte (guardar en lugar seguro)
   - **Region**: Seleccionar más cercana a tu ubicación
5. Click "Create new project"
6. **⏳ Esperar 5-10 minutos** a que se inicialice

---

## Paso 2: Obtener Credenciales

Una vez que el proyecto está listo:

1. Ir a **Settings** (rueda en abajo-izquierda) → **API**
2. Copiar y guardar en lugar seguro:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_KEY` (backend)

Ejemplo:
```
URL: https://abcdefghijklmnop.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Paso 3: Crear Tablas

### 3.1 Abrir SQL Editor

1. En Supabase Dashboard → **SQL Editor** (sidebar izquierdo)
2. Click en "New query"
3. Copiar el siguiente código:

### 3.2 SQL para Crear Tablas

```sql
-- ============================================
-- Rally Competition Platform - Database Setup
-- ============================================

-- ============================================
-- 1. TABLA: Profiles (Perfiles de Usuario)
-- ============================================
CREATE TABLE Profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EQUIPO')),
    team_name VARCHAR(100),
    total_accumulated_points INTEGER NOT NULL DEFAULT 0,
    total_accumulated_time INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_profiles_role ON Profiles(role);
CREATE INDEX idx_profiles_total_points ON Profiles(total_accumulated_points DESC);
CREATE INDEX idx_profiles_total_time ON Profiles(total_accumulated_time ASC);

-- ============================================
-- 2. TABLA: Stations (Estaciones del Rally)
-- ============================================
CREATE TABLE Stations (
    estacion_id SERIAL PRIMARY KEY,
    estacion_nombre VARCHAR(100) NOT NULL,
    qr_code_start_hash VARCHAR(255) NOT NULL UNIQUE,
    qr_code_end_hash VARCHAR(255) NOT NULL UNIQUE,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_stations_name ON Stations(estacion_nombre);

-- ============================================
-- 3. TABLA: Station Attempts (Registros de Intentos)
-- ============================================
CREATE TABLE StationAttempts (
    registro_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES Profiles(user_id) ON DELETE CASCADE,
    estacion_id INTEGER NOT NULL REFERENCES Stations(estacion_id),
    start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    end_timestamp TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    points INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('In Progress', 'Complete', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_attempts_user ON StationAttempts(user_id);
CREATE INDEX idx_attempts_station ON StationAttempts(estacion_id);
CREATE INDEX idx_attempts_status ON StationAttempts(status);

-- ============================================
-- 4. TABLA: Team Locations (Ubicaciones de Equipos)
-- ============================================
CREATE TABLE TeamLocations (
    ubicacion_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES Profiles(user_id) ON DELETE CASCADE,
    latitude FLOAT NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude FLOAT NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    accuracy FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_locations_user ON TeamLocations(user_id);
CREATE INDEX idx_locations_timestamp ON TeamLocations(timestamp DESC);

-- ============================================
-- CONFIGURAR ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE Profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE Stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE StationAttempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE TeamLocations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: Profiles
-- ============================================

-- Solo pueden ver su propio perfil
CREATE POLICY profiles_view_own ON Profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Admin puede ver todos
CREATE POLICY profiles_view_admin ON Profiles
    FOR SELECT USING (
        (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'ADMIN'
    );

-- Solo pueden actualizar su propio perfil
CREATE POLICY profiles_update_own ON Profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM Profiles WHERE user_id = auth.uid()));

-- ============================================
-- POLICIES: Stations
-- ============================================

-- Todos pueden ver las estaciones
CREATE POLICY stations_view_all ON Stations
    FOR SELECT USING (true);

-- Solo admin puede insertar/actualizar/eliminar
CREATE POLICY stations_insert_admin ON Stations
    FOR INSERT WITH CHECK (
        (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'ADMIN'
    );

CREATE POLICY stations_update_admin ON Stations
    FOR UPDATE USING (
        (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'ADMIN'
    );

-- ============================================
-- POLICIES: StationAttempts
-- ============================================

-- Solo pueden ver sus propios intentos
CREATE POLICY attempts_view_own ON StationAttempts
    FOR SELECT USING (auth.uid() = user_id);

-- Admin puede ver todos
CREATE POLICY attempts_view_admin ON StationAttempts
    FOR SELECT USING (
        (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'ADMIN'
    );

-- Solo pueden insertar/actualizar sus propios intentos
CREATE POLICY attempts_insert_own ON StationAttempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY attempts_update_own ON StationAttempts
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLICIES: TeamLocations
-- ============================================

-- Solo pueden ver sus propias ubicaciones
CREATE POLICY locations_view_own ON TeamLocations
    FOR SELECT USING (auth.uid() = user_id);

-- Admin puede ver todas
CREATE POLICY locations_view_admin ON TeamLocations
    FOR SELECT USING (
        (SELECT role FROM Profiles WHERE user_id = auth.uid()) = 'ADMIN'
    );

-- Solo pueden insertar sus propias ubicaciones
CREATE POLICY locations_insert_own ON TeamLocations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CREAR ÍNDICES ADICIONALES
-- ============================================

CREATE INDEX idx_attempts_user_station ON StationAttempts(user_id, estacion_id);
CREATE INDEX idx_locations_user_timestamp ON TeamLocations(user_id, timestamp DESC);
```

### 3.3 Ejecutar SQL

1. Pegar el código anterior en el editor SQL
2. Click en "Run" (botón azul)
3. Esperar confirmación ✅

---

## Paso 4: Configurar Autenticación

1. En Supabase Dashboard → **Authentication** (sidebar)
2. Click en "Providers"
3. Habilitar:
   - ✅ **Email** (ya habilitado por defecto)
   - Desactivar "Confirm email" para desarrollo (opcional)

4. Ir a **Settings** → **Auth**
5. Configurar:
   - **Site URL**: `https://your-amplify-domain.amplifyapp.com` (o `http://localhost:3000` para desarrollo)
   - **Redirect URLs**: Agregar ambas
   - Click "Save"

---

## Paso 5: Crear Usuarios de Prueba

### 5.1 Crear Admin

1. En Supabase Dashboard → **Authentication** → **Users**
2. Click en "Add user"
3. Rellenar:
   - **Email**: `admin@rally.com`
   - **Password**: Generar fuerte
   - Click "Create user"

4. Ir a **SQL Editor**
5. Ejecutar:

```sql
-- Crear perfil de admin
INSERT INTO Profiles (user_id, email, role, team_name)
SELECT id, email, 'ADMIN', 'Admin Team'
FROM auth.users
WHERE email = 'admin@rally.com'
ON CONFLICT (user_id) DO NOTHING;
```

### 5.2 Crear Equipos de Prueba

```sql
-- Crear equipos
INSERT INTO Profiles (user_id, email, role, team_name)
SELECT id, email, 'EQUIPO', 'Equipo A'
FROM auth.users
WHERE email = 'team1@rally.com'
ON CONFLICT (user_id) DO NOTHING;
```

> Repeat para crear más equipos (team2@rally.com, team3@rally.com, etc.)

---

## Paso 6: Crear Estaciones

Ejecutar en SQL Editor:

```sql
-- Crear estaciones de prueba
INSERT INTO Stations (estacion_nombre, qr_code_start_hash, qr_code_end_hash, latitude, longitude, description)
VALUES
    ('Estación 1 - Salida', 'START_001', 'END_001', 40.4168, -3.7038, 'Punto de salida'),
    ('Estación 2 - Control', 'START_002', 'END_002', 40.4170, -3.7040, 'Control de tiempo'),
    ('Estación 3 - Desafío', 'START_003', 'END_003', 40.4172, -3.7042, 'Desafío táctico'),
    ('Estación 4 - Meta', 'START_004', 'END_004', 40.4174, -3.7044, 'Línea de meta');
```

---

## Paso 7: Configurar Variables de Entorno

### Localmente (frontend/.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (backend/.env)

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=tu-secret-muy-largo-aqui
ENV=development
```

---

## Paso 8: Verificar Conexión

### Test Frontend

```bash
cd frontend

# Instalar
npm install
# o pnpm install

# Ejecutar
npm run dev
```

1. Abrir http://localhost:3000
2. Click en "Login"
3. Ingresar `admin@rally.com` / password
4. Debería loguearse y ver el dashboard

### Test Backend

```bash
cd backend

# Instalar
pip install -r requirements-simple.txt

# Ejecutar
python -m uvicorn main:app --reload
```

1. Abrir http://localhost:8000/docs
2. Click en "Try it out" en `/health`
3. Debería devolver: `{"status": "healthy", "timestamp": "2026-09-16T..."}`

---

## Paso 9: Generar Códigos QR

Para pruebas, generar códigos QR con:

```bash
# Instalar librería
pip install qrcode pillow

# Crear script generate_qr.py
```

```python
import qrcode

hashes = [
    'START_001', 'END_001',
    'START_002', 'END_002',
    'START_003', 'END_003',
    'START_004', 'END_004',
]

for qr_hash in hashes:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_hash)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(f"qr_{qr_hash}.png")
    print(f"✅ Creado: qr_{qr_hash}.png")
```

Ejecutar:
```bash
python generate_qr.py
# Ahora tienes imágenes QR para usar en estaciones
```

---

## 🎉 ¡Listo!

Supabase está configurado y listo para:
- ✅ Registro de usuarios
- ✅ Almacenamiento de datos
- ✅ Row-Level Security
- ✅ Autenticación JWT
- ✅ Subscripciones en tiempo real

## ✅ Checklist Final

- [ ] Proyecto Supabase creado
- [ ] Credenciales guardadas en lugar seguro
- [ ] Tablas creadas
- [ ] RLS policies activas
- [ ] Autenticación configurada
- [ ] Usuarios de prueba creados
- [ ] Estaciones creadas
- [ ] Variables de entorno en frontend
- [ ] Variables de entorno en backend
- [ ] Conexión verificada en ambos lados
- [ ] Códigos QR generados

## 📞 Troubleshooting

### Error: "Invalid JWT"
- Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY` es correcto
- Verificar URL de Supabase
- Borrar cookies y reintentar

### Error: "RLS violation"
- Verificar usuario está autenticado
- Revisar policies en Supabase
- Ejecutar SQL de policies nuevamente

### Error: "Network error"
- Verificar Supabase está online
- Revisar CORS en project
- Verificar firewall/VPN

---

**Tiempo total**: ~15-20 minutos  
**Siguiente**: Ver [QUICK_START_AMPLIFY.md](./QUICK_START_AMPLIFY.md)
